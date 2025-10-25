// src/components/comparison/ComparisonCard.tsx
// Comparison1とComparison2の両方で使える共通カードコンポーネント
import React from 'react';
import type { ReactNode } from 'react';
import './ComparisonCard.scss';

export interface ComparisonCardButton {
  label: string;
  onClick: () => void;
  variant: 'info' | 'target' | 'exam';
}

export interface ComparisonCardField {
  label: string;
  value: ReactNode;
  className?: string;
}

interface ComparisonCardProps {
  fields: ComparisonCardField[];
  buttons: ComparisonCardButton[];
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({ fields, buttons }) => {
  const getButtonClass = (variant: string) => {
    switch (variant) {
      case 'info': return 'btn-info';
      case 'target': return 'btn-target';
      case 'exam': return 'btn-exam';
      default: return 'btn-info';
    }
  };

  return (
    <div className="comparison-card">
      <div className="comparison-card-content">
        {fields.map((field, index) => (
          <div key={index} className={`info-row ${field.className || ''}`}>
            <span className="label">{field.label}</span>
            <span className="value">{field.value}</span>
          </div>
        ))}
      </div>
      <div className="comparison-card-actions">
        {buttons.map((button, index) => (
          <button
            key={index}
            className={`btn ${getButtonClass(button.variant)}`}
            onClick={button.onClick}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};