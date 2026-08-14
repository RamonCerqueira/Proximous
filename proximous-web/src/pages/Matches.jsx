import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { matchingAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Camera,
  Award,
  UserCheck
} from 'lucide-react';
import { 
  getUserInitials, 
  generateAvatarUrl, 
  formatDistance, 
  getPersonalityTagColor,
  formatLastSeen,
  formatDateTime
} from '../lib/auth';

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [sentLikes, setSentLikes] = useState([]);
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');

  // Selected Match for Full Profile View Modal
  const [selectedMatchUser, setSelectedMatchUser] = useState(null);
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [matchesRes, sentLikesRes, receivedLikesRes] = await Promise.all([
        matchingAPI.getMatches({ limit: 50 }),
        matchingAPI.getSentLikes({ limit: 50 }),
        matchingAPI.getReceivedLikes({ limit: 50 })
      ]);

      setMatches(matchesRes.data.matches || []);
      setSentLikes(sentLikesRes.data.likes || []);
      setReceivedLikes(receivedLikesRes.data.likes || []);
    } catch (error) {
      console.error('Error fetching matches data:', error);
    } finally {
      setLoading(false);
    }

  };

  const handleUnmatch = async (matchId) => {
    try {
      await matchingAPI.unmatch(matchId);
      setMatches(prev => prev.filter(match => match.id !== matchId));
      if (selectedMatchUser) setSelectedMatchUser(null);
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

  const MatchCard = ({ match }) => {
    const otherUser = match.other_user || (match.user1_id === user?.id ? match.user2 : match.user1) || match.user;
    if (!otherUser) return null;
    
    return (
      <Card className="luxury-glass-card hover:shadow-2xl transition-all duration-300 border border-border/80 rounded-3xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center space-x-4">
            {/* Avatar & Match Unlocked Status */}
            <div 
              onClick={() => { setSelectedMatchUser(otherUser); setModalPhotoIndex(0); }}
              className="relative cursor-pointer group"
            >
              <Avatar className="w-16 h-16 ring-2 ring-purple-500/40 group-hover:ring-purple-500 shadow-md">
                <AvatarImage 
                  src={otherUser.profile_photo_url || generateAvatarUrl(otherUser.name || 'Usuário')} 
                  alt={otherUser.name || 'Usuário'} 
                />
                <AvatarFallback className="bg-purple-900 text-purple-100 font-bold">
                  {getUserInitials(otherUser)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-background shadow-sm" title="Perfil Desbloqueado">
                <Unlock className="w-3 h-3" />
              </div>
            </div>
            
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 
                  onClick={() => { setSelectedMatchUser(otherUser); setModalPhotoIndex(0); }}
                  className="font-extrabold text-foreground text-base hover:text-purple-400 cursor-pointer flex items-center gap-1.5 truncate"
                >
                  {otherUser.name || 'Usuário Proximous'}
                  {match.is_super_match ? (
                    <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 font-black rounded-full flex-shrink-0 shadow-sm">
                      ⭐ SUPER MATCH
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px] px-2 py-0.5 font-bold rounded-full flex-shrink-0">
                      Match 🔓
                    </Badge>
                  )}
                </h3>
                <Badge variant="secondary" className="text-[10px] text-muted-foreground bg-card/60 border border-border/40 flex-shrink-0">
                  {formatLastSeen(otherUser.last_seen)}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground font-medium">
                {otherUser.age ? `${otherUser.age} anos` : 'Idade não informada'}
                {otherUser.distance && ` • ${formatDistance(otherUser.distance)}`}
              </p>
              
              {otherUser.interests && otherUser.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {otherUser.interests.slice(0, 3).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20 rounded-md px-1.5 py-0"
                    >
                      ✨ {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2">
                <Button 
                  onClick={() => { setSelectedMatchUser(otherUser); setModalPhotoIndex(0); }}
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-border/80 text-xs font-bold h-8 px-2.5 sm:px-3 hover:bg-accent flex-1 sm:flex-none"
                >
                  Ver Perfil 🔓
                </Button>

                <Button asChild size="sm" className="proximous-button-primary rounded-xl h-8 px-2.5 sm:px-3 text-xs flex-1 sm:flex-none">
                  <Link to={`/messages/${otherUser.id}`}>
                    <MessageCircle className="w-3.5 h-3.5 mr-1" />
                    Conversar
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleUnmatch(match.id)}
                  className="text-xs text-muted-foreground hover:text-red-400 h-8 px-2"
                >
                  Desfazer
                </Button>
              </div>
            </div>
          </div>
          
          {match.created_at && (
            <div className="mt-3 pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
              <span>Conectados em {formatDateTime(match.created_at)}</span>
              <span className="text-emerald-400 font-bold">Acesso Total ao Perfil Liberado</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const LikeCard = ({ like, type }) => {
    const otherUser = type === 'sent' ? (like.receiver || like.user) : (like.sender || like.user);
    if (!otherUser) return null;
    const isSuperLike = like.like_type === 'superlike' || like.like_type === 'super_like';

    return (
      <Card className={`luxury-glass-card rounded-3xl border shadow-md ${
        isSuperLike ? 'border-amber-500/60 bg-amber-950/20' : 'border-border/80'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className={`w-14 h-14 ring-2 ${isSuperLike ? 'ring-amber-400 shadow-lg' : 'ring-purple-500/20'}`}>
              <AvatarImage 
                src={otherUser.profile_photo_url || generateAvatarUrl(otherUser.name || 'Usuário')} 
                alt={otherUser.name || 'Usuário'} 
              />
              <AvatarFallback className="bg-purple-900 text-purple-100 font-bold">
                {getUserInitials(otherUser)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-foreground truncate">{otherUser.name || 'Usuário Proximous'}</h4>
                  {isSuperLike && (
                    <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-2 py-0.5 rounded-full">
                      ⭐ SUPER LIKE
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {isSuperLike && (
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  )}
                  {like.like_type === 'icebreaker' && (
                    <Zap className="w-4 h-4 text-purple-400" />
                  )}
                  {like.like_type === 'compliment' && (
                    <Gift className="w-4 h-4 text-pink-400" />
                  )}
                  {!isSuperLike && <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />}
                </div>
              </div>

              
              <p className="text-xs text-muted-foreground font-medium">
                {otherUser.age ? `${otherUser.age} anos` : ''}
                {otherUser.distance && ` • ${formatDistance(otherUser.distance)}`}
              </p>
              
              {like.message && (
                <p className="text-xs bg-purple-500/10 p-2.5 rounded-xl text-purple-300 italic border border-purple-500/20">
                  "{like.message}"
                </p>
              )}
              
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                <span>{formatDateTime(like.created_at)}</span>
                <span className="flex items-center gap-1 text-purple-400 font-semibold">
                  <Lock className="w-3 h-3" /> Perfil privado até o match
                </span>
              </div>

              {type === 'received' && (
                <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2 mt-2">
                  <Button
                    onClick={() => handleLikeBack(otherUser.id)}
                    size="sm"
                    className="proximous-button-primary text-xs rounded-xl h-9 px-4 w-full flex items-center justify-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    Curtir de Volta (Dar Match 💜)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const matchUserPhotos = selectedMatchUser?.photos && selectedMatchUser.photos.length > 0
    ? selectedMatchUser.photos
    : [selectedMatchUser?.profile_photo_url].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight luxury-gradient-text">
            Seus Matches & Conexões
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Conexões ativas e perfis completos liberados exclusivamente para vocês.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="matches">
            Matches ({matches.length})
          </TabsTrigger>
          <TabsTrigger value="received">
            Recebidos ({receivedLikes.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Enviados ({sentLikes.length})
          </TabsTrigger>
        </TabsList>


        <TabsContent value="matches">
          {matches.length === 0 ? (
            <Card className="text-center p-10 luxury-glass-card rounded-3xl border border-border/80 shadow-xl space-y-4">
              <Heart className="h-12 w-12 text-pink-400 mx-auto" />
              <h3 className="font-extrabold text-foreground text-lg">Nenhum match ainda</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Continue curtindo perfis no Discover para desbloquear conexões reais!
              </p>
              <Button onClick={() => navigate('/discover')} className="proximous-button-primary rounded-xl text-xs">
                Ir para o Discover
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map(m => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received">
          {receivedLikes.length === 0 ? (
            <Card className="text-center p-10 luxury-glass-card rounded-3xl border border-border/80">
              <p className="text-xs text-muted-foreground font-semibold">Nenhuma curtida recebida recentemente.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receivedLikes.map(like => (
                <LikeCard key={like.id} like={like} type="received" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {sentLikes.length === 0 ? (
            <Card className="text-center p-10 luxury-glass-card rounded-3xl border border-border/80">
              <p className="text-xs text-muted-foreground font-semibold">Você ainda não enviou curtidas.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sentLikes.map(like => (
                <LikeCard key={like.id} like={like} type="sent" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* FULL MATCH PROFILE MODAL */}
      {selectedMatchUser && (
        <div className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="luxury-glass-card rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-border/80">
            <button
              onClick={() => setSelectedMatchUser(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 text-center text-xs font-black flex items-center justify-center gap-1.5 shadow-md">
              <Unlock className="w-4 h-4" />
              Perfil Completo Desbloqueado (Match com {selectedMatchUser.name}!)
            </div>

            <div className="relative h-72 w-full bg-black">
              <img
                src={(matchUserPhotos.length > 0 && matchUserPhotos[modalPhotoIndex % matchUserPhotos.length]) || selectedMatchUser.profile_photo_url || generateAvatarUrl(selectedMatchUser.name || 'Usuário')}
                alt={selectedMatchUser.name || 'Usuário'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

              {matchUserPhotos.length > 1 && (
                <div className="absolute top-3 left-4 right-4 z-20 flex gap-1">
                  {matchUserPhotos.map((_, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => setModalPhotoIndex(pIdx)}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        pIdx === (modalPhotoIndex % matchUserPhotos.length) ? 'bg-white shadow-md' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-2xl font-black">{selectedMatchUser.name}, {selectedMatchUser.age}</h2>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  {selectedMatchUser.location_city || 'São Paulo'}
                  {selectedMatchUser.distance && ` • ${formatDistance(selectedMatchUser.distance)}`}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5 text-left">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Biografia Completa</h4>
                <p className="text-foreground text-sm leading-relaxed bg-card/70 p-3.5 rounded-2xl border border-border/60">
                  {selectedMatchUser.bio || 'Sem biografia informada.'}
                </p>
              </div>

              {matchUserPhotos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Galeria Completa ({matchUserPhotos.length} fotos)
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {matchUserPhotos.map((pUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setModalPhotoIndex(idx)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer ${
                          idx === (modalPhotoIndex % matchUserPhotos.length) ? 'border-purple-500 scale-105 shadow-md' : 'border-border'
                        }`}
                      >
                        <img src={pUrl} alt="Match photo" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMatchUser.interests && selectedMatchUser.interests.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Interesses</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMatchUser.interests.map((interest, idx) => (
                      <Badge key={idx} className="bg-purple-500/10 text-purple-400 text-xs px-2.5 py-1 rounded-xl border border-purple-500/20">
                        ✨ {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={() => navigate(`/messages/${selectedMatchUser.id}`)}
                  className="w-full proximous-button-primary rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir Conversa Privada
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;

