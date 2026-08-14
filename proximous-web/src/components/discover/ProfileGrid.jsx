import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Sparkles } from 'lucide-react';

const ProfileGrid = ({ users, loading, onSwipe, onResetFilters, onOpenFilterModal }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-3xl luxury-glass-card animate-pulse border border-border/40" />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="luxury-glass-card rounded-3xl p-8 text-center border border-border/80 shadow-2xl space-y-4 max-w-md mx-auto"
      >
        <div className="w-16 h-16 bg-purple-500/15 rounded-3xl flex items-center justify-center text-purple-400 mx-auto">
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-foreground">Nenhum perfil encontrado</h3>
        <p className="text-xs text-muted-foreground">Tente expandir o raio de busca ou ajustar os filtros de intenção!</p>
        <div className="flex gap-2 pt-2">
          <Button onClick={onResetFilters} variant="outline" className="flex-1 rounded-2xl text-xs font-bold">
            Resetar Filtros
          </Button>
          <Button onClick={onOpenFilterModal} className="flex-1 rounded-2xl proximous-button-primary text-xs font-black">
            Ajustar Busca
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
      {users.map((u, idx) => {
        const photo = u.photos?.[0] || u.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
        const matchPercent = u.empathy_score || (85 + (idx * 3) % 14);

        return (
          <motion.div
            key={u.id || idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <Card className="luxury-glass-card border border-border/80 shadow-xl overflow-hidden rounded-3xl relative group h-[270px] flex flex-col justify-between">
              {/* Cover Photo */}
              <div className="absolute inset-0 z-0">
                <img src={photo} alt={u.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </div>

              {/* Top Badges */}
              <div className="relative z-10 p-2.5 flex items-center justify-between">
                <Badge className="bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-white/20 shadow-md">
                  💜 {matchPercent}% Match
                </Badge>

                {u.is_available_now && (
                  <Badge className="bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse">
                    🟢 AGORA
                  </Badge>
                )}
              </div>

              {/* Bottom Details Overlay */}
              <div className="relative z-10 p-3 space-y-1 text-white">
                <h4 className="font-black text-sm text-white drop-shadow-md truncate">
                  {u.name}, <span className="text-purple-300 font-extrabold">{u.age}</span>
                </h4>

                <p className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-purple-400 flex-shrink-0" />
                  <span className="truncate">{u.distance_range || 'São Paulo'}</span>
                </p>

                {/* Quick Connect Actions */}
                <div className="pt-2 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => onSwipe('right', u.id)}
                    size="sm"
                    className="flex-1 proximous-button-primary rounded-xl text-[10px] font-black py-1 h-7 shadow-lg flex items-center justify-center gap-1"
                  >
                    <Heart className="h-3 w-3 fill-white" />
                    Conectar
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProfileGrid;
