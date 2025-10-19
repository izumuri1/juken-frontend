// src/components/common/ActionButtons.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ActionButtons.scss';

interface ButtonConfig {
  label: string;
  onClick?: () => void;
  path?: string;
  variant?: 'primary' | 'info' | 'target' | 'exam' | 'home';  // 'target'を追加
  disabled?: boolean;
}

interface ActionButtonsProps {
  workspaceId: string;
  buttons: ButtonConfig[];
  direction?: 'horizontal' | 'vertical';  // ← 追加
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  workspaceId, 
  buttons,
  direction = 'horizontal'  // ← デフォルトは横並び
}) => {
  const navigate = useNavigate();

  const handleClick = (button: ButtonConfig) => {
    if (button.onClick) {
      button.onClick();
    } else if (button.path) {
      navigate(button.path);
    }
  };

  return (
    <div className={`action-buttons action-buttons--${direction}`}>
      {buttons.map((button, index) => (
        <button
          key={index}
          className={`btn-${button.variant || 'primary'}`}
          onClick={() => handleClick(button)}
          disabled={button.disabled}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};