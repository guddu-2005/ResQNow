
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default icon issue with Webpack
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
}

interface MapViewProps {
  center: [number, number];
  placeName: string;
}

// This component will handle map view changes
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapView({ center, placeName }: MapViewProps) {
  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView center={center} zoom={13} />
      <Marker position={center}>
          <Popup>
            {placeName || `Lat: ${center[0].toFixed(4)}, Lon: ${center[1].toFixed(4)}`}
          </Popup>
      </Marker>
    </MapContainer>
  );
}

export default MapView;
