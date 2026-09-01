import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { usersAPI, matchingAPI } from '../../config/api';
import { formatDistance, generateAvatarUrl } from '../../utils/helpers';
import { theme } from '../../styles/colors';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const DiscoverScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    max_distance: 30,
    min_age: 18,
    max_age: 60,
  });

  const position = useRef(new Animated.ValueXY()).current;

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Request location permission gracefully
      let coords = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (loc?.coords) {
            coords = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            await usersAPI.updateLocation(coords);
          }
        }
      } catch (locErr) {
        console.log('Location fetch notice:', locErr);
      }

      const params = {
        ...filters,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      };

      const res = await usersAPI.discover(params);
      setUsers(res.data.users || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeCard('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeCard('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const swipeCard = (direction, likeType = 'like') => {
    const x = direction === 'right' ? screenWidth + 100 : -screenWidth - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      onSwipeComplete(direction, likeType);
    });
  };

  const onSwipeComplete = async (direction, likeType) => {
    const currentUser = users[currentIndex];
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(prev => prev + 1);

    if (direction === 'right' && currentUser) {
      try {
        const res = await matchingAPI.sendLike({
          target_user_id: currentUser.id,
          like_type: likeType,
        });

        if (res.data?.is_match) {
          Alert.alert(
            '🎉 É um Match!',
            `Você e ${currentUser.name} se conectaram. Que tal mandar uma mensagem agora?`,
            [
              { text: 'Continuar Descobrindo', style: 'cancel' },
              {
                text: 'Enviar Mensagem',
                onPress: () => navigation.navigate('Messages'),
              },
            ]
          );
        }
      } catch (err) {
        console.error('Erro ao enviar like:', err);
      }
    }
  };

  const handlePass = () => swipeCard('left');
  const handleLike = () => swipeCard('right', 'like');
  const handleSuperLike = () => swipeCard('right', 'super_like');

  const renderCard = (user, index) => {
    if (index < currentIndex) return null;

    const isTopCard = index === currentIndex;
    const rotate = position.x.interpolate({
      inputRange: [-screenWidth * 1.5, 0, screenWidth * 1.5],
      outputRange: ['-18deg', '0deg', '18deg'],
    });

    const cardStyle = isTopCard
      ? {
          ...styles.card,
          transform: [...position.getTranslateTransform(), { rotate }],
        }
      : {
          ...styles.card,
          transform: [{ scale: 0.95 }],
          top: 10,
        };

    const avatarUrl = user.avatar_url || user.photos?.[0] || generateAvatarUrl(user.name);
    const distanceText = user.distance_km != null 
      ? formatDistance(user.distance_km) 
      : 'Próximo a você';

    return (
      <Animated.View
        key={user.id}
        style={cardStyle}
        {...(isTopCard ? panResponder.panHandlers : {})}
      >
        <Image source={{ uri: avatarUrl }} style={styles.cardImage} resizeMode="cover" />

        <LinearGradient
          colors={['transparent', 'rgba(9, 7, 18, 0.4)', 'rgba(9, 7, 18, 0.92)']}
          style={styles.cardGradient}
        >
          {/* Proximity Pill */}
          <View style={styles.distanceBadge}>
            <Ionicons name="location-sharp" size={12} color={theme.colors.gold} />
            <Text style={styles.distanceText}>{distanceText}</Text>
          </View>

          {/* User Name and Age */}
          <Text style={styles.userName}>
            {user.name}{user.age ? `, ${user.age}` : ''}
          </Text>

          {/* Bio snippet */}
          {user.bio ? (
            <Text style={styles.userBio} numberOfLines={2}>
              {user.bio}
            </Text>
          ) : null}

          {/* Interests Tags */}
          {user.interests && user.interests.length > 0 && (
            <View style={styles.tagsRow}>
              {user.interests.slice(0, 3).map((interest, idx) => (
                <Badge
                  key={idx}
                  label={interest}
                  variant="gold"
                  size="sm"
                  style={{ marginRight: 6, marginBottom: 4 }}
                />
              ))}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Descobrir</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Cards Deck */}
      <View style={styles.deckContainer}>
        {loading ? (
          <EmptyState
            icon="compass-outline"
            title="Buscando pessoas..."
            description="Aguarde um instante enquanto mapeamos conexões por perto."
          />
        ) : currentIndex >= users.length ? (
          <EmptyState
            icon="sparkles-outline"
            title="Você viu todos por perto!"
            description="Tente expandir o raio de distância nos filtros ou retorne mais tarde."
            actionTitle="Ajustar Filtros"
            onActionPress={() => setShowFilterModal(true)}
          />
        ) : (
          users.map((user, idx) => renderCard(user, idx)).reverse()
        )}
      </View>

      {/* Bottom Action Controls */}
      {currentIndex < users.length && !loading && (
        <View style={styles.actionControls}>
          <TouchableOpacity style={[styles.controlBtn, styles.passBtn]} onPress={handlePass} activeOpacity={0.8}>
            <Ionicons name="close" size={28} color={theme.colors.danger} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlBtn, styles.superLikeBtn]} onPress={handleSuperLike} activeOpacity={0.8}>
            <Ionicons name="star" size={26} color={theme.colors.gold} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlBtn, styles.likeBtn]} onPress={handleLike} activeOpacity={0.8}>
            <Ionicons name="heart" size={28} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros de Descoberta</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>
              Raio de Distância Máxima: <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{filters.max_distance} km</Text>
            </Text>
            <View style={styles.distanceOptions}>
              {[10, 25, 50, 100].map((dist) => (
                <TouchableOpacity
                  key={dist}
                  style={[
                    styles.distanceOptionChip,
                    filters.max_distance === dist && styles.distanceOptionChipActive,
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, max_distance: dist }))}
                >
                  <Text
                    style={[
                      styles.distanceOptionText,
                      filters.max_distance === dist && styles.distanceOptionTextActive,
                    ]}
                  >
                    {dist} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Aplicar Filtros"
              onPress={() => setShowFilterModal(false)}
              size="md"
              style={{ marginTop: 24 }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  filterButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  card: {
    position: 'absolute',
    width: screenWidth - 32,
    height: screenHeight * 0.62,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.black,
    ...theme.shadow.lg,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 7, 18, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  distanceText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    marginLeft: 4,
  },
  userName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  userBio: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: theme.spacing.md,
    paddingBottom: 20,
  },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.md,
  },
  passBtn: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  superLikeBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  likeBtn: {
    backgroundColor: theme.colors.heart,
    borderColor: theme.colors.heart,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  filterModalCard: {
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
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  filterLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  distanceOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceOptionChip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primarySoft,
  },
  distanceOptionChipActive: {
    backgroundColor: theme.colors.primary,
  },
  distanceOptionText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  distanceOptionTextActive: {
    color: theme.colors.white,
  },
});

export default DiscoverScreen;
