// src/components/school/SchoolBasicInfo.tsx
// 学校基本情報表示コンポーネント（学校名、都道府県、学校所在地）

import React from 'react';
import './SchoolBasicInfo.scss';

interface SchoolBasicInfoProps {
  name: string;
  prefecture: string;
  address: string;
}

export const SchoolBasicInfo: React.FC<SchoolBasicInfoProps> = ({
  name,
  prefecture,
  address
}) => {
  return (
    <div className="info-card">
      <div className="info-row">
        <span className="label">学校名</span>
        <span className="value">{name}</span>
      </div>
      <div className="info-row">
        <span className="label">都道府県</span>
        <span className="value">{prefecture}</span>
      </div>
      <div className="info-row">
        <span className="label">所在地</span>
        <span className="value">{address}</span>
      </div>
    </div>
  );
};