import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { matchingAPI } from '../../config/api';
import { formatDateTime, formatDistance, generateAvatarUrl } from '../../utils/helpers';
import { theme } from '../../styles/colors';
import EmptyState from '../../components/common/EmptyState';

const MatchesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('matches'); // matches, received, sent
  const [matches, setMatches] = useState([]);
  const [sentLikes, setSentLikes] = useState([]);
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatchesData = useCallback(async () => {
    try {
      const [matchesRes, sentRes, receivedRes] = await Promise.allSettled([
        matchingAPI.getMatches({ limit: 50 }),
        matchingAPI.getSentLikes({ limit: 50 }),
        matchingAPI.getReceivedLikes({ limit: 50 }),
      ]);

      if (matchesRes.status === 'fulfilled' && matchesRes.value.data) {
        setMatches(matchesRes.value.data.matches || []);
      }
      if (sentRes.status === 'fulfilled' && sentRes.value.data) {
        setSentLikes(sentRes.value.data.likes || []);
      }
      if (receivedRes.status === 'fulfilled' && receivedRes.value.data) {
        setReceivedLikes(receivedRes.value.data.likes || []);
      }
    } catch (error) {
      console.error('Erro ao buscar matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatchesData();
  }, [fetchMatchesData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatchesData();
  };

  const handleUnmatch = (matchId, userName) => {
    Alert.alert(
      'Desfazer Conexão',
      `Deseja desfazer o match com ${userName}? Vocês não poderão mais trocar mensagens.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desfazer',
          style: 'destructive',
          onPress: async () => {
            try {
              await matchingAPI.unmatch(matchId);
              setMatches(prev => prev.filter(m => m.id !== matchId));
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível desfazer o match.');
            }
          },
        },
      ]
    );
  };

  const handleOpenChat = (targetUser) => {
    navigation.navigate('Messages', {
      screen: 'Chat',
      params: {
        conversationId: targetUser.id,
        userName: targetUser.name,
        userAvatar: targetUser.avatar_url || generateAvatarUrl(targetUser.name),
      },
    });
  };

  const renderMatchItem = ({ item }) => {
    const targetUser = item.user || {};
    const avatar = targetUser.avatar_url || generateAvatarUrl(targetUser.name || 'User');
    const distanceText = targetUser.distance_km != null ? formatDistance(targetUser.distance_km) : 'Por perto';

    return (
      <View style={styles.matchCard}>
        <Image source={{ uri: avatar }} style={styles.matchAvatar} />
        
        <View style={styles.matchMeta}>
          <Text style={styles.matchName}>{targetUser.name}</Text>
          <View style={styles.distanceRow}>
            <Ionicons name="location-sharp" size={12} color={theme.colors.gold} />
            <Text style={styles.distanceText}>{distanceText}</Text>
          </View>
        </View>

        <View style={styles.matchActions}>
          <TouchableOpacity
            style={styles.chatActionBtn}
            onPress={() => handleOpenChat(targetUser)}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble" size={16} color={theme.colors.white} />
            <Text style={styles.chatActionText}>Conversar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.unmatchBtn}
            onPress={() => handleUnmatch(item.id, targetUser.name)}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLikeItem = ({ item }) => {
    const targetUser = item.user || item.target_user || {};
    const avatar = targetUser.avatar_url || generateAvatarUrl(targetUser.name || 'User');

    return (
      <View style={styles.likeCard}>
        <Image source={{ uri: avatar }} style={styles.likeAvatar} />
        <View style={styles.likeMeta}>
          <Text style={styles.likeName}>{targetUser.name}</Text>
          <Text style={styles.likeDate}>{formatDateTime(item.created_at)}</Text>
        </View>
        <Ionicons
          name={item.like_type === 'super_like' ? 'star' : 'heart'}
          size={20}
          color={item.like_type === 'super_like' ? theme.colors.gold : theme.colors.heart}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conexões & Curtidas</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.tabActive]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}>
            Matches ({matches.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>
            Recebidas ({receivedLikes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>
            Enviadas ({sentLikes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={activeTab === 'matches' ? matches : activeTab === 'received' ? receivedLikes : sentLikes}
        keyExtractor={(item) => String(item.id)}
        renderItem={activeTab === 'matches' ? renderMatchItem : renderLikeItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'matches' ? 'heart-dislike-outline' : 'heart-outline'}
            title={activeTab === 'matches' ? 'Nenhum match ainda' : 'Nenhuma curtida encontrada'}
            description={
              activeTab === 'matches'
                ? 'Continue descobrindo pessoas por perto para encontrar novas conexões.'
                : 'Quando alguém curtir seu perfil, as curtidas aparecerão aqui.'
            }
            actionTitle="Ir para Descoberta"
            onActionPress={() => navigation.navigate('Discover')}
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  matchAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primarySoft,
  },
  matchMeta: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  matchName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  distanceText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textSecondary,
    marginLeft: 3,
  },
  matchActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    marginRight: 6,
  },
  chatActionText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginLeft: 4,
  },
  unmatchBtn: {
    padding: 6,
  },
  likeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  likeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  likeMeta: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  likeName: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  likeDate: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});

export default MatchesScreen;
