import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Crosshair, Check, Search, Loader2 } from 'lucide-react';

// Custom Pin Icon for selected point
const createPickerIcon = () => {
  return L.divIcon({
    className: 'location-picker-icon',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">
          📍
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

function MapClickHandler({ onSelectPoint }) {
  useMapEvents({
    click(e) {
      onSelectPoint([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 16, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

const LocationPickerMap = ({
  locationName,
  onLocationNameChange,
  selectedPoint,
  onSelectPoint,
}) => {
  const defaultCenter = [-23.5505, -46.6333];
  const [position, setPosition] = useState(selectedPoint || defaultCenter);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState(locationName || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);
          if (onSelectPoint) onSelectPoint(coords);
        },
        (err) => console.warn('LocationPicker GPS auto-init notice:', err.message),
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  useEffect(() => {
    setSearchQuery(locationName || '');
  }, [locationName]);

  const handlePointSelect = (coords, name) => {
    setPosition(coords);
    onSelectPoint(coords);
    if (name) {
      onLocationNameChange(name);
      setSearchQuery(name);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onLocationNameChange(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length >= 3) {
      setIsSearching(true);
      setShowDropdown(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const [lat, lon] = position;
          const delta = 0.35;
          const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&lat=${lat}&lon=${lon}&viewbox=${viewbox}&bounded=0&limit=6`
          );
          const data = await res.json();
          setSuggestions(data || []);
        } catch (err) {
          console.warn('Address search error:', err);
        } finally {
          setIsSearching(false);
        }
      }, 350);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    const coords = [parseFloat(item.lat), parseFloat(item.lon)];
    const shortName = item.display_name.split(',').slice(0, 3).join(', ');
    handlePointSelect(coords, shortName);
    setShowDropdown(false);
  };

  const handleUseCurrentGPS = () => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          handlePointSelect(coords, `Meu GPS (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`);
          setLocating(false);
        },
        (err) => {
          console.warn('GPS location error:', err);
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  return (
    <div className="space-y-2 text-foreground">
      {/* Location Input with Live Autocomplete */}
      <div className="relative">
        <label className="text-xs font-extrabold text-foreground block mb-1">
          Localização / Ponto de Encontro
        </label>
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Digite o local (Ex: Starbucks Paulista)"
            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-purple-500/50"
          />
          <div className="absolute right-3 top-2.5 text-muted-foreground">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Autocomplete Dropdown List */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
            {suggestions.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left p-2.5 text-xs font-semibold text-foreground hover:bg-purple-500/15 border-b border-border/60 transition-colors flex items-center gap-2"
              >
                <MapPin className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                <span className="truncate">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaflet Map Picker */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3 text-purple-500" /> Ponto no Mapa Leaflet
          </span>
          <Button
            type="button"
            onClick={handleUseCurrentGPS}
            size="sm"
            variant="outline"
            className="text-[10px] font-black h-6 border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 rounded-lg px-2"
          >
            <Crosshair className="h-3 w-3 mr-1 text-pink-500" />
            {locating ? 'GPS...' : 'Usar Meu GPS'}
          </Button>
        </div>

        <div className="h-[170px] w-full rounded-2xl overflow-hidden border border-border shadow-md relative">
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={false}
            className="h-full w-full z-10"
          >
            <MapController center={position} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapClickHandler onSelectPoint={(coords) => handlePointSelect(coords, null)} />
            <Marker position={position} icon={createPickerIcon()} />
          </MapContainer>

          <div className="absolute bottom-2 left-2 right-2 z-20 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] text-white font-medium flex items-center justify-between border border-purple-500/30">
            <span>Clique no mapa para ajustar o pino</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="h-3 w-3" /> Marcado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerMap;
