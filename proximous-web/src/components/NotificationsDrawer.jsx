import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  X, 
  Heart, 
  Sparkles, 
  MessageCircle, 
  Award, 
  Coffee, 
  CheckCheck,
  CheckCircle2
} from 'lucide-react';
import { notificationsAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const NotificationsDrawer = ({ isOpen, onClose, onUnreadChange }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getNotifications();
      const list = res.data.notifications || [];
      const unreadCount = res.data.unread_count || 0;
      setNotifications(list);
      if (onUnreadChange) onUnreadChange(unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (onUnreadChange) onUnreadChange(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationsAPI.markRead(notif.id);
      } catch (err) {
        console.warn('Sync read notice:', err);
      }
    }

    onClose();

    if (notif.type === 'match' || notif.type === 'like') {
      navigate('/matches');
    } else if (notif.type === 'message') {
      navigate('/messages');
    } else if (notif.type === 'activity') {
      navigate('/discover');
    } else {
      navigate('/profile');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="w-full max-w-sm h-full luxury-glass-card border-l border-border/80 p-5 shadow-2xl flex flex-col justify-between text-foreground"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-foreground">Central de Notificações</h3>
                <p className="text-[10px] text-muted-foreground font-medium">Suas interações e alertas em tempo real</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-none">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground font-bold">
                Carregando notificações...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-purple-400 mx-auto opacity-60" />
                <p className="text-xs font-black text-foreground">Nenhuma notificação por enquanto</p>
                <p className="text-[11px] text-muted-foreground">Você receberá alertas de novos matches, curtidas e mensagens aqui.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      !notif.is_read
                        ? 'bg-purple-500/10 border-purple-500/40 shadow-sm'
                        : 'bg-card/40 border-border/60 hover:bg-accent/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      {notif.type === 'match' ? <Heart className="h-5 w-5 fill-white" /> :
                       notif.type === 'like' ? <Sparkles className="h-5 w-5" /> :
                       notif.type === 'message' ? <MessageCircle className="h-5 w-5" /> :
                       notif.type === 'empathy' ? <Award className="h-5 w-5" /> : <Coffee className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-xs text-foreground truncate">{notif.title}</h4>
                        <span className="text-[9px] text-muted-foreground font-medium flex-shrink-0">{notif.created_at}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border/60">
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              className="w-full rounded-2xl text-xs font-bold border-border/80 text-foreground hover:bg-accent flex items-center justify-center gap-1.5 py-2.5"
            >
              <CheckCheck className="h-4 w-4 text-purple-400" />
              <span>Marcar todas como lidas</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationsDrawer;
