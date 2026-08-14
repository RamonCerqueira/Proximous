import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  X, 
  Sparkles, 
  MapPin, 
  User, 
  MessageCircle, 
  SlidersHorizontal, 
  RotateCcw,
  Zap,
  Info,
  ShieldCheck,
  Star
} from 'lucide-react';
import UserProfileModal from '@/components/UserProfileModal';

const ProfileSwiper = ({
  users,
  currentIndex,
  cardPhotoIndex,
  setCardPhotoIndex,
  loading,
  swipeDirection,
  onSwipe,
  onOpenFilterModal,
  onResetFilters,
}) => {
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  if (loading) {
    return (
      <div className="h-[540px] w-full luxury-glass-card rounded-[32px] border border-border flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
        <p className="text-xs font-black text-foreground animate-pulse">
          Buscando conexões compatíveis na sua região...
        </p>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  if (!currentUser) {
    return (
      <div className="h-[540px] w-full luxury-glass-card rounded-[32px] border border-border flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
          <Sparkles className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-xl font-black text-foreground">Você viu todos por perto!</h3>
          <p className="text-xs text-muted-foreground font-bold mt-1 max-w-xs">
            Aumente o raio de busca nos filtros ou retorne mais tarde para ver novas pessoas ativas.
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onResetFilters}
            className="proximous-btn-glass text-xs font-black"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" /> Resetar Filtros
          </button>
          <button
            onClick={onOpenFilterModal}
            className="proximous-btn-primary text-xs font-black"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1.5" /> Ajustar Filtros
          </button>
        </div>
      </div>
    );
  }

  const photos = currentUser.photos && currentUser.photos.length > 0
    ? currentUser.photos
    : [currentUser.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'];

  const activePhoto = photos[cardPhotoIndex % photos.length];
  const compatibilityScore = currentUser.empathy_score || 88;

  const nextPhoto = (e) => {
    e.stopPropagation();
    setCardPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setCardPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D Swiper Card Canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentUser.id}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
            rotate: swipeDirection === 'left' ? -15 : swipeDirection === 'right' ? 15 : 0,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="relative w-full h-[560px] rounded-[36px] overflow-hidden border-2 border-purple-500/30 shadow-2xl bg-card text-foreground group"
        >
          {/* Main Background Image */}
          <img
            src={activePhoto}
            alt={currentUser.name}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top & Bottom Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/95 pointer-events-none" />

          {/* Photo Touch Navigation Zone */}
          <div className="absolute inset-0 flex z-10">
            <div className="w-1/2 h-4/5 cursor-pointer" onClick={prevPhoto} />
            <div className="w-1/2 h-4/5 cursor-pointer" onClick={nextPhoto} />
          </div>

          {/* Top Indicators Bar */}
          <div className="absolute top-3.5 left-4 right-4 z-20 space-y-2 pointer-events-none">
            {/* Photo Segment Indicators */}
            {photos.length > 1 && (
              <div className="flex gap-1.5 w-full">
                {photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      idx === (cardPhotoIndex % photos.length)
                        ? 'bg-white shadow-md'
                        : 'bg-white/40 backdrop-blur-sm'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Badges Bar */}
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-950/90 backdrop-blur-md border border-purple-400/60 text-purple-200 text-xs font-black px-3.5 py-1.5 rounded-full shadow-xl">
                  <span>💜 {compatibilityScore}% Match</span>
                </Badge>

                {currentUser.is_available_now && (
                  <Badge className="bg-emerald-950/90 backdrop-blur-md border border-emerald-400/60 text-emerald-300 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>AGORA</span>
                  </Badge>
                )}
              </div>

              <button
                onClick={() => setSelectedUserModal(currentUser)}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/40 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow-xl"
                title="Ver perfil completo"
              >
                <Info className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Card Body Overlay Details */}
          <div className="absolute bottom-20 left-0 right-0 p-5 z-20 space-y-2.5 pointer-events-auto">
            {/* User Title & Age */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {currentUser.name}, {currentUser.age || 25}
                </h2>
                {currentUser.is_verified && (
                  <ShieldCheck className="h-6 w-6 text-blue-400 fill-blue-400/30" />
                )}
              </div>
              <p className="text-xs text-white font-black flex items-center gap-1.5 mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span>{currentUser.location_city || 'São Paulo'}</span>
                {currentUser.distance_km && (
                  <span className="text-gray-300 font-extrabold">• {Math.round(currentUser.distance_km)} km de você</span>
                )}
              </p>
            </div>

            {/* Personality Tags Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {currentUser.social_style && (
                <span className="bg-black/60 backdrop-blur-md border border-white/40 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                  ✨ {currentUser.social_style === 'shy' ? 'Tímido(a)' : currentUser.social_style === 'introverted' ? 'Introvertido(a)' : 'Extrovertido(a)'}
                </span>
              )}
              {currentUser.personality_tags && currentUser.personality_tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="bg-purple-950/80 backdrop-blur-md border border-purple-400/50 text-purple-200 font-black text-xs px-3 py-1 rounded-full shadow-md"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Bio Snippet */}
            {currentUser.bio && (
              <p className="text-xs text-white/95 line-clamp-2 font-bold leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                "{currentUser.bio}"
              </p>
            )}
          </div>

          {/* Floating Action Controls Bar inside Canvas */}
          <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-around pointer-events-auto">
            {/* Dislike */}
            <button
              onClick={() => onSwipe('left', currentUser.id)}
              className="w-14 h-14 rounded-full bg-black/70 backdrop-blur-xl border border-red-500/50 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95"
              title="Passar"
            >
              <X className="h-7 w-7" />
            </button>

            {/* Quick Icebreaker */}
            <button
              onClick={() => setSelectedUserModal(currentUser)}
              className="w-12 h-12 rounded-full bg-black/70 backdrop-blur-xl border border-purple-500/50 text-purple-300 hover:text-white hover:bg-purple-600 transition-all flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95"
              title="Mandar Quebra-Gelo"
            >
              <MessageCircle className="h-6 w-6" />
            </button>

            {/* Like VIP */}
            <button
              onClick={() => onSwipe('right', currentUser.id)}
              className="w-16 h-16 rounded-full proximous-btn-primary text-white border-2 border-white/50 transition-all flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95"
              title="Conectar"
            >
              <Heart className="h-8 w-8 fill-white" />
            </button>

            {/* Super Like VIP */}
            <button
              onClick={() => onSwipe('superlike', currentUser.id)}
              className="w-12 h-12 rounded-full proximous-btn-gold transition-all flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95"
              title="Super Like VIP"
            >
              <Star className="h-6 w-6 fill-slate-900" />
            </button>

          </div>
        </motion.div>
      </AnimatePresence>

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
