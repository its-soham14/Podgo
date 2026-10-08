import { useEffect, useState, useMemo } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

function MapAnimator({ origin, destination, routePoints }) {
  const map = useMap();

  useEffect(() => {
    if (origin && destination) {
      if (routePoints && routePoints.length > 0) {
        // Find bounds of the actual route to frame it perfectly
        const bounds = L.latLngBounds(routePoints);
        map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
      } else {
        // Fallback bounds
        const bounds = L.latLngBounds([
          [origin.lat, origin.lng],
          [destination.lat, destination.lng]
        ]);
        map.flyToBounds(bounds, { padding: [60, 60], duration: 1.2 });
      }
    } else if (origin) {
      map.flyTo([origin.lat, origin.lng], 13, { duration: 1.2 });
    } else if (destination) {
      map.flyTo([destination.lat, destination.lng], 13, { duration: 1.2 });
    } else {
      // Default India view
      map.flyTo([20.5937, 78.9629], 5, { duration: 1.2 });
    }
  }, [origin, destination, routePoints, map]);

  return null;
}

function MapDragger({ onMapClick }) {
  useMapEvents({
    click(event) {
      if (onMapClick) {
        onMapClick({
          lat: event.latlng.lat,
          lng: event.latlng.lng
        });
      }
    }
  });
  return null;
}

export default function MapComponent({ origin, destination, onMapClick, onRouteExtracted, onOriginDrag, onDestinationDrag }) {
  const [routePoints, setRoutePoints] = useState([]);

  useEffect(() => {
    if (origin && destination) {
      const fetchRoute = async () => {
        try {
          const res = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
          );
          if (res.data.routes && res.data.routes.length > 0) {
            const coords = res.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRoutePoints(coords);
            
            // Convert to format expected by parent
            if (onRouteExtracted) {
              const waypoints = coords.map(c => ({ lat: c[0], lng: c[1] }));
              onRouteExtracted(waypoints);
            }
          }
        } catch (error) {
          console.error("OSRM Route fetching error:", error);
          // Fallback to straight line
          setRoutePoints([
            [origin.lat, origin.lng],
            [destination.lat, destination.lng]
          ]);
          if (onRouteExtracted) {
            onRouteExtracted([{ lat: origin.lat, lng: origin.lng }, { lat: destination.lat, lng: destination.lng }]);
          }
        }
      };
      fetchRoute();
    } else {
      setRoutePoints([]);
      if (onRouteExtracted && origin) {
        onRouteExtracted([{ lat: origin.lat, lng: origin.lng }]);
      }
    }
  }, [origin, destination, onRouteExtracted]);

  const originHandlers = useMemo(() => ({
    dragend(e) {
      const marker = e.target;
      const position = marker.getLatLng();
      if (onOriginDrag) {
        onOriginDrag({ lat: position.lat, lng: position.lng });
      }
    },
  }), [onOriginDrag]);

  const destinationHandlers = useMemo(() => ({
    dragend(e) {
      const marker = e.target;
      const position = marker.getLatLng();
      if (onDestinationDrag) {
        onDestinationDrag({ lat: position.lat, lng: position.lng });
      }
    },
  }), [onDestinationDrag]);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      scrollWheelZoom={true}
      className="h-full w-full"
      style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapAnimator origin={origin} destination={destination} routePoints={routePoints} />

      {origin && <Marker draggable={true} eventHandlers={originHandlers} position={[origin.lat, origin.lng]} />}
      {destination && <Marker draggable={true} eventHandlers={destinationHandlers} position={[destination.lat, destination.lng]} />}
      
      {/* Black route line to mimic Uber */}
      {routePoints.length > 1 && <Polyline positions={routePoints} color="#000000" weight={4} opacity={0.8} />}

      <MapDragger onMapClick={onMapClick} />
    </MapContainer>
  );
}
