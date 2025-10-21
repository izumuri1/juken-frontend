// src/components/school/SchoolDetailsInfo.tsx
// 登録済み学校情報表示コンポーネント

import React from 'react';
import './SchoolDetailsInfo.scss';

interface SchoolDetailsInfoProps {
  hasCafeteria: boolean | null;
  hasUniform: boolean | null;
  commuteRoute?: string | null;
  commuteTime?: number | null;
  nearestStation?: string | null;
  officialWebsite?: string | null;
}

export const SchoolDetailsInfo: React.FC<SchoolDetailsInfoProps> = ({
  hasCafeteria,
  hasUniform,
  commuteRoute,
  commuteTime,
  nearestStation,
  officialWebsite
}) => {
  return (
    <div className="details-card">
      <h3 className="card-subtitle">登録済み学校情報</h3>
      <div className="info-row">
        <span className="label">学食・購買:</span>
        <span className="value">
          {hasCafeteria === null ? '未設定' : hasCafeteria ? 'あり' : 'なし'}
        </span>
      </div>
      <div className="info-row">
        <span className="label">制服:</span>
        <span className="value">
          {hasUniform === null ? '未設定' : hasUniform ? 'あり' : 'なし'}
        </span>
      </div>
      <div className="info-row">
        <span className="label">通学経路:</span>
        <span className="value">{commuteRoute || '未設定'}</span>
      </div>
      <div className="info-row">
        <span className="label">通学時間:</span>
        <span className="value">
          {commuteTime ? `${commuteTime}分` : '未設定'}
        </span>
      </div>
      <div className="info-row">
        <span className="label">最寄駅:</span>
        <span className="value">{nearestStation || '未設定'}</span>
      </div>
      <div className="info-row">
        <span className="label">公式サイト:</span>
        <span className="value">
          {officialWebsite ? (
            <a 
              href={officialWebsite} 
              target="_blank" 
              rel="noopener noreferrer"
              className="website-link"
            >
              {officialWebsite}
            </a>
          ) : (
            '未設定'
          )}
        </span>
      </div>
    </div>
  );
};