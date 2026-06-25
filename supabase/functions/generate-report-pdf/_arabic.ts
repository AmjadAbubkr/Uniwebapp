/**
 * Arabic text shaping + RTL visual-order helper for jsPDF.
 *
 * Why this exists: jsPDF has NO OpenType shaping engine and NO bidi algorithm.
 * If you feed it raw Arabic (e.g. "مرحبا"), it draws the *isolated* form of
 * every letter, left-to-right — disconnected glyphs reading the wrong way.
 *
 * A correct fix needs three transforms, done here in `shape()`:
 *   1. Convert each letter to its contextual form (isolated / initial / medial
 *      / final) based on its neighbours — `reshape()`.
 *   2. Reverse the string into *visual* (LTR-draw) order — `toRtl()`.
 *   3. Keep combining marks (harakat) attached to their base letter so they
 *      don't drift during reversal — handled in both steps.
 *
 * This covers modern standard Arabic as used in this report (institution
 * headers, field labels, subject names). It is intentionally self-contained to
 * avoid a fragile third-party Deno dependency.
 *
 * Reference: Unicode Arabic presentation forms (U+FB50–U+FEFF).
 */

// --------------------------------------------------------------------------
// Letter tables.
//
// Index order is [isolated, final, initial, medial] presentation forms in the
// FE70–FEFF block. The key is the base (isolated) Arabic letter (U+0621–U+064A).
// Letters that have NO contextual joining (like hamza ء, dal د, dhal ذ, rha ر,
// zay ز, waw و, alef-maqsurah ى) still need final-position handling when they
// follow a joining letter, so their forms are listed too.
// --------------------------------------------------------------------------
type Forms = readonly [string, string, string, string];

const LETTERS: Record<string, Forms> = {
  "\u0621": ["\uFE80", "\uFE80", "\uFE80", "\uFE80"], // ء hamza (non-joining)
  "\u0622": ["\uFE81", "\uFE82", "\uFE81", "\uFE82"], // آ alef-madda
  "\u0623": ["\uFE83", "\uFE84", "\uFE83", "\uFE84"], // أ alef-hamza-above
  "\u0624": ["\uFE85", "\uFE86", "\uFE85", "\uFE86"], // ؤ waw-hamza
  "\u0625": ["\uFE87", "\uFE88", "\uFE87", "\uFE88"], // إ alef-hamza-below
  "\u0626": ["\uFE89", "\uFE8A", "\uFE8B", "\uFE8C"], // ئ yeh-hamza
  "\u0627": ["\uFE8D", "\uFE8E", "\uFE8D", "\uFE8E"], // ا alef
  "\u0628": ["\uFE8F", "\uFE90", "\uFE91", "\uFE92"], // ب ba
  "\u0629": ["\uFE93", "\uFE94", "\uFE93", "\uFE94"], // ة ta-marbuta
  "\u062A": ["\uFE95", "\uFE96", "\uFE97", "\uFE98"], // ت ta
  "\u062B": ["\uFE99", "\uFE9A", "\uFE9B", "\uFE9C"], // ث tha
  "\u062C": ["\uFE9D", "\uFE9E", "\uFE9F", "\uFEA0"], // ج jeem
  "\u062D": ["\uFEA1", "\uFEA2", "\uFEA3", "\uFEA4"], // ح ha
  "\u062E": ["\uFEA5", "\uFEA6", "\uFEA7", "\uFEA8"], // خ kha
  "\u062F": ["\uFEA9", "\uFEAA", "\uFEA9", "\uFEAA"], // د dal (right-joining)
  "\u0630": ["\uFEAB", "\uFEAC", "\uFEAB", "\uFEAC"], // ذ dhal
  "\u0631": ["\uFEAD", "\uFEAE", "\uFEAD", "\uFEAE"], // ر ra
  "\u0632": ["\uFEAF", "\uFEB0", "\uFEAF", "\uFEB0"], // ز zay
  "\u0633": ["\uFEB1", "\uFEB2", "\uFEB3", "\uFEB4"], // س seen
  "\u0634": ["\uFEB5", "\uFEB6", "\uFEB7", "\uFEB8"], // ش sheen
  "\u0635": ["\uFEB9", "\uFEBA", "\uFEBB", "\uFEBC"], // ص sad
  "\u0636": ["\uFEBD", "\uFEBE", "\uFEBF", "\uFEC0"], // ض dad
  "\u0637": ["\uFEC1", "\uFEC2", "\uFEC3", "\uFEC4"], // ط ta
  "\u0638": ["\uFEC5", "\uFEC6", "\uFEC7", "\uFEC8"], // ظ za
  "\u0639": ["\uFEC9", "\uFECA", "\uFECB", "\uFECC"], // ع ain
  "\u063A": ["\uFECD", "\uFECE", "\uFECF", "\uFED0"], // غ ghain
  "\u0640": ["\u0640", "\u0640", "\u0640", "\u0640"], // ـ tatweel/kashida
  "\u0641": ["\uFED1", "\uFED2", "\uFED3", "\uFED4"], // ف fa
  "\u0642": ["\uFED5", "\uFED6", "\uFED7", "\uFED8"], // ق qaf
  "\u0643": ["\uFED9", "\uFEDA", "\uFEDB", "\uFEDC"], // ك kaf
  "\u0644": ["\uFEDD", "\uFEDE", "\uFEDF", "\uFEE0"], // ل lam
  "\u0645": ["\uFEE1", "\uFEE2", "\uFEE3", "\uFEE4"], // م meem
  "\u0646": ["\uFEE5", "\uFEE6", "\uFEE7", "\uFEE8"], // ن noon
  "\u0647": ["\uFEE9", "\uFEEA", "\uFEEB", "\uFEEC"], // ه ha
  "\u0648": ["\uFEED", "\uFEEE", "\uFEED", "\uFEEE"], // و waw (right-joining)
  "\u0649": ["\uFEEF", "\uFEF0", "\uFEEF", "\uFEF0"], // ى alef-maqsurah
  "\u064A": ["\uFEF1", "\uFEF2", "\uFEF3", "\uFEF4"], // ي yeh
};

// Right-joining letters: they join to the PRECEDING letter (take a final form)
// but do NOT join to the following letter (so the next letter starts fresh).
// These break the "chain" to the right.
const RIGHT_JOINING = new Set([
  "\u0621", "\u0622", "\u0623", "\u0624", "\u0625", "\u0626",
  "\u0627", "\u0629", "\u062F", "\u0630", "\u0631", "\u0632",
  "\u0648", "\u0649",
]);

// Combining marks (harakat) — these do NOT advance the joining cursor and must
// stay glued to the base letter before them during reversal.
const MARKS = new Set([
  "\u064B", // ـً  fathatan
  "\u064C", // ـٌ  dammatan
  "\u064D", // ـٍ  kasratan
  "\u064E", // ـَ  fatha
  "\u064F", // ـُ  damma
  "\u0650", // ـِ  kasra
  "\u0651", // ـّ  shadda
  "\u0652", // ـْ  sukun
  "\u0653", // ـٓ  madda above
  "\u0654", // ـٴ  hamza above
  "\u0670", // ٱ  superscript alef
]);

// --------------------------------------------------------------------------
// Lam-Alef ligatures. The combination ل + ا/أ/إ/آ collapses into a single
// presentation-form ligature when lam takes its initial form and is followed
// by an alef variant. Without this, "لا" renders as two separate glyphs.
// --------------------------------------------------------------------------
const LAM_ALEF: Record<string, string> = {
  "\u0622": "\uFEF5", // لا آ -> lam-alef-madda isolated
  "\u0623": "\uFEF7", // لا أ -> lam-alef-hamza-above isolated
  "\u0625": "\uFEF9", // لا إ -> lam-alef-hamza-below isolated
  "\u0627": "\uFEFB", // لا ا -> lam-alef isolated
};
const LAM_ALEF_FINAL: Record<string, string> = {
  "\u0622": "\uFEF6",
  "\u0623": "\uFEF8",
  "\u0625": "\uFEFA",
  "\u0627": "\uFEFC",
};

/** A character can join to the letter that FOLLOWS it (i.e. it is dual/cyclic). */
function joinsForward(ch: string): boolean {
  return LETTERS[ch] !== undefined && !RIGHT_JOINING.has(ch);
}

/** A character participates in joining at all (letter or mark is "ink"). */
function isLetter(ch: string): boolean {
  return LETTERS[ch] !== undefined;
}

// --------------------------------------------------------------------------
// Step 1 — reshape to contextual (presentation) forms, LEFT TO RIGHT over the
// logical string. We track whether the previous *letter* (ignoring marks)
// joined forward, which determines the current letter's form.
// --------------------------------------------------------------------------
export function reshape(input: string): string {
  const chars = Array.from(input);
  const out: string[] = [];
  let prevJoinsForward = false; // did the previous LETTER join to the right?

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    // Marks pass through untouched and do not affect the joining cursor.
    if (MARKS.has(ch)) {
      out.push(ch);
      continue;
    }

    // Non-Arabic characters (digits, Latin, punctuation, spaces) reset the
    // chain and pass through verbatim.
    const forms = LETTERS[ch];
    if (!forms) {
      out.push(ch);
      prevJoinsForward = false;
      continue;
    }

    // Lam-Alef ligature: if this lam is followed by an alef variant AND the
    // lam itself would take initial/medial form, collapse to the ligature.
    const next = chars.slice(i + 1).find((c) => !MARKS.has(c));
    if (ch === "\u0644" && next !== undefined && LAM_ALEF[next] !== undefined) {
      // The ligature's own form depends on whether the letter before the lam
      // joined forward (isolated vs final).
      const ligature = prevJoinsForward ? LAM_ALEF_FINAL[next] : LAM_ALEF[next];
      out.push(ligature);
      // Consume the alef we just merged with: skip ahead past it and any marks
      // sitting between lam and the alef.
      let j = i + 1;
      while (j < chars.length && (MARKS.has(chars[j]) || chars[j] === next)) {
        if (chars[j] === next) { i = j; break; }
        // preserve interleaved marks on the lam by pushing them first
        out.push(chars[j]);
        j++;
      }
      // A lam-alef ligature is right-joining only: it does NOT join forward.
      prevJoinsForward = false;
      continue;
    }

    let formIndex: number;
    if (prevJoinsForward) {
      const after = chars.slice(i + 1).find((c) => !MARKS.has(c));
      const joinsToNext = after !== undefined && isLetter(after);
      formIndex = joinsToNext ? 3 : 1; // medial or final
    } else {
      const after = chars.slice(i + 1).find((c) => !MARKS.has(c));
      const joinsToNext = after !== undefined && isLetter(after);
      formIndex = joinsToNext ? 2 : 0; // initial or isolated
    }
    out.push(forms[formIndex]);

    prevJoinsForward = joinsForward(ch);
  }

  return out.join("");
}

// --------------------------------------------------------------------------
// Step 2 — visual-order reversal for RTL.
//
// jsPDF lays text out left-to-right. Arabic reads right-to-left, so after
// shaping we reverse the code-unit sequence so the FIRST logical character is
// drawn at the RIGHT edge. Combining marks must travel WITH their base letter,
// so we keep each mark bound to the letter on its LEFT during reversal.
//
// Numbers and Latin runs are left as-is (they render LTR even inside RTL
// text); we treat them as "neutral" boundaries so whole runs stay intact.
// --------------------------------------------------------------------------
function isLatinOrDigit(ch: string): boolean {
  const code = ch.codePointAt(0)!;
  return (
    (code >= 0x30 && code <= 0x39) || // 0-9
    (code >= 0x41 && code <= 0x5a) || // A-Z
    (code >= 0x61 && code <= 0x7a) || // a-z
    (code >= 0x660 && code <= 0x669) // arabic-indic digits ٠-٩
  );
}

export function toRtl(input: string): string {
  const chars = Array.from(input);
  const result: string[] = [];

  // Walk the string and reverse Arabic runs while preserving Latin/digit runs.
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    if (isLatinOrDigit(ch)) {
      // Collect the whole neutral run verbatim.
      const run: string[] = [];
      while (i < chars.length && isLatinOrDigit(chars[i])) run.push(chars[i++]);
      result.push(...run);
      continue;
    }

    // Collect an Arabic run (letters, marks, spaces between letters) and keep
    // marks glued to the base letter on their left.
    const run: string[] = [];
    while (i < chars.length && !isLatinOrDigit(chars[i])) {
      run.push(chars[i++]);
    }
    // Reverse, dragging each mark with its preceding base letter.
    const reversed: string[] = [];
    for (let k = run.length - 1; k >= 0; k--) {
      const c = run[k];
      if (MARKS.has(c)) {
        // A leading mark belongs to the base letter that just preceded it in
        // output order; insert it BEFORE that letter.
        reversed.splice(reversed.length - 1, 0, c);
      } else {
        reversed.push(c);
      }
    }
    result.push(...reversed);
  }

  return result.join("");
}

/**
 * Full shaping pipeline for an Arabic string destined for jsPDF.
 * Returns the string ready to be drawn left-to-right by jsPDF while appearing
 * correctly shaped and right-to-left to a reader.
 *
 * Non-Arabic input is returned unchanged (safe to call on mixed/FR strings).
 */
export function shape(input: string): string {
  if (!input) return input;
  return toRtl(reshape(input));
}
