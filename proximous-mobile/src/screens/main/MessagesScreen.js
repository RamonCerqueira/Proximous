import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { messagesAPI } from '../../config/api';
import { formatDateTime, generateAvatarUrl } from '../../utils/helpers';
import { theme } from '../../styles/colors';
import EmptyState from '../../components/common/EmptyState';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const openChat = (item) => {
    navigation.navigate('Chat', {
      conversationId: item.id || item.user_id,
      userName: item.user_name || item.name,
      userAvatar: item.user_avatar || item.avatar_url || generateAvatarUrl(item.user_name || item.name || 'User'),
    });
  };

  const filteredConversations = conversations.filter(c => {
    const name = c.user_name || c.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderConversationItem = ({ item }) => {
    const name = item.user_name || item.name || 'Usuário';
    const avatar = item.user_avatar || item.avatar_url || generateAvatarUrl(name);
    const lastMsg = item.last_message || 'Nova conversa iniciada';
    const unread = item.unread_count || 0;

    return (
      <TouchableOpacity
        style={styles.convItem}
        onPress={() => openChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          {item.is_online && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.convContent}>
          <View style={styles.convHeader}>
            <Text style={styles.convName} numberOfLines={1}>{name}</Text>
            {item.last_message_time && (
              <Text style={styles.convTime}>{formatDateTime(item.last_message_time)}</Text>
            )}
          </View>

          <View style={styles.convFooter}>
            <Text
              style={[styles.convLastMsg, unread > 0 && styles.convLastMsgUnread]}
              numberOfLines={1}
            >
              {lastMsg}
            </Text>

            {unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensagens</Text>
        <TouchableOpacity
          style={styles.newChatBtn}
          onPress={() => navigation.navigate('Discover')}
          activeOpacity={0.7}
        >
          <Ionicons name="people-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversas..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => String(item.id || item.user_id)}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="Nenhuma mensagem ainda"
            description="Dê um like ou envie um Icebreaker em publicações para iniciar conversas."
            actionTitle="Ver Publicações"
            onActionPress={() => navigation.navigate('Home')}
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  newChatBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 42,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  listContent: {
    paddingVertical: theme.spacing.xs,
    paddingBottom: 40,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primarySoft,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  convContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  convHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  convName: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  convTime: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textMuted,
  },
  convFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  convLastMsg: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  convLastMsgUnread: {
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.bold,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
});

export default MessagesScreen;
