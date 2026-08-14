import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Heart, 
  Sparkles, 
  Navigation, 
  RefreshCw, 
  Crosshair, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Users, 
  Zap,
  Coffee,
  Compass,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, activitiesAPI } from '@/lib/api';

// Helper to calculate exact distance between two lat/lng coordinates in km (Haversine formula)
const calculateHaversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

// Component to handle smooth Leaflet map camera movement
function MapController({ center, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, {
        duration: 1.8,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Custom Marker for Nearby Users
const createAvatarIcon = (photoUrl, gender) => {
  const borderColor = gender === 'female' ? '#ec4899' : '#6366f1';
  return L.divIcon({
    className: 'custom-avatar-marker',
    html: `
      <div style="
        position: relative;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3.5px solid ${borderColor};
        box-shadow: 0 4px 18px rgba(0,0,0,0.4);
        background-color: white;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 11px;
          height: 11px;
          background-color: #22c55e;
          border: 2px solid white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -25]
  });
};

// Custom Marker for Spontaneous Events / Invites
const createEventIcon = (category) => {
  const emojiMap = {
    coffee: '☕',
    drinks: '🍻',
    sports: '🏃',
    culture: '🎭',
    games: '🎮',
    other: '🎉'
  };
  const emoji = emojiMap[category] || '⚡';

  return L.divIcon({
    className: 'custom-event-marker',
    html: `
      <div style="position: relative; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(168, 85, 247, 0.4);
          animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #e11d48 100%);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 20px rgba(192, 38, 211, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
        ">
          ${emoji}
        </div>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -23]
  });
};

// Custom Pulsing Marker for User's Own Real-time Location
const createSelfIcon = () => {
  return L.divIcon({
    className: 'self-location-marker',
    html: `
      <div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(236, 72, 153, 0.4);
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          border: 3.5px solid white;
          border-radius: 50%;
          box-shadow: 0 0 25px rgba(236, 72, 153, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        ">
          ✨
        </div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25]
  });
};

const NearbyMap = ({ radius = 15 }) => {
  const navigate = useNavigate();
  const [selectedRadius, setSelectedRadius] = useState(radius);

  const defaultLocation = [-23.5505, -46.6333];
  const [myLocation, setMyLocation] = useState(defaultLocation);
  const [gpsStatus, setGpsStatus] = useState('locating');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Live real data
  const [realUsers, setRealUsers] = useState([]);
  const [realEvents, setRealEvents] = useState([]);

  useEffect(() => {
    requestLiveLocation();
  }, []);

  useEffect(() => {
    fetchNearbyData();
  }, [myLocation, selectedRadius]);

  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }

    setGpsStatus('locating');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = [latitude, longitude];
        setMyLocation(newCoords);
        setGpsStatus('active');
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        try {
          await usersAPI.updateProfile({ latitude, longitude });
        } catch (err) {
          console.warn('Backend location sync notice:', err.message);
        }
      },
      (error) => {
        console.warn('Geolocation error fallback:', error.message);
        setGpsStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 3000
      }
    );
  };

  const fetchNearbyData = async () => {
    try {
      const [usersRes, actRes] = await Promise.all([
        usersAPI.discover({ radius: selectedRadius, available_now: true }),
        activitiesAPI.getNearby({ radius: selectedRadius })
      ]);
      setRealUsers(usersRes.data.users || []);
      setRealEvents(actRes.data.activities || []);
    } catch (err) {
      console.warn('Error fetching map data:', err);
    }
  };

  const handleJoinEventFromMap = async (eventId) => {
    try {
      await activitiesAPI.join(eventId);
      fetchNearbyData();
    } catch (err) {
      console.error('Error joining event:', err);
    }
  };

  const [lat, lng] = myLocation;

  const mapUsersList = realUsers.map(u => ({
    ...u,
    lat: u.latitude || lat,
    lng: u.longitude || lng,
    distance: calculateHaversine(lat, lng, u.latitude || lat, u.longitude || lng)
  }));


  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-purple-100 bg-white">
      
      {/* Map Header & Controls */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Live GPS & Item Count Indicator */}
        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-purple-100 flex items-center gap-2 pointer-events-auto">
          {gpsStatus === 'active' ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <div>
                <span className="text-xs font-bold text-gray-800 block">Pessoas & Eventos Próximos</span>
                <span className="text-[10px] text-gray-500 font-medium">Sinal GPS ({lastUpdated})</span>
              </div>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 text-purple-600 animate-spin" />
              <span className="text-xs font-bold text-purple-700">Obtendo Posição...</span>
            </>
          )}

          <div className="flex gap-1 ml-2">
            <Badge className="bg-purple-100 text-purple-700 text-[10px] font-black">
              👥 {mapUsersList.length} Pessoas
            </Badge>
            <Badge className="bg-pink-100 text-pink-700 text-[10px] font-black">
              🎉 {realEvents.length} Eventos
            </Badge>
          </div>
        </div>

        {/* Action Controls & Radius Selector */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button
            onClick={requestLiveLocation}
            size="sm"
            className="h-9 rounded-2xl bg-white/90 backdrop-blur-md text-purple-700 border border-purple-200 hover:bg-purple-50 shadow-md text-xs font-bold flex items-center gap-1.5"
          >
            <Crosshair className="h-4 w-4 text-pink-500" />
            Minha Posição
          </Button>

          <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-purple-100 flex items-center gap-1">
            {[5, 15, 30, 50].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedRadius === r
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaflet Map Component */}
      <div className="h-[460px] w-full z-10">
        <MapContainer
          center={myLocation}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <MapController center={myLocation} zoom={14} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* User's Live Position Marker */}
          <Marker position={myLocation} icon={createSelfIcon()}>
            <Popup className="custom-leaflet-popup">
              <div className="p-2.5 text-center">
                <p className="font-extrabold text-purple-700 text-sm flex items-center justify-center gap-1">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  Sua Posição Atual
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Buscando pessoas e encontros em um raio de {selectedRadius} km
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Radius Coverage Circle */}
          <Circle
            center={myLocation}
            radius={selectedRadius * 1000}
            pathOptions={{
              color: '#ec4899',
              fillColor: '#ec4899',
              fillOpacity: 0.06,
              weight: 2.5,
              dashArray: '8, 8'
            }}
          />

          {/* 1. Render Real Events/Convites Markers */}
          {realEvents.map((evt) => (
            <Marker
              key={evt.id}
              position={[evt.latitude || lat + 0.003, evt.longitude || lng + 0.004]}
              icon={createEventIcon(evt.category)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 max-w-[230px] text-center space-y-2">
                  <Badge className="bg-purple-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    🎉 {evt.category || 'Convite'}
                  </Badge>

                  <h4 className="font-extrabold text-gray-900 text-sm leading-tight">
                    {evt.title}
                  </h4>

                  <div className="text-[11px] text-gray-600 space-y-1 font-medium text-left bg-purple-50 p-2 rounded-xl border border-purple-100">
                    <p className="flex items-center gap-1 text-purple-700 font-bold">
                      <MapPin className="h-3 w-3 text-purple-500" />
                      <span>{evt.location_name || 'São Paulo'}</span>
                    </p>
                    <p className="flex items-center gap-1 text-emerald-700 font-bold">
                      <Clock className="h-3 w-3 text-emerald-500" />
                      <span>{evt.scheduled_time || 'Hoje'}</span>
                    </p>
                    <p className="flex items-center gap-1 text-pink-700 font-bold">
                      <Users className="h-3 w-3 text-pink-500" />
                      <span>{evt.participant_count || 1}/{evt.max_participants || 2} Vagas</span>
                    </p>
                  </div>

                  <Button
                    onClick={() => handleJoinEventFromMap(evt.id)}
                    size="sm"
                    className="w-full h-8 text-xs bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-black rounded-xl shadow-md hover:opacity-95 flex items-center justify-center gap-1"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Quero ir! 🙋‍♂️
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 2. Render Nearby User Markers */}
          {mapUsersList.map((user) => (
            <Marker
              key={user.id}
              position={[user.lat, user.lng]}
              icon={createAvatarIcon(user.profile_photo_url, user.gender)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 max-w-[210px] text-center">
                  <img
                    src={user.profile_photo_url}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-pink-400 shadow-md"
                  />
                  <h4 className="font-bold text-gray-900 text-sm">{user.name}, {user.age || 24}</h4>
                  <p className="text-[11px] text-pink-600 font-bold mb-1 flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {user.distance || 1.2} km de você
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-tight font-normal">
                    {user.bio || 'Adoro conversas sinceras e momentos espontâneos.'}
                  </p>
                  
                  <Button
                    onClick={() => navigate('/discover')}
                    size="sm"
                    className="w-full h-8 text-xs bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold rounded-xl shadow-md hover:opacity-95"
                  >
                    <Heart className="h-3.5 w-3.5 mr-1" />
                    Conectar no Discover
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend Footer */}
      <div className="bg-white/95 backdrop-blur-md px-6 py-3 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-pink-500 border border-white shadow-sm" />
            <span>Pessoas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-600 border border-white shadow-sm" />
            <span>Eventos 🎉</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span>GPS Ativo</span>
          </div>
        </div>

        <Button
          onClick={() => navigate('/discover')}
          variant="ghost"
          size="sm"
          className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Abrir Modo Discover
        </Button>
      </div>
    </div>
  );
};

export default NearbyMap;
