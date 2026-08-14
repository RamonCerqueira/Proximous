import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { matchingAPI } from '../../config/api';
import { formatUserAge, formatDistance, formatDateTime } from '../../utils/helpers';
import { theme } from '../../styles/colors';

const MatchesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [sentLikes, setSentLikes] = useState([]);
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [matchesRes, sentRes, receivedRes] = await Promise.all([
        matchingAPI.getMatches({ limit: 50 }),
        matchingAPI.getSentLikes({ limit: 50 }),
        matchingAPI.getReceivedLikes({ limit: 50 })
      ]);

      setMatches(matchesRes.data.matches || []);
      setSentLikes(sentRes.data.likes || []);
      setReceivedLikes(receivedRes.data.likes || []);
    } catch (error) {
      console.error('Error fetching matches data:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleUnmatch = async (matchId) => {
    Alert.alert(
      'Desfazer match',
      'Tem certeza que deseja desfazer este match? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desfazer',
          style: 'destructive',
          onPress: async () => {
            try {
              await matchingAPI.unmatch(matchId);
              setMatches(prev => prev.filter(match => match.id !== matchId));
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível desfazer o match.');
            }
          }
        }
      ]
    );
  };

  const handleStartConversation = (match) => {
    navigation.navigate('Messages', {
      screen: 'Conversation',
      params: { userId: match.user.id, userName: match.user.name }
    });
  };

  const TabButton = ({ title, isActive, onPress, count }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {title}
      </Text>
      {count > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const MatchCard = ({ match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => handleStartConversation(match)}
    >
      <View style={styles.matchPhotoContainer}>
        <View style={styles.matchPhoto}>
          <Ionicons name="person" size={40} color={theme.colors.textSecondary} />
        </View>
        {match.is_new && <View style={styles.newMatchBadge} />}
      </View>
      
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>
          {match.user.name}, {formatUserAge(match.user.birth_date)}
        </Text>
        <Text style={styles.matchDistance}>
          {formatDistance(match.user.distance || 0)} • {formatDateTime(match.created_at)}
        </Text>
        {match.last_message && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {match.last_message}
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.matchActions}
        onPress={() => handleUnmatch(match.id)}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const LikeCard = ({ like, type }) => (
    <TouchableOpacity style={styles.likeCard}>
      <View style={styles.likePhotoContainer}>
        <View style={styles.likePhoto}>
          <Ionicons name="person" size={32} color={theme.colors.textSecondary} />
        </View>
        {like.like_type === 'super_like' && (
          <View style={styles.superLikeBadge}>
            <Ionicons name="star" size={12} color={theme.colors.warning} />
          </View>
        )}
      </View>
      
      <Text style={styles.likeName} numberOfLines={1}>
        {like.user.name}
      </Text>
      <Text style={styles.likeAge}>
        {formatUserAge(like.user.birth_date)}
      </Text>
      <Text style={styles.likeTime}>
        {formatDateTime(like.created_at)}
      </Text>
    </TouchableOpacity>
  );

  const EmptyState = ({ type }) => {
    const messages = {
      matches: {
        icon: 'heart-outline',
        title: 'Nenhum match ainda',
        subtitle: 'Continue descobrindo pessoas para encontrar seus matches!'
      },
      sent: {
        icon: 'paper-plane-outline',
        title: 'Nenhuma curtida enviada',
        subtitle: 'Comece a curtir pessoas na aba Descobrir!'
      },
      received: {
        icon: 'heart-outline',
        title: 'Nenhuma curtida recebida',
        subtitle: 'Complete seu perfil para receber mais curtidas!'
      }
    };

    const message = messages[type];

    return (
      <View style={styles.emptyState}>
        <Ionicons name={message.icon} size={80} color={theme.colors.textSecondary} />
        <Text style={styles.emptyStateTitle}>{message.title}</Text>
        <Text style={styles.emptyStateSubtitle}>{message.subtitle}</Text>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'matches':
        return matches.length > 0 ? (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <MatchCard match={item} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.scrollContent}
          >
            <EmptyState type="matches" />
          </ScrollView>
        );

      case 'sent':
        return sentLikes.length > 0 ? (
          <FlatList
            data={sentLikes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <LikeCard like={item} type="sent" />}
            numColumns={2}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
          />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.scrollContent}
          >
            <EmptyState type="sent" />
          </ScrollView>
        );

      case 'received':
        return receivedLikes.length > 0 ? (
          <FlatList
            data={receivedLikes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <LikeCard like={item} type="received" />}
            numColumns={2}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
          />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.scrollContent}
          >
            <EmptyState type="received" />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          title="Matches"
          isActive={activeTab === 'matches'}
          onPress={() => setActiveTab('matches')}
          count={matches.length}
        />
        <TabButton
          title="Enviadas"
          isActive={activeTab === 'sent'}
          onPress={() => setActiveTab('sent')}
          count={sentLikes.length}
        />
        <TabButton
          title="Recebidas"
          isActive={activeTab === 'received'}
          onPress={() => setActiveTab('received')}
          count={receivedLikes.length}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
  },
  
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  
  tabButtonActive: {
    borderBottomColor: theme.colors.primary,
  },
  
  tabButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  
  tabButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  
  tabBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  
  tabBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  
  content: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  listContent: {
    paddingVertical: theme.spacing.md,
  },
  
  gridContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.sm,
  },
  
  matchPhotoContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  newMatchBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  
  matchInfo: {
    flex: 1,
  },
  
  matchName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  
  matchDistance: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  lastMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
  
  matchActions: {
    padding: theme.spacing.sm,
  },
  
  likeCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    margin: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.sm,
  },
  
  likePhotoContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  
  likePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  superLikeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  
  likeName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  likeAge: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  likeTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  
  emptyStateTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  
  emptyStateSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.lineHeight.relaxed,
  },
});

export default MatchesScreen;

