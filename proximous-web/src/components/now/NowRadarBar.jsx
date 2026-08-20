import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Zap, Plus, Settings, Power, Navigation, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const QUICK_PRESETS = [
  { id: 'coffee', label: '☕ Café', text: 'Tomar um café agora' },
  { id: 'drinks', label: '🍻 Drinks', text: 'Drinks pós-trabalho' },
  { id: 'sport', label: '🏃 Treino', text: 'Corrida / Treino no parque' },
  { id: 'cinema', label: '🍿 Cinema', text: 'Cinema hoje' },
  { id: 'food', label: '🍕 Jantar', text: 'Comer algo gostoso' },
];

const RADIUS_OPTIONS = [5, 15, 25, 50];

const NowRadarBar = ({
  user,
  isAvailable,
  activeRadius,
  onRadiusChange,
  onOpenAvailability,
  onOpenCreateActivity,
  onOpenCreateActivityModal,
  onDeactivateRadar,
  totalNearbyCount = 0,
}) => {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-r from-[#160E2E]/90 via-[#0F0C1B]/95 to-[#070611] backdrop-blur-2xl p-4 sm:p-6 shadow-[0_10px_40px_rgba(155,32,240,0.20)]">
      
      {/* Background glow flares */}
      <div className="absolute -top-20 -left-20 w-52 h-52 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5">
        
        {/* Left: Radar Sonar Pulse + Avatar + Status */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Radar Sonar Beacon Animation */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
            <div className={`absolute inset-0 rounded-full border ${isAvailable ? 'border-emerald-500/40 animate-[ping_2.5s_linear_infinite]' : 'border-purple-500/30'}`} />
            <div className={`absolute inset-2 rounded-full border ${isAvailable ? 'border-emerald-400/50 animate-[ping_3.5s_linear_infinite]' : 'border-purple-400/20'}`} />
            
            {/* Spinning radar beam */}
            {isAvailable && (
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(53,227,138,0.45)_360deg)] animate-[spin_3.5s_linear_infinite] origin-center rounded-full" />
              </div>
            )}

            {/* User Center Node Avatar */}
            <div className={`relative z-10 p-0.5 rounded-full ring-2 ${isAvailable ? 'ring-emerald-400 shadow-[0_0_20px_#35E38A]' : 'ring-purple-500/50'}`}>
              <img
                src={user?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Voce')}&background=9B20F0&color=fff`}
                alt={user?.name || 'Você'}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Voce')}&background=9B20F0&color=fff`;
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-[#070611]"
              />
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#070611] ${isAvailable ? 'bg-emerald-500 shadow-[0_0_8px_#35E38A]' : 'bg-zinc-500'}`} />
            </div>
          </div>

          {/* Status info & toggle */}
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${isAvailable ? 'text-emerald-400' : 'text-purple-300'}`}>
                <Radio className={`h-3.5 w-3.5 ${isAvailable ? 'animate-pulse text-emerald-400' : 'text-purple-400'}`} />
                {isAvailable ? 'Seu Sinal Está Ativo' : 'Radar em Espera'}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                🔥 {totalNearbyCount} no raio
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white leading-tight">
              {isAvailable && user?.current_status_text ? (
                <span className="text-emerald-300 italic">"{user.current_status_text}"</span>
              ) : (
                'O que você topa fazer agora?'
              )}
            </h2>

            {/* Quick Mood preset buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={onOpenAvailability}
                  className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-white/5 hover:bg-purple-500/20 text-purple-200 hover:text-white border border-white/10 hover:border-purple-500/40 transition-all active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Radius Selector & CTAs */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 w-full lg:w-auto">
          
          {/* Radius selector buttons */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-2xl">
            <Navigation className="h-3.5 w-3.5 text-purple-400 ml-2 mr-1 hidden sm:inline" />
            {RADIUS_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => onRadiusChange(r)}
                className={`text-[11px] font-black px-2.5 py-1.5 rounded-xl transition-all ${
                  activeRadius === r
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Primary Action Button: Create Event */}
          <button
            onClick={onOpenCreateActivityModal || onOpenCreateActivity}
            className="flex-1 sm:flex-none bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] hover:opacity-95 text-white font-black text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-5 rounded-2xl shadow-[0_0_20px_rgba(212,20,168,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>+ Criar Rolê ⚡</span>
          </button>

          {/* Toggle Presence Button */}
          {isAvailable ? (
            <button
              onClick={onDeactivateRadar}
              className="p-2.5 sm:p-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 rounded-2xl transition-all active:scale-95"
              title="Desativar Sinal do Radar"
            >
              <Power className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAvailability}
              className="p-2.5 sm:p-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-2xl transition-all active:scale-95"
              title="Ativar Meu Sinal"
            >
              <Zap className="h-4 w-4 fill-emerald-400" />
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default NowRadarBar;
