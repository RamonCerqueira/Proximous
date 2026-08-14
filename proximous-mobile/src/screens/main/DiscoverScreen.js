import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanGesturer,
  Animated,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usersAPI, matchingAPI } from '../../config/api';
import { formatUserAge, formatDistance, getSocialStyleColor } from '../../utils/helpers';
import { theme } from '../../styles/colors';
import Button from '../../components/common/Button';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = screenHeight * 0.7;

const DiscoverScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    max_distance: 50,
    min_age: 18,
    max_age: 65,
    gender: 'all',
    social_style: 'all',
    intent_mode: 'all'
  });

  const pan = new Animated.ValueXY();
  const scale = new Animated.Value(1);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.discover(filters);
      setUsers(response.data.users || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Erro', 'Não foi possível carregar usuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction, likeType = 'like') => {
    if (currentIndex >= users.length) return;

    const currentUser = users[currentIndex];
    
    if (direction === 'right') {
      try {
        await matchingAPI.sendLike({
          target_user_id: currentUser.id,
          like_type: likeType
        });
        
        // Show match animation if it's a match
        // This would be implemented with a match modal
      } catch (error) {
        console.error('Error sending like:', error);
      }
    }

    // Animate card out
    Animated.timing(pan, {
      toValue: { x: direction === 'right' ? screenWidth : -screenWidth, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setCurrentIndex(prev => prev + 1);
      pan.setValue({ x: 0, y: 0 });
      scale.setValue(1);
    });
  };

  const handleLike = () => handleSwipe('right', 'like');
  const handleSuperLike = () => handleSwipe('right', 'super_like');
  const handlePass = () => handleSwipe('left');

  const UserCard = ({ user, index }) => {
    const isActive = index === currentIndex;
    const isNext = index === currentIndex + 1;
    
    if (index < currentIndex) return null;

    const cardStyle = {
      position: 'absolute',
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.white,
      ...theme.shadow.lg,
    };

    if (isActive) {
      cardStyle.transform = [
        { translateX: pan.x },
        { translateY: pan.y },
        { scale: scale },
      ];
    } else if (isNext) {
      cardStyle.transform = [{ scale: 0.95 }];
      cardStyle.opacity = 0.8;
    } else {
      cardStyle.transform = [{ scale: 0.9 }];
      cardStyle.opacity = 0.6;
    }

    return (
      <Animated.View style={cardStyle}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.cardGradient}
        >
          {/* User Photo */}
          <View style={styles.photoContainer}>
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={80} color={theme.colors.textSecondary} />
            </View>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.userHeader}>
              <Text style={styles.userName}>
                {user.name}, {formatUserAge(user.birth_date)}
              </Text>
              <View style={styles.distanceContainer}>
                <Ionicons name="location" size={16} color={theme.colors.white} />
                <Text style={styles.distance}>
                  {formatDistance(user.distance || 0)}
                </Text>
              </View>
            </View>

            {user.bio && (
              <Text style={styles.userBio} numberOfLines={3}>
                {user.bio}
              </Text>
            )}

            {/* Personality Tags */}
            {user.personality_tags && user.personality_tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {user.personality_tags.slice(0, 3).map((tag, tagIndex) => (
                  <View key={tagIndex} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Social Style */}
            <View style={[
              styles.socialStyleBadge,
              { backgroundColor: getSocialStyleColor(user.social_style) }
            ]}>
              <Text style={styles.socialStyleText}>
                {user.social_style === 'shy' ? 'Tímido(a)' :
                 user.social_style === 'introverted' ? 'Introvertido(a)' :
                 'Extrovertido(a)'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const NoMoreCards = () => (
    <View style={styles.noMoreCards}>
      <Ionicons name="heart-outline" size={80} color={theme.colors.textSecondary} />
      <Text style={styles.noMoreCardsTitle}>
        Não há mais pessoas por aqui
      </Text>
      <Text style={styles.noMoreCardsSubtitle}>
        Tente ajustar seus filtros ou volte mais tarde
      </Text>
      <Button
        title="Ajustar filtros"
        onPress={() => {
          // Open filters modal
          Alert.alert('Em breve', 'Filtros serão implementados em breve');
        }}
        style={styles.filtersButton}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando pessoas próximas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            Alert.alert('Em breve', 'Filtros serão implementados em breve');
          }}
        >
          <Ionicons name="options" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Descobrir</Text>
        
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="settings" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        {currentIndex >= users.length ? (
          <NoMoreCards />
        ) : (
          users.map((user, index) => (
            <UserCard key={user.id} user={user} index={index} />
          ))
        )}
      </View>

      {/* Action Buttons */}
      {currentIndex < users.length && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={handlePass}
          >
            <Ionicons name="close" size={32} color={theme.colors.error} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.superLikeButton]}
            onPress={handleSuperLike}
          >
            <Ionicons name="star" size={24} color={theme.colors.warning} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={handleLike}
          >
            <Ionicons name="heart" size={32} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  
  cardGradient: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  
  photoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  userInfo: {
    padding: theme.spacing.lg,
  },
  
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  
  userName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    flex: 1,
  },
  
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  distance: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    marginLeft: theme.spacing.xs,
  },
  
  userBio: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    lineHeight: theme.lineHeight.relaxed,
    marginBottom: theme.spacing.md,
  },
  
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  
  tagText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
  },
  
  socialStyleBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  
  socialStyleText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.semibold,
  },
  
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.md,
    ...theme.shadow.md,
  },
  
  passButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  
  superLikeButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.warning,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  
  likeButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  noMoreCardsTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  
  noMoreCardsSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.lineHeight.relaxed,
    marginBottom: theme.spacing.xl,
  },
  
  filtersButton: {
    marginTop: theme.spacing.lg,
  },
});

export default DiscoverScreen;

