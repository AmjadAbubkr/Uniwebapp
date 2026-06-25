import { jsPDF } from "npm:jspdf@2.5.2";
import "npm:jspdf-autotable@3.8.4";
import { createClient } from "npm:@supabase/supabase-js@2";
import { shape } from "./_arabic.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function corsResponse(body: string, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders },
  });
}

function errorResponse(message: string, status: number) {
  return corsResponse(JSON.stringify({ error: message }), status, {
    "Content-Type": "application/json",
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsResponse("ok", 200);
  }

  try {
    let studentId: string | undefined;
    let level: string | undefined;
    try {
      const body = await req.json();
      studentId = body.studentId;
      level = body.level;
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    if (!studentId || !level) {
      return errorResponse("studentId and level are required", 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return errorResponse("Server misconfiguration: missing environment variables", 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const profileRes = await supabase
      .from("profiles")
      .select("*")
      .eq("id", studentId)
      .single();

    if (profileRes.error) {
      return errorResponse(profileRes.error.message, 500);
    }
    const profile = profileRes.data;

    const [enrollmentsRes, facultyRes] = await Promise.all([
      supabase
        .from("enrollments")
        .select(
          "*, subjects(name_ar, name_fr, unit_name_ar, unit_name_fr, credits, semester, level)"
        )
        .eq("student_id", studentId),
      profile.faculty_id
        ? supabase
            .from("faculties")
            .select("name_fr, name_ar")
            .eq("id", profile.faculty_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (enrollmentsRes.error) {
      return errorResponse(enrollmentsRes.error.message, 500);
    }

    const enrollments = (enrollmentsRes.data || []).filter(
      (e: any) => e.subjects?.level === level
    );
    const faculty = facultyRes.data || { name_fr: "", name_ar: "" };

    const semester1 = enrollments.filter((e: any) => e.subjects?.semester === 1);
    const semester2 = enrollments.filter((e: any) => e.subjects?.semester === 2);

    const fmt = (v: number | null) =>
      v !== null ? v.toFixed(2) : "\u2014";

    const calcSemStats = (subs: any[]) => {
      const graded = subs.filter((e: any) => e.subject_average !== null);
      const totalCredits = subs.reduce(
        (a: number, e: any) => a + (e.subjects?.credits || 0),
        0
      );
      const earnedCredits = subs.reduce(
        (a: number, e: any) => a + e.credits_earned,
        0
      );
      const avg =
        graded.length > 0
          ? graded.reduce(
              (a: number, e: any) =>
                a + (e.subject_average || 0) * (e.subjects?.credits || 1),
              0
            ) /
            graded.reduce(
              (a: number, e: any) => a + (e.subjects?.credits || 1),
              0
            )
          : null;
      return { totalCredits, earnedCredits, avg };
    };

    const s1Stats = calcSemStats(semester1);
    const s2Stats = calcSemStats(semester2);

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    const ar = (txt: string, x: number, yC: number, opts?: any) => {
      doc.text(shape(txt), x, yC, opts);
    };

    let y = 14;

    doc.setFontSize(9);
    ar("\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u062A\u0634\u0627\u062F", pageW - 14, y, {
      align: "right",
    });
    y += 4;
    doc.setFontSize(8);
    doc.text("Republique du Tchad", 14, y);
    y += 4;

    ar(
      "\u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645 \u0648\u0627\u0644\u0628\u062D\u062A \u0648\u0627\u0644\u062A\u0643\u0648\u064A\u0646 \u0627\u0644\u0639\u0644\u0645\u064A",
      pageW - 14,
      y,
      { align: "right" }
    );
    y += 4;
    doc.text(
      "Ministere de l'Enseignement Superieur de la recherche",
      14,
      y
    );
    y += 4;

    ar(
      "\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0645\u0644\u0643 \u0641\u064A\u0635\u0627\u0644 \u0628\u062A\u0634\u0627\u062F",
      pageW - 14,
      y,
      { align: "right" }
    );
    y += 4;
    doc.text("Universite du Roi Faycal du Tchad", 14, y);
    y += 4;

    if (faculty.name_fr) doc.text(faculty.name_fr, 14, y);
    if (faculty.name_ar)
      ar(faculty.name_ar, pageW - 14, y, { align: "right" });
    y += 6;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageW - 14, y);
    y += 6;

    doc.setFontSize(13);
    ar("\u0643\u0634\u0641 \u0627\u0644\u062F\u0631\u062C\u0627\u062A", pageW / 2, y, {
      align: "center",
    });
    y += 2;
    doc.setFontSize(10);
    doc.text("Releve de Notes", pageW / 2, y, { align: "center" });
    y += 8;

    doc.setFontSize(9);
    const labelColR = pageW - 14;

    const infoRow = (
      labelAr: string,
      valAr: string,
      labelFr: string,
      valFr: string
    ) => {
      ar(labelAr + " " + valAr, labelColR, y, { align: "right" });
      doc.text(labelFr + " " + valFr, 14, y);
      y += 5;
    };

    if (profile) {
      infoRow(
        "\u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0644\u0642\u0628:",
        profile.name_ar || "",
        "Nom & Prenom:",
        profile.name_fr || ""
      );
      infoRow(
        "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u062C\u0627\u0645\u0639\u064A:",
        profile.university_id || "",
        "Section:",
        profile.section || "\u2014"
      );
      infoRow(
        "\u0627\u0644\u0645\u0633\u062A\u0648\u0649:",
        level || "",
        "Niveau:",
        level || ""
      );
      if (profile.date_of_birth) {
        const dob = new Date(profile.date_of_birth).toLocaleDateString();
        infoRow("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u064A\u0644\u0627\u062F:", dob, "Date de naissance:", dob);
      }
      if (profile.place_of_birth) {
        infoRow(
          "\u0645\u0643\u0627\u0646 \u0627\u0644\u0645\u064A\u0644\u0627\u062F:",
          profile.place_of_birth,
          "Lieu de naissance:",
          profile.place_of_birth
        );
      }
    }
    y += 3;

    const buildTable = (
      subs: any[],
      semNum: number,
      stats: ReturnType<typeof calcSemStats>
    ) => {
      doc.setFontSize(10);
      const semTitle = `Semestre ${semNum}`;
      const semTitleAr = `\u0627\u0644\u0641\u0635\u0644 ${
        semNum === 1 ? "\u0627\u0644\u0623\u0648\u0644" : "\u0627\u0644\u062B\u0627\u0646\u064A"
      }`;
      doc.text(semTitle, 14, y);
      ar(semTitleAr, pageW - 14, y, { align: "right" });
      y += 3;

      const head = [
        [
          "Matiere (FR)",
          shape("\u0627\u0644\u0645\u0627\u062F\u0629 (AR)"),
          shape("\u0627\u0644\u0648\u062D\u062F\u0629"),
          shape("\u0627\u0644\u0648\u062D\u062F\u0627\u062A"),
          shape("\u0623\u0639\u0645\u0627\u0644"),
          shape("\u0627\u0645\u062A\u062D\u0627\u0646 \u0661"),
          shape("\u0627\u0645\u062A\u062D\u0627\u0646 \u0662"),
          shape("\u0627\u0644\u0645\u0639\u062F\u0644"),
          shape("\u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0645\u0643\u062A\u0633\u0628\u0629"),
        ],
      ];

      const body = subs.map((e: any) => [
        e.subjects?.name_fr || "",
        shape(e.subjects?.name_ar || ""),
        e.subjects?.unit_name_fr || "",
        e.subjects?.credits || 0,
        fmt(e.classwork),
        fmt(e.exam_session_1),
        fmt(e.exam_session_2),
        fmt(e.subject_average),
        e.credits_earned,
      ]);

      const footRow = [
        {
          content: "Total",
          colSpan: 3,
          styles: { halign: "right", fontStyle: "bold" },
        },
        {
          content: String(stats.totalCredits),
          styles: { halign: "center", fontStyle: "bold" },
        },
        {
          content:
            stats.avg !== null ? stats.avg.toFixed(2) : "\u2014",
          colSpan: 4,
          styles: { halign: "center", fontStyle: "bold" },
        },
        {
          content: String(stats.earnedCredits),
          styles: { halign: "center", fontStyle: "bold" },
        },
      ];

      (doc as any).autoTable({
        startY: y,
        head,
        body,
        foot: [footRow],
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [232, 247, 252],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        footStyles: {
          fillColor: [232, 247, 252],
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 30 },
          2: { cellWidth: 22 },
          3: { cellWidth: 14, halign: "center" },
          4: { cellWidth: 16, halign: "center" },
          5: { cellWidth: 16, halign: "center" },
          6: { cellWidth: 16, halign: "center" },
          7: { cellWidth: 16, halign: "center" },
          8: { cellWidth: 18, halign: "center" },
        },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          y = (doc as any).lastAutoTable.finalY + 8;
        },
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    };

    if (semester1.length > 0) buildTable(semester1, 1, s1Stats);
    if (semester2.length > 0) buildTable(semester2, 2, s2Stats);

    doc.setFontSize(10);
    const totalCredits = s1Stats.totalCredits + s2Stats.totalCredits;
    const totalEarned = s1Stats.earnedCredits + s2Stats.earnedCredits;
    const allGraded = [...semester1, ...semester2].filter(
      (e: any) => e.subject_average !== null
    );
    const overallAvg =
      allGraded.length > 0
        ? allGraded.reduce(
            (a: number, e: any) =>
              a + (e.subject_average || 0) * (e.subjects?.credits || 1),
            0
          ) /
          allGraded.reduce(
            (a: number, e: any) => a + (e.subjects?.credits || 1),
            0
          )
        : null;

    (doc as any).autoTable({
      startY: y,
      head: [[]],
      body: [
        [
          {
            content: "Total Credits",
            styles: { halign: "center", fontStyle: "bold" },
          },
          {
            content: shape(
              "\u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0645\u0643\u062A\u0633\u0628\u0629 / Credits Obtenus"
            ),
            styles: { halign: "center", fontStyle: "bold" },
          },
          {
            content: shape(
              "\u0627\u0644\u0645\u0639\u062F\u0644 \u0627\u0644\u0639\u0627\u0645 / Moyenne Generale"
            ),
            styles: { halign: "center", fontStyle: "bold" },
          },
        ],
        [
          {
            content: String(totalCredits),
            styles: { halign: "center", fontSize: 12, fontStyle: "bold" },
          },
          {
            content: String(totalEarned),
            styles: { halign: "center", fontSize: 12, fontStyle: "bold" },
          },
          {
            content:
              overallAvg !== null ? overallAvg.toFixed(2) : "\u2014",
            styles: { halign: "center", fontSize: 12, fontStyle: "bold" },
          },
        ],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [232, 247, 252] },
      margin: { left: 14, right: 14 },
    });

    const pdfBytes = doc.output("arraybuffer");

    return new Response(pdfBytes, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=releve-notes-${level}-${
          profile?.university_id || "etudiant"
        }.pdf`,
      },
    });
  } catch (err) {
    console.error("generate-report-pdf unhandled error:", err instanceof Error ? err.stack : err);
    return errorResponse(
      err instanceof Error ? err.message : String(err),
      500
    );
  }
});
