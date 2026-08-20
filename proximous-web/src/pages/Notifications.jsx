import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Heart, 
  Sparkles, 
  MessageCircle, 
  Award, 
  Coffee, 
  CheckCheck, 
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Radio
} from 'lucide-react';
import { notificationsAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import SponsoredAdSlot from '../components/SponsoredAdSlot';

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'match', label: 'Matches' },
  { id: 'like', label: 'Curtidas' },
  { id: 'message', label: 'Mensagens' },
  { id: 'empathy', label: 'Empatia' }
];

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

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationsAPI.markRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (err) {
        console.error('Error marking single read:', err);
      }
    }

    // Contextual navigation based on notification type
    if (notif.type === 'match' || notif.type === 'super_match') {
      navigate('/matches');
    } else if (notif.type === 'message') {
      navigate('/messages');
    } else if (notif.type === 'empathy' || notif.type === 'achievement') {
      navigate('/achievements');
    } else if (notif.actor?.id) {
      navigate(`/profile/${notif.actor.id}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'match':
      case 'super_match':
        return <Sparkles className="h-5 w-5 text-pink-400" />;
      case 'like':
      case 'superlike':
      case 'compliment':
        return <Heart className="h-5 w-5 text-rose-400 fill-rose-400" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-purple-400" />;
      case 'empathy':
      case 'achievement':
        return <Award className="h-5 w-5 text-amber-400" />;
      default:
        return <Bell className="h-5 w-5 text-purple-400" />;
    }
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(n => {
        if (filterType === 'match') return n.type === 'match' || n.type === 'super_match';
        if (filterType === 'like') return n.type === 'like' || n.type === 'superlike' || n.type === 'compliment';
        if (filterType === 'message') return n.type === 'message';
        if (filterType === 'empathy') return n.type === 'empathy' || n.type === 'achievement';
        return n.type === filterType;
      });

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-2xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-extrabold text-foreground">Notificações</h1>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filterType === f.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sponsored Ad Banner */}
        <SponsoredAdSlot slotId="notifications_top" type="banner" />

        {/* Notifications list */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Carregando notificações...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-3 bg-card/60 border border-border rounded-3xl">
              <Bell className="h-10 w-10 mx-auto text-purple-400 opacity-60" />
              <p className="font-extrabold text-foreground text-sm">Nenhuma notificação encontrada</p>
              <p className="text-xs">Fique atento, novas conexões aparecerão aqui!</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                  notif.is_read
                    ? 'bg-card/40 border-border/40 hover:bg-card/80'
                    : 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-2xl bg-card border border-border flex-shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-foreground truncate">
                        {notif.title || 'Notificação Proximous'}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground/80 mt-1 block">
                      {notif.created_at ? new Date(notif.created_at).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
