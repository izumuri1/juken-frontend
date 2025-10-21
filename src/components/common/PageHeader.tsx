// src/components/common/PageHeader.tsx (新規ファイル)
import React from 'react';
import { HamburgerMenu } from './HamburgerMenu';

interface PageHeaderProps {
  workspaceName: string;
  workspaceOwner: string;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  className?: string;
  workspaceId?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  workspaceName, 
  workspaceOwner, 
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  className = 'home-header',
  workspaceId  // ← 追加
}) => {
  return (
    <header className={className}>
      <HamburgerMenu 
        isOpen={isMenuOpen} 
        onToggle={onMenuToggle}
        onClose={onMenuClose}
        workspaceId={workspaceId}  // ← 追加
      />
      
      <div className="header-center">
        <h1 className="workspace-name">{workspaceName}</h1>
        <p className="workspace-owner">オーナー: {workspaceOwner}</p>
      </div>

      <div style={{ width: '40px' }}></div>
    </header>
  );
};