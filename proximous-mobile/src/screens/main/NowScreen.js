import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usersAPI, activitiesAPI, matchingAPI } from '../../config/api';
import { colors } from '../../styles/colors';

const NowScreen = ({ navigation }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Availability Modal
  const [showAvailModal, setShowAvailModal] = useState(false);
  const [availText, setAvailText] = useState('Tomar um café agora');
  const [availHours, setAvailHours] = useState(2);

  // Create Activity Modal
  const [showActModal, setShowActModal] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actCategory, setActCategory] = useState('coffee');
  const [actDesc, setActDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availRes, actRes] = await Promise.all([
        usersAPI.discover({ available_now: true, radius: 50 }),
        activitiesAPI.getNearby({ radius: 50 }),
      ]);
      setAvailableUsers(availRes.data.users || []);
      setActivitiesList(actRes.data.activities || []);
    } catch (error) {
      console.error('Error fetching Modo AGORA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetAvailability = async (clear = false) => {
    try {
      await usersAPI.updateAvailability({
        hours: availHours,
        status_text: availText,
        clear,
      });
      setShowAvailModal(false);
      fetchData();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar sua disponibilidade.');
    }
  };

  const handleCreateActivity = async () => {
    if (!actTitle.trim()) {
      Alert.alert('Atenção', 'Informe um título para o convite.');
      return;
    }
    try {
      await activitiesAPI.create({
        title: actTitle,
        category: actCategory,
        description: actDesc,
        duration_hours: 4,
      });
      setShowActModal(false);
      setActTitle('');
      setActDesc('');
      fetchData();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o convite.');
    }
  };

  const handleConnect = async (userId) => {
    try {
      await matchingAPI.sendLike({ receiver_id: userId, like_type: 'like' });
      Alert.alert('Conectado!', 'Seu interesse foi enviado com sucesso.');
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  const handleJoin = async (actId) => {
    try {
      await activitiesAPI.join(actId);
      Alert.alert('Sucesso', 'Você entrou no convite!');
      fetchData();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível entrar no convite.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner AGORA */}
        <LinearGradient
          colors={[colors.primary, '#8e44ad']}
          style={styles.bannerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bannerHeader}>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>MODO AGORA</Text>
            </View>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => setShowAvailModal(true)}
            >
              <Ionicons name="time-outline" size={14} color="#FFF" />
              <Text style={styles.changeBtnText}>Status</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bannerTitle}>O que você quer fazer hoje?</Text>
          <Text style={styles.bannerSubtitle}>
            Apareça para pessoas próximas que querem a mesma coisa agora.
          </Text>

          <View style={styles.bannerActions}>
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => setShowAvailModal(true)}
            >
              <Ionicons name="flash" size={16} color={colors.primary} />
              <Text style={styles.primaryActionText}>Disponível Agora</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionBtn}
              onPress={() => setShowActModal(true)}
            >
              <Ionicons name="add-circle-outline" size={16} color="#FFF" />
              <Text style={styles.secondaryActionText}>Criar Convite</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Section 1: Disponíveis Agora */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🟢 Pessoas Disponíveis Agora</Text>
          <TouchableOpacity onPress={fetchData}>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : availableUsers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Ninguém disponível por perto agora.</Text>
          </View>
        ) : (
          availableUsers.map((item) => (
            <View key={item.id} style={styles.userCard}>
              <Image
                source={{
                  uri:
                    item.profile_photo_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
                }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {item.name}, {item.age}
                </Text>
                <Text style={styles.userStatus}>
                  "{item.current_status_text || 'Disponível para sair'}"
                </Text>
              </View>
              <TouchableOpacity
                style={styles.connectBtn}
                onPress={() => handleConnect(item.id)}
              >
                <Text style={styles.connectBtnText}>Bora</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Section 2: Convites Abertos */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>🎉 Convites Abertos</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : activitiesList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum convite aberto por perto.</Text>
          </View>
        ) : (
          activitiesList.map((act) => (
            <View key={act.id} style={styles.actCard}>
              <Text style={styles.actCategory}>{act.category?.toUpperCase() || 'GERAL'}</Text>
              <Text style={styles.actTitle}>{act.title}</Text>
              {!!act.description && (
                <Text style={styles.actDesc}>{act.description}</Text>
              )}
              <View style={styles.actFooter}>
                <Text style={styles.actLoc}>📍 {act.location_name || 'Próximo'}</Text>
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => handleJoin(act.id)}
                >
                  <Text style={styles.joinBtnText}>Participar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Availability Modal */}
      <Modal visible={showAvailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>⚡ Ficar Disponível Agora</Text>
            <TextInput
              style={styles.input}
              placeholder="O que você quer fazer?"
              value={availText}
              onChangeText={setAvailText}
            />
            <Text style={styles.label}>Duração ({availHours} horas):</Text>
            <View style={styles.hoursRow}>
              {[1, 2, 4, 6].map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[
                    styles.hourChip,
                    availHours === h && styles.hourChipActive,
                  ]}
                  onPress={() => setAvailHours(h)}
                >
                  <Text
                    style={[
                      styles.hourChipText,
                      availHours === h && styles.hourChipTextActive,
                    ]}
                  >
                    {h}h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAvailModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => handleSetAvailability(false)}
              >
                <Text style={styles.confirmBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Activity Modal */}
      <Modal visible={showActModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🎉 Criar Convite Aberto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Alguém para cinema hoje 20h?"
              value={actTitle}
              onChangeText={setActTitle}
            />
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Descrição ou detalhes (opcional)"
              multiline
              value={actDesc}
              onChangeText={setActDesc}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowActModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleCreateActivity}
              >
                <Text style={styles.confirmBtnText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 16 },
  bannerCard: { borderRadius: 20, padding: 18, marginBottom: 20 },
  bannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  liveTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ECC71', marginRight: 6 },
  liveText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  changeBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 16 },
  bannerActions: { flexDirection: 'row', gap: 10 },
  primaryActionBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  primaryActionText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  secondaryActionBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  secondaryActionText: { color: '#FFF', fontWeight: '800', fontSize: 12 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#2C3E50', textTransform: 'uppercase' },

  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '800', color: '#2C3E50' },
  userStatus: { fontSize: 12, fontWeight: '600', color: '#27AE60', marginTop: 2 },
  connectBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  connectBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12 },

  actCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  actCategory: { fontSize: 10, fontWeight: '900', color: colors.primary, marginBottom: 4 },
  actTitle: { fontSize: 15, fontWeight: '800', color: '#2C3E50' },
  actDesc: { fontSize: 12, color: '#7F8C8D', marginVertical: 6 },
  actFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#ECF0F1', paddingTop: 8 },
  actLoc: { fontSize: 12, color: '#95A5A6' },
  joinBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  joinBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  emptyCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, alignItems: 'center' },
  emptyText: { color: '#95A5A6', fontSize: 12, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '900', color: '#2C3E50', marginBottom: 14 },
  input: { borderWidth: 1, borderColor: '#BDC3C7', borderRadius: 12, padding: 12, fontSize: 13, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#7F8C8D', marginBottom: 8 },
  hoursRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  hourChip: { flex: 1, borderWidth: 1, borderColor: '#BDC3C7', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  hourChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  hourChipText: { fontSize: 12, fontWeight: '700', color: '#7F8C8D' },
  hourChipTextActive: { color: '#FFF' },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: '#7F8C8D', fontWeight: '700' },
  confirmBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: '800' },
});

export default NowScreen;
