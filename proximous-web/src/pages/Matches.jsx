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

  // Selected Profile Modal
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, [radiusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [matchesRes, sentLikesRes, receivedLikesRes, discoverRes] = await Promise.allSettled([
        matchingAPI.getMatches({ limit: 50 }),
        matchingAPI.getSentLikes({ limit: 50 }),
        matchingAPI.getReceivedLikes({ limit: 50 }),
        usersAPI.discover({ radius: radiusFilter, limit: 12 })
      ]);

      if (matchesRes.status === 'fulfilled') setMatches(matchesRes.value.data.matches || []);
      if (sentLikesRes.status === 'fulfilled') setSentLikes(sentLikesRes.value.data.likes || []);
      if (receivedLikesRes.status === 'fulfilled') setReceivedLikes(receivedLikesRes.value.data.likes || []);
      if (discoverRes.status === 'fulfilled') setDiscoverUsers(discoverRes.value.data.users || []);
    } catch (error) {
      console.error('Error fetching matches & discover data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Demo fallback profiles for pristine visual fidelity when DB lists are empty
  const defaultMatchCards = [
    {
      id: 'm-demo-1',
      created_at: '2026-08-14T12:00:00Z',
      user: {
        id: 'user-ana',
        name: 'Ana',
        age: 28,
        distance: 1.8,
        compatibility_score: 94,
        is_online: true,
        profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop',
        interests: ['Música', 'Viagens', 'Gastronomia']
      }
    },
    {
      id: 'm-demo-2',
      created_at: '2026-08-13T18:30:00Z',
      user: {
        id: 'user-julia',
        name: 'Julia',
        age: 31,
        distance: 2.4,
        compatibility_score: 87,
        is_online: true,
        profile_photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop',
        interests: ['Fitness', 'Leitura', 'Natureza']
      }
    },
    {
      id: 'm-demo-3',
      created_at: '2026-08-12T09:15:00Z',
      user: {
        id: 'user-marina',
        name: 'Marina',
        age: 27,
        distance: 3.1,
        compatibility_score: 84,
        is_online: false,
        profile_photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800&auto=format&fit=crop',
        interests: ['Fotografia', 'Comida', 'Cinema']
      }
    }
  ];

  const defaultReceivedLikes = [
    {
      id: 'rec-demo-1',
      sender: {
        id: 'user-beatriz',
        name: 'Beatriz',
        age: 26,
        distance: 1.6,
        compatibility_score: 91,
        profile_photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop',
        interests: ['Viagens', 'Música', 'Vinho']
      },
      time_ago: 'há 2h',
      is_new: true
    },
    {
      id: 'rec-demo-2',
      sender: {
        id: 'user-larissa',
        name: 'Larissa',
        age: 30,
        distance: 2.9,
        compatibility_score: 88,
        profile_photo_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop',
        interests: ['Arte', 'Natureza']
      },
      time_ago: 'há 5h',
      is_new: true
    }
  ];

  const defaultSentLikes = [
    {
      id: 'sent-demo-1',
      receiver: {
        id: 'user-camila',
        name: 'Camila',
        age: 29,
        distance: 2.2,
        profile_photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop'
      },
      time_ago: 'há 3 horas'
    },
    {
      id: 'sent-demo-2',
      receiver: {
        id: 'user-juliana',
        name: 'Juliana',
        age: 27,
        distance: 3.7,
        profile_photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop'
      },
      time_ago: 'há 1 dia'
    }
  ];

  // Raw lists
  const displayMatchesList = matches.length > 0 ? matches : defaultMatchCards;
  const displayReceivedList = receivedLikes.length > 0 ? receivedLikes : defaultReceivedLikes;
  const displaySentList = sentLikes.length > 0 ? sentLikes : defaultSentLikes;

  // Sorting logic for matches
  const sortedMatches = useMemo(() => {
    let list = [...displayMatchesList];

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
  }, [displayMatchesList, searchQuery, sortBy, user]);

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

  // Skeleton Loader for UX rule compliance
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070611] text-white px-4 py-6 pb-28 space-y-6 max-w-[1500px] mx-auto font-sans">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-[#16112A] animate-pulse rounded-xl" />
            <div className="h-4 w-72 bg-[#16112A] animate-pulse rounded-lg" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-[#16112A] animate-pulse rounded-full" />
            <div className="h-9 w-9 bg-[#16112A] animate-pulse rounded-full" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="h-12 w-full bg-[#0D0A1C] border border-[#30204D] rounded-full animate-pulse" />

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[380px] bg-[#100D21] border border-[#30204D] rounded-[22px] animate-pulse relative overflow-hidden">
              <div className="absolute bottom-4 left-4 right-4 space-y-3">
                <div className="h-6 w-32 bg-[#16112A] rounded-lg" />
                <div className="h-4 w-20 bg-[#16112A] rounded-md" />
                <div className="h-6 w-28 bg-[#16112A] rounded-full" />
                <div className="h-10 w-full bg-[#16112A] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
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
      
      {/* 1. HEADER - Title with gradient styling from JSON design tokens */}
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
              className="w-10 h-10 rounded-full bg-[#0D0A1C] border border-[#30204D] flex items-center justify-center text-[#AAA5BA] hover:text-white hover:border-[#9B20F0] transition-all shadow-lg"
              title="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-lg ${
              showFilters 
                ? 'bg-gradient-to-r from-[#9B20F0] to-[#D414A8] border-[#D414A8] text-white shadow-[#D414A8]/30' 
                : 'bg-[#0D0A1C] border-[#30204D] text-[#AAA5BA] hover:text-white hover:border-[#9B20F0]'
            }`}
            title="Filtros"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FILTER DRAWER PANEL */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#0D0A1C] border border-[#30204D] p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.30)] space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-white">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF4FA3]" />
                Raio de Proximidade:
              </span>
              <span className="text-[#FF4FA3] font-extrabold">{radiusFilter} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(Number(e.target.value))}
              className="w-full accent-[#D414A8] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-[#AAA5BA] font-medium">
              <span>1 km (Super local)</span>
              <button 
                onClick={fetchData}
                className="bg-gradient-to-r from-[#9B20F0] to-[#D414A8] text-white font-bold text-xs px-3 py-1 rounded-lg shadow-md hover:opacity-90"
              >
                Aplicar Filtro
              </button>
              <span>50 km</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. TABS BAR - Styled strictly with JSON Design Tokens */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 p-1 bg-[#0D0A1C] border border-[#30204D] rounded-full shadow-inner h-12">
          
          <TabsTrigger 
            value="matches"
            className="rounded-full font-extrabold text-xs sm:text-sm h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9B20F0] data-[state=active]:via-[#D414A8] data-[state=active]:to-[#F01E55] data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(214,20,168,0.35)] transition-all flex items-center justify-center gap-1.5 text-[#AAA5BA]"
          >
            <Heart className="w-3.5 h-3.5 fill-current text-white" />
            <span>Matches</span>
          </TabsTrigger>

          <TabsTrigger 
            value="received"
            className="rounded-full font-extrabold text-xs sm:text-sm h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9B20F0] data-[state=active]:via-[#D414A8] data-[state=active]:to-[#F01E55] data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(214,20,168,0.35)] transition-all flex items-center justify-center gap-1.5 text-[#AAA5BA] relative"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Recebidos</span>
            {displayReceivedList.length > 0 && (
              <span className="absolute -top-1 right-2 w-3.5 h-3.5 rounded-full bg-[#F01E75] border-2 border-[#070611] shadow-lg animate-pulse" />
            )}
          </TabsTrigger>

          <TabsTrigger 
            value="sent"
            className="rounded-full font-extrabold text-xs sm:text-sm h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9B20F0] data-[state=active]:via-[#D414A8] data-[state=active]:to-[#F01E55] data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(214,20,168,0.35)] transition-all flex items-center justify-center gap-1.5 text-[#AAA5BA]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviados</span>
          </TabsTrigger>

        </TabsList>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: MATCHES */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="matches" className="mt-6 space-y-6 focus-visible:outline-none">
          
          {/* Section Header Toolbar with Sorting Dropdown */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF4FA3]" />
              <div>
                <h3 className="font-extrabold text-white text-base">Seus Matches</h3>
                <p className="text-[11px] text-[#AAA5BA]">Pessoas que curtiram você também.</p>
              </div>
            </div>

            {/* Sorting Dropdown (from JSON config) */}
            <div className="relative">
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="bg-[#0D0A1C] border border-[#30204D] hover:border-[#9B20F0] text-xs font-semibold text-[#AAA5BA] hover:text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <span>{sortBy}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#AAA5BA]" />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#100D21] border border-[#30204D] rounded-xl shadow-2xl z-40 overflow-hidden py-1">
                  {['Mais recentes', 'Mais próximos', 'Maior compatibilidade', 'Online agora'].map(option => (
                    <button
                      key={option}
                      onClick={() => { setSortBy(option); setShowSortDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                        sortBy === option ? 'bg-[#9B20F0]/20 text-[#FF4FA3] font-bold' : 'text-slate-300 hover:bg-[#16112A]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Empty State or Cards Grid */}
          {sortedMatches.length === 0 ? (
            <div className="bg-[#100D21] border border-[#30204D] rounded-[22px] p-8 text-center space-y-4">
              <Heart className="w-12 h-12 text-[#FF4FA3] mx-auto animate-pulse" />
              <h4 className="font-extrabold text-white text-lg">Nenhum match ainda</h4>
              <p className="text-xs text-[#AAA5BA] max-w-sm mx-auto">
                Seu próximo match pode estar mais perto do que você imagina.
              </p>
              <Button onClick={() => navigate('/discover')} className="bg-gradient-to-r from-[#9B20F0] to-[#D414A8] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl">
                Descobrir pessoas
              </Button>
            </div>
          ) : (
            /* Portrait Photo Match Cards (Image Focused 4/5 Aspect Ratio) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedMatches.map((m) => {
                const otherUser = m.other_user || (m.user1_id === user?.id ? m.user2 : m.user1) || m.user;
                if (!otherUser) return null;

                const photo = otherUser.profile_photo_url || generateAvatarUrl(otherUser.name);
                const compatibility = otherUser.compatibility_score || 94;
                const interests = otherUser.interests || ['Música', 'Viagens', 'Gastronomia'];

                return (
                  <motion.div 
                    key={m.id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-[22px] overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.30)] border border-[#30204D] bg-[#100D21] group hover:border-[#9B20F0] transition-all duration-300 flex flex-col h-[390px]"
                  >
                    {/* Portrait Photo */}
                    <img 
                      src={photo} 
                      alt={otherUser.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070611] via-[#070611]/60 to-transparent pointer-events-none" />

                    {/* Online Indicator Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 text-[10px] font-bold text-white flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-[#35E38A] animate-pulse" />
                        <span>Online</span>
                      </div>
                    </div>

                    {/* Information Overlaid on Photo */}
                    <div className="mt-auto p-4 relative z-10 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xl font-black text-white tracking-tight">
                          {otherUser.name}, {otherUser.age || 28}
                        </h4>
                        <CheckCircle2 className="w-4 h-4 text-[#FF4FA3]" />
                      </div>

                      <p className="text-xs text-[#AAA5BA] font-medium">
                        {otherUser.distance ? `${otherUser.distance} km` : '1,8 km'} de você
                      </p>

                      {/* Compatibility Percentage Display */}
                      <div className="inline-block">
                        <span className="bg-[#9B20F0]/30 backdrop-blur-md text-[#FF4FA3] text-[11px] font-black px-2.5 py-1 rounded-xl border border-[#9B20F0]/40 shadow-md">
                          {compatibility}% Compatibilidade
                        </span>
                      </div>

                      {/* Interest Pills (max 3) */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {interests.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="bg-[#0D0A1C]/80 backdrop-blur-md text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-white/10 flex items-center gap-1">
                            {idx === 0 ? '🎵' : idx === 1 ? '✈️' : '🍷'} {tag}
                          </span>
                        ))}
                      </div>

                      {/* Conversar Button */}
                      <div className="pt-2">
                        <Button
                          onClick={() => navigate(`/messages/${otherUser.id}`)}
                          className="w-full bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#F01E55] hover:opacity-95 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-[0_8px_25px_rgba(205,20,180,0.35)] flex items-center justify-center gap-1.5 transition-all"
                        >
                          <MessageCircle className="w-4 h-4 fill-white text-white" />
                          <span>Conversar</span>
                        </Button>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Bottom Promotion Card */}
          <div className="bg-gradient-to-r from-[#0D0A1C] via-[#100D21] to-[#25103A] border border-[#30204D] rounded-[22px] p-5 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#9B20F0] to-[#D414A8] flex items-center justify-center text-white shadow-[0_0_30px_rgba(214,20,168,0.30)] flex-shrink-0 p-3">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <h4 className="font-extrabold text-white text-base">Mais pessoas perto de você</h4>
                <p className="text-xs text-[#AAA5BA] font-medium">Descubra quem está online agora</p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/discover')}
              className="bg-gradient-to-r from-[#9B20F0] to-[#D414A8] hover:opacity-90 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <span>Explorar agora</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: RECEBIDOS */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="received" className="mt-6 space-y-6 focus-visible:outline-none">
          
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#FF4FA3]" />
            <div>
              <h3 className="font-extrabold text-white text-base">Pessoas interessadas em você</h3>
              <p className="text-[11px] text-[#AAA5BA]">Elas curtiram seu perfil e querem te conhecer.</p>
            </div>
          </div>

          {displayReceivedList.length === 0 ? (
            <div className="bg-[#100D21] border border-[#30204D] rounded-[22px] p-8 text-center space-y-4">
              <Mail className="w-12 h-12 text-[#FF4FA3] mx-auto animate-pulse" />
              <h4 className="font-extrabold text-white text-lg">Nenhuma solicitação recebida</h4>
              <p className="text-xs text-[#AAA5BA] max-w-sm mx-auto">
                Quando alguém demonstrar interesse em você, aparecerá aqui.
              </p>
              <Button onClick={() => navigate('/discover')} className="bg-gradient-to-r from-[#9B20F0] to-[#D414A8] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl">
                Explorar pessoas
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayReceivedList.map((item) => {
                const sender = item.sender || item.user;
                if (!sender) return null;

                const photo = sender.profile_photo_url || generateAvatarUrl(sender.name);
                const compatibility = sender.compatibility_score || 91;

                return (
                  <motion.div 
                    key={item.id}
                    whileHover={{ y: -2 }}
                    className="bg-[#100D21] border border-[#30204D] hover:border-[#9B20F0] rounded-[22px] p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between relative shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img 
                        src={photo} 
                        alt={sender.name} 
                        className="w-24 sm:w-28 h-32 rounded-2xl object-cover shadow-md flex-shrink-0"
                      />

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-lg font-extrabold text-white truncate">
                            {sender.name}, {sender.age || 26}
                          </h4>
                          <CheckCircle2 className="w-4 h-4 text-[#FF4FA3]" />
                        </div>

                        <p className="text-xs text-[#AAA5BA] font-medium">
                          📍 {sender.distance ? `${sender.distance} km` : '1,6 km'} de você
                        </p>

                        <div className="inline-block">
                          <span className="bg-[#F01E75]/20 text-[#FF4FA3] text-[11px] font-black px-2.5 py-0.5 rounded-xl border border-[#F01E75]/30">
                            {compatibility}% compatibilidade
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-medium pt-0.5">
                          3 interesses em comum <span className="ml-1">✈️ 🎵 🍷</span>
                        </p>

                        <p className="text-[11px] text-[#777188] font-medium pt-1">
                          Curtiu seu perfil {item.time_ago || 'há 2h'}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#30204D]">
                      {item.is_new && (
                        <span className="bg-[#F01E75] text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-md animate-pulse">
                          Novo
                        </span>
                      )}

                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto ml-auto sm:ml-0">
                        <Button
                          onClick={() => setSelectedProfileUser(sender)}
                          className="bg-gradient-to-r from-[#9B20F0] to-[#D414A8] hover:opacity-90 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md flex-1 sm:flex-none text-center"
                        >
                          Ver perfil
                        </Button>

                        <Button
                          onClick={() => handleLikeBack(sender.id)}
                          className="bg-[#16112A] hover:bg-[#20183E] text-[#AAA5BA] hover:text-white font-bold text-xs px-5 py-2 rounded-xl border border-[#30204D] flex-1 sm:flex-none text-center"
                        >
                          Ignorar
                        </Button>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Privacy Card */}
          <div className="bg-[#100D21] border border-[#30204D] rounded-[22px] p-5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#9B20F0]/20 border border-[#9B20F0]/30 flex items-center justify-center text-[#FF4FA3]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">Conexões seguras</h4>
                <p className="text-xs text-[#AAA5BA]">Só você decide com quem quer conversar.</p>
                <a href="#privacy" className="text-xs text-[#FF4FA3] font-bold hover:underline inline-block mt-0.5">
                  Saiba mais sobre privacidade
                </a>
              </div>
            </div>
          </div>

        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ENVIADOS */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="sent" className="mt-6 space-y-6 focus-visible:outline-none">
          
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#FF4FA3]" />
            <div>
              <h3 className="font-extrabold text-white text-base">Solicitações enviadas</h3>
              <p className="text-[11px] text-[#AAA5BA]">Você demonstrou interesse nelas.</p>
            </div>
          </div>

          {displaySentList.length === 0 ? (
            <div className="bg-[#100D21] border border-[#30204D] rounded-[22px] p-8 text-center space-y-4">
              <Send className="w-12 h-12 text-[#FF4FA3] mx-auto animate-pulse" />
              <h4 className="font-extrabold text-white text-lg">Nenhuma solicitação enviada</h4>
              <p className="text-xs text-[#AAA5BA] max-w-sm mx-auto">
                Explore perfis e demonstre interesse em quem combina com você.
              </p>
              <Button onClick={() => navigate('/discover')} className="bg-gradient-to-r from-[#9B20F0] to-[#D414A8] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl">
                Ir para o Discover
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displaySentList.map((item) => {
                const receiver = item.receiver || item.user;
                if (!receiver) return null;

                const photo = receiver.profile_photo_url || generateAvatarUrl(receiver.name);

                return (
                  <motion.div 
                    key={item.id}
                    whileHover={{ y: -2 }}
                    className="bg-[#100D21] border border-[#30204D] rounded-[22px] p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between relative shadow-xl"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img 
                        src={photo} 
                        alt={receiver.name} 
                        className="w-24 sm:w-28 h-32 rounded-2xl object-cover shadow-md flex-shrink-0"
                      />

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-lg font-extrabold text-white truncate">
                            {receiver.name}, {receiver.age || 29}
                          </h4>
                          <CheckCircle2 className="w-4 h-4 text-[#FF4FA3]" />
                        </div>

                        <p className="text-xs text-[#AAA5BA] font-medium">
                          📍 {receiver.distance ? `${receiver.distance} km` : '2,2 km'} de você
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold pt-1">
                          <Clock className="w-3.5 h-3.5 text-[#FFB84D]" />
                          <span>Aguardando resposta</span>
                        </div>

                        <p className="text-[11px] text-[#777188] font-medium">
                          Você demonstrou interesse {item.time_ago || 'há 3 horas'}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#30204D] ml-auto">
                      <Button
                        onClick={() => setSelectedProfileUser(receiver)}
                        className="bg-[#16112A] hover:bg-[#20183E] text-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl border border-[#30204D] flex-1 sm:flex-none text-center"
                      >
                        Ver perfil
                      </Button>

                      <Button
                        onClick={() => handleCancelLike(receiver.id)}
                        className="bg-[#100D21] hover:bg-[#FF3D71]/20 text-[#FF3D71] font-bold text-xs px-5 py-2.5 rounded-xl border border-[#FF3D71]/30 flex-1 sm:flex-none text-center transition-colors"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Bottom Promotion Card */}
          <div className="bg-gradient-to-r from-[#0D0A1C] via-[#100D21] to-[#25103A] border border-[#30204D] rounded-[22px] p-6 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-extrabold text-white text-base">Continue explorando</h4>
              <p className="text-xs text-[#AAA5BA] max-w-sm">
                Quanto mais você interagir, maiores as chances de dar match!
              </p>
            </div>

            <Button
              onClick={() => navigate('/discover')}
              className="bg-gradient-to-r from-[#9B20F0] to-[#D414A8] hover:opacity-90 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-[0_8px_25px_rgba(205,20,180,0.35)] flex-shrink-0"
            >
              Ir para o Discover
            </Button>
          </div>

        </TabsContent>

      </Tabs>

      {/* FULL PROFILE MODAL */}
      {selectedProfileUser && (
        <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#100D21] border border-[#30204D] rounded-[30px] max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedProfileUser(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-80 w-full bg-black">
              <img
                src={selectedProfileUser.profile_photo_url || generateAvatarUrl(selectedProfileUser.name)}
                alt={selectedProfileUser.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#100D21] via-transparent to-transparent" />

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h2 className="text-2xl font-black">{selectedProfileUser.name}, {selectedProfileUser.age || 26}</h2>
                <p className="text-xs text-[#AAA5BA] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF4FA3]" />
                  {selectedProfileUser.distance ? `${selectedProfileUser.distance} km de você` : 'São Paulo, SP'}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h5 className="text-[11px] font-black text-[#AAA5BA] uppercase tracking-wider mb-1">Sobre mim</h5>
                <p className="text-sm text-slate-200 leading-relaxed bg-[#16112A] p-4 rounded-2xl border border-[#30204D]">
                  {selectedProfileUser.bio || 'Adoro conversas tranquilas, música e conhecer novos lugares.'}
                </p>
              </div>

              {selectedProfileUser.interests && (
                <div>
                  <h5 className="text-[11px] font-black text-[#AAA5BA] uppercase tracking-wider mb-2">Interesses</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfileUser.interests.map((interest, idx) => (
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
                    handleLikeBack(selectedProfileUser.id);
                    setSelectedProfileUser(null);
                  }}
                  className="w-full bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#F01E55] hover:opacity-95 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-[0_8px_25px_rgba(205,20,180,0.35)] flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Demonstrar Interesse 💜</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default Matches;
