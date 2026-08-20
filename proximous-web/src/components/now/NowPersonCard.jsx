import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, User, Sparkles, MessageCircle } from 'lucide-react';
import CompatibilityBadge from '@/components/matches/CompatibilityBadge';
import InterestPill from '@/components/matches/InterestPill';
import { formatDistance } from '@/lib/auth';

const NowPersonCard = ({
  person,
  onConnect,
  onOpenProfile,
}) => {
  const statusText = person.current_status_text || 'Disponível agora para conversar ou encontrar';
  const interests = Array.isArray(person.interests) ? person.interests : (person.personality_tags || ['Café', 'Música', 'Papo']);
  const formattedDist = person.distance_range || (person.distance !== undefined ? `${formatDistance(person.distance)} de você` : (person.distance_km !== undefined ? `${formatDistance(person.distance_km)} de você` : 'Perto de você'));

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => onOpenProfile(person)}
      className="group relative h-[440px] rounded-3xl overflow-hidden border border-[#30204D] bg-[#100D21] hover:bg-[#16112A] shadow-[0_10px_40px_rgba(0,0,0,0.30)] transition-all cursor-pointer flex flex-col justify-between"
    >
      {/* Background Profile Photo */}
      <img
        src={person.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'User')}&background=9B20F0&color=fff&size=512`}
        alt={person.name}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'User')}&background=9B20F0&color=fff&size=512`;
        }}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Top Beacon Badge */}
      <div className="relative z-10 p-3.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#35E38A] animate-ping" />
          <span>No Radar Agora</span>
        </div>

        <span className="bg-black/60 backdrop-blur-md border border-white/10 text-pink-300 font-extrabold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#FF4FA3]" />
          <span>{formattedDist}</span>
        </span>
      </div>

      {/* Bottom Gradient Overlay & User Info */}
      <div className="relative z-10 p-4 sm:p-5 bg-gradient-to-t from-[#070611] via-[#070611]/95 to-transparent pt-14 space-y-2">
        
        {/* Name & Age */}
        <div className="flex items-center gap-1.5">
          <h3 className="text-xl font-black text-white drop-shadow-md">
            {person.name ? person.name.split(' ')[0] : 'Usuário'}, {person.age || 25}
          </h3>
          <span className="w-4 h-4 rounded-full bg-[#FF2B68] text-white flex items-center justify-center text-[10px] font-bold shadow-md">
            ✓
          </span>
        </div>

        {/* Current Mood / Radar Intent Speech Bubble */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-2.5 text-xs text-emerald-300 font-bold flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400 flex-shrink-0" />
          <span className="line-clamp-1 italic">"{statusText}"</span>
        </div>

        {/* Compatibility Score */}
        <div>
          <CompatibilityBadge score={person.compatibility_score || 91} />
        </div>

        {/* Interest tags */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {interests.slice(0, 3).map((tag, i) => (
            <InterestPill key={i} label={tag} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onConnect(person.id)}
            className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs py-3 rounded-2xl shadow-[0_0_20px_rgba(53,227,138,0.35)] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Conectar ⚡</span>
          </button>

          <button
            onClick={() => onOpenProfile(person)}
            className="p-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl transition-all"
            title="Ver Perfil Completo"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default NowPersonCard;
