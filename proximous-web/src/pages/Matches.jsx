import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { matchingAPI } from '../lib/api';
import { Sparkles, ChevronDown, Mail, Send, Filter } from 'lucide-react';
import UserProfileModal from '@/components/UserProfileModal';
import SponsoredAdSlot from '@/components/SponsoredAdSlot';

// Modular Match Components
import MatchesHeader from '@/components/matches/MatchesHeader';
import MatchesTabs from '@/components/matches/MatchesTabs';
import MatchCard from '@/components/matches/MatchCard';
import ReceivedRequestCard from '@/components/matches/ReceivedRequestCard';
import SentRequestCard from '@/components/matches/SentRequestCard';
import EmptyMatchState from '@/components/matches/EmptyMatchState';
import NearbyPeopleBanner from '@/components/matches/NearbyPeopleBanner';
import PrivacyCard from '@/components/matches/PrivacyCard';

const SORT_OPTIONS = [
  'Mais recentes',
  'Mais próximos',
  'Maior compatibilidade',
  'Online agora'
];

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Single State Managing Page Tab: 'matches' | 'received' | 'sent'
  const [activeTab, setActiveTab] = useState('matches');

  // Data State
  const [matches, setMatches] = useState([]);
  const [sentLikes, setSentLikes] = useState([]);
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState('Mais recentes');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesRes, sentRes, receivedRes] = await Promise.all([
        matchingAPI.getMatches().catch(() => ({ data: { matches: [] } })),
        matchingAPI.getSentLikes().catch(() => ({ data: { likes: [] } })),
        matchingAPI.getReceivedLikes().catch(() => ({ data: { likes: [] } })),
      ]);

      const fetchedMatches = matchesRes.data.matches || [];
      const fetchedSent = sentRes.data.likes || [];
      const fetchedReceived = receivedRes.data.likes || [];

      if (fetchedMatches.length === 0 && fetchedReceived.length === 0 && fetchedSent.length === 0) {
        // Mock fallback profiles strictly aligned with JSON specification & 3-screen reference
        setMatches([
          {
            id: 'm_mock_1',
            user1_id: 'user_other_1',
            user2_id: user?.id,
            other_user: {
              id: 'user_other_1',
              name: 'Ana',
              age: 28,
              profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
              city: 'São Paulo',
              distance: 1.8,
              compatibility_score: 94,
              is_online: true,
              personality_tags: ['🎵 Música', '✈️ Viagens', '☕ Gastronomia']
            },
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            last_message_text: 'Adorei conversar com você! Vamos agendar aquele café?'
          },
          {
            id: 'm_mock_2',
            user1_id: 'user_other_2',
            user2_id: user?.id,
            other_user: {
              id: 'user_other_2',
              name: 'Julia',
              age: 31,
              profile_photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
              city: 'São Paulo',
              distance: 2.4,
              compatibility_score: 87,
              is_online: true,
              personality_tags: ['🏋️ Fitness', '📚 Leitura', '🌿 Natureza']
            },
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            last_message_text: 'Partiu trilha no parque esse fim de semana?'
          },
          {
            id: 'm_mock_3',
            user1_id: 'user_other_3',
            user2_id: user?.id,
            other_user: {
              id: 'user_other_3',
              name: 'Marina',
              age: 27,
              profile_photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
              city: 'São Paulo',
              distance: 3.1,
              compatibility_score: 84,
              is_online: true,
              personality_tags: ['📸 Fotografia', '🍕 Comida', '🎬 Cinema']
            },
            created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
            last_message_text: 'Oi! Vi que você também gosta de cinema...'
          }
        ]);

        setReceivedLikes([
          {
            id: 'like_rec_1',
            sender: {
              id: 'user_rec_1',
              name: 'Beatriz',
              age: 26,
              profile_photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=600&q=80',
              city: 'São Paulo',
              distance: 1.6,
              compatibility_score: 91,
              common_interests_count: 3,
              interest_icons: ['✈️', '🎵', '🍷'],
              personality_tags: ['Arte', 'Vinhos', 'Design']
            },
            received_time: 'há 2h',
            is_new: true
          },
          {
            id: 'like_rec_2',
            sender: {
              id: 'user_rec_2',
              name: 'Larissa',
              age: 30,
              profile_photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
              city: 'São Paulo',
              distance: 2.9,
              compatibility_score: 88,
              common_interests_count: 2,
              interest_icons: ['🧘‍♀️', '☕'],
              personality_tags: ['Yoga', 'Café', 'Teatro']
            },
            received_time: 'há 5h',
            is_new: true
          }
        ]);

        setSentLikes([
          {
            id: 'like_sent_1',
            receiver: {
              id: 'user_sent_1',
              name: 'Camila',
              age: 29,
              profile_photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
              city: 'São Paulo',
              distance: 2.2,
            },
            sent_time: 'há 3 horas',
            status: 'Aguardando resposta'
          },
          {
            id: 'like_sent_2',
            receiver: {
              id: 'user_sent_2',
              name: 'Juliana',
              age: 27,
              profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
              city: 'São Paulo',
              distance: 3.7,
            },
            sent_time: 'há 1 dia',
            status: 'Aguardando resposta'
          }
        ]);
      } else {
        setMatches(fetchedMatches);
        setSentLikes(fetchedSent);
        setReceivedLikes(fetchedReceived);
      }
    } catch (err) {
      console.error('Error fetching matches data:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayMatchesList = useMemo(() => {
    let list = [...matches];

    if (searchQuery.trim()) {
      list = list.filter(m => {
        const u = m.other_user || (m.user1_id === user?.id ? m.user2 : m.user1) || m.user;
        return u?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    if (sortBy === 'Mais próximos') {
      list.sort((a, b) => {
        const uA = a.other_user || a.user;
        const uB = b.other_user || b.user;
        return (uA?.distance || 99) - (uB?.distance || 99);
      });
    } else if (sortBy === 'Maior compatibilidade') {
      list.sort((a, b) => {
        const uA = a.other_user || a.user;
        const uB = b.other_user || b.user;
        return (uB?.compatibility_score || 0) - (uA?.compatibility_score || 0);
      });
    } else if (sortBy === 'Online agora') {
      list.sort((a, b) => {
        const uA = a.other_user || a.user;
        const uB = b.other_user || b.user;
        return (uB?.is_online ? 1 : 0) - (uA?.is_online ? 1 : 0);
      });
    }
    return list;
  }, [matches, searchQuery, sortBy, user]);

  const handleUnmatch = async (matchId) => {
    try {
      await matchingAPI.unmatch(matchId);
      setMatches(prev => prev.filter(match => match.id !== matchId));
    } catch (error) {
      console.error('Error unmatching:', error);
    }
  };

  const handleLikeBack = async (otherUserId) => {
    try {
      await matchingAPI.sendLike({ receiver_id: otherUserId, like_type: 'like' });
      await fetchData();
      setActiveTab('matches');
    } catch (error) {
      console.error('Error liking back user:', error);
    }
  };

  const handleCancelLike = async (receiverId) => {
    try {
      await matchingAPI.unlike(receiverId);
      setSentLikes(prev => prev.filter(l => (l.receiver_id || l.receiver?.id || l.id) !== receiverId));
    } catch (error) {
      console.error('Error cancelling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070611] text-white p-6 max-w-[1500px] mx-auto flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full border-4 border-[#9B20F0]/30 border-t-[#D414A8] animate-spin shadow-2xl" />
        <p className="text-xs font-black text-[#AAA5BA] animate-pulse">Carregando suas conexões com segurança...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-[#070611] text-white px-4 sm:px-6 md:px-8 py-6 pb-28 space-y-6 max-w-[1500px] mx-auto font-sans selection:bg-[#FF4FA3] selection:text-white"
    >
      
      {/* 1. Matches Header Component */}
      <MatchesHeader
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenFilters={() => navigate('/discover')}
      />

      {/* 2. Matches Tabs Component */}
      <MatchesTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        matchesCount={matches.length}
        receivedCount={receivedLikes.length}
        sentCount={sentLikes.length}
      />

      {/* 3. Single Page Active Tab View */}

      {/* TAB 1: SEUS MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF4FA3]" />
                <span>Seus Matches</span>
              </h2>
              <p className="text-xs text-[#AAA5BA] font-medium">Pessoas que curtiram você também.</p>
            </div>

            {/* Sort Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="bg-[#0D0A1C] border border-[#30204D] text-xs font-black text-[#AAA5BA] px-3.5 py-2 rounded-2xl flex items-center gap-2 hover:text-white transition-all shadow-sm"
              >
                <span>Ordenar</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 mt-2 w-48 bg-[#0D0A1C] border border-[#30204D] rounded-2xl shadow-2xl py-2 z-30"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setShowSortDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                          sortBy === opt ? 'bg-purple-600/30 text-purple-300' : 'text-[#AAA5BA] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Matches Grid or Empty State */}
          {displayMatchesList.length === 0 ? (
            <EmptyMatchState tabKey="matches" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayMatchesList.map((match, index) => (
                <React.Fragment key={match.id}>
                  <MatchCard
                    match={match}
                    onOpenProfile={(u) => setSelectedUserModal(u)}
                    onOpenMessage={(id) => navigate('/messages', { state: { selectedUserId: id } })}
                    onUnmatch={handleUnmatch}
                  />

                  {(index + 1) % 6 === 0 && (
                    <div className="col-span-full my-2">
                      <SponsoredAdSlot slotId={`matches_grid_${index}`} type="banner" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Nearby Promotion Banner */}
          <NearbyPeopleBanner type="nearby" />
        </div>
      )}

      {/* TAB 2: RECEBIDOS */}
      {activeTab === 'received' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FF4FA3]" />
              <span>Pessoas interessadas em você</span>
            </h2>
            <p className="text-xs text-[#AAA5BA] font-medium">Elas curtiram seu perfil e querem te conhecer.</p>
          </div>

          {receivedLikes.length === 0 ? (
            <EmptyMatchState tabKey="received" />
          ) : (
            <div className="space-y-4">
              {receivedLikes.map((like, index) => (
                <React.Fragment key={like.id || index}>
                  <ReceivedRequestCard
                    like={like}
                    onOpenProfile={(u) => setSelectedUserModal(u)}
                    onLikeBack={handleLikeBack}
                    onIgnore={(id) => handleCancelLike(id)}
                  />

                  {(index + 1) % 6 === 0 && (
                    <div className="my-2">
                      <SponsoredAdSlot slotId={`received_grid_${index}`} type="banner" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Privacy Card Component */}
          <PrivacyCard />
        </div>
      )}

      {/* TAB 3: ENVIADOS */}
      {activeTab === 'sent' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-[#FF4FA3]" />
              <span>Solicitações enviadas</span>
            </h2>
            <p className="text-xs text-[#AAA5BA] font-medium">Você demonstrou interesse nelas.</p>
          </div>

          {sentLikes.length === 0 ? (
            <EmptyMatchState tabKey="sent" />
          ) : (
            <div className="space-y-4">
              {sentLikes.map((like, index) => (
                <React.Fragment key={like.id || index}>
                  <SentRequestCard
                    like={like}
                    onOpenProfile={(u) => setSelectedUserModal(u)}
                    onCancelLike={handleCancelLike}
                  />

                  {(index + 1) % 6 === 0 && (
                    <div className="my-2">
                      <SponsoredAdSlot slotId={`sent_grid_${index}`} type="banner" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Explore Banner Component */}
          <NearbyPeopleBanner type="explore" />
        </div>
      )}

      {/* User Profile Detail Modal */}
      {selectedUserModal && (
        <UserProfileModal
          user={selectedUserModal}
          isOpen={!!selectedUserModal}
          onClose={() => setSelectedUserModal(null)}
          onLike={() => {
            handleLikeBack(selectedUserModal.id);
            setSelectedUserModal(null);
          }}
        />
      )}

    </motion.div>
  );
};

export default Matches;
