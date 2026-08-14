import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Send, ArrowRight } from 'lucide-react';

const NearbyPeopleBanner = ({ type = 'nearby' }) => {
  const navigate = useNavigate();

  if (type === 'explore') {
    return (
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-[#18122B]/90 via-[#0F0C1B] to-[#070611] backdrop-blur-xl p-6 shadow-[0_0_30px_rgba(214,20,168,0.30)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-400/40 text-[#FF4FA3] flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
            <Send className="w-7 h-7 text-[#FF4FA3]" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-white">Continue explorando</h4>
            <p className="text-xs text-[#AAA5BA] font-medium mt-0.5">Quanto mais você interagir, maiores as chances de dar match!</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/discover')}
          className="bg-gradient-to-r from-[#9B20F0] to-[#D414A8] hover:opacity-90 text-white font-black text-xs py-3 px-6 rounded-2xl shadow-lg transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5"
        >
          <span>Ir para o Discover</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Default 'nearby' banner matching Left Screen from reference image
  return (
    <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-[#1E0B36] via-[#120722] to-[#0A040D] backdrop-blur-xl p-6 shadow-[0_0_30px_rgba(214,20,168,0.30)] flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4 text-center sm:text-left">
        <div className="w-14 h-14 rounded-full bg-[#9B20F0]/20 border border-purple-400/40 text-[#FF4FA3] flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
          <MapPin className="w-7 h-7 text-[#FF4FA3]" />
        </div>
        <div>
          <h4 className="font-extrabold text-base text-white">Mais pessoas perto de você</h4>
          <p className="text-xs text-[#AAA5BA] font-medium mt-0.5">Descubra quem está online agora</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/discover')}
        className="bg-gradient-to-r from-[#9B20F0] to-[#D414A8] hover:opacity-90 text-white font-black text-xs py-3 px-6 rounded-2xl shadow-lg transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5"
      >
        <span>Explorar agora</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NearbyPeopleBanner;
