import React, { createContext, useContext, useState } from 'react';

type Lang = 'fr' | 'ar';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (fr: string, ar: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'fr');

  const toggleLang = () => {
    setLang(prev => {
      const next = prev === 'fr' ? 'ar' : 'fr';
      localStorage.setItem('lang', next);
      return next;
    });
  };

  const t = (fr: string, ar: string) => lang === 'fr' ? fr : ar;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
};
