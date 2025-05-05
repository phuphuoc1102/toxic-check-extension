import React, {useRef, useState, useEffect, useCallback} from 'react';
import Button from './Button';
import '../css/vault.css';

interface ButtonBarProps {
  onButtonPress: (label: string) => void;
  data: string[];
}

const ButtonBar: React.FC<ButtonBarProps> = ({onButtonPress, data}) => {
  const [activeButton, setActiveButton] = useState<string>('all');
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(false);
  const buttonBarRef = useRef<HTMLDivElement>(null);

  const SCROLL_STEP = 200; // Đoạn cuộn mỗi lần nhấn nút (pixels)

  // Kiểm tra hiển thị nút
  const checkArrowVisibility = useCallback(() => {
    if (buttonBarRef.current) {
      const {scrollWidth, clientWidth, scrollLeft} = buttonBarRef.current;
      setShowLeftArrow(scrollLeft > 0); // Hiển thị mũi tên trái nếu không ở đầu
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth); // Hiển thị mũi tên phải nếu không ở cuối
    }
  }, []);

  useEffect(() => {
    // Kiểm tra khi render lần đầu
    checkArrowVisibility();

    // Lắng nghe sự kiện resize để cập nhật hiển thị nút mũi tên
    const handleResize = () => checkArrowVisibility();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [checkArrowVisibility]);

  const handleScroll = () => {
    checkArrowVisibility(); // Kiểm tra lại khi cuộn
  };

  const handleButtonClick = (label: string) => {
    setActiveButton(label);
    onButtonPress(label);
  };

  const scrollLeft = () => {
    if (buttonBarRef.current) {
      buttonBarRef.current.scrollBy({left: -SCROLL_STEP, behavior: 'smooth'});
    }
  };

  const scrollRight = () => {
    if (buttonBarRef.current) {
      buttonBarRef.current.scrollBy({left: SCROLL_STEP, behavior: 'smooth'});
    }
  };

  return (
    <div className="button-bar flex items-center">
      {/* Hiển thị mũi tên trái */}
      {showLeftArrow && (
        <button
          className="arrow-button absolute left-0 z-10 flex items-center justify-center bg-white shadow-md"
          onClick={scrollLeft}
          aria-label="Scroll to start">
          <img src="./icons/left.png" alt="Scroll Left" />
        </button>
      )}
      <div
        ref={buttonBarRef}
        className="flex overflow-hidden scroll-smooth"
        onScroll={handleScroll}>
        {data.map(label => (
          <Button
            key={label}
            label={label}
            isActive={activeButton === label}
            onClick={() => handleButtonClick(label)}
          />
        ))}
      </div>
      {/* Hiển thị mũi tên phải */}
      {showRightArrow && (
        <button
          className="arrow-button absolute right-0 z-10 flex items-center justify-center bg-white shadow-md"
          onClick={scrollRight}
          aria-label="Scroll to end">
          <img src="./icons/right.png" alt="Scroll Right" />
        </button>
      )}
    </div>
  );
};

export default ButtonBar;
