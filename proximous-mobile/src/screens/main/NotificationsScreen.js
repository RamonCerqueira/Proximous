import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { notificationsAPI } from '../../config/api';
import { formatDateTime } from '../../utils/helpers';
import { theme } from '../../styles/colors';
import EmptyState from '../../components/common/EmptyState';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsAPI.getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Erro ao marcar notificações:', err);
    }
  };

  const handleNotificationPress = async (item) => {
    if (!item.is_read) {
      try {
        await notificationsAPI.markSingleRead(item.id);
        setNotifications(prev =>
          prev.map(n => (n.id === item.id ? { ...n, is_read: true } : n))
        );
      } catch (err) {
        console.error('Erro ao marcar lida:', err);
      }
    }

    if (item.type === 'match' || item.type === 'like') {
      navigation.navigate('Matches');
    } else if (item.type === 'message') {
      navigation.navigate('Messages');
    } else {
      navigation.navigate('Home');
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'like':
        return { name: 'heart', color: theme.colors.heart, bg: 'rgba(236, 72, 153, 0.12)' };
      case 'match':
        return { name: 'sparkles', color: theme.colors.gold, bg: theme.colors.secondarySoft };
      case 'message':
        return { name: 'chatbubble', color: theme.colors.primary, bg: theme.colors.primarySoft };
      default:
        return { name: 'notifications', color: theme.colors.info, bg: theme.colors.infoLight };
    }
  };

  const filteredList = notifications.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const renderItem = ({ item }) => {
    const iconConfig = getNotifIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.is_read && styles.notifCardUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
          <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
        </View>

        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, !item.is_read && styles.notifTitleUnread]}>
            {item.title || 'Notificação Proximous'}
          </Text>
          <Text style={styles.notifMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notifTime}>{formatDateTime(item.created_at)}</Text>
        </View>

        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <TouchableOpacity onPress={handleMarkAllRead} style={styles.readAllBtn}>
          <Ionicons name="checkmark-done" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'Todas' },
          { key: 'match', label: 'Matches' },
          { key: 'like', label: 'Curtidas' },
          { key: 'message', label: 'Mensagens' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterChip, filterType === tab.key && styles.filterChipActive]}
            onPress={() => setFilterType(tab.key)}
          >
            <Text style={[styles.filterChipText, filterType === tab.key && styles.filterChipTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="Tudo limpo por aqui!"
            description="Você não possui notificações pendentes no momento."
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  readAllBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  notifCardUnread: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  notifTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  notifTitleUnread: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  notifMessage: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
});

export default NotificationsScreen;
