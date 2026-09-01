import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usersAPI, activitiesAPI, matchingAPI } from '../../config/api';
import { formatDistance, generateAvatarUrl } from '../../utils/helpers';
import { theme } from '../../styles/colors';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const NowScreen = ({ navigation }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myAvailability, setMyAvailability] = useState(null);

  // Modals
  const [showAvailModal, setShowAvailModal] = useState(false);
  const [availText, setAvailText] = useState('Tomar um café agora ☕');
  const [availHours, setAvailHours] = useState(2);

  const [showActModal, setShowActModal] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actCategory, setActCategory] = useState('coffee');
  const [actDesc, setActDesc] = useState('');
  const [creatingAct, setCreatingAct] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [availRes, actRes] = await Promise.allSettled([
        usersAPI.discover({ available_now: true, max_distance: 50 }),
        activitiesAPI.getNearby({ radius: 50 }),
      ]);

      if (availRes.status === 'fulfilled') {
        setAvailableUsers(availRes.value.data?.users || []);
      }
      if (actRes.status === 'fulfilled') {
        setActivitiesList(actRes.value.data?.activities || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do Modo AGORA:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSetAvailability = async (clear = false) => {
    try {
      await usersAPI.updateAvailability({
        hours: availHours,
        status_text: clear ? '' : availText,
        clear,
      });
      setMyAvailability(clear ? null : { status_text: availText, hours: availHours });
      setShowAvailModal(false);
      fetchData();
      Alert.alert('Sucesso', clear ? 'Sua disponibilidade foi desativada.' : 'Seu status de disponibilidade está ativo!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar sua disponibilidade.');
    }
  };

  const handleCreateActivity = async () => {
    if (!actTitle.trim()) {
      Alert.alert('Atenção', 'Informe um título para o convite.');
      return;
    }
    setCreatingAct(true);
    try {
      await activitiesAPI.create({
        title: actTitle.trim(),
        category: actCategory,
        description: actDesc.trim(),
        duration_hours: 4,
      });
      setShowActModal(false);
      setActTitle('');
      setActDesc('');
      fetchData();
      Alert.alert('Convite Criado!', 'Seu convite está visível para pessoas próximas.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o convite.');
    } finally {
      setCreatingAct(false);
    }
  };

  const handleJoinActivity = async (activityId) => {
    try {
      await activitiesAPI.join(activityId);
      Alert.alert('Presença Confirmada!', 'Você agora faz parte desta atividade.');
      fetchData();
    } catch (error) {
      Alert.alert('Aviso', error.response?.data?.message || 'Você já faz parte desta atividade.');
    }
  };

  const handleConnectUser = async (userId, userName) => {
    try {
      await matchingAPI.sendLike({ target_user_id: userId, like_type: 'like' });
      Alert.alert('Conectado!', `Você enviou um interesse para ${userName}.`);
    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>⚡ Modo AGORA</Text>
          <Badge label="Tempo Real" variant="gold" size="sm" />
        </View>
        <Text style={styles.headerSubtitle}>
          Encontros espontâneos e companhias disponíveis nas próximas horas
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.gold]} />
        }
      >
        {/* Availability Banner */}
        <View style={styles.myAvailCard}>
          <LinearGradient
            colors={theme.colors.gradientGold}
            style={styles.availGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.availTextCol}>
              <Text style={styles.availCardTitle}>
                {myAvailability ? 'Você está Disponível!' : 'Está livre agora?'}
              </Text>
              <Text style={styles.availCardDesc}>
                {myAvailability
                  ? `Status: "${myAvailability.status_text}"`
                  : 'Avise quem está por perto que você topa um café ou passeio.'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.availToggleBtn}
              onPress={() => setShowAvailModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.availToggleText}>
                {myAvailability ? 'Alterar' : 'Ativar'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Section: People Available Now */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pessoas Disponíveis Agora</Text>
          <Badge label={`${availableUsers.length}`} variant="primary" size="sm" />
        </View>

        {availableUsers.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="Ninguém ativo por perto ainda"
            description="Ative seu status acima para inspirar outras pessoas a se conectarem."
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalUsersList}
          >
            {availableUsers.map((item) => {
              const avatar = item.avatar_url || generateAvatarUrl(item.name);
              return (
                <View key={item.id} style={styles.userCard}>
                  <View style={styles.userAvatarContainer}>
                    <Image source={{ uri: avatar }} style={styles.userAvatar} />
                    <View style={styles.liveDot} />
                  </View>
                  <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.userDistance}>
                    {item.distance_km != null ? formatDistance(item.distance_km) : 'Por perto'}
                  </Text>
                  <TouchableOpacity
                    style={styles.connectBtn}
                    onPress={() => handleConnectUser(item.id, item.name)}
                  >
                    <Ionicons name="chatbubble-outline" size={14} color={theme.colors.white} />
                    <Text style={styles.connectBtnText}>Chamar</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Section: Activities */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Convites Rápidos de Atividades</Text>
          <TouchableOpacity
            style={styles.createActPill}
            onPress={() => setShowActModal(true)}
          >
            <Ionicons name="add" size={16} color={theme.colors.gold} />
            <Text style={styles.createActPillText}>Criar Convite</Text>
          </TouchableOpacity>
        </View>

        {activitiesList.length === 0 ? (
          <EmptyState
            icon="cafe-outline"
            title="Nenhum convite criado ainda"
            description="Crie um convite para tomar um café, caminhar ou praticar esportes!"
            actionTitle="Criar Convite Rápido"
            onActionPress={() => setShowActModal(true)}
          />
        ) : (
          activitiesList.map((act) => (
            <View key={act.id} style={styles.activityCard}>
              <View style={styles.actHeader}>
                <View style={styles.actTitleRow}>
                  <Ionicons name="flash" size={18} color={theme.colors.gold} style={{ marginRight: 6 }} />
                  <Text style={styles.actTitle}>{act.title}</Text>
                </View>
                <Badge label={act.category || 'Atividade'} variant="gold" size="sm" />
              </View>

              {act.description ? (
                <Text style={styles.actDesc}>{act.description}</Text>
              ) : null}

              <View style={styles.actFooter}>
                <View style={styles.participantsCount}>
                  <Ionicons name="people-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.participantsText}>
                    {act.participants_count || 1} participante(s)
                  </Text>
                </View>

                <Button
                  title="Eu Topo!"
                  variant="gold"
                  size="sm"
                  onPress={() => handleJoinActivity(act.id)}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Set Availability Modal */}
      <Modal
        visible={showAvailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Definir Disponibilidade</Text>
              <TouchableOpacity onPress={() => setShowAvailModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>O que você gostaria de fazer?</Text>
            <TextInput
              style={styles.modalInput}
              value={availText}
              onChangeText={setAvailText}
              placeholder="Ex: Tomar um café, correr no parque..."
            />

            <View style={styles.quickOptionsRow}>
              {['Tomar um café ☕', 'Caminhar no parque 🌳', 'Conversar sobre ideias 💡'].map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.optChip}
                  onPress={() => setAvailText(opt)}
                >
                  <Text style={styles.optChipText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Salvar Disponibilidade"
              variant="gold"
              size="md"
              onPress={() => handleSetAvailability(false)}
              style={{ marginTop: 16 }}
            />

            {myAvailability && (
              <Button
                title="Desativar Modo AGORA"
                variant="ghost"
                size="sm"
                onPress={() => handleSetAvailability(true)}
                style={{ marginTop: 8 }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Create Activity Modal */}
      <Modal
        visible={showActModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Convite Rápido</Text>
              <TouchableOpacity onPress={() => setShowActModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Título do Convite</Text>
            <TextInput
              style={styles.modalInput}
              value={actTitle}
              onChangeText={setActTitle}
              placeholder="Ex: Café e bate-papo no centro"
            />

            <Text style={styles.inputLabel}>Descrição (Opcional)</Text>
            <TextInput
              style={[styles.modalInput, { minHeight: 70, textAlignVertical: 'top' }]}
              value={actDesc}
              onChangeText={setActDesc}
              placeholder="Detalhes adicionais..."
              multiline
            />

            <Button
              title="Publicar Convite"
              variant="gold"
              size="md"
              loading={creatingAct}
              onPress={handleCreateActivity}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  myAvailCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadow.md,
  },
  availGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  availTextCol: {
    flex: 1,
  },
  availCardTitle: {
    fontSize: theme.fontSize.md + 1,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  availCardDesc: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  availToggleBtn: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    marginLeft: 12,
  },
  availToggleText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gold,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md + 1,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  horizontalUsersList: {
    paddingVertical: theme.spacing.xs,
  },
  userCard: {
    width: 120,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  userAvatarContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  userAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  liveDot: {
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
  userName: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  userDistance: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
  },
  connectBtnText: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginLeft: 3,
  },
  createActPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
  },
  createActPillText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.secondaryDark,
    fontWeight: theme.fontWeight.semibold,
    marginLeft: 2,
  },
  activityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  actHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  actTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actTitle: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  actDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  actFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 8,
  },
  participantsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
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
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  inputLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  quickOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  optChip: {
    backgroundColor: theme.colors.secondarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  optChipText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.secondaryDark,
    fontWeight: theme.fontWeight.medium,
  },
});

export default NowScreen;
