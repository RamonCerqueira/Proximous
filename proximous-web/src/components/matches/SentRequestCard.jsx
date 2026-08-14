import React from 'react';
import { MapPin, Clock } from 'lucide-react';

const SentRequestCard = ({ like, onOpenProfile, onCancelLike }) => {
  const receiver = like.receiver || like.receiver_user;
  if (!receiver) return null;

  return (
    <div className="bg-[#100D21] border border-[#30204D] rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.30)] hover:bg-[#16112A] transition-all">
      <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
        <img
          src={receiver.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(receiver.name || 'User')}&background=9B20F0&color=fff`}
          alt={receiver.name}
          className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl object-cover ring-2 ring-purple-500/30 flex-shrink-0"
        />

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-base text-white">{receiver.name}, {receiver.age || 29}</h3>
            <span className="w-4 h-4 rounded-full bg-[#FF2B68] text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
          </div>

          <p className="text-xs text-[#AAA5BA] font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#FF4FA3]" />
            <span>{receiver.distance ? `${receiver.distance} km` : '2,2 km'} de você</span>
          </p>

          <div className="flex items-center gap-1.5 text-xs text-[#AAA5BA] pt-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-400">{like.status || 'Aguardando resposta'}</span>
          </div>

          <p className="text-xs text-[#AAA5BA]/80 font-medium">
            Você demonstrou interesse {like.sent_time || 'há 3 horas'}
          </p>
        </div>
      </div>

      {/* Action Buttons Right Column */}
      <div className="flex flex-col gap-2 w-full sm:w-40 pt-2 sm:pt-0">
        <button
          onClick={() => onOpenProfile(receiver)}
          className="w-full bg-[#0D0A1C] border border-[#30204D] text-white font-black text-xs py-2.5 px-4 rounded-xl hover:bg-white/10 transition-all"
        >
          Ver perfil
        </button>

        <button
          onClick={() => onCancelLike(receiver.id || like.receiver_id || like.id)}
          className="w-full bg-transparent border border-[#FF3D71]/40 text-[#FF3D71] hover:bg-[#FF3D71]/10 font-bold text-xs py-2.5 px-4 rounded-xl transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default SentRequestCard;
