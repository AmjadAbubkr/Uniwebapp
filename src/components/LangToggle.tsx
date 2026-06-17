import React from 'react';
import { useLang } from '../context/LanguageContext';

export const LangToggle: React.FC = () => {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={toggleLang}
      className="flex items-center space-x-2 px-4 py-2.5 bg-[#f3fcf6] hover:bg-[#067647] hover:text-white text-[#067647] border border-[#067647]/30 font-semibold text-sm rounded-md cursor-pointer transition-all"
    >
      <span>{lang === 'fr' ? '🌐 العربية' : '🌐 Français'}</span>
    </button>
  );
};
