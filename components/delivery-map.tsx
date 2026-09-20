'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom distinct icons for clarity
const storeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/888/888063.png', // Store icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png', // Home icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const riderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', // Bike icon
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});


// Auto-fit bounds component
function FitRoute({ route, riderCoord, customerCoord }: { route: [number, number][], riderCoord: [number, number], customerCoord: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    // Fit bounds to show both the rider and the customer, regardless of the route
    const bounds = L.latLngBounds([riderCoord, customerCoord]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }, [riderCoord, customerCoord, map]);
  return null;
}

// Distance helper to prevent API spam
function getDistance(coord1: [number, number], coord2: [number, number]) {
  const R = 6371e3; // metres
  const φ1 = coord1[0] * Math.PI/180;
  const φ2 = coord2[0] * Math.PI/180;
  const Δφ = (coord2[0]-coord1[0]) * Math.PI/180;
  const Δλ = (coord2[1]-coord1[1]) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function DeliveryMap({ 
  status, 
  compact = false,
  storeCoord = [12.9352, 77.6245],
  customerCoord = [12.9716, 77.5946],
  riderCoord
}: { 
  status?: string, 
  compact?: boolean,
  storeCoord?: [number, number],
  customerCoord?: [number, number],
  riderCoord?: [number, number] | null
}) {
  const [routeData, setRouteData] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);
  const lastFetchedRiderCoord = useRef<[number, number] | null>(null);

  // Determine actual starting point for the route
  // The user explicitly wants the route from the delivery boy's current location to the customer, regardless of status.
  const startCoord = riderCoord ? riderCoord : storeCoord;

  useEffect(() => {
    const fetchRoute = async () => {
      // Don't re-fetch if we fetched recently for a nearby coordinate (within 50 meters)
      if (
        startCoord === riderCoord && 
        lastFetchedRiderCoord.current && 
        getDistance(lastFetchedRiderCoord.current, riderCoord) < 50
      ) {
        return; 
      }
      
      try {
        if (routeData.length === 0) setLoading(true); // Only show loading on initial fetch
        
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${customerCoord[1]},${customerCoord[0]}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data && data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates;
          const leafletRoute = coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
          setRouteData(leafletRoute);
          if (startCoord === riderCoord) {
            lastFetchedRiderCoord.current = riderCoord;
          }
        } else {
          setRouteData([startCoord, customerCoord]);
        }
      } catch (err) {
        console.error("Failed to fetch route", err);
        if (routeData.length === 0) setRouteData([startCoord, customerCoord]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoute();
  }, [startCoord[0], startCoord[1], customerCoord[0], customerCoord[1]]);

  // Determine rider position for marker
  let riderPosition: [number, number] = storeCoord;
  if (riderCoord) {
    riderPosition = riderCoord;
  } else if (routeData.length > 0) {
    if (status === 'Delivered') {
      riderPosition = routeData[routeData.length - 1];
    } else if (status === 'On the way') {
      const midIndex = Math.floor(routeData.length / 2);
      riderPosition = routeData[midIndex];
    } else if (status === 'Picked up') {
      const pickIndex = Math.min(2, routeData.length - 1);
      riderPosition = routeData[pickIndex];
    }
  }

  if (loading && routeData.length === 0) {
    return <div className={`w-full rounded-2xl bg-zinc-100 animate-pulse ${compact ? 'h-[220px]' : 'h-[440px]'}`} />
  }

  return (
    <div className={`relative w-full overflow-hidden border-b border-zinc-100 bg-zinc-50 ${compact ? 'h-[220px]' : 'h-[440px]'}`}>
      <MapContainer 
        key={`map-${customerCoord[0]}-${customerCoord[1]}`} // Re-mount only if customer changes
        center={storeCoord} 
        zoom={13} 
        scrollWheelZoom={false} 
        className="h-full w-full z-0"
      >
        <TileLayer 
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitRoute route={routeData} riderCoord={riderPosition} customerCoord={customerCoord} />
        
        {/* Main route from rider/store to destination */}
        {routeData.length > 0 && (
          <Polyline 
            positions={routeData} 
            pathOptions={{ color: '#10b981', weight: 6, opacity: 0.8, lineCap: 'round' }} 
          />
        )}
        
        {/* Markers */}
        <Marker position={storeCoord} icon={storeIcon} />
        <Marker position={customerCoord} icon={customerIcon} />
        <Marker position={riderPosition} icon={riderIcon} />
        
      </MapContainer>
    </div>
  )
}
