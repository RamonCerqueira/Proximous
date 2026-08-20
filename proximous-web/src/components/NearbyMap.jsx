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
  UserPlus,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, activitiesAPI } from '@/lib/api';
import { formatDistance } from '@/lib/auth';

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
  const borderColor = gender === 'female' ? '#FF4FA3' : '#9B20F0';
  return L.divIcon({
    className: 'custom-avatar-marker',
    html: `
      <div style="
        position: relative;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3.5px solid ${borderColor};
        box-shadow: 0 4px 20px rgba(155, 32, 240, 0.5);
        background-color: #100D21;
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
          background-color: #35E38A;
          border: 2px solid #070611;
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
      <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(255, 43, 104, 0.4);
          animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #FF2B68 0%, #D414A8 50%, #9B20F0 100%);
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 4px 22px rgba(255, 43, 104, 0.6);
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
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
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
          background: rgba(155, 32, 240, 0.4);
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #9B20F0 0%, #FF4FA3 100%);
          border: 3.5px solid white;
          border-radius: 50%;
          box-shadow: 0 0 25px rgba(155, 32, 240, 0.8);
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

const NearbyMap = ({ radius = 15, fullHeight = false }) => {
  const navigate = useNavigate();
  const [selectedRadius, setSelectedRadius] = useState(radius);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'people' | 'events' | 'coffee'

  const defaultLocation = [-23.5505, -46.6333];
  const [myLocation, setMyLocation] = useState(defaultLocation);
  const [gpsStatus, setGpsStatus] = useState('locating');

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

  // Fallback demo users & events if backend returns empty lists
  const defaultEvents = [
    {
      id: 'map-evt-1',
      title: '☕ Tomando café no Centro',
      category: 'coffee',
      location_name: 'Pinheiros, SP',
      scheduled_time: 'Hoje às 17:30',
      latitude: lat + 0.003,
      longitude: lng + 0.004,
      participant_count: 1,
      max_participants: 2
    },
    {
      id: 'map-evt-2',
      title: '🏃 Caminhada no Parque',
      category: 'sports',
      location_name: 'Parque Ibirapuera',
      scheduled_time: 'Amanhã às 09:00',
      latitude: lat - 0.004,
      longitude: lng - 0.003,
      participant_count: 2,
      max_participants: 4
    }
  ];

  const defaultUsers = [
    {
      id: 'map-u1',
      name: 'Mariana',
      age: 24,
      gender: 'female',
      profile_photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
      latitude: lat + 0.002,
      longitude: lng - 0.003,
      bio: 'Adoro conversas tranquilas e cafés acolhedores.'
    },
    {
      id: 'map-u2',
      name: 'Lucas',
      age: 27,
      gender: 'male',
      profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      latitude: lat - 0.003,
      longitude: lng + 0.005,
      bio: 'Fotografia urbana e caminhadas no fim de tarde.'
    }
  ];

  const mapEventsList = realEvents.length > 0 ? realEvents : defaultEvents;
  const rawUsersList = realUsers.length > 0 ? realUsers : defaultUsers;

  const mapUsersList = rawUsersList.map(u => ({
    ...u,
    lat: u.latitude || lat,
    lng: u.longitude || lng,
    distance: calculateHaversine(lat, lng, u.latitude || lat, u.longitude || lng)
  }));

  // Quick Filter Logic
  const displayEvents = (filterMode === 'all' || filterMode === 'events' || filterMode === 'coffee')
    ? (filterMode === 'coffee' ? mapEventsList.filter(e => e.category === 'coffee') : mapEventsList)
    : [];

  const displayUsers = (filterMode === 'all' || filterMode === 'people') ? mapUsersList : [];

  return (
    <div className={`relative w-full ${fullHeight ? 'h-full flex-1 flex flex-col' : 'rounded-3xl overflow-hidden shadow-2xl border border-[#30204D] bg-[#070611]'}`}>
      
      {/* Quick Filter Bar & Radius Controls */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-[400] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none">
        
        {/* Quick Filter Pills (Todos, Pessoas, Eventos, Cafés) */}
        <div className="bg-[#0D0A1C]/90 backdrop-blur-md p-1 rounded-full border border-[#30204D] shadow-xl flex items-center gap-1 pointer-events-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
              filterMode === 'all' 
                ? 'bg-gradient-to-r from-[#9B20F0] to-[#D414A8] text-white shadow-md' 
                : 'text-[#AAA5BA] hover:text-white'
            }`}
          >
            ✨ Todos ({mapUsersList.length + mapEventsList.length})
          </button>

          <button
            onClick={() => setFilterMode('people')}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
              filterMode === 'people' 
                ? 'bg-gradient-to-r from-[#9B20F0] to-[#FF4FA3] text-white shadow-md' 
                : 'text-[#AAA5BA] hover:text-white'
            }`}
          >
            👥 Pessoas ({mapUsersList.length})
          </button>

          <button
            onClick={() => setFilterMode('events')}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
              filterMode === 'events' 
                ? 'bg-gradient-to-r from-[#FF2B68] to-[#D414A8] text-white shadow-md' 
                : 'text-[#AAA5BA] hover:text-white'
            }`}
          >
            🎉 Eventos ({mapEventsList.length})
          </button>

          <button
            onClick={() => setFilterMode('coffee')}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
              filterMode === 'coffee' 
                ? 'bg-gradient-to-r from-[#10B981] to-[#35E38A] text-white shadow-md' 
                : 'text-[#AAA5BA] hover:text-white'
            }`}
          >
            ☕ Cafés
          </button>
        </div>

        {/* Radius Selector Pills */}
        <div className="flex items-center justify-end gap-1.5 pointer-events-auto">
          <div className="bg-[#0D0A1C]/90 backdrop-blur-md p-1 rounded-full shadow-xl border border-[#30204D] flex items-center gap-1">
            {[5, 15, 30, 50].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold transition-all ${
                  selectedRadius === r
                    ? 'bg-gradient-to-r from-[#9B20F0] to-[#D414A8] text-white shadow-sm'
                    : 'text-[#AAA5BA] hover:text-white'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>

          <Button
            onClick={requestLiveLocation}
            size="sm"
            className="h-8 px-2.5 rounded-full bg-[#0D0A1C]/90 backdrop-blur-md text-white border border-[#30204D] hover:border-[#9B20F0] text-xs font-bold flex items-center gap-1 shadow-xl"
            title="Recentrar Posição"
          >
            <Crosshair className="h-3.5 w-3.5 text-[#FF4FA3]" />
          </Button>
        </div>
      </div>

      {/* Leaflet Map Component (Taking 100% Height when fullHeight is true) */}
      <div className={`w-full z-10 ${fullHeight ? 'h-full flex-1 min-h-[450px]' : 'h-[360px] sm:h-[480px]'}`}>
        <MapContainer
          center={myLocation}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <MapController center={myLocation} zoom={14} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* User's Current Position Marker */}
          <Marker position={myLocation} icon={createSelfIcon()}>
            <Popup className="custom-leaflet-popup">
              <div className="p-2.5 text-center">
                <p className="font-extrabold text-[#9B20F0] text-sm flex items-center justify-center gap-1">
                  <Sparkles className="h-4 w-4 text-[#FF4FA3]" />
                  Sua Posição
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Exibindo pessoas e eventos num raio de {selectedRadius} km
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Radius Coverage Circle */}
          <Circle
            center={myLocation}
            radius={selectedRadius * 1000}
            pathOptions={{
              color: '#9B20F0',
              fillColor: '#9B20F0',
              fillOpacity: 0.07,
              weight: 2,
              dashArray: '6, 6'
            }}
          />

          {/* 1. Render Events/Convites Markers */}
          {displayEvents.map((evt) => (
            <Marker
              key={evt.id}
              position={[evt.latitude || lat + 0.003, evt.longitude || lng + 0.004]}
              icon={createEventIcon(evt.category)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 max-w-[220px] text-center space-y-2">
                  <Badge className="bg-[#FF2B68] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    🎉 {evt.category || 'Convite'}
                  </Badge>

                  <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                    {evt.title}
                  </h4>

                  <div className="text-[11px] text-slate-700 space-y-1 font-medium text-left bg-purple-50 p-2 rounded-xl border border-purple-100">
                    <p className="flex items-center gap-1 text-purple-700 font-bold">
                      <MapPin className="h-3 w-3 text-[#9B20F0]" />
                      <span>{evt.location_name || 'São Paulo'}</span>
                    </p>
                    <p className="flex items-center gap-1 text-emerald-700 font-bold">
                      <Clock className="h-3 w-3 text-emerald-600" />
                      <span>{evt.scheduled_time || 'Hoje'}</span>
                    </p>
                    <p className="flex items-center gap-1 text-pink-700 font-bold">
                      <Users className="h-3 w-3 text-[#FF4FA3]" />
                      <span>{evt.participant_count || 1}/{evt.max_participants || 2} Vagas</span>
                    </p>
                  </div>

                  <Button
                    onClick={() => handleJoinEventFromMap(evt.id)}
                    size="sm"
                    className="w-full h-8 text-xs bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] text-white font-black rounded-xl shadow-md hover:opacity-95 flex items-center justify-center gap-1"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Quero ir! 🙋‍♂️
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 2. Render Nearby User Markers */}
          {displayUsers.map((user) => (
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
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-[#FF4FA3] shadow-md"
                  />
                  <h4 className="font-bold text-gray-900 text-sm">{user.name}, {user.age || 24}</h4>
                  <p className="text-[11px] text-[#D414A8] font-bold mb-1 flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {user.distance !== undefined ? `${formatDistance(user.distance)} de você` : (user.distance_range || 'Perto de você')}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-tight font-normal">
                    {user.bio || 'Adoro conversas sinceras e momentos espontâneos.'}
                  </p>
                  
                  <Button
                    onClick={() => navigate('/discover')}
                    size="sm"
                    className="w-full h-8 text-xs bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] text-white font-bold rounded-xl shadow-md hover:opacity-95"
                  >
                    <Heart className="h-3.5 w-3.5 mr-1" />
                    Conectar
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
};

export default NearbyMap;
