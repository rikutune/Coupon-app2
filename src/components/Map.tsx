import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store } from '../data/stores';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationUpdaterProps {
  onLocationFound: (lat: number, lng: number) => void;
}

const LocationUpdater: React.FC<LocationUpdaterProps> = ({ onLocationFound }) => {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 14 });
    
    map.on('locationfound', (e) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
    });

    map.on('locationerror', () => {
      // Default to Tokyo Station if location access is denied
      map.setView([35.6812, 139.7671], 12);
    });
  }, [map, onLocationFound]);

  return null;
};

interface MapProps {
  stores: Store[];
}

const Map: React.FC<MapProps> = ({ stores }) => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const handleLocationFound = (lat: number, lng: number) => {
    setUserLocation([lat, lng]);
  };

  return (
    <MapContainer
      center={[35.6812, 139.7671]} // Tokyo Station as default center
      zoom={12}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationUpdater onLocationFound={handleLocationFound} />
      
      {userLocation && (
        <Marker
          position={userLocation}
          icon={new Icon({
            ...defaultIcon,
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            className: 'pulse-marker'
          })}
        >
          <Popup>You are here</Popup>
        </Marker>
      )}

      {stores.map((store) => (
        <Marker
          key={store.id}
          position={store.coordinates}
          icon={defaultIcon}
          eventHandlers={{
            click: () => navigate(`/store/${store.id}`)
          }}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">{store.name}</h3>
              <p className="text-red-600 font-semibold">{store.discount}</p>
              <button
                onClick={() => navigate(`/store/${store.id}`)}
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;