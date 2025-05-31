import React, { useState } from 'react';

interface Props {
  value: 'vi' | 'en';
  onChange: (lang: 'vi' | 'en') => void;
  dark?: boolean;
}

const LANGS = [
  { value: 'vi', label: 'Tiếng Việt', icon: '🇻🇳' },
  { value: 'en', label: 'English', icon: '🇬🇧' },
];

const LanguageDropdown: React.FC<Props> = ({ value, onChange, dark }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (lang: 'vi' | 'en') => {
    onChange(lang);
    setIsOpen(false); // Collapse dropdown after selection
  };

  return (
    <div className="relative inline-block w-full">
      <button
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg ${
          dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } shadow-sm focus:outline-none transition-colors duration-200`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>
          {LANGS.find((l) => l.value === value)?.icon} {LANGS.find((l) => l.value === value)?.label}
        </span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div
          className={`absolute left-0 mt-2 w-full rounded-lg shadow-lg z-10 ${
            dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
        >
          {LANGS.map((lang) => (
            <button
              key={lang.value}
              className={`flex items-center w-full px-3 py-2 text-left ${
                dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'
              } transition-colors duration-200`}
              onClick={() => handleSelect(lang.value as 'vi' | 'en')}
            >
              <span className="mr-2">{lang.icon}</span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
