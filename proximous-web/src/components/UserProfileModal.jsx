import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  MapPin, 
  Heart, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Clock, 
  Coffee, 
  Calendar 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfileModal = ({ user, isOpen, onClose, onLike }) => {
  const navigate = useNavigate();

  if (!isOpen || !user) return null;

  const photos = user.photos && user.photos.length > 0
    ? user.photos
    : [user.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'];

  const compatibilityScore = user.empathy_score || 88;

  const handleStartChat = () => {
    onClose();
    navigate('/messages', { state: { targetUserId: user.id, targetUser: user } });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="luxury-glass-card rounded-[32px] max-w-md w-full max-h-[85vh] overflow-y-auto border border-border/80 shadow-2xl relative text-foreground scrollbar-none"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all border border-white/20 shadow-lg"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Cover Header Image */}
          <div className="relative h-72 w-full">
            <img
              src={photos[0]}
              alt={user.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            {/* Top Match Badge */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <Badge className="bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-purple-300 text-xs font-black px-3 py-1 rounded-full shadow-lg">
                <span>💜 {compatibilityScore}% Match</span>
              </Badge>
              {user.is_available_now && (
                <Badge className="bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full">
                  <span>🟢 AGORA</span>
                </Badge>
              )}
            </div>

            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                  {user.name}, {user.age || 25}
                </h2>
                {user.is_verified && (
                  <ShieldCheck className="h-5 w-5 text-blue-400 fill-blue-400/20" />
                )}
              </div>
              <p className="text-xs text-gray-300 font-medium flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5 text-purple-400" />
                <span>{user.location_city || 'São Paulo'}</span>
                {user.distance_km && <span>• {Math.round(user.distance_km)} km de você</span>}
              </p>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-5 space-y-5 text-xs">
            {/* Social Style & Tags */}
            <div>
              <h4 className="font-extrabold text-foreground mb-2">Estilo & Personalidade</h4>
              <div className="flex flex-wrap gap-1.5">
                {user.social_style && (
                  <span className="bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold px-3 py-1 rounded-xl">
                    ✨ {user.social_style === 'shy' ? 'Tímido(a)' : user.social_style === 'introverted' ? 'Introvertido(a)' : 'Extrovertido(a)'}
                  </span>
                )}
                {user.personality_tags && user.personality_tags.map((tag, i) => (
                  <span key={i} className="bg-card border border-border/80 text-muted-foreground font-bold px-3 py-1 rounded-xl">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div>
                <h4 className="font-extrabold text-foreground mb-1">Sobre mim</h4>
                <p className="text-muted-foreground font-medium leading-relaxed bg-card/50 p-3 rounded-2xl border border-border/60">
                  "{user.bio}"
                </p>
              </div>
            )}

            {/* Photo Gallery Grid */}
            {photos.length > 1 && (
              <div>
                <h4 className="font-extrabold text-foreground mb-2">Galeria de Fotos</h4>
                <div className="grid grid-cols-2 gap-2">
                  {photos.slice(1).map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`${user.name} ${i}`}
                      className="w-full h-36 object-cover rounded-2xl border border-border/80 shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 border-t border-border/60 bg-card/40 space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={handleStartChat}
                variant="outline"
                className="flex-1 rounded-2xl border-border/80 text-purple-400 hover:text-purple-300 font-bold text-xs py-3"
              >
                <MessageCircle className="h-4 w-4 mr-1.5" /> Mensagem
              </Button>
              <Button
                onClick={onLike}
                className="flex-1 proximous-button-primary rounded-2xl text-white font-black text-xs py-3 shadow-lg"
              >
                <Heart className="h-4 w-4 mr-1.5 fill-white" /> Conectar
              </Button>
            </div>

            <Button
              onClick={() => {
                onClose();
                navigate(`/profile/${user.id}`);
              }}
              variant="ghost"
              className="w-full text-xs font-extrabold text-purple-300 hover:text-white hover:bg-purple-500/10 py-2 rounded-xl"
            >
              Ver Perfil Completo & Fotos →
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserProfileModal;
