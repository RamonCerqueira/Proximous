import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, 
  MapPin, 
  Users, 
  MessageCircle, 
  Star, 
  Zap, 
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import NearbyMap from '@/components/NearbyMap';
import { usersAPI, matchingAPI, messagesAPI } from '@/lib/api';

const Home = () => {
  const [stats, setStats] = useState({
    nearbyUsers: 0,
    todayMatches: 0,
    unreadMessages: 0,
    weeklyConnections: 0
  });
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [userStatsRes, matchStatsRes, matchesRes, unreadRes] = await Promise.allSettled([
        usersAPI.getStats(),
        matchingAPI.getStats(),
        matchingAPI.getMatches({ limit: 4 }),
        messagesAPI.getUnreadCount()
      ]);

      const uStats = userStatsRes.status === 'fulfilled' ? userStatsRes.value.data : {};
      const mStats = matchStatsRes.status === 'fulfilled' ? matchStatsRes.value.data : {};
      const mMatches = matchesRes.status === 'fulfilled' ? (matchesRes.value.data.matches || []) : [];
      const unread = unreadRes.status === 'fulfilled' ? (unreadRes.value.data.unread_count || 0) : 0;

      setStats({
        nearbyUsers: uStats.nearby_users_count ?? 0,
        todayMatches: mStats.today_matches_count ?? mMatches.length,
        unreadMessages: unread,
        weeklyConnections: mStats.weekly_connections_count ?? mMatches.length
      });

      setRecentMatches(mMatches.slice(0, 4).map((m, idx) => ({
        id: m.id || idx + 1,
        name: m.user2?.name || m.user_name || 'Usuário Proximous',
        age: m.user2?.age || 25,
        profile_photo_url: m.user2?.profile_photo_url || m.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        distance: m.distance || 1.2,
        matched_at: m.created_at ? 'Recente' : 'Hoje',
        is_online: true,
        bio: m.user2?.bio || 'Conexão ativa no Proximous'
      })));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, gradient, delay }) => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative group"
    >
      <Card className="luxury-glass-card border border-border/60 hover:border-purple-500/50 rounded-3xl overflow-hidden transition-all duration-300">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground truncate">{title}</p>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-0.5">{value}</p>
              {subtitle && <p className="text-[11px] text-muted-foreground/80 font-medium truncate mt-0.5">{subtitle}</p>}
            </div>
            <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${gradient}`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="space-y-2 text-center max-w-md mx-auto">
          <Skeleton className="h-8 w-3/4 mx-auto rounded-xl" />
          <Skeleton className="h-4 w-1/2 mx-auto rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-6 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
      
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl luxury-glass-card p-6 sm:p-8 border border-border/80 shadow-2xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Experiência Social Proximous</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Bem-vindo ao <span className="luxury-gradient-text">Proximous</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Conectando pessoas introvertidas e autênticas no seu raio de proximidade com toda a privacidade e elegância.
          </p>
        </div>

        <div className="relative z-10 flex gap-3 flex-wrap justify-center">
          <Link to="/discover">
            <Button className="proximous-button-primary rounded-2xl flex items-center gap-2">
              <Zap className="w-4 h-4 fill-white" />
              <span>Explorar Pessoas</span>
            </Button>
          </Link>
        </div>

        {/* Ambient Glow background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Metrics Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          icon={Users}
          title="Próximas de você"
          value={stats.nearbyUsers}
          subtitle="Em um raio de 5km"
          gradient="bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/20"
          delay={0.1}
        />
        <StatCard
          icon={Heart}
          title="Matches Hoje"
          value={stats.todayMatches}
          subtitle="Conexões mútuas"
          gradient="bg-gradient-to-tr from-pink-500 to-rose-600 shadow-pink-500/20"
          delay={0.2}
        />
        <StatCard
          icon={MessageCircle}
          title="Mensagens"
          value={stats.unreadMessages}
          subtitle="Conversas não lidas"
          gradient="bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/20"
          delay={0.3}
        />
        <StatCard
          icon={TrendingUp}
          title="Conexões Semanais"
          value={stats.weeklyConnections}
          subtitle="Últimos 7 dias"
          gradient="bg-gradient-to-tr from-amber-500 to-orange-600 shadow-amber-500/20"
          delay={0.4}
        />
      </div>

      {/* Quick Launchers - Interactive Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Link to="/discover" className="group">
          <Card className="luxury-glass-card border border-purple-500/20 hover:border-purple-500/50 rounded-3xl p-5 shadow-lg group-hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-500">
                <Compass className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-extrabold text-lg text-foreground">Descobrir Perfis</h3>
            <p className="text-xs text-muted-foreground mt-1">Conheça pessoas afins no mapa e por interesses comuns</p>
          </Card>
        </Link>

        <Link to="/matches" className="group">
          <Card className="luxury-glass-card border border-pink-500/20 hover:border-pink-500/50 rounded-3xl p-5 shadow-lg group-hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/15 flex items-center justify-center text-pink-500">
                <Heart className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-extrabold text-lg text-foreground">Meus Matches</h3>
            <p className="text-xs text-muted-foreground mt-1">Veja quem combinou com você e inicie o papo</p>
          </Card>
        </Link>

        <Link to="/messages" className="group">
          <Card className="luxury-glass-card border border-emerald-500/20 hover:border-emerald-500/50 rounded-3xl p-5 shadow-lg group-hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-extrabold text-lg text-foreground">Conversas Ativas</h3>
            <p className="text-xs text-muted-foreground mt-1">Troque mensagens com privacidade e recursos interativos</p>
          </Card>
        </Link>
      </motion.div>

      {/* Interactive Proximity Map */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              Pessoas Próximas no Mapa
            </h2>
            <p className="text-xs text-muted-foreground">Visualização geográfica dinâmica em tempo real</p>
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden border border-border/80 shadow-2xl luxury-glass-card">
          <NearbyMap radius={15} />
        </div>
      </motion.div>

      {/* Recent Matches Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        <Card className="luxury-glass-card border border-border/80 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                Matches Recentes
              </h2>
              <p className="text-xs text-muted-foreground">Suas últimas conexões recíprocas no Proximous</p>
            </div>
            <Link to="/matches">
              <Button variant="outline" size="sm" className="rounded-xl border-purple-500/30 text-purple-400 hover:bg-purple-500/10 font-bold text-xs">
                Ver Todos
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.65 + index * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-card/70 border border-border/60 hover:border-purple-500/40 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="relative">
                    <img
                      src={match.profile_photo_url}
                      alt={match.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500 transition-all"
                    />
                    {match.is_online && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background shadow-sm" />
                    )}
                  </div>
                  <Badge className="bg-pink-500/15 text-pink-400 border-0 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />
                    Match
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-foreground text-sm group-hover:text-purple-400 transition-colors">
                    {match.name}, {match.age}
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate font-medium">
                    {match.bio}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-semibold pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1 text-purple-400">
                      <MapPin className="h-3 w-3" />
                      {match.distance} km
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {match.matched_at}
                    </span>
                  </div>
                </div>

                <Link to="/messages" className="mt-3">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs py-2 font-bold shadow-md">
                    Conversar 💬
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {recentMatches.length === 0 && (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400">
                <Heart className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Nenhum match ainda. Comece a explorar perfis!</p>
              <Link to="/discover">
                <Button className="proximous-button-primary rounded-xl text-xs">
                  <Zap className="h-4 w-4 mr-2" />
                  Descobrir Pessoas
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Introvert Social Tip */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.75 }}
      >
        <Card className="luxury-glass-card border border-amber-500/30 rounded-3xl p-6 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500 flex-shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-extrabold text-foreground text-base">💡 Dica Proximous para Pessoas Introvertidas</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O Proximous valoriza a autenticidade e o conforto. Você não precisa forçar um ritmo acelerado — compartilhe seus interesses genuínos e deixe as conexões acontecerem naturalmente.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Home;


