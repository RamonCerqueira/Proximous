import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';

const PrivacyCard = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0D0A1C] border border-[#30204D] rounded-3xl p-5 backdrop-blur-xl flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-[#FF4FA3]" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-white">Conexões seguras</h4>
          <p className="text-xs text-[#AAA5BA] font-medium">Só você decide com quem quer conversar.</p>
          <button 
            onClick={() => navigate('/privacy')} 
            className="text-xs font-bold text-purple-400 hover:underline mt-0.5 block"
          >
            Saiba mais sobre privacidade →
          </button>
        </div>
      </div>
      <ShieldCheck className="w-8 h-8 text-purple-400/60 hidden sm:block flex-shrink-0" />
    </div>
  );
};

export default PrivacyCard;
