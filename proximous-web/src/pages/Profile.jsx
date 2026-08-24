import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api, { usersAPI, uploadAPI } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Heart, 
  Sparkles, 
  Award, 
  Shield, 
  Settings, 
  Camera, 
  MapPin, 
  Star, 
  MessageCircle, 
  Edit3, 
  Check, 
  Plus, 
  Image as ImageIcon, 
  Lock, 
  Sliders, 
  Eye, 
  Zap, 
  Trash2, 
  AlertTriangle, 
  Upload,
  X,
  Search,
  ChevronRight,
  Smile,
  Music,
  Film,
  Plane,
  Utensils,
  BookOpen,
  Palette,
  Briefcase,
  Activity,
  CheckCircle2,
  Circle,
  RefreshCw,
  Share2,
  Info,
  Globe,
  SlidersHorizontal,
  History,
  TrendingUp,
  Clock,
  ArrowLeft,
  Calendar,
  Radio,
  EyeOff,
  UserCheck,
  Compass,
  CheckSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MIN_PHOTOS = 2;
const MAX_PHOTOS = 8;

// Interest Categories & Suggestions
const INTEREST_CATEGORIES = [
  { id: 'all', name: 'Todos', icon: Sparkles },
  { id: 'musica', name: 'Música', icon: Music, items: ['Rock', 'MPB', 'Indie', 'Jazz', 'Hip Hop', 'Eletrônica', 'Samba', 'Clássica'] },
  { id: 'cinema', name: 'Cinema & TV', icon: Film, items: ['Sci-Fi', 'Drama', 'Comédia', 'Terror', 'Animes', 'Documentários', 'Cinema Cult'] },
  { id: 'tecnologia', name: 'Tecnologia', icon: Zap, items: ['Programação', 'Inteligência Artificial', 'Gadgets', 'Gaming', 'Design UX', 'Cripto'] },
  { id: 'viagens', name: 'Viagens', icon: Plane, items: ['Mochilão', 'Praia', 'Ecoturismo', 'Cidades Históricas', 'Montanha', 'Camping'] },
  { id: 'gastronomia', name: 'Gastronomia', icon: Utensils, items: ['Café Especial', 'Vinho', 'Cerveja Artesanal', 'Comida Japonesa', 'Vegano', 'Churrasco'] },
  { id: 'esportes', name: 'Esportes & Saúde', icon: Activity, items: ['Corrida', 'Trilha', 'Yoga', 'Academia', 'Futebol', 'Crossfit', 'Ciclismo'] },
  { id: 'livros', name: 'Livros & Cultura', icon: BookOpen, items: ['Ficção Científica', 'Filosofia', 'História', 'Poesia', 'Psicologia', 'Biografia'] },
  { id: 'arte', name: 'Arte & Criação', icon: Palette, items: ['Fotografia', 'Pintura', 'Arquitetura', 'Teatro', 'Escrita', 'Ilustração'] }
];

const PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500'
];

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Page Modes: 'profile' (Meu Perfil), 'edit' (Central de Edição), 'preview' (Visualizar como Visitante)
  const [viewMode, setViewMode] = useState('profile');
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Tabs for 'profile' view: 'overview', 'photos', 'moments', 'achievements'
  const [activeProfileTab, setActiveProfileTab] = useState('overview');

  // Modals & Popups State
  const [showEmpathyModal, setShowEmpathyModal] = useState(false);
  const [empathyData, setEmpathyData] = useState({ total_points: 0, weekly_points: 0, transactions: [] });
  const [loadingEmpathy, setLoadingEmpathy] = useState(false);
  const [empathyModalTab, setEmpathyModalTab] = useState('transactions'); // 'transactions' | 'rules'
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [photoSourceTab, setPhotoSourceTab] = useState('upload'); // 'upload', 'presets', 'url'

  // Filter & Search for Edit Interests
  const [selectedInterestCategory, setSelectedInterestCategory] = useState('all');
  const [interestSearch, setInterestSearch] = useState('');
  const [customInterestInput, setCustomInterestInput] = useState('');

  // Form State synced with Backend
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    birthDate: '',
    bio: '',
    age: 25,
    gender: 'female',
    social_style: 'introverted', // 'shy', 'introverted', 'extroverted', 'ambiverted'
    looking_for: 'Amizades', // 'Amizades', 'Networking', 'Conversas', 'Eventos'
    availability: 'Hoje', // 'Agora', 'Hoje', 'Esta semana', 'Não informar'
    location_city: 'São Paulo',
    location_precision: 'approximate', // 'exact', 'approximate', 'city'
    search_radius: 10, // km
    photos: [],
    interests: [],
    personality_tags: [],
    // Privacy & Visibility Controls
    online_status: 'online', // 'online', 'away', 'invisible'
    show_online: true,
    show_last_active: false,
    show_city: true,
    show_distance: true,
    allow_messages: true,
    allow_connections: true,
    discovery_mode: 'available' // 'available', 'view_only', 'invisible'
  });

  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // User Moments State
  const [moments, setMoments] = useState([
    {
      id: 1,
      content: 'Domingo perfeito lendo um bom livro num café calmo. Alguém indica novidades de ficção científica? ☕📚',
      likes: 12,
      created_at: 'Há 2 dias',
      photo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500',
      visibility: 'Pessoas próximas',
      mood: '😊 Relaxado'
    },
    {
      id: 2,
      content: 'Trilha matinal para recarregar as energias. Lugares calmos são os melhores lugares. 🌿',
      likes: 19,
      created_at: 'Há 5 dias',
      photo: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500',
      visibility: 'Todos',
      mood: '🏃 Energizado'
    }
  ]);

  // Moment Creator State
  const [newMoment, setNewMoment] = useState({
    content: '',
    photo: '',
    visibility: 'Pessoas próximas',
    mood: '😊 Inspirado'
  });
  const [publishingMoment, setPublishingMoment] = useState(false);

  useEffect(() => {
    fetchProfileData();
    fetchEmpathyHistory();
  }, []);

  const fetchEmpathyHistory = async () => {
    try {
      setLoadingEmpathy(true);
      const res = await usersAPI.getEmpathyHistory();
      if (res.data) {
        setEmpathyData(res.data);
      }
    } catch (err) {
      console.error('Error fetching empathy history:', err);
    } finally {
      setLoadingEmpathy(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getProfile();
      const data = res.data?.user || res.data;
      setProfile(data);
      
      const userPhotos = data.photos && data.photos.length > 0
        ? data.photos
        : data.profile_photo_url
          ? [data.profile_photo_url, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400']
          : [
              'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
            ];

      setFormData({
        name: data.name || user?.name || 'Ramon',
        displayName: data.displayName || data.name || user?.name || 'Ramon',
        birthDate: data.birthDate || '1992-09-10',
        bio: data.bio || 'Desenvolvedor apaixonado por café, boas conversas e tecnologias que conectam pessoas reais.',
        age: data.age || 32,
        gender: data.gender || 'male',
        social_style: data.social_style || 'extroverted',
        intent_mode: data.intent_mode || 'all',
        looking_for: data.looking_for || 'Amizades & Conversas',
        availability: data.availability || 'Hoje',
        location_city: data.location_city || 'São Paulo',
        location_precision: data.location_precision || 'approximate',
        search_radius: data.search_radius || 10,
        photos: userPhotos,
        interests: data.interests || ['Música', 'Cinema', 'Tecnologia', 'Viagens', 'Gastronomia'],
        personality_tags: data.personality_tags || ['Extrovertido', 'Curioso', 'Empático', 'Criativo'],
        online_status: data.online_status || 'online',
        show_online: data.show_online !== false,
        show_last_active: data.show_last_active || false,
        show_city: data.show_city !== false,
        show_distance: data.show_distance !== false,
        allow_messages: data.allow_messages !== false,
        allow_connections: data.allow_connections !== false,
        discovery_mode: data.status || 'available'
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      const initialProfile = {
        id: user?.id || '',
        name: user?.name || user?.username || 'Usuário',
        email: user?.email || '',
        bio: user?.bio || '',
        profile_photo_url: user?.profile_photo_url || user?.avatar || '',
        photos: user?.photos || [],
        interests: user?.interests || [],
        personality_tags: user?.personality_tags || []
      };
      setProfile(initialProfile);
    } finally {
      setLoading(false);
    }
  };

  // Profile Completeness Gamification Calculation
  const calculateCompleteness = () => {
    let score = 0;
    const checklist = [
      { id: 'photo', label: 'Foto de Perfil', done: formData.photos.length > 0, weight: 15 },
      { id: 'name', label: 'Nome e Idade', done: !!formData.name, weight: 10 },
      { id: 'location', label: 'Localização', done: !!formData.location_city, weight: 15 },
      { id: 'interests', label: 'Interesses (mín. 3)', done: formData.interests.length >= 3, weight: 15 },
      { id: 'bio', label: 'Bio / Sobre Mim', done: !!formData.bio && formData.bio.length > 10, weight: 15 },
      { id: 'min_photos', label: 'Mínimo de 2 Fotos', done: formData.photos.length >= MIN_PHOTOS, weight: 10 },
      { id: 'personality', label: 'Preferências Sociais', done: !!formData.social_style, weight: 10 },
      { id: 'moments', label: 'Criar um Momento', done: moments.length > 0, weight: 10 }
    ];

    checklist.forEach(item => {
      if (item.done) score += item.weight;
    });

    return { percent: score, checklist };
  };

  const { percent: profilePercent, checklist: profileChecklist } = calculateCompleteness();

  // Save Profile Handler
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setPhotoError('');
    setSaveSuccessMsg('');

    if (formData.photos.length < MIN_PHOTOS) {
      setPhotoError(`O Proximous exige o mínimo de ${MIN_PHOTOS} fotos ativas no perfil!`);
      return;
    }

    setSaving(true);
    try {
      await usersAPI.updateProfile(formData);
      setProfile(prev => ({
        ...prev,
        ...formData,
        profile_photo_url: formData.photos[0]
      }));
      if (updateUser) updateUser({ ...user, name: formData.name });
      setSaveSuccessMsg('Perfil atualizado com sucesso!');
      setTimeout(() => {
        setSaveSuccessMsg('');
        setViewMode('profile');
      }, 1200);
    } catch (err) {
      console.error('Error saving profile:', err);
      // Fallback local save update
      setProfile(prev => ({
        ...prev,
        ...formData,
        profile_photo_url: formData.photos[0]
      }));
      setSaveSuccessMsg('Perfil atualizado localmente!');
      setTimeout(() => {
        setSaveSuccessMsg('');
        setViewMode('profile');
      }, 1200);
    } finally {
      setSaving(false);
    }
  };

  // Photo Management (Min 2, Max 8)
  const handleAddPhoto = async () => {
    setPhotoError('');
    if (!newPhotoUrl.trim()) return;

    if (formData.photos.length >= MAX_PHOTOS) {
      setPhotoError(`Você atingiu o limite máximo de ${MAX_PHOTOS} fotos por perfil!`);
      return;
    }

    const photoToAdd = newPhotoUrl.trim();
    const updated = [...formData.photos, photoToAdd];
    setFormData(prev => ({ ...prev, photos: updated }));
    setProfile(prev => prev ? { ...prev, photos: updated, profile_photo_url: updated[0] } : prev);
    setNewPhotoUrl('');

    try {
      await usersAPI.addPhoto(photoToAdd);
    } catch (err) {
      console.warn('Sync add photo notice:', err);
    }
  };

  const handleFileUpload = async (e) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.photos.length >= MAX_PHOTOS) {
      setPhotoError(`Você atingiu o limite máximo de ${MAX_PHOTOS} fotos!`);
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const res = await uploadAPI.uploadPhoto(uploadData);
      const photoUrl = res.data?.photo_url;

      if (photoUrl) {
        const updated = [...formData.photos, photoUrl];
        setFormData(prev => ({ ...prev, photos: updated }));
        setProfile(prev => prev ? { ...prev, photos: updated, profile_photo_url: updated[0] } : prev);
        setShowPhotoModal(false);
        usersAPI.addPhoto(photoUrl).catch(err => console.warn('Sync upload photo notice:', err));
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setPhotoError('Falha no upload da foto. Verifique o formato e tente novamente.');
    }
  };

  const handleSelectPreset = (presetUrl) => {
    setPhotoError('');
    if (formData.photos.length >= MAX_PHOTOS) {
      setPhotoError(`Você atingiu o limite máximo de ${MAX_PHOTOS} fotos!`);
      return;
    }

    const updated = [...formData.photos, presetUrl];
    setFormData(prev => ({ ...prev, photos: updated }));
    setProfile(prev => prev ? { ...prev, photos: updated, profile_photo_url: updated[0] } : prev);
    setShowPhotoModal(false);
    usersAPI.addPhoto(presetUrl).catch(err => console.warn('Sync preset photo notice:', err));
  };

  const handleRemovePhoto = async (photoUrl) => {
    setPhotoError('');
    if (formData.photos.length <= 2) {
      setPhotoError('⚠️ Atenção: É obrigatório manter no mínimo 2 fotos no perfil para continuar ativo e poder curtir/dar match.');
      return;
    }

    const updated = formData.photos.filter(p => p !== photoUrl);
    const newPrimary = updated[0] || '';
    setFormData(prev => ({ ...prev, photos: updated }));
    setProfile(prev => prev ? { ...prev, photos: updated, profile_photo_url: newPrimary } : prev);

    try {
      await usersAPI.deletePhoto(photoUrl);
      await usersAPI.updateProfile({ photos: updated, profile_photo_url: newPrimary });
    } catch (err) {
      console.warn('Sync remove photo notice:', err);
    }
  };

  const handleSetPrimaryPhoto = async (photoUrl) => {
    setPhotoError('');
    const filtered = formData.photos.filter(p => p !== photoUrl);
    const newPhotos = [photoUrl, ...filtered];

    setFormData(prev => ({ ...prev, photos: newPhotos }));
    setProfile(prev => prev ? { ...prev, photos: newPhotos, profile_photo_url: photoUrl } : prev);

    try {
      await usersAPI.updateProfile({
        photos: newPhotos,
        profile_photo_url: photoUrl
      });
      if (updateUser) {
        updateUser({ ...user, profile_photo_url: photoUrl });
      }
    } catch (err) {
      console.error('Error saving primary photo:', err);
      setPhotoError('Erro ao salvar foto principal no servidor.');
    }
  };

  // Interest Selection Helpers
  const toggleInterest = (interestItem) => {
    if (formData.interests.includes(interestItem)) {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.filter(i => i !== interestItem)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interestItem]
      }));
    }
  };

  const handleAddCustomInterest = () => {
    if (customInterestInput.trim() && !formData.interests.includes(customInterestInput.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, customInterestInput.trim()]
      }));
      setCustomInterestInput('');
    }
  };

  // Publish New Moment
  const handlePublishMoment = (e) => {
    e.preventDefault();
    if (!newMoment.content.trim()) return;

    setPublishingMoment(true);
    const created = {
      id: Date.now(),
      content: newMoment.content,
      likes: 0,
      created_at: 'Agora mesmo',
      photo: newMoment.photo || null,
      visibility: newMoment.visibility,
      mood: newMoment.mood
    };

    setMoments([created, ...moments]);
    setNewMoment({ content: '', photo: '', visibility: 'Pessoas próximas', mood: '😊 Inspirado' });
    setPublishingMoment(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const currentPhotos = formData.photos || [];
  const hasMinPhotos = currentPhotos.length >= MIN_PHOTOS;

  // Render Interest Chips based on Category & Search
  const getFilteredInterestSuggestions = () => {
    let list = [];
    if (selectedInterestCategory === 'all') {
      INTEREST_CATEGORIES.forEach(cat => {
        if (cat.items) list.push(...cat.items);
      });
    } else {
      const cat = INTEREST_CATEGORIES.find(c => c.id === selectedInterestCategory);
      if (cat && cat.items) list = cat.items;
    }

    if (interestSearch.trim()) {
      list = list.filter(item => item.toLowerCase().includes(interestSearch.toLowerCase()));
    }

    return Array.from(new Set(list));
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      
      {/* PREVIEW BANNER FLOATING BAR */}

      {viewMode === 'preview' && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-3 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <Eye className="h-5 w-5 text-amber-300 animate-pulse" />
            <span>Modo de Visualização: É assim que outras pessoas veem seu perfil</span>
          </div>
          <Button
            onClick={() => setViewMode('profile')}
            className="bg-white text-purple-700 hover:bg-purple-50 text-xs font-extrabold rounded-full px-4 shadow-md"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao Meu Perfil
          </Button>
        </div>
      )}

      {/* VIEW MODE 1 & 3: MEU PERFIL / VISUALIZAR COMO VISITANTE */}
      {(viewMode === 'profile' || viewMode === 'preview') && (
        <div>
          {/* Hero Cover Banner */}
          <div className="relative h-64 sm:h-80 w-full bg-gradient-to-r from-purple-900 via-pink-950 to-indigo-950 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
            
            {/* Top Floating Actions (Owner Only) */}
            {viewMode === 'profile' && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <Button
                  onClick={() => setShowPhotoModal(true)}
                  className="rounded-2xl luxury-glass text-foreground hover:bg-accent border border-border/80 shadow-lg font-extrabold text-xs px-3.5"
                >
                  <Camera className="h-4 w-4 mr-1.5 text-pink-400" />
                  + Adicionar Fotos
                </Button>

                <Button
                  onClick={() => setViewMode('preview')}
                  variant="outline"
                  className="rounded-2xl luxury-glass text-foreground hover:bg-accent border border-border/80 shadow-lg font-bold text-xs px-3.5 hidden sm:inline-flex"
                >
                  <Eye className="h-4 w-4 mr-1.5 text-purple-400" />
                  Visualizar como Visitante
                </Button>

                <Button
                  onClick={() => setViewMode('edit')}
                  className="rounded-2xl proximous-button-primary shadow-xl font-black text-xs px-4"
                >
                  <Edit3 className="h-4 w-4 mr-1.5" />
                  Editar Perfil
                </Button>
              </div>
            )}

          </div>

          {/* Main Profile Container */}
          <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-20">
            
            {/* Warning Banner if user has < 2 photos */}
            {viewMode === 'profile' && !hasMinPhotos && (
              <Alert className="mb-6 bg-gradient-to-r from-amber-500/90 to-amber-600/90 text-white border border-amber-400/40 rounded-3xl shadow-xl flex items-center justify-between p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-200 animate-pulse flex-shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-sm">Perfil Incompleto (Mínimo 2 Fotos Exigido)</h4>
                    <p className="text-xs text-amber-100 font-medium">
                      Adicione pelo menos 2 fotos para que outras pessoas próximas possam descobrir seu perfil no Proximous.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setViewMode('edit')}
                  className="bg-white text-amber-900 hover:bg-amber-100 text-xs font-black rounded-xl shadow-md flex-shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Foto
                </Button>
              </Alert>
            )}

            {/* Profile Header Card */}
            <Card className="luxury-glass-card border border-border/80 shadow-2xl rounded-3xl mb-6 relative overflow-visible">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-6 border-b border-border/60">
                  
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                    {/* Profile Avatar with Glowing Ring */}
                    <div className="relative -mt-24 sm:-mt-28 z-10">
                      <div 
                        onClick={() => viewMode === 'profile' && setShowPhotoModal(true)}
                        className={`w-32 h-32 md:w-36 md:h-36 rounded-3xl ring-4 ring-purple-500/40 shadow-2xl overflow-hidden bg-card relative group ${viewMode === 'profile' ? 'cursor-pointer' : ''}`}
                      >
                        <img
                          src={currentPhotos[0] || profile?.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                          alt={profile?.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {viewMode === 'profile' && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black gap-1">
                            <Camera className="h-4 w-4" />
                            Alterar Foto
                          </div>
                        )}
                      </div>

                      {/* Online Status Badge */}
                      <div className="absolute bottom-1 right-1">
                        <button
                          onClick={() => viewMode === 'profile' && setStatusDropdownOpen(!statusDropdownOpen)}
                          className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border border-border/80 shadow-lg backdrop-blur-md ${
                            formData.online_status === 'online' ? 'bg-emerald-500/90 text-white' :
                            formData.online_status === 'away' ? 'bg-amber-500/90 text-white' : 'bg-slate-600/90 text-white'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          {formData.online_status === 'online' ? 'Online' :
                           formData.online_status === 'away' ? 'Ausente' : 'Invisível'}
                        </button>

                        {/* Status Change Selector Menu */}
                        {statusDropdownOpen && viewMode === 'profile' && (
                          <div className="absolute top-full right-0 mt-2 w-40 luxury-glass-card rounded-2xl shadow-2xl border border-border/80 py-2 z-30 text-xs">
                            <button
                              onClick={() => { setFormData(prev => ({ ...prev, online_status: 'online' })); setStatusDropdownOpen(false); }}
                              className="w-full px-3.5 py-2 text-left hover:bg-accent flex items-center gap-2 font-bold text-foreground"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                              🟢 Online
                            </button>
                            <button
                              onClick={() => { setFormData(prev => ({ ...prev, online_status: 'away' })); setStatusDropdownOpen(false); }}
                              className="w-full px-3.5 py-2 text-left hover:bg-accent flex items-center gap-2 font-bold text-foreground"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                              🟡 Ausente
                            </button>
                            <button
                              onClick={() => { setFormData(prev => ({ ...prev, online_status: 'invisible' })); setStatusDropdownOpen(false); }}
                              className="w-full px-3.5 py-2 text-left hover:bg-accent flex items-center gap-2 font-bold text-foreground"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                              ⚫ Invisível
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name, Age, Location & Tags */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                          {formData.displayName || formData.name || profile?.name}, {formData.age || profile?.age}
                        </h1>
                        <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-black border-0 shadow-md text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-black">
                          <Sparkles className="h-3 w-3 fill-black" />
                          VIP
                        </Badge>
                      </div>

                      {/* Location & Precision Badge */}
                      <p className="text-muted-foreground text-xs sm:text-sm flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                        <MapPin className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span className="font-bold text-foreground">{formData.location_city || 'São Paulo'}</span>
                        <span>•</span>
                        <span className="text-purple-400 font-extrabold">
                          🎉 {formData.social_style === 'extroverted' ? 'Extrovertido(a)' :
                              formData.social_style === 'introverted' ? 'Introvertido(a)' :
                              formData.social_style === 'ambiverted' ? 'Ambivertido(a)' : 'Tímido(a)'}
                        </span>
                        
                        <Badge variant="outline" className="text-[10px] font-extrabold text-purple-400 border-purple-500/20 bg-purple-500/10 rounded-lg ml-1">
                          📍 {formData.location_precision === 'approximate' ? '~500m aproximado' :
                              formData.location_precision === 'exact' ? 'Localização Exata' : 'Apenas Cidade'}
                        </Badge>
                      </p>

                      {/* Photo Requisite Badge */}
                      <div className="pt-1 flex items-center justify-center md:justify-start">
                        <Badge className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                          hasMinPhotos ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'
                        }`}>
                          {hasMinPhotos ? `✓ ${currentPhotos.length}/${MAX_PHOTOS} Fotos completas` : `⚠️ ${currentPhotos.length}/${MAX_PHOTOS} Fotos (Mínimo de 2)`}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* EMPATHY POINTS GAMIFICATION CARD */}
                  <div 
                    onClick={() => {
                      setShowEmpathyModal(true);
                      fetchEmpathyHistory();
                    }}
                    className="cursor-pointer luxury-glass-card border border-purple-500/30 p-4 rounded-3xl flex items-center gap-4 hover:shadow-purple-500/10 transition-all group w-full md:w-auto"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Award className="h-6 w-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Pontos de Empatia</p>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          +{empathyData?.weekly_points ?? 0} esta semana
                        </Badge>
                      </div>
                      <p className="text-2xl font-black luxury-gradient-text">
                        💜 {empathyData?.total_points || profile?.empathy_points || 340} pts
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 mt-0.5">
                        <Info className="h-3 w-3 text-purple-400" />
                        Ver extrato de empatia
                      </p>
                    </div>
                  </div>
                </div>

                {/* PROFILE PROGRESS GAMIFICATION BAR (Owner Only) */}
                {viewMode === 'profile' && (
                  <div className="mt-6 bg-card/60 border border-border/60 p-4.5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-purple-400" />
                        <span className="text-xs font-black text-foreground">
                          Seu perfil está <span className="text-purple-400 font-extrabold">{profilePercent}%</span> completo
                        </span>
                      </div>
                      <button 
                        onClick={() => setShowProgressModal(!showProgressModal)}
                        className="text-xs text-purple-400 font-bold hover:underline flex items-center gap-1"
                      >
                        {showProgressModal ? 'Ocultar requisitos' : 'Ver checklist'}
                        <ChevronRight className={`h-4 w-4 transition-transform ${showProgressModal ? 'rotate-90' : ''}`} />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-accent/60 h-2.5 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${profilePercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 rounded-full"
                      />
                    </div>

                    <p className="text-[11px] text-muted-foreground font-medium">
                      Complete todas as etapas para destacar seu perfil na lista de recomendações do Proximous.
                    </p>

                    {/* Expanded Progress Checklist */}
                    {showProgressModal && (
                      <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {profileChecklist.map(item => (
                          <div 
                            key={item.id}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                              item.done 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-card border-border/60 text-muted-foreground'
                            }`}
                          >
                            {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                            <span className="font-bold text-[11px] truncate">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TABS NAVIGATION */}
                <div className="pt-6">
                  <div className="flex border-b border-border/60 gap-4 sm:gap-8 overflow-x-auto scrollbar-none mb-6">
                    {[
                      { id: 'overview', label: 'Visão Geral', icon: User },
                      { id: 'gallery', label: `Galeria (${currentPhotos.length}/${MAX_PHOTOS})`, icon: Camera },
                      { id: 'moments', label: `Momentos (${moments.length})`, icon: ImageIcon },
                      { id: 'achievements', label: 'Conquistas', icon: Award }
                    ].map(tab => {
                      const IconComp = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveProfileTab(tab.id)}
                          className={`pb-3 text-xs sm:text-sm font-black transition-all whitespace-nowrap flex items-center gap-2 relative ${
                            activeProfileTab === tab.id
                              ? 'text-purple-400 border-b-2 border-purple-400'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* TAB 1: VISÃO GERAL */}
                  {activeProfileTab === 'overview' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      
                      {/* Bio Card */}
                      <div className="luxury-glass-card p-5 rounded-3xl border border-border/80">
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <User className="h-4 w-4 text-purple-400" />
                          Sobre Mim
                        </h3>
                        <p className="text-foreground text-sm sm:text-base leading-relaxed font-medium">
                          "{formData.bio || 'Sem biografia informada.'}"
                        </p>
                      </div>

                      {/* Interests Chips */}
                      <div className="luxury-glass-card p-5 rounded-3xl border border-border/80">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-pink-400" />
                            Meus Interesses ({formData.interests.length})
                          </h3>
                          {viewMode === 'profile' && (
                            <button
                              onClick={() => setViewMode('edit')}
                              className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Gerenciar
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {formData.interests.length > 0 ? (
                            formData.interests.map((interest, idx) => (
                              <Badge
                                key={idx}
                                className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                              >
                                <span>✨ {interest}</span>
                              </Badge>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">Nenhum interesse adicionado ainda.</p>
                          )}
                        </div>
                      </div>

                      {/* Preferências Sociais Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="luxury-glass-card p-4 rounded-2xl border border-border/80">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Personalidade</p>
                          <p className="text-sm font-black text-foreground mt-1 flex items-center gap-1.5">
                            🎉 {formData.social_style === 'extroverted' ? 'Extrovertido(a)' :
                                formData.social_style === 'introverted' ? 'Introvertido(a)' :
                                formData.social_style === 'ambiverted' ? 'Ambivertido(a)' : 'Tímido(a)'}
                          </p>
                        </div>

                        <div className="luxury-glass-card p-4 rounded-2xl border border-border/80">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">O que procuro</p>
                          <p className="text-sm font-black text-foreground mt-1 flex items-center gap-1.5">
                            🤝 {formData.looking_for}
                          </p>
                        </div>

                        <div className="luxury-glass-card p-4 rounded-2xl border border-border/80">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Disponibilidade</p>
                          <p className="text-sm font-black text-foreground mt-1 flex items-center gap-1.5">
                            ⚡ {formData.availability}
                          </p>
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* TAB 2: GALERIA DE FOTOS */}
                  {activeProfileTab === 'gallery' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-black text-foreground">
                            Galeria do Perfil ({currentPhotos.length}/{MAX_PHOTOS} Fotos)
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            A primeira foto é utilizada como sua imagem principal no Discover.
                          </p>
                        </div>
                        {viewMode === 'profile' && currentPhotos.length < MAX_PHOTOS && (
                          <Button
                            onClick={() => setShowPhotoModal(true)}
                            className="proximous-button-primary text-xs font-bold py-2 rounded-xl"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar Foto
                          </Button>
                        )}
                      </div>

                      {photoError && (
                        <Alert className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-2xl p-3 text-xs font-bold flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                          <span>{photoError}</span>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                        {currentPhotos.map((photoUrl, idx) => (
                          <div key={idx} className="relative group rounded-3xl overflow-hidden aspect-[3/4] bg-card border border-border/80 shadow-md">
                            <img src={photoUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            
                            {idx === 0 && (
                              <Badge className="absolute top-2.5 left-2.5 bg-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-md">
                                Principal
                              </Badge>
                            )}

                            {viewMode === 'profile' && (
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                                {idx !== 0 && (
                                  <Button
                                    onClick={() => handleSetPrimaryPhoto(photoUrl)}
                                    size="sm"
                                    className="bg-white text-purple-900 hover:bg-white/90 text-[10px] font-black rounded-xl w-full py-1"
                                  >
                                    Tornar Principal
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleRemovePhoto(photoUrl)}
                                  size="sm"
                                  variant="destructive"
                                  className="text-[10px] font-black rounded-xl w-full py-1"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Excluir
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: MOMENTOS */}
                  {activeProfileTab === 'moments' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      
                      {/* Publisher Widget */}
                      {viewMode === 'profile' && (
                        <Card className="luxury-glass-card border border-border/80 rounded-3xl shadow-sm">
                          <CardContent className="p-5 space-y-3">
                            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-purple-400" />
                              Criar Novo Momento
                            </h4>
                            <form onSubmit={handlePublishMoment} className="space-y-3">
                              <textarea
                                value={newMoment.content}
                                onChange={(e) => setNewMoment({ ...newMoment, content: e.target.value })}
                                placeholder="Compartilhe um momento do seu dia..."
                                rows={2}
                                className="w-full p-3 rounded-2xl bg-card border border-border/80 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              />

                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <select
                                  value={newMoment.visibility}
                                  onChange={(e) => setNewMoment({ ...newMoment, visibility: e.target.value })}
                                  className="text-xs bg-card border border-border/80 rounded-xl p-2 font-bold text-foreground"
                                >
                                  <option value="Pessoas próximas">👥 Pessoas próximas</option>
                                  <option value="Meus contatos">💬 Meus contatos</option>
                                  <option value="Todos">🌐 Todos</option>
                                  <option value="Somente eu">🔒 Somente eu</option>
                                </select>

                                <Button
                                  type="submit"
                                  disabled={!newMoment.content.trim() || publishingMoment}
                                  className="proximous-button-primary rounded-xl text-xs font-black px-4 py-2"
                                >
                                  Publicar Momento
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      )}

                      {/* Moments Timeline */}
                      <div className="space-y-4">
                        {moments.map(moment => (
                          <Card key={moment.id} className="luxury-glass-card border border-border/80 rounded-3xl overflow-hidden shadow-sm">
                            <CardContent className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={currentPhotos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-2xl object-cover ring-2 ring-purple-500/40"
                                  />
                                  <div>
                                    <p className="text-xs font-black text-foreground">{formData.displayName || formData.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{moment.created_at} • {moment.visibility}</p>
                                  </div>
                                </div>
                                {moment.mood && (
                                  <Badge className="bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">
                                    {moment.mood}
                                  </Badge>
                                )}
                              </div>

                              <p className="text-xs sm:text-sm text-foreground leading-relaxed mb-3 font-medium">
                                {moment.content}
                              </p>

                              {moment.photo && (
                                <div className="rounded-2xl overflow-hidden mb-3 max-h-80 bg-black">
                                  <img src={moment.photo} alt="Momento" className="w-full h-full object-cover" />
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40 font-bold">
                                <span className="flex items-center gap-1 text-pink-400">
                                  <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
                                  {moment.likes} curtidas
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: CONQUISTAS */}
                  {activeProfileTab === 'achievements' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { title: 'Primeiro Passo', desc: 'Criou seu perfil no Proximous', icon: Sparkles, unlocked: true },
                        { title: 'Empático VIP', desc: 'Alcançou 300+ pontos de empatia', icon: Heart, unlocked: true },
                        { title: 'Explorador Urbano', desc: 'Conectou em 3 bairros diferentes', icon: MapPin, unlocked: true },
                        { title: 'Social Butterfly', desc: '10 conversas iniciadas', icon: MessageCircle, unlocked: false }
                      ].map((badge, idx) => {
                        const IconComponent = badge.icon;
                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-3xl border text-center flex flex-col items-center justify-center gap-2 ${
                              badge.unlocked 
                                ? 'luxury-glass-card border-purple-500/30 text-foreground' 
                                : 'bg-card/40 border-border/40 opacity-50 text-muted-foreground'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${badge.unlocked ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-accent text-muted-foreground'}`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <h4 className="text-xs font-black text-foreground mt-1">{badge.title}</h4>
                            <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: EDITAR PERFIL (CENTRAL EM CARTÕES LUXUOSOS) */}

      {viewMode === 'edit' && (
        <div>
          {/* Sticky Header */}
          <div className="sticky top-0 z-40 luxury-glass border-b border-border/80 px-4 sm:px-6 py-3.5 shadow-xl mb-6">
            <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
              
              {/* Left: Back Icon Button + Title */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setViewMode('profile')}
                  className="w-10 h-10 rounded-2xl bg-card border border-border/80 hover:bg-accent text-foreground transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
                  title="Voltar ao Meu Perfil"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-foreground whitespace-nowrap">
                      Editar Perfil VIP
                    </h2>
                    <Badge className="bg-purple-500/10 text-purple-400 text-[10px] font-black border border-purple-500/20 hidden sm:inline-flex">
                      Central de Edição
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium whitespace-nowrap truncate">
                    Personalize como outras pessoas veem você no Proximous
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 whitespace-nowrap ml-auto sm:ml-0">
                <Button
                  onClick={() => setViewMode('preview')}
                  variant="outline"
                  className="rounded-2xl text-xs font-bold border-border/80 bg-card text-foreground hover:bg-accent shadow-sm whitespace-nowrap px-3.5 py-2"
                >
                  <Eye className="h-4 w-4 text-purple-400 mr-1.5 flex-shrink-0" />
                  <span>Visualizar Visitante</span>
                </Button>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="proximous-button-primary rounded-2xl text-xs font-black px-5 py-2 shadow-lg transition-all whitespace-nowrap"
                >
                  {saving ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <RefreshCw className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>

            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 pb-8">

          {saveSuccessMsg && (
            <Alert className="mb-6 bg-emerald-500 text-white border-0 rounded-2xl shadow-lg font-bold text-xs p-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {saveSuccessMsg}
            </Alert>
          )}

          {/* EDIT CENTRAL CARDS */}
          <div className="space-y-6">

            {/* CARD 0: GERENCIAMENTO DE FOTOS */}
            <Card className="luxury-glass-card border border-purple-500/30 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-foreground">Sua Galeria & Fotos de Perfil</h3>
                      <p className="text-xs text-muted-foreground">Adicione e reordene suas fotos ({currentPhotos.length}/{MAX_PHOTOS} adicionadas, mínimo de 2 exigidas).</p>
                    </div>
                  </div>

                  {currentPhotos.length < MAX_PHOTOS && (
                    <Button
                      onClick={() => setShowPhotoModal(true)}
                      className="proximous-button-primary rounded-2xl text-xs font-black px-4 py-2.5 flex items-center gap-1.5 shadow-lg"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Foto
                    </Button>
                  )}
                </div>

                {photoError && (
                  <Alert className="mb-4 bg-red-500/15 border border-red-500/30 text-red-400 rounded-2xl p-3 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{photoError}</span>
                  </Alert>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                  {currentPhotos.map((photoUrl, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-[3/4] bg-card border border-border/80 shadow-md">
                      <img src={photoUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {idx === 0 && (
                        <Badge className="absolute top-2.5 left-2.5 bg-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-md">
                          Principal
                        </Badge>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        {idx !== 0 && (
                          <Button
                            onClick={() => handleSetPrimaryPhoto(photoUrl)}
                            size="sm"
                            className="bg-white text-purple-900 hover:bg-white/90 text-[10px] font-black rounded-xl w-full py-1"
                          >
                            Tornar Principal
                          </Button>
                        )}
                        <Button
                          onClick={() => handleRemovePhoto(photoUrl)}
                          size="sm"
                          variant="destructive"
                          className="text-[10px] font-black rounded-xl w-full py-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}

                  {currentPhotos.length < MAX_PHOTOS && (
                    <button
                      onClick={() => setShowPhotoModal(true)}
                      className="border-2 border-dashed border-purple-500/40 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/10 rounded-2xl aspect-[3/4] flex flex-col items-center justify-center gap-2 text-purple-400 font-extrabold text-xs transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="h-5 w-5 text-purple-400" />
                      </div>
                      <span>Adicionar Foto</span>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CARD 1: INFORMAÇÕES PESSOAIS */}
            <Card className="luxury-glass-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden">

              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground">Perfil & Informações Pessoais</h3>
                    <p className="text-xs text-muted-foreground">Configure seu nome, bio e foto principal de exibição.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Nome Completo</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome"
                      className="rounded-2xl text-xs bg-card border-border/80 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Nome de Exibição</label>
                    <Input
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="Como deseja ser chamado"
                      className="rounded-2xl text-xs bg-card border-border/80 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Idade</label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                      className="rounded-2xl text-xs bg-card border-border/80 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Cidade</label>
                    <Input
                      value={formData.location_city}
                      onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                      className="rounded-2xl text-xs bg-card border-border/80 text-foreground"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-foreground block mb-1">Biografia (Sobre Mim)</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      placeholder="Conte um pouco sobre você..."
                      className="w-full p-3.5 rounded-2xl bg-card border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: INTERESSES & PERSONALIDADE */}
            <Card className="luxury-glass-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center font-bold">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground">Interesses & Perfil Social</h3>
                    <p className="text-xs text-muted-foreground">Seus interesses alimentam o algoritmo de afinidade do Proximous.</p>
                  </div>
                </div>

                {/* Selected Interests List */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-foreground block mb-2">
                    Interesses Selecionados ({formData.interests.length})
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-card/60 border border-border/80 rounded-2xl min-h-[50px]">
                    {formData.interests.map((interest, idx) => (
                      <Badge
                        key={idx}
                        className="bg-purple-600 text-white px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm"
                      >
                        <span>{interest}</span>
                        <X
                          onClick={() => toggleInterest(interest)}
                          className="h-3.5 w-3.5 cursor-pointer hover:text-red-200"
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Categories & Search */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        value={interestSearch}
                        onChange={(e) => setInterestSearch(e.target.value)}
                        placeholder="Buscar interesse..."
                        className="pl-9 rounded-2xl text-xs bg-card border-border/80 text-foreground"
                      />
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {INTEREST_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedInterestCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                          selectedInterestCategory === cat.id
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Suggestions Chips Grid */}
                  <div className="flex flex-wrap gap-2 p-3 bg-card/40 rounded-2xl max-h-48 overflow-y-auto border border-border/60">
                    {getFilteredInterestSuggestions().map((suggestion, idx) => {
                      const isSelected = formData.interests.includes(suggestion);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleInterest(suggestion)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-card text-foreground border border-border/80 hover:border-purple-500/50'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {suggestion}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Social Style & Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/60">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Modo de Intenção Principal</label>
                    <select
                      value={formData.intent_mode || 'all'}
                      onChange={(e) => setFormData({ ...formData, intent_mode: e.target.value })}
                      className="w-full p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-xs font-black text-purple-400"
                    >
                      <option value="all" className="bg-card text-foreground">✨ Todos os Modos</option>
                      <option value="romance" className="bg-card text-foreground">❤️ Romance / Paquera</option>
                      <option value="friendship" className="bg-card text-foreground">🤝 Amizade & Conexões</option>
                      <option value="networking" className="bg-card text-foreground">💼 Networking Profissional</option>
                      <option value="sports" className="bg-card text-foreground">🏃 Esportes & Atividades</option>
                      <option value="games" className="bg-card text-foreground">🎮 Games & Hobbies</option>
                      <option value="social" className="bg-card text-foreground">🍻 Social & Eventos</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Personalidade</label>
                    <select
                      value={formData.social_style}
                      onChange={(e) => setFormData({ ...formData, social_style: e.target.value })}
                      className="w-full p-2.5 bg-card border border-border/80 rounded-2xl text-xs font-bold text-foreground"
                    >
                      <option value="extroverted" className="bg-card text-foreground">🎉 Extrovertido(a)</option>
                      <option value="introverted" className="bg-card text-foreground">🤔 Introvertido(a)</option>
                      <option value="ambiverted" className="bg-card text-foreground">⚖️ Ambivertido(a)</option>
                      <option value="shy" className="bg-card text-foreground">😊 Tímido(a)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">O que procuro</label>
                    <select
                      value={formData.looking_for}
                      onChange={(e) => setFormData({ ...formData, looking_for: e.target.value })}
                      className="w-full p-2.5 bg-card border border-border/80 rounded-2xl text-xs font-bold text-foreground"
                    >
                      <option value="Amizades" className="bg-card text-foreground">🤝 Amizades</option>
                      <option value="Networking" className="bg-card text-foreground">💼 Networking</option>
                      <option value="Conversas" className="bg-card text-foreground">💬 Conversas</option>
                      <option value="Eventos" className="bg-card text-foreground">🎉 Eventos</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Disponibilidade</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full p-2.5 bg-card border border-border/80 rounded-2xl text-xs font-bold text-foreground"
                    >
                      <option value="Agora" className="bg-card text-foreground">⚡ Agora</option>
                      <option value="Hoje" className="bg-card text-foreground">📅 Hoje</option>
                      <option value="Esta semana" className="bg-card text-foreground">🗓️ Esta semana</option>
                      <option value="Não informar" className="bg-card text-foreground">🔒 Não informar</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 3: LOCALIZAÇÃO & PRIVACIDADE DE RAIO */}
            <Card className="luxury-glass-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground">Localização & Raio de Descoberta</h3>
                    <p className="text-xs text-muted-foreground">Controle o nível de precisão da sua localização para sua segurança.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Precision Selector */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-2">Exibição da Localização</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'approximate', title: 'Área aproximada (~500m)', desc: 'Recomendado para segurança' },
                        { id: 'exact', title: 'Localização Exata', desc: 'Para encontros imediatos' },
                        { id: 'city', title: 'Apenas Cidade', desc: 'Exibe apenas o nome da cidade' }
                      ].map(item => (
                        <div
                          key={item.id}
                          onClick={() => setFormData({ ...formData, location_precision: item.id })}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            formData.location_precision === item.id
                              ? 'bg-purple-500/10 border-purple-500 text-purple-400 font-extrabold shadow-sm'
                              : 'bg-card border-border/80 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <p className="text-xs font-black">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discovery Radius Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-foreground">Raio Máximo de Descoberta</label>
                      <span className="text-xs font-black text-purple-400">{formData.search_radius} km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={formData.search_radius}
                      onChange={(e) => setFormData({ ...formData, search_radius: parseInt(e.target.value) })}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-bold">
                      <span>1 km</span>
                      <span>10 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 4: PRIVACIDADE DE CONEXÕES */}
            <Card className="luxury-glass-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground">Privacidade & Visibilidade</h3>
                    <p className="text-xs text-muted-foreground">Defina quem pode interagir e ver suas atividades no app.</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { key: 'show_online', label: 'Mostrar quando estou online' },
                    { key: 'show_city', label: 'Mostrar minha cidade no perfil público' },
                    { key: 'allow_messages', label: 'Permitir novas mensagens diretas' },
                    { key: 'allow_connections', label: 'Permitir solicitações de conexão por afinidade' }
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between p-3.5 bg-card/60 border border-border/80 rounded-2xl">
                      <span className="font-bold text-foreground">{setting.label}</span>
                      <input
                        type="checkbox"
                        checked={formData[setting.key]}
                        onChange={(e) => setFormData({ ...formData, [setting.key]: e.target.checked })}
                        className="w-4 h-4 accent-purple-600 cursor-pointer rounded"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    )}


      {/* MODAL 1: EXTRATO DE PONTOS DE EMPATIA */}
      <AnimatePresence>
        {showEmpathyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setShowEmpathyModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Pontos de Empatia</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-purple-600 font-bold">
                      💜 {empathyData?.total_points || profile?.empathy_points || 340} pontos acumulados
                    </p>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      +{empathyData?.weekly_points ?? 0} 7 dias
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-4 text-xs font-bold">
                <button
                  onClick={() => setEmpathyModalTab('transactions')}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    empathyModalTab === 'transactions'
                      ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  Extrato de Pontos
                </button>
                <button
                  onClick={() => setEmpathyModalTab('rules')}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    empathyModalTab === 'rules'
                      ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Como Pontuar
                </button>
              </div>

              {/* Tab 1: Extrato de Transações */}
              {empathyModalTab === 'transactions' && (
                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 text-xs max-h-[320px]">
                  {loadingEmpathy ? (
                    <div className="py-8 text-center text-slate-400 font-medium">Carregando extrato...</div>
                  ) : empathyData?.transactions && empathyData.transactions.length > 0 ? (
                    empathyData.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/50"
                      >
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{tx.description}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tx.created_at ? new Date(tx.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recente'}
                          </p>
                        </div>
                        <span className="font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg text-xs whitespace-nowrap">
                          +{tx.points} pts
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-slate-800 dark:text-slate-200">Pontuação Inicial do Perfil</p>
                          <p className="text-[10px] text-purple-400 mt-0.5">Bônus de Boas-vindas ao Proximous</p>
                        </div>
                        <span className="font-black text-purple-400 bg-purple-500/20 px-2 py-1 rounded-lg text-xs whitespace-nowrap">
                          +{empathyData?.total_points || profile?.empathy_points || 340} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-center text-slate-400 py-3 leading-relaxed">
                        Publicações no feed, conversas ativas e conquistas geram novos registros neste extrato.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Regras de Pontuação */}
              {empathyModalTab === 'rules' && (
                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 text-xs max-h-[320px]">
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    Os Pontos de Empatia medem o quão autênticas e positivas são suas interações no Proximous.
                  </p>
                  {[
                    { label: 'Publicar um Momento no feed', pts: '+15 pts', desc: 'Compartilhe ideias ou fotos no feed', color: 'text-purple-600' },
                    { label: 'Enviar um Icebreaker em Momento', pts: '+20 pts', desc: 'Inicie uma conversa a partir de um post', color: 'text-pink-600' },
                    { label: 'Desbloquear Conquistas', pts: '+10 pts', desc: 'Por interações e matches concluídos', color: 'text-indigo-600' },
                    { label: 'Interesses & Conexões em comum', pts: '+120 pts', desc: 'Compatibilidade de perfil', color: 'text-emerald-600' },
                    { label: 'Perfil 100% completo', pts: '+40 pts', desc: 'Adicione bio, fotos e tags de estilo', color: 'text-amber-600' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">{item.label}</span>
                        <span className="text-[10px] text-slate-400">{item.desc}</span>
                      </div>
                      <span className={`font-black ${item.color} whitespace-nowrap ml-2`}>{item.pts}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setShowEmpathyModal(false)}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs py-3"
              >
                Fechar Extrato
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADICIONAR FOTO (UPLOAD / PRESETS / URL) */}
      <AnimatePresence>
        {showPhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative"
            >
              <button
                onClick={() => setShowPhotoModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-600" />
                Adicionar Foto ao Perfil
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Escolha uma foto do seu dispositivo, selecione dos presets ou insira um link.
              </p>

              {/* Source Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 gap-2">
                <button
                  onClick={() => setPhotoSourceTab('upload')}
                  className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    photoSourceTab === 'upload'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Upload do Dispositivo
                </button>

                <button
                  onClick={() => setPhotoSourceTab('presets')}
                  className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    photoSourceTab === 'presets'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  Galeria de Presets
                </button>

                <button
                  onClick={() => setPhotoSourceTab('url')}
                  className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    photoSourceTab === 'url'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  Link URL
                </button>
              </div>

              {/* Tab 1: Device File Upload */}
              {photoSourceTab === 'upload' && (
                <div className="space-y-4">
                  <label className="border-2 border-dashed border-purple-300 dark:border-purple-800 hover:border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      Clique para escolher uma imagem do seu dispositivo
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG ou WEBP</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Tab 2: Presets Grid */}
              {photoSourceTab === 'presets' && (
                <div className="grid grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                  {PHOTO_PRESETS.map((presetUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectPreset(presetUrl)}
                      className="relative rounded-2xl overflow-hidden aspect-square border-2 border-transparent hover:border-purple-600 cursor-pointer group shadow-sm transition-all bg-slate-100"
                    >
                      <img src={presetUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-extrabold">
                        Escolher
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: URL Input */}
              {photoSourceTab === 'url' && (
                <div className="space-y-3">
                  <Input
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    className="rounded-xl text-xs"
                  />
                  <Button
                    onClick={() => { handleAddPhoto(); setShowPhotoModal(false); }}
                    disabled={!newPhotoUrl.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                  >
                    Adicionar Imagem por Link
                  </Button>
                </div>
              )}

              {photoError && (
                <p className="text-xs text-red-600 font-bold mt-3">{photoError}</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
