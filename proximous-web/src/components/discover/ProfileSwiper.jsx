import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  X, 
  Sparkles, 
  MapPin, 
  MessageCircle, 
  SlidersHorizontal, 
  RotateCcw,
  Info,
  ShieldCheck,
  Star,
  ExternalLink,
  Tag,
  Truck
} from 'lucide-react';
import UserProfileModal from '@/components/UserProfileModal';
import { useAuth } from '@/hooks/useAuth';
import { formatDistance } from '@/lib/auth';

const CardItem = ({
  currentUser,
  cardPhotoIndex,
  setCardPhotoIndex,
  photos,
  compatibilityScore,
  displayCity,
  onSwipe,
  onOpenModal,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  
  // Stamp Overlays opacity
  const likeOpacity = useTransform(x, [30, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -30], [1, 0]);

  const activePhoto = photos[cardPhotoIndex % photos.length];

  const nextPhoto = (e) => {
    e.stopPropagation();
    setCardPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setCardPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleDragEnd = (event, info) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      onSwipe('right', currentUser.id);
    } else if (info.offset.x < -threshold) {
      onSwipe('left', currentUser.id);
    } else if (info.offset.y < -threshold) {
      onSwipe('superlike', currentUser.id);
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileGrab={{ scale: 1.02, cursor: 'grabbing' }}
      className="relative w-full h-[500px] rounded-[36px] overflow-hidden border border-purple-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-[#0C0A19] text-white cursor-grab touch-none selection:bg-transparent select-none"
    >
      {/* Dynamic Background Image with Fallback */}
      <img
        src={activePhoto}
        alt={currentUser.name}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=9B20F0&color=fff&size=512`;
        }}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />

      {/* Smooth Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />

      {/* LIKE Stamp Overlay (Green/Pink) */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-12 left-8 z-30 pointer-events-none border-4 border-emerald-400 text-emerald-400 font-black text-2xl px-5 py-1.5 rounded-2xl rotate-[-20deg] shadow-[0_0_20px_#35E38A] bg-black/40 backdrop-blur-md uppercase tracking-wider"
      >
        CONECTAR ⚡
      </motion.div>

      {/* NOPE Stamp Overlay (Red) */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-12 right-8 z-30 pointer-events-none border-4 border-red-500 text-red-500 font-black text-2xl px-5 py-1.5 rounded-2xl rotate-[20deg] shadow-[0_0_20px_#EF4444] bg-black/40 backdrop-blur-md uppercase tracking-wider"
      >
        PASSAR ✕
      </motion.div>

      {/* Photo Touch Navigation Zone */}
      <div className="absolute inset-0 flex z-10">
        <div className="w-1/2 h-3/4 cursor-pointer" onClick={prevPhoto} />
        <div className="w-1/2 h-3/4 cursor-pointer" onClick={nextPhoto} />
      </div>

      {/* Top Indicators & Info Bar */}
      <div className="absolute top-4 left-5 right-5 z-20 space-y-2.5 pointer-events-none">
        {/* Photo Segment Dots */}
        {photos.length > 1 && (
          <div className="flex gap-1.5 w-full">
            {photos.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  idx === (cardPhotoIndex % photos.length)
                    ? 'bg-white shadow-[0_0_10px_#fff]'
                    : 'bg-white/30 backdrop-blur-sm'
                }`}
              />
            ))}
          </div>
        )}

        {/* Top Badges */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-950/90 backdrop-blur-xl border border-purple-400/60 text-purple-200 text-xs font-black px-3.5 py-1.5 rounded-full shadow-2xl">
              <span>💜 {compatibilityScore}% Sintonia</span>
            </Badge>

            {currentUser.is_available_now && (
              <Badge className="bg-emerald-950/90 backdrop-blur-xl border border-emerald-400/60 text-emerald-300 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>RADAR LIVE</span>
              </Badge>
            )}
          </div>

          <button
            onClick={() => onOpenModal(currentUser)}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/30 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow-xl active:scale-95"
            title="Ver perfil completo"
          >
            <Info className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Card Details Bottom Container */}
      <div className="absolute bottom-12 left-0 right-0 p-5 z-20 space-y-2 pointer-events-auto">
        {/* Name & Age */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
              {currentUser.name}, {currentUser.age || 25}
            </h2>
            {currentUser.is_verified && (
              <ShieldCheck className="h-6 w-6 text-blue-400 fill-blue-400/20" />
            )}
          </div>

          <p className="text-xs text-purple-200 font-extrabold flex items-center gap-1.5 mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            <MapPin className="h-4 w-4 text-purple-400" />
            <span>{displayCity}</span>
            {(currentUser.distance !== undefined || currentUser.distance_km !== undefined) && (
              <span className="text-gray-300 font-bold">• {formatDistance(currentUser.distance ?? currentUser.distance_km)} de você</span>
            )}
          </p>
        </div>

        {/* Personality & Style Tags */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {currentUser.social_style && (
            <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
              ✨ {currentUser.social_style === 'shy' ? 'Tímido(a)' : currentUser.social_style === 'introverted' ? 'Introvertido(a)' : 'Extrovertido(a)'}
            </span>
          )}
          {currentUser.personality_tags && currentUser.personality_tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-purple-200 font-black text-xs px-3 py-1 rounded-full shadow-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bio Snippet */}
        {currentUser.bio && (
          <p className="text-xs text-white/90 line-clamp-2 font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] italic">
            "{currentUser.bio}"
          </p>
        )}
      </div>

    </motion.div>
  );
};

const ProfileSwiper = ({
  users = [],
  currentIndex = 0,
  cardPhotoIndex = 0,
  setCardPhotoIndex,
  loading = false,
  swipeDirection,
  onSwipe,
  onOpenFilterModal,
  onResetFilters,
}) => {
  const { user } = useAuth();
  const [selectedUserModal, setSelectedUserModal] = useState(null);
  const [detectedCity, setDetectedCity] = useState(user?.city || user?.location_name || '');
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  // Automatic Carousel timer every 6 seconds (No manual tabs!)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Geolocation detection to preserve exact current city
  useEffect(() => {
    if (user?.city) {
      setDetectedCity(user.city);
    } else if (user?.location_name) {
      setDetectedCity(user.location_name);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.municipality || data.address?.state_district || 'Sua Região';
            setDetectedCity(city);
          } catch (e) {
            console.warn('Could not resolve reverse geocoding city:', e);
          }
        },
        (err) => console.warn('Geolocation permission not granted:', err)
      );
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-[500px] w-full rounded-[36px] border border-purple-500/30 bg-[#0C0A19]/80 backdrop-blur-2xl flex flex-col items-center justify-center p-8 space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
        <p className="text-xs font-black text-white animate-pulse">
          Buscando conexões compatíveis na sua região...
        </p>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  if (!currentUser) {
    return (
      <div className="h-[500px] w-full rounded-[36px] border border-purple-500/30 bg-[#0C0A19]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shadow-lg">
          <Sparkles className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white">Você viu todos por perto!</h3>
          <p className="text-xs text-purple-200/70 font-medium mt-1 max-w-xs">
            Aumente o raio de busca nos filtros ou retorne mais tarde para ver novas pessoas ativas.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onResetFilters}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs py-3 px-5 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Resetar Filtros
          </button>
          <button
            onClick={onOpenFilterModal}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs py-3 px-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" /> Ajustar Filtros
          </button>
        </div>
      </div>
    );
  }

  const photos = currentUser.photos && currentUser.photos.length > 0
    ? currentUser.photos
    : [currentUser.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=9B20F0&color=fff&size=512`];

  const compatibilityScore = currentUser.empathy_score || 92;
  const displayCity = currentUser.city || currentUser.location_city || detectedCity || 'Sua Região';

  return (
    <div className="relative w-full flex flex-col items-center">
      
      {/* Card Canvas Container */}
      <AnimatePresence mode="wait">
        <CardItem
          key={currentUser.id}
          currentUser={currentUser}
          cardPhotoIndex={cardPhotoIndex}
          setCardPhotoIndex={setCardPhotoIndex}
          photos={photos}
          compatibilityScore={compatibilityScore}
          displayCity={displayCity}
          onSwipe={onSwipe}
          onOpenModal={setSelectedUserModal}
        />
      </AnimatePresence>

      {/* 🔮 ULTRA-PREMIUM OVERLAPPING CONTROL ACTION BAR */}
      <div className="-mt-10 w-full max-w-sm bg-[#120D26]/95 border border-purple-500/40 backdrop-blur-2xl rounded-full p-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex items-center justify-around z-40 relative">
        
        {/* Dislike / Pass Button (X Red) */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSwipe('left', currentUser.id)}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-red-500/15 hover:bg-red-500 border border-red-500/40 hover:border-red-500 text-red-400 hover:text-white transition-all flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          title="Passar (Deslize para a esquerda)"
        >
          <X className="h-6 w-6 stroke-[2.5]" />
        </motion.button>

        {/* Message / Icebreaker Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSelectedUserModal(currentUser)}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-purple-500/20 hover:bg-purple-600 border border-purple-500/40 text-purple-300 hover:text-white transition-all flex items-center justify-center shadow-lg"
          title="Ver perfil & Enviar Mensagem"
        >
          <MessageCircle className="h-5 w-5" />
        </motion.button>

        {/* Primary LIKE / Connect Button (Radiant Heart Gradient) */}
        <motion.button
          whileHover={{ scale: 1.18 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSwipe('right', currentUser.id)}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9B20F0] via-[#D414A8] to-[#FF2B68] text-white border-2 border-white/60 flex items-center justify-center shadow-[0_0_35px_rgba(212,20,168,0.7)] transition-all"
          title="Curtir / Conectar (Deslize para a direita)"
        >
          <Heart className="h-8 w-8 fill-white" />
        </motion.button>

        {/* Super Like VIP Button (Gold Star) */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSwipe('superlike', currentUser.id)}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-500/20 hover:bg-amber-400 border border-amber-400/50 text-amber-300 hover:text-slate-950 transition-all flex items-center justify-center shadow-lg"
          title="Super Like VIP (Arrastar para cima)"
        >
          <Star className="h-5 w-5 fill-amber-400 hover:fill-slate-950 transition-colors" />
        </motion.button>

      </div>

      {/* 🔄 CARROSSEL AUTOMÁTICO DE ANÚNCIOS PATROCINADOS (Sem Tabs, Rotação Fluída) */}
      <div className="mt-4 w-full max-w-md">
        <AnimatePresence mode="wait">
          {activeAdIndex === 0 ? (
            /* 📦 SLIDE 1: MERCADO LIVRE (Destaque Principal) */
            <motion.div 
              key="ad_ml_auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full rounded-3xl border-2 border-[#FFE600]/80 bg-gradient-to-br from-[#2B3280] via-[#1E2359] to-[#0D0B1C] backdrop-blur-2xl p-4 shadow-[0_10px_35px_rgba(43,50,128,0.5)] text-white relative overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FFE600]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFE600] text-[#2B3280] font-black flex items-center justify-center text-xl shadow-lg flex-shrink-0">
                    📦
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#FFE600] text-[#2B3280] font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Tag className="h-3 w-3 fill-[#2B3280]" />
                        MERCADO LIVRE ⚡ OFERTA
                      </span>
                      <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1">
                        <Truck className="h-3 w-3 text-amber-300" />
                        Frete Grátis
                      </span>
                    </div>

                    <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-snug">
                      Achados do Dia no Mercado Livre
                    </h3>
                    
                    <p className="text-[11px] text-purple-200/80 font-medium leading-relaxed max-w-md">
                      Aproveite até <strong>60% OFF</strong> e cupons exclusivos da semana para usuários do Proximous!
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => window.open('https://www.mercadolivre.com.br', '_blank')}
                  className="w-full sm:w-auto bg-[#FFE600] hover:bg-[#ffd700] text-[#2B3280] font-black text-xs py-2.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap flex-shrink-0"
                >
                  <span>Ir para o Mercado Livre</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#2B3280]" />
                </button>
              </div>
            </motion.div>
          ) : activeAdIndex === 1 ? (
            /* 🍓 SLIDE 2: MOTEL PORTO SEDUÇÃO */
            <motion.div 
              key="ad_motel_auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full rounded-3xl border-2 border-[#FF2B68]/80 bg-gradient-to-b from-[#2A051A] via-[#170512] to-[#0A040D] backdrop-blur-2xl p-3.5 sm:p-4 shadow-[0_15px_40px_rgba(255,43,104,0.4)] text-white relative overflow-hidden text-center space-y-2"
            >
              <div className="flex items-center justify-center gap-1 text-[9px] font-black text-red-200/90 uppercase tracking-tight whitespace-nowrap overflow-x-auto scrollbar-none border-b border-white/10 pb-1.5">
                <span>FIT</span>
                <span className="text-red-500 font-bold">•</span>
                <span>CLASSIC</span>
                <span className="text-red-500 font-bold">•</span>
                <span>DELUXE</span>
                <span className="text-red-500 font-bold">•</span>
                <span className="text-amber-300 font-black">SUÍTE PRIME</span>
              </div>

              <div className="relative py-1 flex items-center justify-center gap-3 text-left">
                <div className="w-16 h-16 rounded-full border-2 border-[#FF2B68] shadow-[0_0_20px_#FF2B68] flex flex-col items-center justify-center p-1 relative bg-black/50 flex-shrink-0">
                  <span className="text-lg">🍓</span>
                  <span className="text-[8px] font-black uppercase text-red-300 leading-none">Motel do</span>
                  <span className="font-serif italic font-black text-xs text-white leading-none">Amor</span>
                </div>

                <div>
                  <h4 className="font-black text-xs text-white tracking-wide uppercase">
                    AQUI O PRAZER TEM O SABOR MAIS DOCE!
                  </h4>
                  <p className="text-[10px] text-red-200/90 font-semibold italic mt-0.5">
                    Todos os dias, uma experiência nova • 25 Anos Motel Porto Sedução
                  </p>
                </div>
              </div>

              <button 
                onClick={() => window.open('https://www.google.com', '_blank')}
                className="w-full bg-gradient-to-r from-[#FF2B68] via-rose-600 to-pink-600 hover:opacity-90 text-white font-black text-xs py-2 px-4 rounded-2xl shadow-[0_0_20px_rgba(255,43,104,0.6)] flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Reservar Suíte com Cortesia Proximous 🍾</span>
                <ExternalLink className="h-3.5 w-3.5 text-white" />
              </button>
            </motion.div>
          ) : (
            /* 🍸 SLIDE 3: ROOFTOP & BAR PARCEIRO */
            <motion.div 
              key="ad_rooftop_auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full rounded-3xl border-2 border-purple-500/80 bg-gradient-to-br from-[#1C0D33] via-[#120822] to-[#0A0415] backdrop-blur-2xl p-4 shadow-[0_10px_35px_rgba(155,32,240,0.4)] text-white relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 font-black flex items-center justify-center text-lg shadow-lg flex-shrink-0">
                    🍸
                  </div>

                  <div className="space-y-0.5">
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      PARCEIRO LOCAL 🥂
                    </span>

                    <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-snug">
                      Sky Lounge Rooftop & Bar
                    </h3>
                    
                    <p className="text-[11px] text-purple-200/80 font-medium leading-relaxed">
                      Double Drink exclusivo para encontros combinados no Radar Proximous!
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => window.open('https://www.google.com', '_blank')}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-2.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap flex-shrink-0"
                >
                  <span>Ver Local 📍</span>
                  <ExternalLink className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Dots Progress Indicator */}
        <div className="flex justify-center items-center gap-1.5 mt-2.5">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setActiveAdIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeAdIndex === idx 
                  ? 'w-6 bg-white shadow-[0_0_8px_#fff]' 
                  : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* User Full Profile Modal */}
      {selectedUserModal && (
        <UserProfileModal
          user={selectedUserModal}
          isOpen={!!selectedUserModal}
          onClose={() => setSelectedUserModal(null)}
          onLike={() => {
            onSwipe('right', selectedUserModal.id);
            setSelectedUserModal(null);
          }}
        />
      )}
    </div>
  );
};

export default ProfileSwiper;
