import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, MapPin, Heart, Sparkles, Zap, SlidersHorizontal } from 'lucide-react';

export const AllAvailableUsersModal = ({
  show,
  onClose,
  users = [],
  onSelectUser,
  onLikeUser,
  likedUserIds = new Set(),
  onOpenFilter,
  userCity = 'Salvador'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'now', 'later'

  if (!show) return null;

  const filteredUsers = users.filter((u) => {
    const matchesMode = filterMode === 'all' || 
      (filterMode === 'now' && u.is_online !== false) ||
      (filterMode === 'later' && u.is_later);

    const matchesSearch = !searchQuery ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(u.interests) && u.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      u.current_status_text?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesMode && matchesSearch;
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
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  Pessoas no Radar em {userCity}
                </h3>
                <p className="text-[11px] text-zinc-400 font-normal">
                  {filteredUsers.length} conexões disponíveis por perto
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

          {/* SEARCH & FILTER BAR */}
          <div className="py-3 space-y-2.5 border-b border-white/5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, interesse ou status..."
                  className="w-full pl-8.5 pr-4 py-2 rounded-xl bg-[#150F28] border border-white/10 text-white text-xs font-normal placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenFilter();
                }}
                className="px-3 py-2 rounded-xl bg-[#150F28] border border-white/10 hover:border-purple-500 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Filtros</span>
              </button>
            </div>

            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'Todos no Radar' },
                { id: 'now', label: '🟢 Disponíveis Agora' },
                { id: 'later', label: '🟡 Disponíveis Mais Tarde' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilterMode(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border ${
                    filterMode === pill.id
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                      : 'bg-[#150F28] border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* SCROLLABLE GRID */}
          <div className="flex-1 overflow-y-auto py-4 pr-1 scrollbar-none">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-zinc-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">Nenhuma pessoa encontrada</h4>
                <p className="text-xs text-zinc-400 font-normal max-w-xs mx-auto">
                  Tente ajustar os termos da busca ou o raio do seu radar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredUsers.map((person) => {
                  const isLiked = likedUserIds.has(person.id);
                  return (
                    <motion.div
                      key={person.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onClose();
                        onSelectUser(person);
                      }}
                      className="relative h-[250px] sm:h-[270px] rounded-2xl overflow-hidden shadow-xl border border-white/10 flex flex-col justify-between p-3 cursor-pointer group"
                    >
                      <img
                        src={person.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`}
                        alt={person.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                      {/* Online status indicator */}
                      <div className="relative z-10 self-end">
                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${person.is_later ? 'bg-amber-400' : 'bg-emerald-400'} shadow-[0_0_8px_rgba(53,227,138,0.8)]`} />
                      </div>

                      {/* Bottom details */}
                      <div className="relative z-10 space-y-1">
                        <h3 className="font-semibold text-sm text-white">
                          {person.full_name || `${person.name}, ${person.age || 25}`}
                        </h3>

                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal border bg-purple-950/80 text-purple-200 border-purple-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span className="truncate max-w-[100px]">{person.status_label || 'Disponível agora'}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-white/10">
                          <div className="flex items-center gap-1 text-[10px] text-zinc-300 font-normal">
                            <MapPin className="w-3 h-3 text-pink-400 shrink-0" />
                            <span>{person.distance ? `${person.distance} km` : (person.distance_text || 'Perto')}</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onLikeUser(person.id);
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
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AllAvailableUsersModal;
