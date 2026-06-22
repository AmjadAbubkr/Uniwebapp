import React from 'react';
import { useLang } from '../context/LanguageContext';

export const LangToggle: React.FC = () => {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={toggleLang}
      className="flex items-center space-x-2 px-4 py-2.5 bg-[#e8f7fc] hover:bg-[#00b4d8] hover:text-white text-[#00b4d8] border border-[#00b4d8]/30 font-semibold text-sm rounded-md cursor-pointer transition-colors active:scale-[0.96]"
    >
      <span>{lang === 'fr' ? '🌐 العربية' : '🌐 Français'}</span>
    </button>
  );
};
