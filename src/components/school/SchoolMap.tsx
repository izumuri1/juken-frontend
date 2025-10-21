// src/components/school/SchoolMap.tsx
// 学校地図表示コンポーネント

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './SchoolMap.scss';

// Leafletアイコン設定
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SchoolMapProps {
  latitude: number;
  longitude: number;
  schoolName: string;
}

export const SchoolMap: React.FC<SchoolMapProps> = ({
  latitude,
  longitude,
  schoolName
}) => {
  return (
    <div className="map-container">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '200px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[latitude, longitude]}>
          <Popup>{schoolName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};