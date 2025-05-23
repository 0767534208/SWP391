import React, { useState } from 'react';
import { FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();

  const languages = [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher">
      <button 
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <FaGlobe className="globe-icon" />
        <span>{i18n.language === 'vi' ? 'VI' : 'EN'}</span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 