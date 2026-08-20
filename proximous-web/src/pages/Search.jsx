import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search as SearchIcon, 
  Heart, 
  Sparkles, 
  MapPin, 
  SlidersHorizontal, 
  X,
  User,
  Coffee,
  Music,
  BookOpen,
  Film,
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';
import { usersAPI, matchingAPI } from '../lib/api';

const INTEREST_TAGS = [
  'Todos', 'Café', 'Música', 'Livros', 'Cinema', 'Programação', 
  'Trilha', 'Jogos', 'Arte', 'Fotografia', 'Animes', 'Yoga'
];

const STYLE_OPTIONS = [
  { value: '', label: 'Todos os estilos' },
  { value: 'shy', label: 'Tímido(a)' },
  { value: 'introverted', label: 'Introvertido(a)' },
  { value: 'ambiverted', label: 'Ambivertido(a)' },
  { value: 'extroverted', label: 'Extrovertido(a)' },
];

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('Todos');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likedUserIds, setLikedUserIds] = useState(new Set());

  useEffect(() => {
    performSearch();
  }, [selectedInterest, selectedStyle]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const params = {};
      if (query.trim()) params.q = query.trim();
      if (selectedInterest !== 'Todos') params.interest = selectedInterest;
      if (selectedStyle) params.social_style = selectedStyle;

      const res = await usersAPI.search(params);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  const handleQuickLike = async (e, userId) => {
    e.stopPropagation();
    if (likedUserIds.has(userId)) return;

    try {
      await matchingAPI.sendLike({ receiver_id: userId, like_type: 'like' });
      setLikedUserIds(prev => new Set(prev).add(userId));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070611] text-white p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#A020F0] to-[#FF4FA3] bg-clip-text text-transparent">
          Buscar Pessoas
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Encontre pessoas com interesses e estilo parecidos com o seu.
        </p>
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nome, bio..."
          className="w-full bg-[#0D0A1C] border border-[#30204D] rounded-2xl py-4 pl-12 pr-28 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-purple-500 shadow-xl"
        />
        <SearchIcon className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
        
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg"
        >
          Buscar
        </button>
      </form>

      {/* Interest Tags Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {INTEREST_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedInterest(tag)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedInterest === tag
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-105'
                : 'bg-[#16112A] border border-[#30204D] text-[#AAA5BA] hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Style Filter Select */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" /> Estilo:
        </span>
        <select
          value={selectedStyle}
          onChange={e => setSelectedStyle(e.target.value)}
          className="bg-[#16112A] border border-[#30204D] text-xs font-semibold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
        >
          {STYLE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Buscando perfis...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-[#0D0A1C] border border-[#30204D] rounded-3xl p-8">
          <SearchIcon className="w-10 h-10 mx-auto text-purple-400 opacity-50" />
          <p className="font-extrabold text-white text-base">Nenhum resultado encontrado</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Tente buscar com outro termo ou selecionar a categoria "Todos".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => {
            const isLiked = likedUserIds.has(u.id);
            return (
              <div
                key={u.id}
                onClick={() => navigate(`/profile/${u.id}`)}
                className="bg-[#0D0A1C] border border-[#30204D] hover:border-purple-500/50 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-[#16112A]">
                    <img
                      src={u.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'}
                      alt={u.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0A1C] via-transparent to-transparent pointer-events-none" />
                    
                    {u.compatibility_score && (
                      <span className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg">
                        <Sparkles className="w-3 h-3 text-pink-300" /> {u.compatibility_score}%
                      </span>
                    )}

                    <button
                      onClick={e => handleQuickLike(e, u.id)}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isLiked
                          ? 'bg-pink-500 text-white shadow-lg'
                          : 'bg-black/60 backdrop-blur-md text-white/80 hover:text-pink-400 hover:scale-110'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-white truncate">
                        {u.name}{u.age ? `, ${u.age}` : ''}
                      </h3>
                      {u.location_city && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-pink-400" />
                          {u.location_city}
                        </span>
                      )}
                    </div>

                    {u.bio && (
                      <p className="text-xs text-[#AAA5BA] line-clamp-2 leading-relaxed">
                        {u.bio}
                      </p>
                    )}

                    {/* Tags */}
                    {u.interests && u.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {u.interests.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#16112A] border border-[#30204D] text-purple-300"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Link */}
                <div className="p-4 pt-0">
                  <div className="w-full py-2.5 rounded-xl bg-[#16112A] border border-[#30204D] group-hover:bg-purple-600/20 group-hover:border-purple-500/40 text-xs font-bold text-center text-purple-300 flex items-center justify-center gap-1 transition-colors">
                    Ver Perfil Completo
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Search;
