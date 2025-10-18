// src/components/SchoolMap.tsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leafletのデフォルトアイコンの問題を修正
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface SchoolMapProps {
  latitude: number;
  longitude: number;
  schoolName: string;
}

export const SchoolMap: React.FC<SchoolMapProps> = ({
  latitude,
  longitude,
  schoolName,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // 地図がすでに初期化されている場合は何もしない
    if (mapInstanceRef.current) return;

    // 地図コンテナが存在しない場合は何もしない
    if (!mapRef.current) return;

    // 地図を初期化
    const map = L.map(mapRef.current).setView([latitude, longitude], 15);

    // OpenStreetMapのタイルレイヤーを追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // マーカーを追加
    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`<strong>${schoolName}</strong>`)
      .openPopup();

    // 地図インスタンスを保存
    mapInstanceRef.current = map;

    // クリーンアップ関数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, schoolName]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
};