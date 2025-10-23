// src/components/common/PageLayout.tsx (新規作成)
import React, { ReactNode, useState } from 'react';  // ← useStateを追加
import { PageHeader } from './PageHeader';
import Tutorial from '../Tutorial';  // ← 追加
import './PageLayout.scss';

interface PageLayoutProps {
  workspaceName: string;
  workspaceOwner: string;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  children: ReactNode;
  className?: string;
  workspaceId?: string;  // ← 追加
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  workspaceName,
  workspaceOwner,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  workspaceId,
  className = ''  // ← この行を追加
}) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);  // ← 追加

  return (
    <div className={`page-container ${className}`}>
      <PageHeader
        workspaceName={workspaceName}
        workspaceOwner={workspaceOwner}
        isMenuOpen={isMenuOpen}
        onMenuToggle={onMenuToggle}
        onMenuClose={onMenuClose}
        className="page-header"  // ← この行を追加
        workspaceId={workspaceId}
        onTutorialOpen={() => setIsTutorialOpen(true)}
      />
      <main className="page-main">{children}</main>
      
      {/* ← チュートリアルモーダルを追加 */}
      <Tutorial 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
    </div>
  );
};