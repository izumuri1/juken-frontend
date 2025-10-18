// src/components/common/InfoCard.tsx (新規ファイル)
import React from 'react';

interface InfoRow {
  label: string;
  value: string | number;
}

interface InfoCardProps {
  title?: string;
  badge?: React.ReactNode;
  rows: InfoRow[];
  actions?: React.ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ 
  title,
  badge,
  rows, 
  actions, 
  className = '' 
}) => {
  return (
    <div className={`info-card ${className}`}>
      {(title || badge) && (
        <div className="card-header">
          {title && <h3 className="school-name">{title}</h3>}
          {badge}
        </div>
      )}
      <div className="card-body">
        {rows.map((row, index) => (
          <div key={index} className="card-info-row">
            <span className="label">{row.label}:</span>
            <span className="value">{row.value}</span>
          </div>
        ))}
      </div>
      {actions && <div className="card-actions">{actions}</div>}
    </div>
  );
};