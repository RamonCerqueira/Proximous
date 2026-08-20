import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, MessageCircle, Hourglass, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const getCategoryInfo = (category, customPhoto) => {
  const cat = (category || 'Rolê').trim();
  
  let photo = customPhoto;
  if (!photo) {
    const low = cat.toLowerCase();
    if (low.includes('café') || low.includes('coffee')) {
      photo = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80';
    } else if (low.includes('drink') || low.includes('bar') || low.includes('cerveja')) {
      photo = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80';
    } else if (low.includes('tennis') || low.includes('beach') || low.includes('praia')) {
      photo = 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80';
    } else if (low.includes('corrida') || low.includes('treino') || low.includes('trilha') || low.includes('sport')) {
      photo = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80';
    } else if (low.includes('cinema') || low.includes('filme') || low.includes('pipoca')) {
      photo = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
    } else if (low.includes('pizza') || low.includes('jantar') || low.includes('food') || low.includes('comida')) {
      photo = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80';
    } else if (low.includes('pet') || low.includes('cachorro') || low.includes('dog')) {
      photo = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80';
    } else if (low.includes('música') || low.includes('jam') || low.includes('violão') || low.includes('show')) {
      photo = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
    } else if (low.includes('game') || low.includes('jogo') || low.includes('tabuleiro')) {
      photo = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80';
    } else if (low.includes('sushi') || low.includes('japa') || low.includes('rodízio')) {
      photo = 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80';
    } else {
      photo = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80';
    }
  }

  return { label: cat, photo };
};

const NowEventCard = ({
  activity,
  currentUserId,
  onJoin,
  onOpenChat,
  onOpenCreatorProfile,
}) => {
  const { label: categoryLabel, photo: coverPhoto } = getCategoryInfo(activity.category, activity.photo_url);

  const isCreator = activity.user_id === currentUserId;
  const myParticipation = activity.participants?.find(p => p.user_id === currentUserId);
  const myStatus = myParticipation?.status;

  const totalParticipants = activity.participant_count || 0;
  const maxParticipants = activity.max_participants || 2;
  const spotsLeft = Math.max(0, maxParticipants - totalParticipants);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative h-[440px] rounded-3xl overflow-hidden border border-[#30204D] bg-[#100D21] hover:bg-[#16112A] shadow-[0_10px_40px_rgba(0,0,0,0.40)] flex flex-col justify-between"
    >
      {/* Background Event Photo with subtle zoom on hover */}
      <img
        src={coverPhoto}
        alt={activity.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
      />

      {/* Dark Ambient Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070611] via-[#070611]/80 to-black/40" />

      {/* Top Header Bar */}
      <div className="relative z-10 p-4 flex items-center justify-between gap-2">
        {/* Creator Info Chip */}
        <div 
          onClick={() => onOpenCreatorProfile && onOpenCreatorProfile(activity.user_id)}
          className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full cursor-pointer hover:border-purple-400/60 transition-all shadow-md"
        >
          <img
            src={activity.creator_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.creator_name || 'Anfitriao')}&background=9B20F0&color=fff`}
            alt={activity.creator_name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.creator_name || 'Anfitriao')}&background=9B20F0&color=fff`;
            }}
            className="w-6 h-6 rounded-full object-cover border border-purple-400"
          />
          <span className="text-xs font-black text-white truncate max-w-[110px]">
            {activity.creator_name || 'Anfitrião'}
          </span>
          <span className="w-3.5 h-3.5 rounded-full bg-[#FF2B68] text-white flex items-center justify-center text-[9px] font-bold">
            ✓
          </span>
        </div>

        {/* Spots badge */}
        <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Users className="w-3 h-3 text-emerald-400" />
          <span>{spotsLeft > 0 ? `${spotsLeft} vaga${spotsLeft > 1 ? 's' : ''}` : 'Lotado'}</span>
        </span>
      </div>

      {/* Bottom Event Details */}
      <div className="relative z-10 p-5 space-y-2.5 bg-gradient-to-t from-[#070611] via-[#070611]/95 to-transparent pt-12">
        
        {/* Category & Distance tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-purple-500/40 bg-purple-500/20 text-purple-300 backdrop-blur-md shadow-sm">
            {categoryLabel}
          </span>

          <span className="text-[11px] font-extrabold text-pink-300 flex items-center gap-1 bg-pink-500/15 border border-pink-500/30 px-2.5 py-0.5 rounded-full">
            <MapPin className="w-3 h-3 text-[#FF4FA3]" />
            <span>{activity.distance_range || '1,4 km de você'}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-black text-white leading-tight group-hover:text-purple-200 transition-colors drop-shadow-md">
          {activity.title}
        </h3>

        {/* Location & Time Info */}
        <div className="flex items-center gap-3 text-xs text-[#AAA5BA] font-extrabold">
          <span className="truncate flex items-center gap-1">
            📍 {activity.location_name || 'Local a combinar'}
          </span>
          <span className="flex items-center gap-1 text-emerald-400 flex-shrink-0">
            <Clock className="w-3 h-3 text-emerald-400" />
            {activity.scheduled_time || 'Hoje'}
          </span>
        </div>

        {/* Short description */}
        {activity.description && (
          <p className="text-xs text-purple-200/70 font-medium line-clamp-2 italic pt-0.5">
            "{activity.description}"
          </p>
        )}

        {/* Action Button CTA */}
        <div className="pt-2">
          {isCreator ? (
            <div className="w-full py-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-black text-center shadow-md flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Seu Convite Criado ⭐</span>
            </div>
          ) : myStatus === 'approved' ? (
            <button
              onClick={() => onOpenChat(activity.user_id)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs py-3 rounded-2xl shadow-[0_0_20px_rgba(53,227,138,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-slate-950" />
              <span>Chat Liberado • Conversar 💬</span>
            </button>
          ) : myStatus === 'pending' ? (
            <div className="w-full py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black text-center shadow-md flex items-center justify-center gap-2">
              <Hourglass className="w-4 h-4 animate-spin text-amber-400" />
              <span>Pedido Enviado • Aguardando Anfitrião</span>
            </div>
          ) : (
            <button
              onClick={() => onJoin(activity.id)}
              className="w-full bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] hover:opacity-90 text-white font-black text-xs py-3 rounded-2xl shadow-[0_8px_25px_rgba(205,20,180,0.35)] flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Quero Ir! (Pedir Vaga) 🙋‍♂️</span>
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default NowEventCard;
