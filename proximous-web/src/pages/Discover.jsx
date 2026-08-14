import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  SlidersHorizontal, 
  User, 
  Zap, 
  Sparkles, 
  Heart, 
  Users, 
  Briefcase, 
  Activity, 
  Gamepad2, 
  GlassWater,
  LayoutGrid,
  Radio
} from 'lucide-react';
import { usersAPI, matchingAPI, activitiesAPI } from '@/lib/api';

// Modular Components
import ActivitySearchHub from '@/components/discover/ActivitySearchHub';
import ModoAgoraHub from '@/components/discover/ModoAgoraHub';
import ProfileSwiper from '@/components/discover/ProfileSwiper';
import ProfileGrid from '@/components/discover/ProfileGrid';
import { FilterModal, AvailabilityModal, CreateActivityModal } from '@/components/discover/DiscoverModals';

const INTENT_MODES = [
  { id: 'all', label: 'Todos', icon: Sparkles },
  { id: 'romance', label: 'Romance', icon: Heart },
  { id: 'friendship', label: 'Amizade', icon: Users },
  { id: 'networking', label: 'Networking', icon: Briefcase },
  { id: 'sports', label: 'Esportes', icon: Activity },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'social', label: 'Drinks & Social', icon: GlassWater },
];

const Discover = () => {
  const location = useLocation();

  // View state: 'profiles' (Descoberta VIP) | 'now' (Conexões Agora ⚡) | 'grid' (Grade de Perfis 🌐)
  const [viewMode, setViewMode] = useState('profiles');
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardPhotoIndex, setCardPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);

  // Filters & Search State
  const [intentMode, setIntentMode] = useState('all');
  const [selectedActivityCategory, setSelectedActivityCategory] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [radius, setRadius] = useState(25);
  const [genderFilter, setGenderFilter] = useState('all');
  const [socialStyleFilter, setSocialStyleFilter] = useState('all');

  // Radar Ao Vivo (Conexões Agora) Data State
  const [availableUsers, setAvailableUsers] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Modals State
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availHours, setAvailHours] = useState(2);
  const [availStatusText, setAvailStatusText] = useState('Tomar um café agora');
  const [isUpdatingAvail, setIsUpdatingAvail] = useState(false);

  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);
  const [newActTitle, setNewActTitle] = useState('');
  const [newActCategory, setNewActCategory] = useState('coffee');
  const [newActLocation, setNewActLocation] = useState('');
  const [newActTime, setNewActTime] = useState('Hoje às 19:30');
  const [newActMaxParticipants, setNewActMaxParticipants] = useState(2);
  const [newActDesc, setNewActDesc] = useState('');
  const [isCreatingAct, setIsCreatingAct] = useState(false);


  // Load profiles on filter changes
  useEffect(() => {
    fetchUsers();
  }, [radius, genderFilter, socialStyleFilter, intentMode, selectedActivityCategory]);

  // Load Radar Ao Vivo data when active
  useEffect(() => {
    if (viewMode === 'now') {
      fetchAvailableUsersAndActivities();
    }
  }, [viewMode, radius]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setCurrentIndex(0);
      const params = {
        radius,
        gender: genderFilter !== 'all' ? genderFilter : undefined,
        social_style: socialStyleFilter !== 'all' ? socialStyleFilter : undefined,
        intent_mode: intentMode !== 'all' ? intentMode : undefined,
      };
      const response = await usersAPI.discover(params);
      let list = response.data.users || [];

      if (selectedActivityCategory) {
        list = list.filter((u) => {
          const matchStatus = u.current_status_text?.toLowerCase().includes(selectedActivityCategory);
          const matchIntents = u.intent_mode === selectedActivityCategory;
          return matchStatus || matchIntents || true;
        });
      }

      setUsers(list);
      setCurrentIndex(0);
      setCardPhotoIndex(0);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsersAndActivities = async () => {
    try {
      setLoadingActivities(true);
      const [availRes, actRes] = await Promise.all([
        usersAPI.discover({ radius, available_now: true }),
        activitiesAPI.getNearby({ radius }),
      ]);
      setAvailableUsers(availRes.data.users || []);
      setActivitiesList(actRes.data.activities || []);
    } catch (err) {
      console.error('Error fetching Radar Ao Vivo data:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSwipe = async (direction, userId) => {
    const isLike = direction === 'right' || direction === 'superlike';
    setSwipeDirection(isLike ? 'right' : 'left');
    if (isLike) {
      try {
        const likeType = direction === 'superlike' ? 'superlike' : 'like';
        await matchingAPI.sendLike({ receiver_id: userId, like_type: likeType });
      } catch (error) {
        console.error('Error sending like/superlike:', error);
      }
    }
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };


  const handleSetAvailability = async (clear = false) => {
    try {
      setIsUpdatingAvail(true);
      await usersAPI.updateAvailability({
        hours: availHours,
        status_text: availStatusText,
        clear,
      });
      setShowAvailabilityModal(false);
      if (viewMode === 'now') fetchAvailableUsersAndActivities();
    } catch (err) {
      console.error('Error updating availability:', err);
    } finally {
      setIsUpdatingAvail(false);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!newActTitle) return;
    try {
      setIsCreatingAct(true);
      await activitiesAPI.create({
        title: newActTitle,
        category: newActCategory,
        location_name: newActLocation,
        scheduled_time: newActTime,
        max_participants: newActMaxParticipants,
        description: newActDesc,
        duration_hours: 6,
      });
      setShowCreateActivityModal(false);
      setNewActTitle('');
      setNewActLocation('');
      setNewActDesc('');
      fetchAvailableUsersAndActivities();
    } catch (err) {
      console.error('Error creating activity:', err);
    } finally {
      setIsCreatingAct(false);
    }
  };

  const handleJoinActivity = async (actId) => {
    try {
      await activitiesAPI.join(actId);
      fetchAvailableUsersAndActivities();
    } catch (err) {
      console.error('Error joining activity:', err);
    }
  };

  const handleResetFilters = () => {
    setGenderFilter('all');
    setRadius(25);
    setSocialStyleFilter('all');
    setIntentMode('all');
    setSelectedActivityCategory(null);
  };

  return (
    <div className="min-h-screen bg-[#070611] text-white p-3 sm:p-5 pb-28 selection:bg-[#FF4FA3] selection:text-white">
      <div className={`${viewMode === 'profiles' ? 'max-w-md' : 'max-w-6xl'} mx-auto space-y-4 pt-1 transition-all duration-300`}>

        {/* Minimalist Top Header & High-Contrast Filter Trigger */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#A020F0] to-[#FF4FA3] bg-clip-text text-transparent flex items-center gap-2">
              <span>Descoberta</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#9B20F0]/20 text-[#FF4FA3] font-black border border-[#9B20F0]/40">
                VIP
              </span>
            </h1>
            <p className="text-[11px] text-[#AAA5BA] font-bold flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-[#FF4FA3]" />
              Raio de busca: <span className="text-white font-black">{radius} km</span>
            </p>
          </div>

          <Button
            onClick={() => setShowFilterModal(true)}
            variant="outline"
            className="rounded-xl px-3.5 py-1.5 border-[#30204D] bg-[#0D0A1C] hover:border-[#9B20F0] text-white shadow-lg flex items-center gap-2 font-bold text-xs"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#FF4FA3]" />
            <span className="font-extrabold text-white">Filtros</span>
            {(genderFilter !== 'all' || radius !== 25 || socialStyleFilter !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-[#F01E75] animate-pulse" />
            )}
          </Button>
        </div>

        {/* Sleek Cards vs Grid View Selector */}
        <div className="flex bg-[#0D0A1C] p-1 rounded-full border border-[#30204D] shadow-inner max-w-xs mx-auto">
          <button
            onClick={() => setViewMode('profiles')}
            className={`flex-1 py-2 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'profiles'
                ? 'bg-gradient-to-r from-[#9B20F0] to-[#D414A8] text-white shadow-lg'
                : 'text-[#AAA5BA] hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Cards ({users.length})</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 py-2 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-[#9B20F0] to-[#D414A8] text-white shadow-lg'
                : 'text-[#AAA5BA] hover:text-white'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Grade</span>
          </button>
        </div>

        {/* Clean High-Contrast Sub-Header Intention Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {INTENT_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = intentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setIntentMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-purple-500/40 hover:bg-accent'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Minimalist Compact Collapsible Activity Search Hub */}
        <ActivitySearchHub
          selectedCategory={selectedActivityCategory}
          onSelectCategory={setSelectedActivityCategory}
        />

        {/* Main View Display */}
        {viewMode === 'now' ? (
          <ModoAgoraHub
            availableUsers={availableUsers}
            activitiesList={activitiesList}
            loadingActivities={loadingActivities}
            radius={radius}
            onOpenAvailabilityModal={() => setShowAvailabilityModal(true)}
            onOpenCreateActivityModal={() => setShowCreateActivityModal(true)}
            onSwipeUser={handleSwipe}
            onJoinActivity={handleJoinActivity}
          />
        ) : viewMode === 'grid' ? (
          <ProfileGrid
            users={users}
            loading={loading}
            onSwipe={handleSwipe}
            onResetFilters={handleResetFilters}
            onOpenFilterModal={() => setShowFilterModal(true)}
          />
        ) : (
          <ProfileSwiper
            users={users}
            currentIndex={currentIndex}
            cardPhotoIndex={cardPhotoIndex}
            setCardPhotoIndex={setCardPhotoIndex}
            loading={loading}
            swipeDirection={swipeDirection}
            onSwipe={handleSwipe}
            onOpenFilterModal={() => setShowFilterModal(true)}
            onResetFilters={handleResetFilters}
          />
        )}
      </div>

      {/* Modals */}
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
        newActTitle={newActTitle}
        setNewActTitle={setNewActTitle}
        newActCategory={newActCategory}
        setNewActCategory={setNewActCategory}
        newActLocation={newActLocation}
        setNewActLocation={setNewActLocation}
        newActTime={newActTime}
        setNewActTime={setNewActTime}
        newActMaxParticipants={newActMaxParticipants}
        setNewActMaxParticipants={setNewActMaxParticipants}
        newActDesc={newActDesc}
        setNewActDesc={setNewActDesc}
        onCreate={handleCreateActivity}
        isCreating={isCreatingAct}
      />

    </div>
  );
};

export default Discover;
