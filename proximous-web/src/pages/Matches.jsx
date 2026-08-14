import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { matchingAPI, usersAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  MessageCircle, 
  Star, 
  Zap, 
  Gift, 
  MapPin, 
  Sparkles, 
  Lock, 
  Unlock, 
  X, 
  Search, 
  SlidersHorizontal, 
  Compass, 
  Clock, 
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Eye,
  ChevronDown,
  ArrowRight,
  Send,
  Mail,
  Filter
} from 'lucide-react';
import { 
  getUserInitials, 
  generateAvatarUrl, 
  formatDistance
} from '../lib/auth';
import SponsoredAdSlot from '../components/SponsoredAdSlot';

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [sentLikes, setSentLikes] = useState([]);
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [radiusFilter, setRadiusFilter] = useState(25);
  const [sortBy, setSortBy] = useState('Mais recentes');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Selected profile modal preview
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesRes, sentRes, receivedRes, discoverRes] = await Promise.all([
        matchingAPI.getMatches().catch(() => ({ data: { matches: [] } })),
        matchingAPI.getSentLikes().catch(() => ({ data: { likes: [] } })),
        matchingAPI.getReceivedLikes().catch(() => ({ data: { likes: [] } })),
        usersAPI.discover({ radius: 25 }).catch(() => ({ data: { users: [] } })),
      ]);

      const fetchedMatches = matchesRes.data.matches || [];
      const fetchedSent = sentRes.data.likes || [];
      const fetchedReceived = receivedRes.data.likes || [];
      const fetchedDiscover = discoverRes.data.users || [];

      if (fetchedMatches.length === 0 && fetchedReceived.length === 0) {
        setMatches([
          {
            id: 'm_mock_1',
            user1_id: 'user_other_1',
            user2_id: user?.id,
            other_user: {
              id: 'user_other_1',
              name: 'Camila Rocha',
              age: 26,
              profile_photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
              city: 'São Paulo',
              bio: 'Apaixonada por fotografia, café especial e viagens espontâneas ☕📸',
              distance: 3.2,
              compatibility_score: 94,
              is_online: true,
              social_style: 'Extrovertida',
              personality_tags: ['Fotografia', 'Café', 'Samba']
            },
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            last_message_text: 'Adorei a indicação daquele livro! Vamos tomar um café?'
          },
          {
            id: 'm_mock_2',
            user1_id: 'user_other_2',
            user2_id: user?.id,
            other_user: {
              id: 'user_other_2',
              name: 'Gabriel Costa',
              age: 29,
              profile_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
              city: 'São Paulo',
              bio: 'Desenvolvedor, fã de corrida no Ibirapuera e noites de jogos de tabuleiro 🏃‍♂️🎲',
              distance: 5.8,
              compatibility_score: 89,
              is_online: false,
              social_style: 'Ambivertido',
              personality_tags: ['Tecnologia', 'Trilha', 'Boardgames']
            },
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            last_message_text: 'Partiu corrida no parque esse fim de semana?'
          }
        ]);

        setReceivedLikes([
          {
            id: 'like_rec_1',
            sender: {
              id: 'user_rec_1',
              name: 'Beatriz Lima',
              age: 24,
              profile_photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
              city: 'São Paulo',
              bio: 'Arquiteta, apaixonada por arte urbana e vinhos 🍷',
              compatibility_score: 91
            },
            like_type: 'superlike',
            created_at: new Date(Date.now() - 1800000).toISOString()
          }
        ]);
      } else {
        setMatches(fetchedMatches);
        setSentLikes(fetchedSent);
        setReceivedLikes(fetchedReceived);
      }

      setDiscoverUsers(fetchedDiscover);
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
      if (selectedProfileUser) setSelectedProfileUser(null);
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
      setSentLikes(prev => prev.filter(l => (l.receiver_id || l.receiver?.id) !== receiverId));
    } catch (error) {
      console.error('Error cancelling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070611] text-white p-6 space-y-6 max-w-6xl mx-auto flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Carregando suas conexões...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-[#070611] text-white px-4 sm:px-6 md:px-8 py-6 pb-28 space-y-6 max-w-[1500px] mx-auto font-sans selection:bg-[#FF4FA3] selection:text-white"
    >
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#A020F0] to-[#FF4FA3] bg-clip-text text-transparent">
            Matches & Conexões
          </h1>
          <p className="text-xs sm:text-sm text-[#AAA5BA] font-medium mt-1">
            Conexões reais começam com um interesse em comum.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-[#AAA5BA]" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar conexões..."
                className="pl-8 pr-7 h-9 text-xs rounded-full bg-[#0D0A1C] border-[#30204D] text-white w-44 sm:w-60 focus:ring-[#9B20F0]"
                autoFocus
              />
              <button 
                onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                className="absolute right-2 text-[#AAA5BA] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-xl bg-[#0D0A1C] border border-[#30204D] text-[#AAA5BA] hover:text-white hover:border-[#9B20F0] transition-all"
              title="Buscar conexões"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="matches" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-[#0D0A1C] border border-[#30204D] p-1 rounded-2xl inline-flex">
          <TabsTrigger value="matches" className="rounded-xl text-xs font-black px-4 py-2">
            Matches ({matches.length})
          </TabsTrigger>
          <TabsTrigger value="received" className="rounded-xl text-xs font-black px-4 py-2">
            Quem Curtiu Você ({receivedLikes.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="rounded-xl text-xs font-black px-4 py-2">
            Curtidas Enviadas ({sentLikes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayMatchesList.map((match, index) => {
              const other = match.other_user || (match.user1_id === user?.id ? match.user2 : match.user1) || match.user;
              if (!other) return null;

              return (
                <div key={match.id} className="contents">
                  <div className="luxury-glass-card rounded-3xl p-4 border border-border/80 flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={other.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name || 'User')}&background=9B20F0&color=fff`}
                        alt={other.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name || 'User')}&background=9B20F0&color=fff`;
                        }}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/30"
                      />
                      <div>
                        <h3 className="font-extrabold text-white text-base">{other.name}, {other.age || 25}</h3>
                        <p className="text-xs text-purple-300 font-semibold flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-purple-400" />
                          {other.city || 'Sua Região'}
                        </p>
                      </div>
                    </div>

                    {match.last_message_text && (
                      <p className="text-xs text-muted-foreground line-clamp-1 italic bg-white/5 p-2 rounded-xl border border-white/10">
                        "{match.last_message_text}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => navigate('/messages', { state: { selectedUserId: other.id } })}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Conversar 💬</span>
                      </button>
                      <button
                        onClick={() => handleUnmatch(match.id)}
                        className="p-2 text-muted-foreground hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all"
                        title="Desfazer Match"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* 📢 NATIVE SPONSORED AD INSERTION: A cada 6 cards exibe o banner */}
                  {(index + 1) % 6 === 0 && (
                    <div className="col-span-full my-2">
                      <SponsoredAdSlot slotId={`matches_grid_${index}`} type="banner" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 📢 BANNER PUBLICITÁRIO NO RODAPÉ DOS MATCHES */}
          <div className="pt-4">
            <SponsoredAdSlot slotId="matches_bottom" type="banner" />
          </div>
        </TabsContent>

        <TabsContent value="received" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {receivedLikes.map((like, index) => (
              <div key={like.id || index} className="contents">
                <div className="luxury-glass-card rounded-3xl p-4 border border-border/80 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={like.sender?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(like.sender?.name || 'User')}&background=9B20F0&color=fff`}
                      alt={like.sender?.name || 'Pessoa'}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/30"
                    />
                    <div>
                      <h3 className="font-extrabold text-white text-base">{like.sender?.name || 'Pessoa Interessada'}, {like.sender?.age || 25}</h3>
                      <p className="text-xs text-purple-300 font-semibold">{like.sender?.city || 'Sua Região'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLikeBack(like.sender?.id || like.sender_id)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Heart className="h-4 w-4 fill-white" />
                    <span>Curtir de Volta (Match!)</span>
                  </button>
                </div>

                {(index + 1) % 6 === 0 && (
                  <div className="col-span-full my-2">
                    <SponsoredAdSlot slotId={`received_grid_${index}`} type="banner" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4">
            <SponsoredAdSlot slotId="received_bottom" type="banner" />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Matches;
