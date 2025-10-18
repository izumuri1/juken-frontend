// src/components/common/HamburgerMenu.tsx (新規ファイル)
import React from 'react';

interface HamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  isOpen, 
  onToggle,
  onClose 
}) => {
  return (
    <>
      <button 
        className="hamburger-menu"
        onClick={onToggle}
        aria-label="メニュー"
      >
        <span className="hamburger-icon">≡</span>
      </button>
      
      {isOpen && (
        <div className="side-menu-overlay" onClick={onClose}>
          <nav className="side-menu" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={onClose}>✕</button>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/school">School</a></li>
              <li><a href="/target">Target</a></li>
              <li><a href="/exam">Exam</a></li>
              <li><a href="/comparison">Comparison</a></li>
              <li><a href="/task">Task</a></li>
              <li className="divider"></li>
              <li><a href="/workspace">ワークスペース選択</a></li>
              <li><a href="/tutorial">チュートリアル</a></li>
              <li><a href="/logout">ログアウト</a></li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};