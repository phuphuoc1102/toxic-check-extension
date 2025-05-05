import React, { useRef, useEffect } from 'react';

interface FormFieldProps {
  value: string;
  placeholder: string;
  handleChangeText: (text: string) => void;
  otherStyles?: string;
  isSearch?: boolean;
}

const SearchInput: React.FC<FormFieldProps> = ({
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  isSearch,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearch && inputRef.current) {
      inputRef.current.focus();
    } else if (inputRef.current) {
      inputRef.current.blur(); // Blur nếu isSearch là false
    }
  }, [isSearch]);

  return (
    <div
      className={` relative rounded-xl flex items-center  ${otherStyles}`}>
      <input
        ref={inputRef}
        className="bg-box text-base flex-1 font-medium text-text px-14 py-2 rounded-[20px] focus:outline-none "
        value={value}
        placeholder={placeholder}
        onChange={e => handleChangeText(e.target.value)}
      />

      <div className="absolute left-6">
        <img src={'./icons/search.png'} className="w-5 h-5" alt="search" />
      </div>
      {value.length > 0 && (
        <div
          className="absolute right-6 cursor-pointer"
          onClick={() => handleChangeText('')}>
          <img src={'./icons/close.png'} className="w-5 h-5" alt="close" />
        </div>
      )}
    </div>
  );
};

export default SearchInput;
