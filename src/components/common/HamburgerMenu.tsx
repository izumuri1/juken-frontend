// src/components/common/HamburgerMenu.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  workspaceId?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  isOpen, 
  onToggle,
  onClose,
  workspaceId 
}) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
      navigate('/login');
    }
  };

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
              <li>
                <button onClick={() => handleNavigation(workspaceId ? `/workspace/${workspaceId}` : '/workspaces')}>
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation(workspaceId ? `/workspace/${workspaceId}/comparison1` : '/workspaces')}>
                  志望校情報一覧
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation(workspaceId ? `/workspace/${workspaceId}/comparison2` : '/workspaces')}>
                  受験情報一覧
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/task')}>
                  受験管理
                </button>
              </li>
              <li className="divider"></li>
              <li>
                <button onClick={() => handleNavigation('/workspaces')}>
                  ワークスペース選択
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/tutorial')}>
                  チュートリアル
                </button>
              </li>
              <li>
                <button onClick={handleLogout}>
                  ログアウト
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};