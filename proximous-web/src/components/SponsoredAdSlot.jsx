import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Tag, Truck, Megaphone, Sparkles, ChevronRight } from 'lucide-react';

const DEFAULT_ADS = [
  {
    id: 'mercadolivre',
    badge: 'MERCADO LIVRE ⚡ OFERTA',
    title: 'Achados do Dia com Frete Grátis 📦',
    desc: 'Até 60% OFF e cupons exclusivos da semana para usuários do Proximous!',
    cta: 'Ir para o Mercado Livre',
    link: 'https://www.mercadolivre.com.br',
    theme: 'yellow', // yellow | pink | purple | emerald
    icon: '📦',
    is_active: true
  },
  {
    id: 'motel_porto',
    badge: 'PARCEIRO PREMIUM 🍓',
    title: 'Motel Porto Sedução - O Motel do Amor',
    desc: 'Cortesia de Espumante e 20% OFF na Suíte Deluxe para casais do Proximous.',
    cta: 'Reservar Suíte 🥂',
    link: 'https://www.google.com',
    theme: 'pink',
    icon: '🍓',
    is_active: true
  },
  {
    id: 'cafe_aurora',
    badge: 'ESPECIAL 1º ENCONTRO ☕',
    title: 'Café & Confeitaria Aurora',
    desc: 'Mostre seu match no Proximous e ganhe 15% OFF no combo de café e torta!',
    cta: 'Ver Benefício 📍',
    link: 'https://www.google.com',
    theme: 'purple',
    icon: '☕',
    is_active: true
  },
  {
    id: 'rooftop_bar',
    badge: 'ENCONTRO ESPONTÂNEO 🍸',
    title: 'Sky Lounge Rooftop & Drinks',
    desc: 'Double Drink de boas-vindas para duplas marcadas pelo Radar!',
    cta: 'Conhecer Local 🍸',
    link: 'https://www.google.com',
    theme: 'emerald',
    icon: '🍸',
    is_active: true
  }
];

const SponsoredAdSlot = ({ 
  slotId = 'general', 
  type = 'banner', // 'banner' | 'card' | 'inline' | 'compact'
  title = 'Espaço Publicitário',
  customAd = null,
  className = '' 
}) => {
  const [adList, setAdList] = useState(DEFAULT_ADS);
  const [adIndex, setAdIndex] = useState(0);

  // Dynamic SuperAdmin Live Ads Loader
  useEffect(() => {
    loadAdsFromSuperAdmin();

    const handleStorageChange = () => loadAdsFromSuperAdmin();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('proximous_ads_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('proximous_ads_updated', handleStorageChange);
    };
  }, []);

  const loadAdsFromSuperAdmin = () => {
    try {
      const stored = localStorage.getItem('proximous_custom_ads');
      if (stored) {
        const parsed = JSON.parse(stored);
        const activeOnly = parsed.filter(a => a.is_active !== false);
        if (activeOnly.length > 0) {
          setAdList(activeOnly);
          return;
        }
      }
    } catch (err) {
      console.warn('Using default ads:', err);
    }
    setAdList(DEFAULT_ADS);
  };

  // Carousel rotation timer
  useEffect(() => {
    if (adList.length === 0) return;
    const timer = setInterval(() => {
      setAdIndex(prev => (prev + 1) % adList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [adList]);

  if (adList.length === 0) return null;

  const ad = customAd || adList[adIndex % adList.length];

  const themeStyles = {
    yellow: {
      border: 'border-[#FFE600]/80',
      bg: 'bg-gradient-to-r from-[#2B3280] via-[#1E2359] to-[#0D0B1C]',
      badge: 'bg-[#FFE600] text-[#2B3280]',
      btn: 'bg-[#FFE600] text-[#2B3280] hover:bg-[#ffd700]',
      glow: 'bg-[#FFE600]/20'
    },
    pink: {
      border: 'border-[#FF2B68]/80',
      bg: 'bg-gradient-to-r from-[#2A051A] via-[#170512] to-[#0A040D]',
      badge: 'bg-[#FF2B68] text-white',
      btn: 'bg-gradient-to-r from-[#FF2B68] to-pink-600 text-white hover:opacity-90',
      glow: 'bg-[#FF2B68]/20'
    },
    purple: {
      border: 'border-purple-500/80',
      bg: 'bg-gradient-to-r from-[#1E0B36] via-[#120722] to-[#090314]',
      badge: 'bg-purple-500 text-white',
      btn: 'bg-purple-600 hover:bg-purple-500 text-white',
      glow: 'bg-purple-500/20'
    },
    emerald: {
      border: 'border-emerald-500/80',
      bg: 'bg-gradient-to-r from-[#07241A] via-[#041711] to-[#020A07]',
      badge: 'bg-emerald-500 text-slate-950',
      btn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
      glow: 'bg-emerald-500/20'
    }
  };

  const currentTheme = themeStyles[ad.theme] || themeStyles.yellow;

  if (type === 'compact') {
    return (
      <div className={`w-full rounded-2xl border ${currentTheme.border} ${currentTheme.bg} backdrop-blur-xl p-3 shadow-lg flex items-center justify-between gap-3 text-white ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg flex-shrink-0">{ad.icon}</span>
          <div className="min-w-0">
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${currentTheme.badge}`}>
              PATROCINADO 📢
            </span>
            <h4 className="font-extrabold text-xs text-white truncate mt-0.5">{ad.title}</h4>
          </div>
        </div>

        <button
          onClick={() => window.open(ad.link, '_blank')}
          className={`text-[10px] font-black py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95 flex-shrink-0 ${currentTheme.btn}`}
        >
          <span>Anúncio</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`w-full rounded-3xl border-2 ${currentTheme.border} ${currentTheme.bg} backdrop-blur-2xl p-5 shadow-2xl text-white relative overflow-hidden space-y-3 ${className}`}>
        <div className={`absolute -top-12 -right-12 w-32 h-32 ${currentTheme.glow} rounded-full blur-2xl pointer-events-none`} />

        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${currentTheme.badge}`}>
            <Megaphone className="h-3 w-3" /> ANÚNCIO PATROCINADO
          </span>
          <span className="text-[9px] text-muted-foreground font-bold">Espaço Publicitário #PROXIMOUS</span>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
            {ad.icon}
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug">{ad.title}</h3>
            <p className="text-xs text-purple-200/80 font-medium leading-relaxed">{ad.desc}</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            onClick={() => window.open(ad.link, '_blank')}
            className={`w-full font-black text-xs py-3 px-5 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${currentTheme.btn}`}
          >
            <span>{ad.cta}</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Default Standard Banner
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={ad.id || adIndex}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.3 }}
        className={`w-full rounded-2xl border-2 ${currentTheme.border} ${currentTheme.bg} backdrop-blur-2xl p-4 shadow-xl text-white relative overflow-hidden ${className}`}
      >
        <div className={`absolute -top-16 -right-16 w-36 h-36 ${currentTheme.glow} rounded-full blur-2xl pointer-events-none`} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/30 border border-white/20 font-black flex items-center justify-center text-lg shadow-lg flex-shrink-0">
              {ad.icon}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${currentTheme.badge}`}>
                  <Tag className="h-3 w-3" /> {ad.badge}
                </span>
              </div>

              <h4 className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-snug">
                {ad.title}
              </h4>
              
              <p className="text-[11px] text-purple-200/80 font-medium leading-relaxed max-w-md">
                {ad.desc}
              </p>
            </div>
          </div>

          <button 
            onClick={() => window.open(ad.link, '_blank')}
            className={`w-full sm:w-auto font-black text-xs py-2.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap flex-shrink-0 ${currentTheme.btn}`}
          >
            <span>{ad.cta}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SponsoredAdSlot;
