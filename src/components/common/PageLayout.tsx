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
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  workspaceName,
  workspaceOwner,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  children,
  className = ''
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
      />
      <main className="page-main">
        {children}
      </main>
    </div>
  );
};