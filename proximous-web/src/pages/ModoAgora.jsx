import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usersAPI, activitiesAPI, matchingAPI } from '@/lib/api';
import ModoAgoraHub from '@/components/discover/ModoAgoraHub';
import { AvailabilityModal, CreateActivityModal, FilterModal } from '@/components/discover/DiscoverModals';

const ModoAgora = () => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Radius State
  const [radius, setRadius] = useState(25);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [socialStyleFilter, setSocialStyleFilter] = useState('all');

  // Availability Modal State
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availHours, setAvailHours] = useState(2);
  const [availStatusText, setAvailStatusText] = useState('Tomar um café agora');
  const [isUpdatingAvail, setIsUpdatingAvail] = useState(false);

  // Create Activity Modal State
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);
  const [newActTitle, setNewActTitle] = useState('');
  const [newActCategory, setNewActCategory] = useState('coffee');
  const [newActLocation, setNewActLocation] = useState('');
  const [newActTime, setNewActTime] = useState('Hoje às 19:30');
  const [newActMaxParticipants, setNewActMaxParticipants] = useState(2);
  const [newActDesc, setNewActDesc] = useState('');
  const [isCreatingAct, setIsCreatingAct] = useState(false);

  useEffect(() => {
    fetchData();
  }, [radius, genderFilter, socialStyleFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availRes, actRes] = await Promise.allSettled([
        usersAPI.discover({ radius, available_now: true, gender: genderFilter !== 'all' ? genderFilter : undefined }),
        activitiesAPI.getNearby({ radius }),
      ]);

      if (availRes.status === 'fulfilled') {
        setAvailableUsers(availRes.value.data.users || []);
      }
      if (actRes.status === 'fulfilled') {
        setActivitiesList(actRes.value.data.activities || []);
      }
    } catch (err) {
      console.error('Error fetching Modo Agora data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeUser = async (direction, userId) => {
    try {
      const likeType = direction === 'superlike' ? 'superlike' : 'like';
      await matchingAPI.sendLike({ receiver_id: userId, like_type: likeType });
      fetchData();
    } catch (error) {
      console.error('Error sending like:', error);
    }
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
      fetchData();
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
      fetchData();
    } catch (err) {
      console.error('Error creating activity:', err);
    } finally {
      setIsCreatingAct(false);
    }
  };

  const handleJoinActivity = async (actId) => {
    try {
      await activitiesAPI.join(actId);
      fetchData();
    } catch (err) {
      console.error('Error joining activity:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-[#070611] text-white p-3 sm:p-6 pb-28 relative overflow-hidden selection:bg-[#35E38A] selection:text-slate-950"
    >
      {/* Background Ambient Gradient Spotlights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-6 pt-2 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-wider mb-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Conexões em Tempo Real</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
              Radar Proximous ⚡
            </h1>
            <p className="text-xs text-purple-200/60 font-medium mt-0.5">
              Encontre pessoas e convites espontâneos perto de você agora mesmo.
            </p>
          </div>

          <Button
            onClick={() => setShowFilterModal(true)}
            variant="outline"
            className="rounded-2xl px-4 py-2 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-white shadow-lg flex items-center gap-2 font-bold text-xs backdrop-blur-md transition-all active:scale-95"
          >
            <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
            <span>Filtros</span>
          </Button>
        </div>

        {/* Dedicated Modo Agora Hub Component */}
        <ModoAgoraHub
          availableUsers={availableUsers}
          activitiesList={activitiesList}
          loadingActivities={loading}
          radius={radius}
          onOpenAvailabilityModal={() => setShowAvailabilityModal(true)}
          onOpenCreateActivityModal={() => setShowCreateActivityModal(true)}
          onDeactivateRadar={() => handleSetAvailability(true)}
          onSwipeUser={handleSwipeUser}
          onJoinActivity={handleJoinActivity}
        />

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

    </motion.div>
  );
};

export default ModoAgora;
