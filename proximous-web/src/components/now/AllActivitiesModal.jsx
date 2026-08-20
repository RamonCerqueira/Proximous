import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Flame, MapPin, Clock, Plus, Sparkles, Coffee, Wine, Dumbbell, Film, Pizza } from 'lucide-react';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Todos', icon: '⊞' },
  { id: 'coffee', label: 'Café', icon: '☕' },
  { id: 'drinks', label: 'Drinks', icon: '🍸' },
  { id: 'sport', label: 'Treino', icon: '🏋️' },
  { id: 'cinema', label: 'Cinema', icon: '🍿' },
  { id: 'food', label: 'Gastro', icon: '🍕' }
];

export const AllActivitiesModal = ({
  show,
  onClose,
  activities = [],
  onJoinActivity,
  onOpenCreate,
  userCity = 'Salvador'
}) => {
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!show) return null;

  const filteredActivities = activities.filter((act) => {
    const matchesCat = selectedCat === 'all' || 
      (selectedCat === 'coffee' && (act.category?.toLowerCase().includes('café') || act.title?.toLowerCase().includes('café'))) ||
      (selectedCat === 'drinks' && (act.category?.toLowerCase().includes('drink') || act.title?.toLowerCase().includes('drink'))) ||
      (selectedCat === 'sport' && (act.category?.toLowerCase().includes('beach') || act.category?.toLowerCase().includes('treino') || act.category?.toLowerCase().includes('corrida'))) ||
      (selectedCat === 'cinema' && (act.category?.toLowerCase().includes('cinema') || act.title?.toLowerCase().includes('cinema'))) ||
      (selectedCat === 'food' && (act.category?.toLowerCase().includes('pizza') || act.category?.toLowerCase().includes('gastro') || act.category?.toLowerCase().includes('sushi')));

    const matchesSearch = !searchQuery || 
      act.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="bg-[#0D081D] text-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-purple-500/25 relative max-h-[92vh] flex flex-col justify-between overflow-hidden"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Flame className="w-5 h-5 fill-orange-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  Rolês & Encontros em {userCity}
                </h3>
                <p className="text-[11px] text-zinc-400 font-normal">
                  {filteredActivities.length} experiências ativas no Radar
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="py-3 space-y-2.5 border-b border-white/5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar rolê por nome, bairro ou categoria..."
                className="w-full pl-8.5 pr-4 py-2 rounded-xl bg-[#150F28] border border-white/10 text-white text-xs font-normal placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border flex items-center gap-1.5 ${
                    selectedCat === cat.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-md'
                      : 'bg-[#150F28] border-white/5 text-zinc-400 hover:text-white hover:border-white/15'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SCROLLABLE GRID */}
          <div className="flex-1 overflow-y-auto py-4 pr-1 scrollbar-none">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-zinc-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">Nenhum rolê encontrado nessa categoria</h4>
                <p className="text-xs text-zinc-400 font-normal max-w-xs mx-auto">
                  Que tal ser o primeiro a criar um rolê espontâneo agora?
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreate();
                  }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-md inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Criar Rolê
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredActivities.map((act) => (
                  <motion.div
                    key={act.id}
                    whileTap={{ scale: 0.98 }}
                    className="relative h-[250px] rounded-2xl overflow-hidden shadow-xl border border-white/10 flex flex-col justify-between p-3.5 group"
                  >
                    <img
                      src={act.photo_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600'}
                      alt={act.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30" />

                    {/* Top Row: Badge + Participants */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${act.badge_color || 'bg-amber-500/90 text-black'}`}>
                        {act.badge_type || 'AGORA'}
                      </span>

                      <div className="flex items-center -space-x-1.5">
                        {(act.participant_avatars || [act.creator_photo]).slice(0, 3).map((avatar, idx) => (
                          <img
                            key={idx}
                            src={avatar}
                            alt="Participante"
                            className="w-5 h-5 rounded-full object-cover border border-black/60"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="relative z-10 space-y-2">
                      <div>
                        <h3 className="font-semibold text-sm text-white leading-tight line-clamp-1">
                          {act.title}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-300 mt-1">
                          <MapPin className="w-3 h-3 text-pink-400 shrink-0" />
                          <span className="truncate">{act.location_name || userCity}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-0.5">
                          <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                          <span>{act.scheduled_time || 'Hoje'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onJoinActivity(act.id);
                          onClose();
                        }}
                        className={`w-full py-2 px-3 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${act.button_gradient || 'from-[#8A2BE2] to-[#FF2B85]'} hover:opacity-95 shadow-md flex items-center justify-center gap-1 active:scale-95 transition-all`}
                      >
                        <span>Quero ir</span>
                        <span>⚡</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER CTA */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-400 font-normal">
              Quer criar o seu próprio encontro?
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenCreate();
              }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Criar Rolê</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AllActivitiesModal;
