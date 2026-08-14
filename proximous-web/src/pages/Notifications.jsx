import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Heart, 
  Sparkles, 
  MessageCircle, 
  Award, 
  Coffee, 
  CheckCheck, 
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { notificationsAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Error loading notifications page:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-2">
        {/* Sticky Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-2xl bg-card border border-border/80 hover:bg-accent text-foreground transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black luxury-gradient-text">Notificações</h1>
              <p className="text-xs text-muted-foreground font-medium">Acompanhe novos matches, curtidas e novidades</p>
            </div>
          </div>

          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            className="rounded-2xl text-xs font-bold border-border/80 text-foreground hover:bg-accent flex items-center gap-1.5 px-4 py-2"
          >
            <CheckCheck className="h-4 w-4 text-purple-400" />
            <span className="hidden sm:inline">Marcar Lidas</span>
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'match', label: 'Matches 🔓' },
            { id: 'like', label: 'Curtidas ❤️' },
            { id: 'message', label: 'Mensagens 💬' },
            { id: 'empathy', label: 'Empatia 💜' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                filterType === cat.id
                  ? 'proximous-button-primary text-white shadow-md'
                  : 'luxury-glass text-muted-foreground hover:text-foreground border border-border/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main List */}
        {loading ? (
          <div className="p-12 text-center luxury-glass-card rounded-3xl border border-border/80">
            <p className="text-xs font-bold text-muted-foreground">Carregando suas notificações...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="luxury-glass-card border border-border/80 p-8 text-center rounded-3xl space-y-3">
            <CheckCircle2 className="h-12 w-12 text-purple-400 mx-auto opacity-50" />
            <h3 className="font-black text-base text-foreground">Nenhuma notificação nesta categoria</h3>
            <p className="text-xs text-muted-foreground">Sua caixa de notificações está em dia!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`luxury-glass-card border transition-all rounded-3xl overflow-hidden ${
                  !notif.is_read ? 'border-purple-500/40 shadow-md bg-purple-500/5' : 'border-border/80'
                }`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                      {notif.type === 'match' ? <Heart className="h-6 w-6 fill-white" /> :
                       notif.type === 'like' ? <Sparkles className="h-6 w-6" /> :
                       notif.type === 'message' ? <MessageCircle className="h-6 w-6" /> :
                       notif.type === 'empathy' ? <Award className="h-6 w-6" /> : <Coffee className="h-6 w-6" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-foreground truncate">{notif.title}</h4>
                        <span className="text-[10px] font-bold text-muted-foreground">{notif.created_at}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
