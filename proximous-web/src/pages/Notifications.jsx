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
import SponsoredAdSlot from '../components/SponsoredAdSlot';

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
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-extrabold text-foreground">Notificações</h1>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-purple-400 hover:text-purple-300"
          >
            Marcar todas como lidas
          </button>
        </div>

        {/* 📢 SPONSORED AD BANNER SLOT AT NOTIFICATIONS */}
        <SponsoredAdSlot slotId="notifications_top" type="banner" />

        {/* Notifications list */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-2">
              <Bell className="h-8 w-8 mx-auto text-purple-400" />
              <p className="font-extrabold text-foreground text-sm">Nenhuma notificação por enquanto</p>
              <p className="text-xs">Fique atento, novidades aparecerão aqui!</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all ${
                  notif.is_read ? 'bg-card/40 border-border/40' : 'bg-purple-500/10 border-purple-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{notif.title || 'Notificação Proximous'}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
