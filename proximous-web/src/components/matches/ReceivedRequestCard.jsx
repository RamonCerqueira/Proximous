import React from 'react';
import { MapPin, Heart, Crown, Lock, Eye } from 'lucide-react';
import CompatibilityBadge from './CompatibilityBadge';
import { useVipModal } from '@/context/VipModalContext';

const ReceivedRequestCard = ({ like, onOpenProfile, onLikeBack, onIgnore, isFreeUser = false }) => {
  const { openVipModal } = useVipModal();
  const sender = like.sender || like.user;
  if (!sender) return null;

  const handleUnlockVip = () => {
    openVipModal({
      title: 'Quem te Curtiu VIP 👑',
      feature: 'Desbloquear Quem Te Curtiu',
      description: 'Assine o Proximous VIP para ver as fotos e perfis completos de quem curtiu você e dar match instantaneamente!'
    });
  };

  return (
    <div className="bg-[#100D21] border border-[#30204D] rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.30)] relative overflow-hidden group hover:bg-[#16112A] transition-all">
      <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
        {/* Photo with Blur for Free Users */}
        <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden ring-2 ring-purple-500/30 flex-shrink-0">
          <img
            src={sender.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.name || 'User')}&background=9B20F0&color=fff`}
            alt={sender.name}
            className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
              isFreeUser ? 'filter blur-md scale-110' : ''
            }`}
          />
          {isFreeUser && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1 text-amber-400">
              <Lock className="w-5 h-5 drop-shadow-md" />
              <span className="text-[8px] font-black uppercase tracking-wider text-white">VIP</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-base text-white">
              {isFreeUser ? `${sender.name ? sender.name[0] + '***' : 'Alguém'}, ${sender.age || 26}` : `${sender.name}, ${sender.age || 26}`}
            </h3>
            <span className="w-4 h-4 rounded-full bg-[#FF2B68] text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
          </div>

          <p className="text-xs text-[#AAA5BA] font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#FF4FA3]" />
            <span>{sender.distance ? `${sender.distance} km` : '1,6 km'} de você</span>
          </p>

          <CompatibilityBadge score={sender.compatibility_score || 91} variant="text" />

          <p className="text-xs text-[#AAA5BA] font-medium">
            {sender.common_interests_count || 3} interesses em comum
          </p>

          <div className="flex items-center gap-1 text-sm pt-0.5">
            {sender.interest_icons ? sender.interest_icons.map((ic, i) => (
              <span key={i}>{ic}</span>
            )) : (
              <span>✈️ 🎵 🍷</span>
            )}
          </div>

          <p className="text-[11px] text-[#AAA5BA]/70 font-medium pt-1">
            Curtiu seu perfil {like.received_time || 'há 2h'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
        {like.is_new && (
          <span className="bg-[#F01E75] text-white font-black text-[10px] px-3 py-1 rounded-xl uppercase shadow-md animate-pulse">
            Novo
          </span>
        )}

        <div className="flex flex-col gap-2 w-full sm:w-44 pt-2 sm:pt-0">
          {isFreeUser ? (
            <button
              onClick={handleUnlockVip}
              className="w-full bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-[0_8px_25px_rgba(245,158,11,0.35)] hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 fill-white" />
              <span>Desbloquear com VIP</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenProfile(sender)}
              className="w-full bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#F01E55] text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-[0_8px_25px_rgba(205,20,180,0.35)] hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Ver perfil</span>
            </button>
          )}

          {isFreeUser ? (
            <button
              onClick={handleUnlockVip}
              className="w-full bg-[#0D0A1C] border border-amber-500/40 text-amber-300 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Foto Nítida</span>
            </button>
          ) : (
            <button
              onClick={() => onLikeBack(sender.id)}
              className="w-full bg-[#0D0A1C] border border-[#30204D] text-[#AAA5BA] hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-[#FF2B68]" />
              <span>Curtir de Volta</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivedRequestCard;
