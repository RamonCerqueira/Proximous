import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/colors';
import { formatDateTime, generateAvatarUrl } from '../../utils/helpers';
import { momentsAPI } from '../../config/api';
import Button from '../common/Button';

const MomentCard = ({ moment, currentUserId, onIcebreakerSent, onDelete }) => {
  const [liked, setLiked] = useState(moment.liked_by_me || false);
  const [likesCount, setLikesCount] = useState(moment.likes_count || 0);
  const [showIcebreakerModal, setShowIcebreakerModal] = useState(false);
  const [icebreakerText, setIcebreakerText] = useState('');
  const [sendingIcebreaker, setSendingIcebreaker] = useState(false);

  const isMyMoment = moment.user_id === currentUserId;

  const handleToggleLike = async () => {
    // Optimistic UI update
    const previousLiked = liked;
    const previousCount = likesCount;

    setLiked(!previousLiked);
    setLikesCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      const response = await momentsAPI.toggleLike(moment.id);
      if (response.data) {
        setLiked(response.data.liked_by_me);
        setLikesCount(response.data.likes_count);
      }
    } catch (error) {
      // Rollback on error
      setLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleSendIcebreaker = async () => {
    if (!icebreakerText.trim()) {
      Alert.alert('Atenção', 'Digite uma mensagem para iniciar a conversa.');
      return;
    }

    setSendingIcebreaker(true);
    try {
      await momentsAPI.sendIcebreaker(moment.id, { text: icebreakerText.trim() });
      setShowIcebreakerModal(false);
      setIcebreakerText('');
      Alert.alert('Icebreaker Enviado!', 'Sua mensagem iniciou uma conversa com sucesso.');
      if (onIcebreakerSent) onIcebreakerSent();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível enviar o icebreaker.');
    } finally {
      setSendingIcebreaker(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir publicação',
      'Tem certeza que deseja apagar este momento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await momentsAPI.deleteMoment(moment.id);
              if (onDelete) onDelete(moment.id);
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível excluir.');
            }
          },
        },
      ]
    );
  };

  const avatarUrl = moment.user?.avatar_url || generateAvatarUrl(moment.user?.name || 'Proximous User');

  return (
    <View style={styles.card}>
      {/* Author Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{moment.user?.name || 'Membro do Proximous'}</Text>
            <Text style={styles.timestamp}>{formatDateTime(moment.created_at)}</Text>
          </View>
        </View>

        {isMyMoment && (
          <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content Text */}
      {moment.content ? (
        <Text style={styles.content}>{moment.content}</Text>
      ) : null}

      {/* Optional Photo */}
      {moment.photo_url ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: moment.photo_url }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      ) : null}

      {/* Interactions Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleToggleLike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? theme.colors.heart : theme.colors.textSecondary}
          />
          <Text style={[styles.actionText, liked && { color: theme.colors.heart, fontWeight: '700' }]}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        {!isMyMoment && (
          <TouchableOpacity
            style={styles.icebreakerButton}
            onPress={() => setShowIcebreakerModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.colors.gradientSocial}
              style={styles.icebreakerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={theme.colors.white} />
              <Text style={styles.icebreakerText}>Puxar Papo</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Icebreaker Modal */}
      <Modal
        visible={showIcebreakerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIcebreakerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Puxar Papo com {moment.user?.name}</Text>
              <TouchableOpacity onPress={() => setShowIcebreakerModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.quoteContext} numberOfLines={2}>
              "{moment.content}"
            </Text>

            <TextInput
              style={styles.icebreakerInput}
              placeholder="Escreva algo gentil ou interessante..."
              placeholderTextColor={theme.colors.textMuted}
              value={icebreakerText}
              onChangeText={setIcebreakerText}
              multiline
              numberOfLines={3}
              autoFocus
            />

            <View style={styles.quickSuggestions}>
              {['Adorei sua foto! ✨', 'Que lugar incrível!', 'Concordo totalmente com você!'].map((sug, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.sugChip}
                  onPress={() => setIcebreakerText(sug)}
                >
                  <Text style={styles.sugText}>{sug}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Enviar Mensagem e Conectar"
              onPress={handleSendIcebreaker}
              loading={sendingIcebreaker}
              size="md"
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
  },
  authorMeta: {
    marginLeft: theme.spacing.sm,
  },
  authorName: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  timestamp: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  content: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  imageContainer: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: theme.borderRadius.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    fontWeight: theme.fontWeight.medium,
  },
  icebreakerButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  icebreakerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  icebreakerText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  quoteContext: {
    fontSize: theme.fontSize.xs,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  icebreakerInput: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.sm,
  },
  quickSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  sugChip: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  sugText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
});

export default MomentCard;
