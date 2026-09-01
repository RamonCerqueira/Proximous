import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../styles/colors';
import { momentsAPI, usersAPI } from '../../config/api';
import Button from '../common/Button';

const CreateMomentModal = ({ visible, onClose, onMomentCreated }) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para adicionar uma imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera para tirar uma foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      Alert.alert('Atenção', 'Escreva algo sobre o seu momento antes de publicar.');
      return;
    }

    setLoading(true);
    try {
      let photoUrl = null;

      // If an image was selected, upload it first
      if (selectedImage) {
        const formData = new FormData();
        const filename = selectedImage.split('/').pop() || 'moment.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('photo', {
          uri: selectedImage,
          name: filename,
          type,
        });

        try {
          const uploadRes = await usersAPI.uploadPhoto(formData);
          photoUrl = uploadRes.data.photo_url || uploadRes.data.url;
        } catch (uploadErr) {
          console.log('Upload fallback info:', uploadErr);
          // If server photo endpoint is direct, pass as photo_url
          photoUrl = selectedImage;
        }
      }

      const res = await momentsAPI.createMoment({
        content: content.trim(),
        photo_url: photoUrl,
      });

      setContent('');
      setSelectedImage(null);
      onClose();
      if (onMomentCreated) onMomentCreated(res.data.moment);
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível publicar seu momento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Compartilhar Momento</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder="O que está acontecendo por perto agora?"
            placeholderTextColor={theme.colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
            autoFocus
          />

          {/* Image Preview */}
          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          )}

          {/* Action Row */}
          <View style={styles.actionRow}>
            <View style={styles.mediaButtons}>
              <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={22} color={theme.colors.primary} />
                <Text style={styles.iconButtonText}>Galeria</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={22} color={theme.colors.primary} />
                <Text style={styles.iconButtonText}>Câmera</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Publicar"
              onPress={handlePublish}
              loading={loading}
              size="sm"
              style={{ minWidth: 100 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    minHeight: 110,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.md,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: theme.borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mediaButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    marginRight: 8,
  },
  iconButtonText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
    marginLeft: 4,
  },
});

export default CreateMomentModal;
