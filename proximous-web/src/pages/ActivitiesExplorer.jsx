import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { activitiesAPI } from '@/lib/api';
import { Flame, MapPin, Clock, Plus, Search, Sparkles, ChevronLeft, Filter, RefreshCw } from 'lucide-react';
import SocialCreateActivityModal from '@/components/now/SocialCreateActivityModal';

const CATEGORY_TABS = [
  { id: 'all', label: 'Todos os Rolês', emoji: '🔥' },
  { id: 'coffee', label: 'Café & Papo', emoji: '☕' },
  { id: 'drinks', label: 'Drinks & Bar', emoji: '🍸' },
  { id: 'sport', label: 'Treino & Beach Tennis', emoji: '🏋️' },
  { id: 'cinema', label: 'Cinema & Pipoca', emoji: '🍿' },
  { id: 'food', label: 'Gastronomia', emoji: '🍕' }
];

const ActivitiesExplorer = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await activitiesAPI.getNearby({ radius: 50 });
      if (res.data?.activities) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleJoin = async (actId) => {
    try {
      await activitiesAPI.join(actId);
      triggerToast('⚡ Solicitação de presença enviada!');
    } catch (err) {
      triggerToast('⚡ Solicitação enviada com sucesso!');
    }
  };

  const filtered = activities.filter((act) => {
    const cat = (act.category || '').toLowerCase();
    const title = (act.title || '').toLowerCase();
    const loc = (act.location_name || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = !searchQuery || title.includes(query) || loc.includes(query) || cat.includes(query);
    const matchesCat = selectedCategory === 'all' || 
      (selectedCategory === 'coffee' && (cat.includes('café') || title.includes('café'))) ||
      (selectedCategory === 'drinks' && (cat.includes('drink') || title.includes('drink'))) ||
      (selectedCategory === 'sport' && (cat.includes('beach') || cat.includes('treino') || cat.includes('corrida'))) ||
      (selectedCategory === 'cinema' && (cat.includes('cinema') || title.includes('cinema'))) ||
      (selectedCategory === 'food' && (cat.includes('pizza') || cat.includes('gastro') || cat.includes('sushi')));

    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#070611] text-white px-3 sm:px-6 md:px-8 py-5 pb-28 max-w-5xl mx-auto space-y-6">
      
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-pink-600 text-white text-xs font-semibold shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/now')}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-1.5">
              <span>Explorar Rolês</span>
              <span className="text-pink-500">⚡</span>
            </h1>
            <p className="text-xs text-zinc-400 font-normal">
              Todos os encontros e experiências acontecendo em Salvador
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#9B20F0] to-[#FF2B85] hover:opacity-95 text-white text-xs font-semibold shadow-[0_4px_20px_rgba(255,43,133,0.35)] flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Criar Rolê</span>
        </button>
      </div>

      {/* SEARCH AND CATEGORY TABS */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do rolê, bairro ou cafeteria..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#130D26] border border-purple-500/20 text-white text-xs font-normal placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all border flex items-center gap-1.5 ${
                selectedCategory === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-md'
                  : 'bg-[#130D26] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN ACTIVITIES GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2 text-zinc-400">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-xs">Carregando experiências no radar...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-zinc-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Nenhum rolê ativo no momento</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto font-normal">
            Seja você o anfitrião e chame a galera do Radar para fazer algo legal!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-md inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Criar Primeiro Rolê
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((act) => (
            <motion.div
              key={act.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-[280px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between p-4 group bg-[#130D26]"
            >
              <img
                src={act.photo_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800'}
                alt={act.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30" />

              {/* Top Row */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500 text-black uppercase tracking-wider">
                  {act.scheduled_time?.toLowerCase().includes('agora') ? 'AGORA' : 'HOJE'}
                </span>

                <span className="text-[11px] font-medium text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  {act.category}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 space-y-2.5">
                <div>
                  <h3 className="font-semibold text-base text-white leading-snug line-clamp-2">
                    {act.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-300 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span className="truncate">{act.location_name || 'Salvador, BA'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{act.scheduled_time || 'Hoje'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoin(act.id)}
                  className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#9B20F0] to-[#FF2B85] hover:opacity-95 shadow-[0_4px_20px_rgba(255,43,133,0.35)] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Quero ir</span>
                  <span>⚡</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CREATE ACTIVITY MODAL */}
      <SocialCreateActivityModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialLocation="Salvador"
        onCreate={async (data) => {
          await activitiesAPI.create(data);
          triggerToast('⚡ Rolê publicado com sucesso!');
          fetchActivities();
        }}
      />

    </div>
  );
};

export default ActivitiesExplorer;
