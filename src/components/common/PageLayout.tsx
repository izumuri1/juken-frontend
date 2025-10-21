// src/components/common/PageLayout.tsx (新規作成)
import React, { ReactNode } from 'react';
import { PageHeader } from './PageHeader';
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
  workspaceName,
  workspaceOwner,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  children,
  className = '',
  workspaceId  // ← 追加
}) => {
  return (
    <div className={`page-container ${className}`}>
      <PageHeader
        workspaceName={workspaceName}
        workspaceOwner={workspaceOwner}
        isMenuOpen={isMenuOpen}
        onMenuToggle={onMenuToggle}
        onMenuClose={onMenuClose}
        className="page-header"
        workspaceId={workspaceId}  // ← 追加
      />
      <main className="page-main">
        {children}
      </main>
    </div>
  );
};