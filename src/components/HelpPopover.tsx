import { useState, useRef, useEffect } from 'react';

interface HelpPopoverProps {
  content: string;
}

const HelpPopover = ({ content }: HelpPopoverProps) => {
  const [show, setShow] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (show && popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect();
      const padding = 10; // 距离边缘的最小间距
      let move = 0;

      // 检测右侧溢出
      if (rect.right > window.innerWidth - padding) {
        move = window.innerWidth - padding - rect.right;
      }
      // 检测左侧溢出
      if (rect.left < padding) {
        move = padding - rect.left;
      }

      setOffset(move);
    } else {
      setOffset(0);
    }
  }, [show]);

  return (
    <div className="relative inline-block ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-gray-500 hover:text-white transition focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </button>

      {show && (
        <div
          ref={popoverRef}
          style={{
            transform: `translateX(calc(-50% + ${offset}px))`
          }}
          className="absolute z-50 bottom-full mb-2 left-1/2 w-64 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl text-xs text-gray-200 leading-relaxed pointer-events-none transition-all duration-200"
        >
          {content}
          {/* 小箭头逻辑：反向补偿位移以保持指向问号 */}
          <div
            style={{ transform: `translateX(calc(-50% - ${offset}px))` }}
            className="absolute top-full left-1/2 border-8 border-transparent border-t-gray-800"
          ></div>
        </div>
      )}
    </div>
  );
};

export default HelpPopover;