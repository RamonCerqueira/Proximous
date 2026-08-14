import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EMPTY_CONFIGS = {
  matches: {
    icon: Heart,
    title: 'Nenhum match ainda',
    description: 'Seu próximo match pode estar mais perto do que você imagina.',
    buttonLabel: 'Descobrir pessoas ✨'
  },
  received: {
    icon: Mail,
    title: 'Nenhuma solicitação recebida',
    description: 'Quando alguém demonstrar interesse em você, aparecerá aqui.',
    buttonLabel: 'Explorar pessoas ✨'
  },
  sent: {
    icon: Send,
    title: 'Nenhuma solicitação enviada',
    description: 'Explore perfis e demonstre interesse em quem combina com você.',
    buttonLabel: 'Ir para o Discover ⚡'
  }
};

const EmptyMatchState = ({ tabKey = 'matches' }) => {
  const navigate = useNavigate();
  const config = EMPTY_CONFIGS[tabKey] || EMPTY_CONFIGS.matches;
  const IconComponent = config.icon;

  return (
    <div className="bg-[#100D21] rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto border border-[#30204D] shadow-[0_10px_40px_rgba(0,0,0,0.30)]">
      <div className="w-16 h-16 rounded-full bg-purple-500/20 text-[#FF4FA3] border border-purple-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg">
        <IconComponent className="w-8 h-8 fill-[#FF4FA3]" />
      </div>
      <div>
        <h3 className="font-extrabold text-lg text-white">{config.title}</h3>
        <p className="text-xs text-[#AAA5BA] font-medium mt-1">
          {config.description}
        </p>
      </div>
      <Button
        onClick={() => navigate('/discover')}
        className="proximous-button-primary rounded-2xl text-xs font-black py-3 px-6 shadow-xl"
      >
        {config.buttonLabel}
      </Button>
    </div>
  );
};

export default EmptyMatchState;
