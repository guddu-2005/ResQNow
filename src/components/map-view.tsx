
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, memo } from 'react';

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


interface MapViewProps {
  center: [number, number];
  markerPosition: [number, number] | null;
  placeName: string;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapViewComponent({ center, markerPosition, placeName }: MapViewProps) {

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView center={center} zoom={13} />
      {markerPosition && (
        <Marker position={markerPosition}>
          <Popup>
            {placeName || `Lat: ${markerPosition[0].toFixed(4)}, Lon: ${markerPosition[1].toFixed(4)}`}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

const MapView = memo(MapViewComponent);
export default MapView;
