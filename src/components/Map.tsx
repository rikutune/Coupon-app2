import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Store } from '../data/stores';

// Replace with your actual Mapbox access token
// You'll need to sign up at mapbox.com for a free token
mapboxgl.accessToken = 'pk.eyJ1IjoicmVwbGFjZXdpdGh5b3VydG9rZW4iLCJhIjoiY2xyeXBlbmV3amRpIjozMnpobnRib290amRod2pyIn0.RxUmT07SFxTZvD0Krc6rWQ';

interface MapProps {
  stores: Store[];
}

const Map: React.FC<MapProps> = ({ stores }) => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([139.7671, 35.6812]); // Tokyo Station default
  
  // Initialize map when component mounts
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [userLocation[0], userLocation[1]],
        zoom: 12,
        pitch: 45, // Add pitch for 3D effect
        bearing: 0,
        antialias: true // Enables antialiasing for smoother rendering
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl());
      
      // Try to get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            setUserLocation([longitude, latitude]);
            map.current?.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              essential: true
            });
          },
          () => {
            // Error or permission denied - keep default location
            console.log('Unable to get location - using default');
          }
        );
      }

      // Enable 3D buildings
      map.current.on('load', () => {
        if (!map.current) return;
        
        // Add 3D building layer
        map.current.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });

        // Add markers for each store
        stores.forEach(store => {
          // Create a marker element
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/pin.png)';
          el.style.width = '32px';
          el.style.height = '32px';
          el.style.backgroundSize = 'cover';
          el.style.cursor = 'pointer';
          
          // Create a popup
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="text-center">
                <h3 class="font-bold">${store.name}</h3>
                <p class="text-red-600 font-semibold">${store.discount}</p>
                <button
                  class="mt-2 px-4 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 view-details"
                  data-store-id="${store.id}"
                >
                  View Details
                </button>
              </div>
            `);

          // Add the marker to the map
          new mapboxgl.Marker(el)
            .setLngLat([store.coordinates[1], store.coordinates[0]]) // Mapbox uses [lng, lat] order
            .setPopup(popup)
            .addTo(map.current!);
            
          // Add click handler for the marker
          el.addEventListener('click', () => {
            navigate(`/store/${store.id}`);
          });
        });
        
        // Add click event for popup buttons
        map.current.getCanvas().addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains('view-details')) {
            const storeId = target.getAttribute('data-store-id');
            if (storeId) {
              navigate(`/store/${storeId}`);
            }
          }
        });
        
        // Add click handler for the map itself
        map.current.on('click', (e) => {
          // Find closest store to the click point
          const clickPoint = [e.lngLat.lng, e.lngLat.lat];
          let closestStore = null;
          let closestDistance = Infinity;
          
          stores.forEach(store => {
            const storeLng = store.coordinates[1]; // Longitude
            const storeLat = store.coordinates[0]; // Latitude
            
            // Simple distance calculation (this is not perfect but works for demo)
            const distance = Math.sqrt(
              Math.pow(clickPoint[0] - storeLng, 2) + 
              Math.pow(clickPoint[1] - storeLat, 2)
            );
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestStore = store;
            }
          });
          
          // If click is close enough to a store (threshold of 0.01 degree)
          if (closestStore && closestDistance < 0.01) {
            navigate(`/store/${closestStore.id}`);
          }
        });
      });
    }
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [stores, navigate]);

  // Add user location marker when location changes
  useEffect(() => {
    if (!map.current) return;
    
    // User location marker
    const userMarker = new mapboxgl.Marker({
      color: '#3b82f6',
      scale: 1
    })
      .setLngLat([userLocation[0], userLocation[1]])
      .addTo(map.current);
      
    // Add pulsing effect
    const pulsingDot = {
      width: 100,
      height: 100,
      data: new Uint8Array(100 * 100 * 4),
      
      onAdd: function() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
      },
      
      render: function() {
        const duration = 1000;
        const t = (performance.now() % duration) / duration;
        
        const radius = (this.width / 2) * 0.3;
        const outerRadius = (this.width / 2) * 0.7 * t + radius;
        const context = this.context;
        
        // Draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
          this.width / 2,
          this.height / 2,
          outerRadius,
          0,
          Math.PI * 2
        );
        context.fillStyle = `rgba(66, 133, 244, ${1 - t})`;
        context.fill();
        
        // Draw inner circle
        context.beginPath();
        context.arc(
          this.width / 2,
          this.height / 2,
          radius,
          0,
          Math.PI * 2
        );
        context.fillStyle = 'rgba(66, 133, 244, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();
        
        // Update this image's data with data from the canvas
        this.data = context.getImageData(0, 0, this.width, this.height).data;
        
        // Continuously repaint until stop is called
        map.current?.triggerRepaint();
        
        // Return `true` to let the map know that the image was updated
        return true;
      }
    };
    
    // Clean up
    return () => {
      userMarker.remove();
    };
  }, [userLocation]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default Map;
