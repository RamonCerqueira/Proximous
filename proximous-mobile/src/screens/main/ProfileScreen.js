import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../config/api';
import { theme } from '../../styles/colors';
import { generateAvatarUrl } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Bio Modal
  const [showBioModal, setShowBioModal] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      const [profRes, statsRes, achRes] = await Promise.allSettled([
        usersAPI.getProfile(),
        usersAPI.getStats(),
        usersAPI.getAchievements(),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value.data?.user) {
        setProfile(profRes.value.data.user);
        setNewBio(profRes.value.data.user.bio || '');
      } else {
        setProfile(user);
        setNewBio(user?.bio || '');
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.stats) {
        setStats(statsRes.value.data.stats);
      }

      if (achRes.status === 'fulfilled' && achRes.value.data?.achievements) {
        setAchievements(achRes.value.data.achievements);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para atualizar seu avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const photoUri = result.assets[0].uri;
      try {
        const formData = new FormData();
        const filename = photoUri.split('/').pop() || 'avatar.jpg';
        formData.append('photo', {
          uri: photoUri,
          name: filename,
          type: 'image/jpeg',
        });

        const uploadRes = await usersAPI.uploadPhoto(formData);
        const newAvatarUrl = uploadRes.data.photo_url || uploadRes.data.url || photoUri;

        await usersAPI.updateProfile({ avatar_url: newAvatarUrl });
        const updated = { ...(profile || user), avatar_url: newAvatarUrl };
        setProfile(updated);
        updateUser(updated);
        Alert.alert('Foto Atualizada!', 'Sua foto de perfil foi alterada com sucesso.');
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível atualizar a foto.');
      }
    }
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      await usersAPI.updateProfile({ bio: newBio.trim() });
      const updated = { ...(profile || user), bio: newBio.trim() };
      setProfile(updated);
      updateUser(updated);
      setShowBioModal(false);
      Alert.alert('Sucesso', 'Sua biografia foi atualizada.');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar a biografia.');
    } finally {
      setSavingBio(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja desconectar do Proximous?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const avatarUrl = profile?.avatar_url || user?.avatar_url || generateAvatarUrl(profile?.name || user?.name || 'User');
  const interestsList = profile?.interests || ['Tecnologia', 'Viagens', 'Música', 'Gastronomia'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderTitle}>Meu Perfil</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Matches')}
          activeOpacity={0.7}
        >
          <Ionicons name="heart-outline" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
      >
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={handlePickAvatar}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{profile?.name || user?.name || 'Seu Nome'}</Text>
          <Text style={styles.userUsername}>@{profile?.username || user?.username || 'proximous_user'}</Text>

          {/* Bio Section */}
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>
              {profile?.bio || 'Adicione uma breve apresentação para que as pessoas próximas conheçam você melhor.'}
            </Text>
            <TouchableOpacity
              style={styles.editBioBtn}
              onPress={() => setShowBioModal(true)}
            >
              <Ionicons name="pencil-outline" size={14} color={theme.colors.primary} />
              <Text style={styles.editBioText}>Editar Bio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats?.matches_count || 0}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats?.received_likes_count || 0}</Text>
            <Text style={styles.statLabel}>Curtidas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: theme.colors.gold }]}>
              {stats?.empathy_points || 120}
            </Text>
            <Text style={styles.statLabel}>Pontos de Empatia</Text>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Interesses & Afinidades</Text>
          <View style={styles.tagsContainer}>
            {interestsList.map((tag, idx) => (
              <Badge
                key={idx}
                label={tag}
                variant="primary"
                size="md"
                style={{ marginRight: 8, marginBottom: 8 }}
              />
            ))}
          </View>
        </View>

        {/* Quick Menu Actions */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Matches')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: theme.colors.primarySoft }]}>
                <Ionicons name="heart" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Meus Matches & Conexões</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: theme.colors.secondarySoft }]}>
                <Ionicons name="notifications" size={18} color={theme.colors.gold} />
              </View>
              <Text style={styles.menuItemText}>Central de Notificações</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.colors.danger }]}>
                Desconectar da Conta
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Bio Modal */}
      <Modal
        visible={showBioModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Biografia</Text>
              <TouchableOpacity onPress={() => setShowBioModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.bioInput}
              value={newBio}
              onChangeText={setNewBio}
              placeholder="Fale um pouco sobre você..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={250}
              autoFocus
            />

            <Text style={styles.charCount}>{newBio.length}/250 caracteres</Text>

            <Button
              title="Salvar Biografia"
              onPress={handleSaveBio}
              loading={savingBio}
              size="md"
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  topHeaderTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primarySoft,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  userUsername: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  bioContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  bioText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  editBioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  editBioText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  statNum: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuItemText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
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
  bioInput: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default ProfileScreen;
