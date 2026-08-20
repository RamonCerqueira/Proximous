import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MapPin, 
  MessageCircle, 
  Star, 
  Zap, 
  Sparkles,
  Compass,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Flame,
  UserPlus,
  RefreshCw,
  X,
  Coffee,
  Calendar
} from 'lucide-react';
import NearbyMap from '@/components/NearbyMap';
import { usersAPI, matchingAPI, activitiesAPI } from '@/lib/api';
import { getUserInitials, generateAvatarUrl, formatDistance } from '@/lib/auth';

const Home = () => {
  const navigate = useNavigate();
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Profile Modal & Full Map Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFullMapModal, setShowFullMapModal] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          usersAPI.updateProfile({ latitude, longitude }).catch(() => {});
          fetchHomeData({ latitude, longitude });
        },
        () => {
          fetchHomeData();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    } else {
      fetchHomeData();
    }
  }, []);

  const fetchHomeData = async (coords = null) => {
    try {
      setLoading(true);
      const params = { radius: 15, limit: 10 };
      if (coords?.latitude && coords?.longitude) {
        params.latitude = coords.latitude;
        params.longitude = coords.longitude;
      }
      const [discoverRes, actRes] = await Promise.allSettled([
        usersAPI.discover(params),
        activitiesAPI.getNearby({ radius: 15 })
      ]);

      if (discoverRes.status === 'fulfilled') {
        setNearbyUsers(discoverRes.value.data.users || []);
      }
      if (actRes.status === 'fulfilled') {
        setActivities(actRes.value.data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // High quality fallback profiles for demo & immediate visual excellence
  const defaultNearbyUsers = [
    {
      id: 'demo-u1',
      name: 'Mariana Silva',
      age: 24,
      distance: 1.2,
      compatibility_score: 98,
      bio: 'Adoro música, café calmo e conversas sobre livros de ficção.',
      profile_photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=600',
      interests: ['Café', 'Música', 'Livros'],
      is_online: true
    },
    {
      id: 'demo-u2',
      name: 'Lucas Santos',
      age: 27,
      distance: 1.8,
      compatibility_score: 91,
      bio: 'Trilha matinal no fim de semana e fotografia urbana.',
      profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
      interests: ['Trilha', 'Fotografia', 'Filmes'],
      is_online: true
    },
    {
      id: 'demo-u3',
      name: 'Camila Rocha',
      age: 23,
      distance: 2.4,
      compatibility_score: 88,
      bio: 'Artista plástica e apaixonada por cafeterias acolhedoras.',
      profile_photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600',
      interests: ['Arte', 'Design', 'Café'],
      is_online: true
    }
  ];

  const defaultActivities = [
    {
      id: 'act-1',
      title: 'Café calmo & conversa sobre livros',
      category: 'coffee',
      location_name: 'Pinheiros, São Paulo',
      scheduled_time: 'Hoje às 17:30',
      participant_count: 1,
      max_participants: 2,
      creator: { name: 'Mariana', profile_photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200' }
    },
    {
      id: 'act-2',
      title: 'Caminhada & Fotografia no Parque',
      category: 'sports',
      location_name: 'Parque Ibirapuera',
      scheduled_time: 'Amanhã às 09:00',
      participant_count: 2,
      max_participants: 4,
      creator: { name: 'Lucas', profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }
    }
  ];

  const displayUsers = nearbyUsers.length > 0 ? nearbyUsers : defaultNearbyUsers;
  const displayActivities = activities.length > 0 ? activities : defaultActivities;
  
  // Single curated featured match of the day
  const featuredUser = displayUsers[0];

  const handleQuickLike = async (targetUser) => {
    try {
      await matchingAPI.sendLike({ receiver_id: targetUser.id, like_type: 'like' });
      navigate('/matches');
    } catch (error) {
      console.error('Error sending like:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-3 text-white">
        <RefreshCw className="h-10 w-10 text-pink-500 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Carregando experiências próximas...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#070611] text-white px-4 sm:px-6 md:px-8 py-6 pb-28 space-y-8 max-w-5xl mx-auto font-sans"
    >
      
      {/* 1. TOP LIVE REEL - PESSOAS ON-LINE AGORA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Pessoas On-line Agora</span>
              <Badge className="bg-[#9B20F0]/20 text-[#FF4FA3] border border-[#9B20F0]/40 text-[10px]">
                Ao Vivo
              </Badge>
            </h2>
          </div>

          <button 
            onClick={() => setShowFullMapModal(true)} 
            className="text-xs font-extrabold text-[#FF4FA3] hover:underline flex items-center gap-1 transition-all"
          >
            Ver todas no mapa <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Stories Horizontal Scroll */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          {displayUsers.map((u) => (
            <motion.div
              key={u.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedUser(u)}
              className="flex flex-col items-center space-y-1.5 cursor-pointer flex-shrink-0 group"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#9B20F0] via-[#D414A8] to-[#FF2B68] shadow-[0_0_15px_rgba(214,20,168,0.4)]">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-[#070611]">
                  <AvatarImage src={u.profile_photo_url || generateAvatarUrl(u.name)} className="object-cover" />
                  <AvatarFallback className="bg-purple-900 font-bold">{getUserInitials(u)}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#070611]" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-[#FF4FA3] transition-colors truncate max-w-[75px] text-center">
                {u.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {formatDistance(u.distance ?? u.distance_km) || u.distance_range || 'Perto de você'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. DESTAQUE DO DIA (SINGLE CURATED SUPER MATCH) */}
      {featuredUser && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF4FA3]" />
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Destaque do Dia
              </h2>
            </div>
            <span className="text-xs text-[#AAA5BA] font-semibold">98% de Compatibilidade</span>
          </div>

          {/* Curated Luxury Highlight Banner Card */}
          <div className="bg-gradient-to-r from-[#1E123B] via-[#100D21] to-[#25103A] border border-[#9B20F0]/50 rounded-[28px] p-5 sm:p-7 shadow-[0_12px_45px_rgba(155,32,240,0.25)] relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
            
            {/* Featured User Photo */}
            <div className="relative w-full md:w-56 h-72 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group">
              <img
                src={featuredUser.profile_photo_url || generateAvatarUrl(featuredUser.name)}
                alt={featuredUser.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3">
                <Badge className="bg-[#9B20F0] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
                  🔥 Maior Afinidade
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-bold text-slate-300">
                  📍 {formatDistance(featuredUser.distance ?? featuredUser.distance_km) ? `${formatDistance(featuredUser.distance ?? featuredUser.distance_km)} de você` : (featuredUser.distance_range || 'Perto de você')}
                </p>
              </div>
            </div>

            {/* Featured Details */}
            <div className="space-y-4 flex-1 text-center md:text-left w-full">
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-white">{featuredUser.name}, {featuredUser.age || 24}</h3>
                  <CheckCircle2 className="w-5 h-5 text-[#FF4FA3]" />
                </div>
                <p className="text-xs text-[#FF4FA3] font-extrabold uppercase tracking-wider">
                  Combinado perfeito para seu estilo social
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium bg-[#16112A] p-4 rounded-2xl border border-[#30204D]">
                "{featuredUser.bio || 'Adora conversas tranquilas, café de boa qualidade e passeios calmos.'}"
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                {(featuredUser.interests || ['Café', 'Música', 'Livros']).map((interest, idx) => (
                  <span key={idx} className="bg-[#9B20F0]/20 text-[#FF4FA3] text-xs px-3 py-1 rounded-xl border border-[#9B20F0]/30 font-semibold">
                    ✨ {interest}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => setSelectedUser(featuredUser)}
                  variant="outline"
                  className="bg-[#16112A] hover:bg-[#20183E] border-[#30204D] text-white font-bold text-xs py-3 rounded-xl flex-1"
                >
                  Ver Perfil Completo
                </Button>

                <Button
                  onClick={() => handleQuickLike(featuredUser)}
                  className="bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#F01E55] hover:opacity-95 text-white font-extrabold text-xs py-3 rounded-xl shadow-[0_8px_25px_rgba(205,20,180,0.35)] flex-1 flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Demonstrar Interesse 💜</span>
                </Button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 3. ENCONTROS & ATIVIDADES EM ALTA (CONVITES ESPONTÂNEOS) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-[#35E38A]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white">Convites & Atividades Próximas</h2>
          </div>
          <Link to="/activities" className="text-xs font-bold text-[#35E38A] hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayActivities.map((act) => (
            <motion.div 
              key={act.id}
              whileHover={{ y: -2 }}
              className="bg-[#100D21] border border-[#30204D] hover:border-[#35E38A] p-5 rounded-[22px] shadow-xl space-y-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="bg-[#35E38A]/20 text-[#35E38A] border border-[#35E38A]/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  ☕ {act.category || 'Atividade'}
                </span>
                <span className="text-[11px] text-[#AAA5BA] font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#35E38A]" />
                  {act.scheduled_time}
                </span>
              </div>

              <h4 className="font-extrabold text-white text-base leading-tight">
                "{act.title}"
              </h4>

              <div className="flex items-center justify-between pt-2 border-t border-[#30204D]">
                <div className="flex items-center gap-2">
                  <img
                    src={act.creator?.profile_photo_url || generateAvatarUrl(act.creator?.name || 'Proximous')}
                    alt="Criador"
                    className="w-8 h-8 rounded-full object-cover border border-[#35E38A]"
                  />
                  <span className="text-xs font-semibold text-slate-300">
                    {act.creator?.name || 'Membro'}, {act.location_name || 'São Paulo'}
                  </span>
                </div>

                <Button
                  onClick={() => navigate('/activities')}
                  className="bg-gradient-to-r from-[#10B981] to-[#35E38A] text-white font-extrabold text-xs px-4 py-1.5 rounded-xl shadow-md"
                >
                  Quero ir 🙋‍♂️
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. RADAR & MAPA INTERATIVO */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#9B20F0]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white">Radar de Proximidade</h2>
          </div>
          <button 
            onClick={() => setShowFullMapModal(true)}
            className="text-xs text-[#FF4FA3] font-bold hover:underline"
          >
            Expandir Mapa 🗺️
          </button>
        </div>

        <div className="rounded-[26px] overflow-hidden border border-[#30204D] shadow-2xl bg-[#100D21]">
          <NearbyMap radius={15} />
        </div>
      </div>

      {/* USER PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#100D21] border border-[#30204D] rounded-[30px] max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-80 w-full bg-black">
              <img
                src={selectedUser.profile_photo_url || generateAvatarUrl(selectedUser.name)}
                alt={selectedUser.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#100D21] via-transparent to-transparent" />

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h2 className="text-2xl font-black">{selectedUser.name}, {selectedUser.age || 24}</h2>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF4FA3]" />
                  {formatDistance(selectedUser.distance ?? selectedUser.distance_km) ? `${formatDistance(selectedUser.distance ?? selectedUser.distance_km)} de você` : (selectedUser.distance_range || selectedUser.location_city || 'Sua Região')}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Sobre mim</h5>
                <p className="text-sm text-slate-200 leading-relaxed bg-[#16112A] p-4 rounded-2xl border border-[#30204D]">
                  {selectedUser.bio || 'Adoro conversas tranquilas, música e conhecer novos lugares.'}
                </p>
              </div>

              {selectedUser.interests && (
                <div>
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Interesses</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.interests.map((interest, idx) => (
                      <span key={idx} className="bg-[#9B20F0]/20 text-[#FF4FA3] text-xs px-3 py-1 rounded-xl border border-[#9B20F0]/30 font-semibold">
                        ✨ {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={() => {
                    handleQuickLike(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="w-full bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#F01E55] hover:opacity-95 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Demonstrar Interesse 💜</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN MAP MODAL */}
      {showFullMapModal && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-md flex flex-col justify-between p-2 sm:p-5 animate-in fade-in duration-300">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between bg-[#100D21] border border-[#30204D] p-3 sm:p-4 rounded-2xl shadow-2xl mb-2.5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9B20F0] to-[#D414A8] flex items-center justify-center text-white shadow-lg">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  Mapa de Conexões Próximas
                </h3>
                <p className="text-xs text-[#AAA5BA]">Explore pessoas e eventos no seu raio em tempo real.</p>
              </div>
            </div>

            <button
              onClick={() => setShowFullMapModal(false)}
              className="w-10 h-10 rounded-full bg-[#16112A] hover:bg-[#20183E] text-[#FF4FA3] hover:text-white border border-[#30204D] hover:border-[#9B20F0] flex items-center justify-center transition-all shadow-lg"
              title="Fechar Mapa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Screen Map Container (Stretching 100% of remaining screen height) */}
          <div className="flex-1 rounded-[26px] overflow-hidden border border-[#30204D] shadow-2xl bg-[#070611] relative flex flex-col w-full h-full">
            <NearbyMap radius={25} fullHeight={true} />
          </div>

        </div>
      )}

    </motion.div>
  );
};

export default Home;
