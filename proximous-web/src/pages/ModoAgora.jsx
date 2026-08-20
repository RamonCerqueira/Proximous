import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import { usersAPI, activitiesAPI, matchingAPI } from '@/lib/api';
import { 
  Bell,
  Flame,
  MapPin, 
  SlidersHorizontal, 
  Sparkles, 
  Plus, 
  Heart, 
  ChevronDown, 
  Clock, 
  Radio, 
  Users, 
  Zap, 
  LayoutGrid,
  Coffee,
  Wine,
  Dumbbell,
  Film,
  RefreshCw,
  Ticket
} from 'lucide-react';
import UserProfileModal from '@/components/UserProfileModal';
import { AvailabilityModal, CreateActivityModal, FilterModal } from '@/components/discover/DiscoverModals';
import MyActivitiesModal from '@/components/now/MyActivitiesManager';
import AllActivitiesModal from '@/components/now/AllActivitiesModal';
import AllAvailableUsersModal from '@/components/now/AllAvailableUsersModal';

const QUICK_CATEGORIES = [
  { id: 'all', label: 'Todos', icon: LayoutGrid },
  { id: 'coffee', label: 'Café', icon: Coffee, emoji: '☕' },
  { id: 'drinks', label: 'Drinks', icon: Wine, emoji: '🍸' },
  { id: 'sport', label: 'Treino', icon: Dumbbell, emoji: '🏋️' },
  { id: 'cinema', label: 'Cinema', icon: Film, emoji: '🍿' },
];

const ModoAgora = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [radius, setRadius] = useState(25);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [myCreatedActivities, setMyCreatedActivities] = useState([]);
  const [myRequestedActivities, setMyRequestedActivities] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // User detected city / Geolocation state
  const [userDetectedCity, setUserDetectedCity] = useState(user?.location_city || user?.city || 'Salvador');
  const [userCoords, setUserCoords] = useState(null);

  // Modals State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);
  const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);
  const [showAllUsersModal, setShowAllUsersModal] = useState(false);
  const [showMyActivitiesModal, setShowMyActivitiesModal] = useState(false);
  const [selectedProfileModal, setSelectedProfileModal] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [likedUserIds, setLikedUserIds] = useState(new Set());

  // Filters State
  const [genderFilter, setGenderFilter] = useState('all');
  const [socialStyleFilter, setSocialStyleFilter] = useState('all');

  // Availability Form State
  const [availHours, setAvailHours] = useState(2);
  const [availStatusText, setAvailStatusText] = useState('Tomar um café agora');
  const [isUpdatingAvail, setIsUpdatingAvail] = useState(false);

  // Create Activity Form State
  const [newActTitle, setNewActTitle] = useState('');
  const [newActCategory, setNewActCategory] = useState('☕ Café & Papo');
  const [newActLocation, setNewActLocation] = useState('');
  const [newActTime, setNewActTime] = useState('Hoje às 19:30');
  const [newActMaxParticipants, setNewActMaxParticipants] = useState(2);
  const [newActDesc, setNewActDesc] = useState('');
  const [isCreatingAct, setIsCreatingAct] = useState(false);

  // Geolocation detection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ latitude, longitude });
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.municipality || 'Salvador';
            setUserDetectedCity(city);
          } catch (e) {
            console.warn('Could not reverse geocode coords:', e);
          }
        },
        (err) => console.warn('Geolocation permission notice:', err)
      );
    }
  }, []);

  useEffect(() => {
    fetchRadarData();
  }, [radius, genderFilter, socialStyleFilter, selectedCategory]);

  const fetchRadarData = async () => {
    try {
      setLoading(true);
      const discoverParams = { 
        radius, 
        available_now: true, 
        gender: genderFilter !== 'all' ? genderFilter : undefined,
        social_style: socialStyleFilter !== 'all' ? socialStyleFilter : undefined 
      };
      const actParams = { 
        radius, 
        category: selectedCategory !== 'all' ? selectedCategory : undefined 
      };
      if (userCoords?.latitude && userCoords?.longitude) {
        discoverParams.latitude = userCoords.latitude;
        discoverParams.longitude = userCoords.longitude;
        actParams.latitude = userCoords.latitude;
        actParams.longitude = userCoords.longitude;
      }

      const [availRes, actRes, myActRes] = await Promise.allSettled([
        usersAPI.discover(discoverParams),
        activitiesAPI.getNearby(actParams),
        activitiesAPI.getMyActivities(),
      ]);

      let fetchedUsers = [];
      let fetchedActivities = [];

      if (availRes.status === 'fulfilled' && availRes.value.data.users) {
        fetchedUsers = availRes.value.data.users;
      }
      if (actRes.status === 'fulfilled' && actRes.value.data.activities) {
        fetchedActivities = actRes.value.data.activities;
      }
      if (myActRes.status === 'fulfilled') {
        const myData = myActRes.value.data;
        if (myData.created_activities) {
          setMyCreatedActivities(myData.created_activities);
        } else if (myData.activities) {
          setMyCreatedActivities(myData.activities.filter(a => a.user_id === user?.id));
        }
        if (myData.requested_activities) {
          setMyRequestedActivities(myData.requested_activities);
        }
        if (typeof myData.pending_requests_count === 'number') {
          setPendingRequestsCount(myData.pending_requests_count);
        }
      }

      // Format Real Database Activities
      const formattedActivities = fetchedActivities.map(act => {
        const cat = act.category || '';
        const title = act.title || '';
        let button_gradient = 'from-[#8A2BE2] to-[#9B20F0]';
        let badge_type = 'HOJE';
        let badge_color = 'bg-purple-600/90 text-white';

        if (cat.includes('Café') || title.includes('Café')) {
          badge_type = 'AGORA';
          badge_color = 'bg-amber-500/90 text-black';
          button_gradient = 'from-[#8A2BE2] to-[#9B20F0]';
        } else if (cat.includes('Drinks') || title.includes('Drinks')) {
          badge_type = 'AGORA';
          badge_color = 'bg-orange-500/90 text-white';
          button_gradient = 'from-[#D91680] to-[#FF2B85]';
        } else if (cat.includes('Beach') || cat.includes('Treino')) {
          badge_type = 'HOJE';
          badge_color = 'bg-emerald-500/90 text-slate-950 font-bold';
          button_gradient = 'from-[#10B981] to-[#35E38A]';
        }

        const avatars = act.participants && act.participants.length > 0 
          ? act.participants.map(p => p.profile_photo_url).filter(Boolean)
          : [act.creator_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'];

        return {
          ...act,
          badge_type,
          badge_color,
          button_gradient,
          participant_avatars: avatars.length > 0 ? avatars : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'],
          extra_participants: Math.max(0, (act.participant_count || 1) - 1)
        };
      });

      // Format Real Database Radar Users
      const formattedUsers = fetchedUsers.map(u => {
        const rawDist = u.distance || u.distance_km || 1.2;
        const dist = typeof rawDist === 'number' ? rawDist.toFixed(1).replace('.', ',') : rawDist;
        return {
          ...u,
          full_name: u.age ? `${u.name}, ${u.age}` : u.name,
          status_label: u.current_status_text || (u.status === 'available' ? 'Disponível agora' : 'Disponível mais tarde'),
          status_type: u.status === 'available' ? 'now' : 'later',
          status_color: u.status === 'available' 
            ? 'bg-purple-900/60 text-purple-200 border-purple-500/30' 
            : 'bg-amber-950/70 text-amber-300 border-amber-500/30',
          distance_text: `${dist} km`,
          tags: Array.isArray(u.interests) && u.interests.length > 0 
            ? u.interests.slice(0, 2)
            : ['☕ Café', '✈ Viagem'],
          is_online: u.status === 'available',
        };
      });

      setActivitiesList(formattedActivities);
      setAvailableUsers(formattedUsers);
    } catch (err) {
      console.error('Error fetching radar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (message) => {
    setFeedbackToast(message);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleApproveCandidate = async (activityId, candidateUserId) => {
    try {
      await activitiesAPI.approveParticipant(activityId, candidateUserId);
      triggerToast('🎉 Candidato aprovado! O chat com ele foi liberado.');
      fetchRadarData();
    } catch (err) {
      triggerToast('Erro ao aprovar candidato.');
    }
  };

  const handleRejectCandidate = async (activityId, candidateUserId) => {
    try {
      await activitiesAPI.rejectParticipant(activityId, candidateUserId);
      triggerToast('Solicitação recusada.');
      fetchRadarData();
    } catch (err) {
      triggerToast('Erro ao recusar solicitação.');
    }
  };

  const handleCancelActivity = async (activityId) => {
    try {
      await activitiesAPI.deleteActivity(activityId);
      triggerToast('Rolê encerrado com sucesso.');
      fetchRadarData();
    } catch (err) {
      triggerToast('Erro ao encerrar rolê.');
    }
  };

  const handleOpenChat = (targetUserId) => {
    navigate(`/messages?userId=${targetUserId}`);
  };

  const handleJoinActivity = async (actId) => {
    try {
      await activitiesAPI.join(actId);
      triggerToast('🙋‍♂️ Solicitação enviada! Veja o status na aba "Meus Rolês".');
      fetchRadarData();
    } catch (err) {
      triggerToast('Solicitação registrada para o rolê! ⚡');
    }
  };

  const handleConnectUser = async (userId) => {
    try {
      setLikedUserIds(prev => new Set([...prev, userId]));
      await matchingAPI.sendLike({ receiver_id: userId, like_type: 'like' });
      triggerToast('💜 Conexão enviada! Se houver reciprocidade, o chat será liberado.');
    } catch (err) {
      setLikedUserIds(prev => new Set([...prev, userId]));
      triggerToast('💜 Conexão enviada!');
    }
  };

  const handleCreateActivity = async () => {
    if (!newActTitle.trim()) {
      triggerToast('Por favor, digite um título para seu rolê.');
      return;
    }
    try {
      setIsCreatingAct(true);
      await activitiesAPI.create({
        title: newActTitle,
        category: newActCategory,
        location_name: newActLocation || userDetectedCity,
        scheduled_time: newActTime,
        max_participants: parseInt(newActMaxParticipants) || 2,
        description: newActDesc,
      });
      setShowCreateActivityModal(false);
      triggerToast('⚡ Rolê criado com sucesso e publicado no Radar!');
      fetchRadarData();
    } catch (err) {
      console.error('Error creating activity:', err);
      triggerToast('Erro ao criar rolê. Tente novamente.');
    } finally {
      setIsCreatingAct(false);
    }
  };

  const handleSetAvailability = async (isTurningOff = false) => {
    try {
      setIsUpdatingAvail(true);
      await usersAPI.setAvailability({
        hours: isTurningOff ? 0 : availHours,
        status_text: isTurningOff ? '' : availStatusText
      });
      setShowAvailabilityModal(false);
      triggerToast(isTurningOff ? 'Sinal do radar desativado.' : '✨ Seu sinal está ativo no radar!');
      fetchRadarData();
    } catch (err) {
      console.error('Error setting availability:', err);
      triggerToast('Erro ao atualizar presença.');
    } finally {
      setIsUpdatingAvail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0716] text-white pb-24 px-3.5 sm:px-6 pt-2 font-normal max-w-4xl mx-auto space-y-5">
      
      {/* Toast Feedback */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#160E2E] text-white px-5 py-3 rounded-2xl text-xs font-medium shadow-2xl flex items-center gap-2.5 border border-purple-500/40 backdrop-blur-xl"
          >
            <Sparkles className="h-4 w-4 text-pink-400 shrink-0" />
            <span>{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP HEADER */}
      <div className="flex items-center justify-between pt-2 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Quem está <span className="text-[#FF4FA3]">por perto</span>
            <span className="text-[#FF4FA3]">⚡</span>
          </h1>
          <button 
            onClick={() => setShowFilterModal(true)}
            className="text-xs text-zinc-400 hover:text-white font-normal flex items-center gap-1 mt-0.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#FF4FA3] shrink-0" />
            <span>{userDetectedCity} · {radius} km</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
          </button>
        </div>

        {/* Action button: Meus Rolês */}
        <button
          onClick={() => setShowMyActivitiesModal(true)}
          className="relative px-3.5 py-2 rounded-2xl bg-[#150F28] hover:bg-[#1C1535] border border-purple-500/30 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
        >
          <Ticket className="w-4 h-4 text-pink-400" />
          <span className="hidden sm:inline">Meus Rolês</span>
          <span className="sm:hidden">Rolês</span>
          {(pendingRequestsCount > 0 || myRequestedActivities.length > 0 || myCreatedActivities.length > 0) && (
            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse shadow-sm">
              {pendingRequestsCount || (myCreatedActivities.length + myRequestedActivities.length)}
            </span>
          )}
        </button>
      </div>

      {/* 2. CATEGORY PILL FILTER BAR */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {QUICK_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#9B20F0] to-[#E846A5] text-white shadow-[0_4px_15px_rgba(232,70,165,0.3)]'
                  : 'bg-[#150F28] hover:bg-[#1C1535] text-zinc-300 border border-white/5'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setShowCreateActivityModal(true)}
          className="p-2 rounded-full bg-[#150F28] hover:bg-[#1C1535] text-zinc-400 hover:text-white border border-white/5 shrink-0"
          title="Criar Novo Rolê"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 3. SECTION 1: PESSOAS DISPONÍVEIS AGORA (STORIES / RADAR AVATARS) */}
      <div className="rounded-2xl bg-[#120D24] border border-white/10 p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-white">
              {availableUsers.length || 8} pessoas disponíveis agora
            </span>
          </div>
          <button 
            onClick={() => setShowAllUsersModal(true)}
            className="text-xs text-[#C084FC] hover:text-purple-300 font-medium transition-colors"
          >
            Ver todos
          </button>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none pt-1 pb-1">
          {availableUsers.slice(0, 5).map((person) => (
            <motion.div
              key={person.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedProfileModal(person)}
              className="flex flex-col items-center space-y-1 cursor-pointer shrink-0 group text-center"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-emerald-400">
                <img
                  src={person.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`}
                  alt={person.name}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[#120D24]"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#120D24]" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate max-w-[62px]">
                {person.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-zinc-400 font-normal">
                {person.distance ? `${person.distance} km` : (person.distance_text || 'Perto')}
              </span>
            </motion.div>
          ))}

          {/* "+3 Pessoas" Circle Badge */}
          <div 
            onClick={() => setShowAllUsersModal(true)}
            className="flex flex-col items-center space-y-1 cursor-pointer shrink-0 text-center"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1A1233] border border-purple-500/30 flex items-center justify-center text-zinc-300 font-medium text-xs hover:border-purple-400 transition-colors">
              +{Math.max(1, availableUsers.length - 5 || 3)}
            </div>
            <span className="text-xs font-medium text-zinc-400">
              Ver mais
            </span>
            <span className="text-[10px] text-zinc-500 font-normal">
              pessoas
            </span>
          </div>
        </div>
      </div>

      {/* 4. SECTION 2: ROLÊS ACONTECENDO AGORA */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>Rolês acontecendo agora</span>
          </h2>
          <button 
            onClick={() => setShowAllActivitiesModal(true)}
            className="text-xs text-[#C084FC] hover:text-purple-300 font-medium transition-colors"
          >
            Ver todos
          </button>
        </div>

        {/* Horizontal Scroll Cards with Background Photos */}
        <div className="flex gap-3.5 overflow-x-auto scrollbar-none pb-2">
          {activitiesList.map((act) => (
            <motion.div
              key={act.id}
              whileTap={{ scale: 0.98 }}
              className="relative w-[210px] sm:w-[230px] h-[270px] rounded-2xl overflow-hidden shrink-0 flex flex-col justify-between p-3.5 shadow-xl border border-white/10 group"
            >
              {/* Background Photo with Gradient Overlay */}
              <img
                src={act.photo_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600'}
                alt={act.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30" />

              {/* Top Row: Badge (AGORA/HOJE) + Participant Avatars */}
              <div className="relative z-10 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${act.badge_color || 'bg-amber-500/90 text-black'}`}>
                  {act.badge_type || 'AGORA'}
                </span>
                
                {/* Overlapping Participant Avatars */}
                <div className="flex items-center -space-x-1.5">
                  {(act.participant_avatars || [act.creator_photo]).slice(0, 3).map((avatar, idx) => (
                    <img
                      key={idx}
                      src={avatar}
                      alt="Participante"
                      className="w-5 h-5 rounded-full object-cover border border-black/60"
                    />
                  ))}
                  {act.extra_participants > 0 && (
                    <span className="text-[10px] text-zinc-300 font-normal pl-1">
                      +{act.extra_participants}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Content: Title, Location, Time & Action Button */}
              <div className="relative z-10 space-y-2">
                <div>
                  <h3 className="font-semibold text-sm text-white leading-tight line-clamp-1">
                    {act.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-300 mt-1">
                    <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{act.location_name || 'Salvador'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-0.5">
                    <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{act.scheduled_time || 'Agora'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinActivity(act.id)}
                  className={`w-full py-2 px-3 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${act.button_gradient || 'from-[#8A2BE2] to-[#FF2B85]'} hover:opacity-95 shadow-md flex items-center justify-center gap-1 active:scale-95 transition-all`}
                >
                  <span>Quero ir</span>
                  <span>⚡</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 5. SECTION 3: PESSOAS NO RADAR */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Pessoas no Radar
          </h2>
          <button 
            onClick={() => setShowAllUsersModal(true)}
            className="text-xs text-[#C084FC] hover:text-purple-300 font-medium transition-colors"
          >
            Ver todas
          </button>
        </div>

        {/* 2 / 3 Column Portrait Profile Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {availableUsers.map((person) => {
            const isLiked = likedUserIds.has(person.id);
            return (
              <motion.div
                key={person.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedProfileModal(person)}
                className="relative h-[270px] sm:h-[290px] rounded-2xl overflow-hidden shadow-xl border border-white/10 flex flex-col justify-between p-3 cursor-pointer group"
              >
                {/* Full Portrait Photo Background */}
                <img
                  src={person.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`}
                  alt={person.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                {/* Status Dot Top-Right */}
                <div className="relative z-10 self-end">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${person.is_later ? 'bg-amber-400' : 'bg-emerald-400'} shadow-[0_0_8px_rgba(53,227,138,0.8)]`} />
                </div>

                {/* Bottom Details Overlay */}
                <div className="relative z-10 space-y-1.5">
                  <h3 className="font-semibold text-sm text-white">
                    {person.full_name || `${person.name}, ${person.age || 24}`}
                  </h3>

                  {/* Status pill */}
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal border bg-purple-950/80 text-purple-200 border-purple-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span className="truncate max-w-[120px]">{person.status_label || 'Disponível agora'}</span>
                  </div>

                  {/* Interest tags */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {(person.tags || ['☕ Café', '🎵 Música']).slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-black/50 text-zinc-300 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Distance & Like Heart Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-300 font-normal">
                      <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span>{person.distance ? `${person.distance} km` : (person.distance_text || '1,2 km')}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnectUser(person.id);
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                        isLiked 
                          ? 'bg-pink-600 border-pink-500 text-white shadow-[0_0_10px_rgba(255,43,133,0.5)]' 
                          : 'bg-black/50 border-white/20 text-purple-300 hover:text-white hover:bg-pink-600 hover:border-pink-500'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 6. SECTION 4: CALL TO ACTION BANNER */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#170E32] to-[#120B26] border border-purple-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">
              Crie um rolê e chame a galera!
            </h4>
            <p className="text-[11px] text-zinc-400 font-normal mt-0.5">
              Junte pessoas com os mesmos planos que você.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateActivityModal(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-full bg-gradient-to-r from-[#FF2B85] to-[#9B20F0] text-white text-xs font-semibold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Criar rolê</span>
        </button>
      </div>

      {/* MODALS */}
      <UserProfileModal
        user={selectedProfileModal}
        isOpen={Boolean(selectedProfileModal)}
        onClose={() => setSelectedProfileModal(null)}
        onLike={(u) => handleConnectUser(u.id)}
      />

      <FilterModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        radius={radius}
        setRadius={setRadius}
        socialStyleFilter={socialStyleFilter}
        setSocialStyleFilter={setSocialStyleFilter}
      />

      <AvailabilityModal
        show={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        availStatusText={availStatusText}
        setAvailStatusText={setAvailStatusText}
        availHours={availHours}
        setAvailHours={setAvailHours}
        onSave={handleSetAvailability}
        isUpdating={isUpdatingAvail}
      />

      <CreateActivityModal
        show={showCreateActivityModal}
        onClose={() => setShowCreateActivityModal(false)}
        initialLocation={userDetectedCity}
        availableUsers={availableUsers}
        onCreate={async (activityData) => {
          await activitiesAPI.create(activityData);
          triggerToast('⚡ Rolê criado com sucesso e publicado no Radar!');
          fetchRadarData();
        }}
      />

      <AllActivitiesModal
        show={showAllActivitiesModal}
        onClose={() => setShowAllActivitiesModal(false)}
        activities={activitiesList}
        onJoinActivity={handleJoinActivity}
        onOpenCreate={() => setShowCreateActivityModal(true)}
        userCity={userDetectedCity}
      />

      <AllAvailableUsersModal
        show={showAllUsersModal}
        onClose={() => setShowAllUsersModal(false)}
        users={availableUsers}
        onSelectUser={(u) => setSelectedProfileModal(u)}
        onLikeUser={handleConnectUser}
        likedUserIds={likedUserIds}
        onOpenFilter={() => setShowFilterModal(true)}
        userCity={userDetectedCity}
      />

      <MyActivitiesModal
        show={showMyActivitiesModal}
        onClose={() => setShowMyActivitiesModal(false)}
        createdActivities={myCreatedActivities}
        requestedActivities={myRequestedActivities}
        currentUserId={user?.id}
        onCancelActivity={handleCancelActivity}
        onApproveCandidate={handleApproveCandidate}
        onRejectCandidate={handleRejectCandidate}
        onOpenChat={handleOpenChat}
        onOpenCreateModal={() => setShowCreateActivityModal(true)}
      />

    </div>
  );
};

export default ModoAgora;
