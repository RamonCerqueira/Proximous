import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { momentsAPI, usersAPI, notificationsAPI } from '../../config/api';
import { theme } from '../../styles/colors';
import { generateAvatarUrl } from '../../utils/helpers';
import MomentCard from '../../components/feed/MomentCard';
import CreateMomentModal from '../../components/feed/CreateMomentModal';
import EmptyState from '../../components/common/EmptyState';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [stats, setStats] = useState({ matches_count: 0, received_likes_count: 0 });

  const fetchHomeData = useCallback(async () => {
    try {
      const [momentsRes, notifsRes, statsRes] = await Promise.allSettled([
        momentsAPI.getMoments({ page: 1, per_page: 20 }),
        notificationsAPI.getNotifications(),
        usersAPI.getStats(),
      ]);

      if (momentsRes.status === 'fulfilled' && momentsRes.value.data?.moments) {
        setMoments(momentsRes.value.data.moments);
      }

      if (notifsRes.status === 'fulfilled' && notifsRes.value.data) {
        setUnreadNotifications(notifsRes.value.data.unread_count || 0);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.stats) {
        setStats(statsRes.value.data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar feed da Home:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  const handleMomentCreated = (newMoment) => {
    if (newMoment) {
      setMoments(prev => [newMoment, ...prev]);
    } else {
      fetchHomeData();
    }
  };

  const handleMomentDeleted = (momentId) => {
    setMoments(prev => prev.filter(m => m.id !== momentId));
  };

  const userAvatar = user?.avatar_url || generateAvatarUrl(user?.name || 'User');

  const renderHeader = () => (
    <View style={styles.feedHeaderContainer}>
      {/* Quick Discovery & Now Mode Highlights Banner */}
      <View style={styles.quickBar}>
        <TouchableOpacity
          style={styles.nowCard}
          onPress={() => navigation.navigate('Now')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={theme.colors.gradientGold}
            style={styles.nowGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.nowIconBadge}>
              <Ionicons name="flash" size={18} color={theme.colors.gold} />
            </View>
            <View style={styles.nowMeta}>
              <Text style={styles.nowTitle}>Modo AGORA</Text>
              <Text style={styles.nowSubtitle}>Disponível para um café ou conversa?</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <View style={styles.feedTitleRow}>
        <Text style={styles.feedTitle}>Momentos Próximos</Text>
        <TouchableOpacity
          style={styles.newPostPill}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color={theme.colors.primary} />
          <Text style={styles.newPostPillText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Navbar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Image source={{ uri: userAvatar }} style={styles.topAvatar} />
        </TouchableOpacity>

        <View style={styles.logoBrand}>
          <Text style={styles.logoText}>Proximous</Text>
        </View>

        <TouchableOpacity
          style={styles.notifButton}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.colors.textPrimary} />
          {unreadNotifications > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Feed List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Buscando publicações da sua região...</Text>
        </View>
      ) : (
        <FlatList
          data={moments}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MomentCard
              moment={item}
              currentUserId={user?.id}
              onIcebreakerSent={() => navigation.navigate('Messages')}
              onDelete={handleMomentDeleted}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              icon="sparkles-outline"
              title="Seja o primeiro a publicar!"
              description="Compartilhe uma foto, um pensamento ou convite com pessoas da sua cidade."
              actionTitle="Criar Primeiro Momento"
              onActionPress={() => setShowCreateModal(true)}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      {/* Floating Action Button for Create Moment */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={theme.colors.gradientSocial}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color={theme.colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Create Moment Modal */}
      <CreateMomentModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onMomentCreated={handleMomentCreated}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  topAvatar: {
    width: '100%',
    height: '100%',
  },
  logoBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  notifButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.danger,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: 80,
  },
  feedHeaderContainer: {
    marginBottom: theme.spacing.md,
  },
  quickBar: {
    marginBottom: theme.spacing.md,
  },
  nowCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadow.sm,
  },
  nowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  nowIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  nowMeta: {
    flex: 1,
  },
  nowTitle: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  nowSubtitle: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
  },
  feedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  feedTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  newPostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  newPostPillText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
    marginLeft: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    borderRadius: 28,
    ...theme.shadow.lg,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
