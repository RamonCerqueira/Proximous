import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, MessageCircle, X } from 'lucide-react';
import CompatibilityBadge from './CompatibilityBadge';
import InterestPill from './InterestPill';

const MatchCard = ({ match, onOpenProfile, onOpenMessage, onUnmatch }) => {
  const other = match.other_user || (match.user1_id === match.user?.id ? match.user2 : match.user1) || match.user;
  if (!other) return null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => onOpenProfile(other)}
      className="group relative h-[440px] rounded-3xl overflow-hidden border border-[#30204D] bg-[#100D21] hover:bg-[#16112A] shadow-[0_10px_40px_rgba(0,0,0,0.30)] transition-all cursor-pointer flex flex-col justify-between"
    >
      {/* Background Photo (4:5 Aspect Ratio) */}
      <img
        src={other.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name || 'User')}&background=9B20F0&color=fff&size=512`}
        alt={other.name}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name || 'User')}&background=9B20F0&color=fff&size=512`;
        }}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Top Online Indicator */}
      <div className="relative z-10 p-3.5 flex items-center justify-start pointer-events-none">
        {other.is_online && (
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#35E38A] animate-ping" />
            <span>Online</span>
          </div>
        )}
      </div>

      {/* Bottom Gradient Information */}
      <div className="relative z-10 p-4 sm:p-5 bg-gradient-to-t from-[#070611] via-[#070611]/95 to-transparent pt-16 space-y-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xl font-black text-white drop-shadow-md">
            {other.name}, {other.age || 28}
          </h3>
          <span className="w-4 h-4 rounded-full bg-[#FF2B68] text-white flex items-center justify-center text-[10px] font-bold shadow-md">
            ✓
          </span>
        </div>

        <p className="text-xs text-[#AAA5BA] font-extrabold flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#FF4FA3]" />
          <span>{other.distance ? `${other.distance} km` : '1,8 km'} de você</span>
        </p>

        {/* Compatibility Score */}
        <div>
          <CompatibilityBadge score={other.compatibility_score || 94} />
        </div>

        {/* Interests */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {other.personality_tags && other.personality_tags.slice(0, 3).map((tag, i) => (
            <InterestPill key={i} label={tag} />
          ))}
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onOpenMessage(other.id)}
            className="flex-1 bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#F01E55] hover:opacity-90 text-white font-black text-xs py-3 rounded-2xl shadow-[0_8px_25px_rgba(205,20,180,0.35)] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Conversar</span>
          </button>

          {onUnmatch && (
            <button
              onClick={() => onUnmatch(match.id)}
              className="p-3 bg-black/50 hover:bg-red-500/20 text-[#AAA5BA] hover:text-red-400 border border-white/10 hover:border-red-500/40 rounded-2xl transition-all"
              title="Desfazer Match"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;
