import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { usersAPI, activitiesAPI, uploadAPI } from '../lib/api';
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
  Activity,
  CheckCircle2,
  Share2,
  Info,
  Clock,
  ArrowRight,
  TrendingUp,
  Radio,
  Users,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const MIN_PHOTOS = 2;
const MAX_PHOTOS = 6;

const INTEREST_PRESETS = [
  { category: 'Música', icon: Music, items: ['Rock', 'MPB', 'Indie', 'Jazz', 'Hip Hop', 'Eletrônica', 'Samba', 'Pop'] },
  { category: 'Gastronomia', icon: Utensils, items: ['Café Especial', 'Vinho', 'Cerveja Artesanal', 'Sushi', 'Hamburguer', 'Vegano'] },
  { category: 'Lazer & Viagem', icon: Plane, items: ['Praia', 'Trilhas', 'Mochilão', 'Camping', 'Cidades Históricas'] },
  { category: 'Cultura & Arte', icon: Film, items: ['Cinema Cult', 'Teatro', 'Fotografia', 'Museus', 'Animes', 'Livros'] },
  { category: 'Saúde & Esportes', icon: Activity, items: ['Beach Tennis', 'Corrida', 'Yoga', 'Academia', 'Futebol', 'Ciclismo'] },
  { category: 'Geek & Tech', icon: Zap, items: ['Games', 'Programação', 'Board Games', 'Inteligência Artificial', 'Design'] }
];

const PERSONALITY_TAGS_OPTIONS = [
  '☕ Apaixonado por café',
  '🎧 Sempre de fone',
  '🐾 Pet lover',
  '🍷 Apreciador de vinhos',
  '📚 Leitor assíduo',
  '🏃 Movido a endorfina',
  '🍕 Rota da pizza',
  '✈️ Próximo destino',
  '🌅 Fã de pôr do sol',
  '🎮 Gamer casual',
  '🎨 Alma criativa',
  '🌿 Conexão com a natureza'
];

export const Profile = () => {
  const { user, updateUser } = useAuth();

  // Profile data & loading states
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [myActivities, setMyActivities] = useState({ created: [], joined: [] });
  const [achievements, setAchievements] = useState([]);
  const [empathyLedger, setEmpathyLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  // View & Tab States
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'photos' | 'activities' | 'achievements'
  const [isVisitorPreview, setIsVisitorPreview] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTab, setEditTab] = useState('photos'); // 'photos' | 'basic' | 'interests' | 'status'
  const [selectedPhotoFullscreen, setSelectedPhotoFullscreen] = useState(null);
  const [showEmpathyModal, setShowEmpathyModal] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    age: 25,
    gender: 'female',
    location_city: 'Salvador',
    social_style: 'flexible',
    interests: [],
    personality_tags: [],
    photos: [],
    current_status_text: '',
    available_until_hours: 4
  });

  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch all live data from real backend endpoints
  const loadFullProfile = async () => {
    try {
      setLoading(true);

      const [profileRes, statsRes, actsRes, achRes, empRes] = await Promise.allSettled([
        usersAPI.getProfile(),
        usersAPI.getStats(),
        activitiesAPI.getMyActivities(),
        usersAPI.getAchievements(),
        usersAPI.getEmpathyHistory()
      ]);

      const prof = profileRes.status === 'fulfilled' ? profileRes.value.data.user || profileRes.value.data : user;
      setProfileData(prof);

      // Populate Edit Form
      if (prof) {
        setEditForm({
          name: prof.name || '',
          bio: prof.bio || '',
          age: prof.age || 25,
          gender: prof.gender || 'female',
          location_city: prof.location_city || 'Salvador',
          social_style: prof.social_style || 'flexible',
          interests: prof.interests || [],
          personality_tags: prof.personality_tags || [],
          photos: prof.photos || (prof.profile_photo_url ? [prof.profile_photo_url] : []),
          current_status_text: prof.current_status_text || '',
          available_until_hours: 4
        });
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.stats || statsRes.value.data);
      }

      if (actsRes.status === 'fulfilled') {
        const acts = actsRes.value.data;
        setMyActivities({
          created: acts.created_activities || acts.created || [],
          joined: acts.requested_activities || acts.joined || acts.participations || []
        });
      }

      if (achRes.status === 'fulfilled') {
        setAchievements(achRes.value.data.achievements || achRes.value.data.user_achievements || []);
      }

      if (empRes.status === 'fulfilled') {
        setEmpathyLedger(empRes.value.data.transactions || empRes.value.data.history || []);
      }

    } catch (err) {
      console.error('Error loading full profile:', err);
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFullProfile();
  }, []);

  // Upload Real Photo to Cloudinary
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (editForm.photos.length >= MAX_PHOTOS) {
      toast.error(`Você atingiu o limite máximo de ${MAX_PHOTOS} fotos!`);
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('photo', file);

      const res = await uploadAPI.uploadPhoto(formData);
      const photoUrl = res.data?.photo_url || res.data?.url;

      if (!photoUrl) {
        throw new Error('URL não retornada pelo servidor');
      }

      const updatedPhotos = [...editForm.photos, photoUrl];
      setEditForm(prev => ({ ...prev, photos: updatedPhotos }));

      // Auto-save photos to user profile in backend
      await usersAPI.updateProfile({
        photos: updatedPhotos,
        profile_photo_url: updatedPhotos[0]
      });

      setProfileData(prev => ({
        ...prev,
        photos: updatedPhotos,
        profile_photo_url: updatedPhotos[0]
      }));

      if (updateUser) {
        updateUser({
          ...user,
          photos: updatedPhotos,
          profile_photo_url: updatedPhotos[0],
          has_required_photos: updatedPhotos.length >= 2
        });
      }

      toast.success('Foto enviada e adicionada com sucesso!');
    } catch (err) {
      console.error('Error uploading photo:', err);
      toast.error('Erro ao enviar foto. Tente novamente.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Set Primary Photo
  const handleSetPrimaryPhoto = async (photoUrl) => {
    const remaining = editForm.photos.filter(p => p !== photoUrl);
    const reordered = [photoUrl, ...remaining];

    setEditForm(prev => ({ ...prev, photos: reordered }));
    try {
      await usersAPI.updateProfile({
        photos: reordered,
        profile_photo_url: photoUrl
      });
      setProfileData(prev => ({
        ...prev,
        photos: reordered,
        profile_photo_url: photoUrl
      }));
      if (updateUser) {
        updateUser({
          ...user,
          photos: reordered,
          profile_photo_url: photoUrl
        });
      }
      toast.success('Foto principal atualizada!');
    } catch (err) {
      toast.error('Erro ao reordenar fotos');
    }
  };

  // Remove Photo with 2-photos rule
  const handleRemovePhoto = async (photoUrl) => {
    if (editForm.photos.length <= MIN_PHOTOS) {
      toast.error(`⚠️ É obrigatório manter no mínimo ${MIN_PHOTOS} fotos ativas no perfil para continuar ativo!`);
      return;
    }

    const updated = editForm.photos.filter(p => p !== photoUrl);
    const newPrimary = updated[0] || '';

    setEditForm(prev => ({ ...prev, photos: updated }));
    try {
      await usersAPI.deletePhoto(photoUrl);
      await usersAPI.updateProfile({
        photos: updated,
        profile_photo_url: newPrimary
      });
      setProfileData(prev => ({
        ...prev,
        photos: updated,
        profile_photo_url: newPrimary
      }));
      if (updateUser) {
        updateUser({
          ...user,
          photos: updated,
          profile_photo_url: newPrimary,
          has_required_photos: updated.length >= 2
        });
      }
      toast.success('Foto removida com sucesso!');
    } catch (err) {
      toast.error('Erro ao remover foto');
    }
  };

  // Toggle Interest Tag
  const handleToggleInterest = (item) => {
    setEditForm(prev => {
      const exists = prev.interests.includes(item);
      const updated = exists 
        ? prev.interests.filter(i => i !== item)
        : [...prev.interests, item];
      return { ...prev, interests: updated.slice(0, 15) };
    });
  };

  // Toggle Personality Tag
  const handleTogglePersonalityTag = (tag) => {
    setEditForm(prev => {
      const exists = prev.personality_tags.includes(tag);
      const updated = exists 
        ? prev.personality_tags.filter(t => t !== tag)
        : [...prev.personality_tags, tag];
      return { ...prev, personality_tags: updated.slice(0, 8) };
    });
  };

  // Save Full Profile Edit
  const handleSaveProfile = async () => {
    if (editForm.photos.length < MIN_PHOTOS) {
      toast.error(`Você precisa de no mínimo ${MIN_PHOTOS} fotos para salvar seu perfil.`);
      return;
    }

    try {
      setSavingEdit(true);

      const payload = {
        name: editForm.name.trim(),
        bio: editForm.bio.trim(),
        age: parseInt(editForm.age) || 25,
        gender: editForm.gender,
        location_city: editForm.location_city.trim(),
        social_style: editForm.social_style,
        interests: editForm.interests,
        personality_tags: editForm.personality_tags,
        photos: editForm.photos,
        profile_photo_url: editForm.photos[0]
      };

      const res = await usersAPI.updateProfile(payload);
      const updatedUser = res.data?.user || payload;

      // Update live status if provided
      if (editForm.current_status_text) {
        await usersAPI.setAvailability({
          status_text: editForm.current_status_text,
          hours: editForm.available_until_hours || 4
        });
        updatedUser.current_status_text = editForm.current_status_text;
      }

      setProfileData(prev => ({ ...prev, ...updatedUser }));
      if (updateUser) {
        updateUser({ ...user, ...updatedUser, has_required_photos: true });
      }

      setIsEditModalOpen(false);
      toast.success('✨ Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Erro ao salvar dados do perfil.');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-pink-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-zinc-400">Carregando seu perfil VIP...</p>
        </div>
      </div>
    );
  }

  const currentProf = profileData || user || {};
  const currentPhotos = currentProf.photos?.length ? currentProf.photos : (currentProf.profile_photo_url ? [currentProf.profile_photo_url] : []);
  const primaryPhoto = currentPhotos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';

  // Calculate Profile Completeness
  let completenessScore = 30;
  if (currentPhotos.length >= 2) completenessScore += 25;
  if (currentPhotos.length >= 4) completenessScore += 10;
  if (currentProf.bio && currentProf.bio.length > 20) completenessScore += 15;
  if (currentProf.interests?.length >= 3) completenessScore += 10;
  if (currentProf.personality_tags?.length >= 2) completenessScore += 10;
  completenessScore = Math.min(100, completenessScore);

  return (
    <div className="min-h-screen bg-[#070512] text-white pb-24 relative overflow-x-hidden selection:bg-pink-500 selection:text-white">
      
      {/* Background Ambient Aura Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-purple-600/20 via-pink-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-0 w-[500px] h-[500px] bg-purple-900/15 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-6">

        {/* 1. TOP HERO BANNER & HEADER CARD */}
        <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-gradient-to-b from-[#181133]/90 via-[#100B24]/90 to-[#0B071A]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          
          {/* Cover Art Ambient Glow */}
          <div className="h-40 sm:h-52 w-full relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-950 to-pink-950">
            <img 
              src={primaryPhoto} 
              alt="Capa" 
              className="w-full h-full object-cover opacity-25 filter blur-sm scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#100B24] via-transparent to-black/40" />

            {/* Preview Mode Switcher & Edit Button */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVisitorPreview(!isVisitorPreview)}
                className={`h-9 px-3.5 rounded-full text-xs font-black backdrop-blur-md transition-all border ${
                  isVisitorPreview 
                    ? 'bg-pink-500 text-white border-pink-400 shadow-[0_0_20px_rgba(255,43,104,0.6)]' 
                    : 'bg-black/50 text-zinc-200 border-white/15 hover:bg-black/70 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                {isVisitorPreview ? 'Modo Visitante Ativo' : 'Visualizar como Visitante'}
              </Button>

              <Button
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="h-9 px-4 rounded-full bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] text-white font-black text-xs shadow-lg hover:opacity-95 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Editar Perfil
              </Button>
            </div>
          </div>

          {/* Profile Header Details Row */}
          <div className="px-5 sm:px-8 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-20">
              
              {/* Profile Avatar with Glowing Ring */}
              <div className="relative group shrink-0">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-[#FF2B68] via-[#9B20F0] to-[#35E38A] shadow-[0_10px_35px_rgba(155,32,240,0.5)]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#0D0A1C] relative">
                    <img 
                      src={primaryPhoto} 
                      alt={currentProf.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Edit Photo Trigger Overlay Button */}
                <button
                  type="button"
                  onClick={() => {
                    setEditTab('photos');
                    setIsEditModalOpen(true);
                  }}
                  className="absolute bottom-1 right-1 p-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-xl border-2 border-[#100B24] transition-transform hover:scale-110"
                  title="Gerenciar Fotos"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Identity & Status */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {currentProf.name || 'Seu Nome'}{currentProf.age ? `, ${currentProf.age}` : ''}
                  </h1>

                  {currentProf.is_verified && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
                    </Badge>
                  )}

                  <Badge className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/40 text-purple-200 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Membro VIP
                  </Badge>
                </div>

                {/* Location & Social Style Chips */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-semibold text-zinc-300">
                  <span className="flex items-center gap-1 text-pink-400 font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                    {currentProf.location_city || 'Salvador, BA'}
                  </span>

                  <span className="w-1 h-1 rounded-full bg-zinc-600 hidden sm:inline" />

                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                    Estilo: {
                      currentProf.social_style === 'introverted' ? '🧘 Introvertido(a)' :
                      currentProf.social_style === 'shy' ? '🌱 Tímido(a)' :
                      currentProf.social_style === 'extroverted' ? '⚡ Extrovertido(a)' : '✨ Flexível'
                    }
                  </span>

                  {currentProf.current_status_text && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {currentProf.current_status_text}
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Profile Completeness Bar */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:w-48 bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${completenessScore}%` }}
                  />
                </div>
                <span className="text-xs font-black text-pink-400">{completenessScore}% Completo</span>
              </div>

              <span className="text-xs text-zinc-400 font-medium">
                {currentPhotos.length >= 2 ? '✅ Requisito de fotos ativo (mín. 2)' : '⚠️ Adicione pelo menos 2 fotos para destravar 100%'}
              </span>
            </div>

          </div>
        </div>

        {/* 2. REAL STATS METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Matches / Connections */}
          <div className="p-4 rounded-2xl bg-[#120B24]/90 border border-white/10 shadow-lg text-center space-y-1">
            <div className="inline-flex p-2 rounded-xl bg-pink-500/15 text-pink-400">
              <Heart className="w-4 h-4" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {stats?.matches || 0}
            </p>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Matches</p>
          </div>

          {/* Empathy Points */}
          <button
            type="button"
            onClick={() => setShowEmpathyModal(true)}
            className="p-4 rounded-2xl bg-[#120B24]/90 border border-purple-500/30 hover:border-purple-400 shadow-lg text-center space-y-1 transition-all group cursor-pointer"
          >
            <div className="inline-flex p-2 rounded-xl bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-300">
              {currentProf.empathy_points || stats?.empathy_points || 0}
            </p>
            <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center justify-center gap-1">
              <span>Empatia</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </button>

          {/* Activities / Rolês */}
          <div className="p-4 rounded-2xl bg-[#120B24]/90 border border-white/10 shadow-lg text-center space-y-1">
            <div className="inline-flex p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {(myActivities.created.length + myActivities.joined.length) || 0}
            </p>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Rolês no Radar</p>
          </div>

          {/* Likes Received */}
          <div className="p-4 rounded-2xl bg-[#120B24]/90 border border-white/10 shadow-lg text-center space-y-1">
            <div className="inline-flex p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {stats?.likes_received || 0}
            </p>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Curtidas</p>
          </div>

        </div>

        {/* 3. NAVIGATION TABS */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'overview', label: 'Visão Geral', icon: User },
              { id: 'photos', label: `Galeria (${currentPhotos.length})`, icon: Camera },
              { id: 'activities', label: `Meus Rolês (${myActivities.created.length})`, icon: Zap },
              { id: 'achievements', label: `Conquistas (${achievements.length})`, icon: Award }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/20'
                      : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. TAB CONTENTS */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Bio Section */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#120B24]/90 border border-white/10 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase text-purple-300 tracking-wider flex items-center gap-2">
                    <Smile className="w-4 h-4 text-pink-400" />
                    <span>Sobre Mim</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTab('basic');
                      setIsEditModalOpen(true);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar
                  </button>
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed font-normal">
                  {currentProf.bio || 'Adicione uma bio para contar aos outros o que você curte fazer, onde gosta de ir e seu estilo de rolê! ✨'}
                </p>
              </div>

              {/* Personality Tags */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#120B24]/90 border border-white/10 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase text-purple-300 tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Vibe & Personalidade</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTab('interests');
                      setIsEditModalOpen(true);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Alterar
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {currentProf.personality_tags && currentProf.personality_tags.length > 0 ? (
                    currentProf.personality_tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-bold shadow-sm"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 italic">Nenhuma tag selecionada ainda.</p>
                  )}
                </div>
              </div>

              {/* Interesses & Hobbies */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#120B24]/90 border border-white/10 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase text-purple-300 tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Interesses & Estilo de Vida</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTab('interests');
                      setIsEditModalOpen(true);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {currentProf.interests && currentProf.interests.length > 0 ? (
                    currentProf.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-pink-950/40 border border-pink-500/30 text-pink-200 text-xs font-bold shadow-sm"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 italic">Nenhum interesse selecionado.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: GALERIA DE FOTOS */}
          {activeTab === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Suas Fotos ({currentPhotos.length}/6)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Obrigatório manter pelo menos 2 fotos ativas no perfil.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto || currentPhotos.length >= MAX_PHOTOS}
                  className="rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-black"
                >
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                  ) : (
                    <Plus className="w-4 h-4 mr-1.5" />
                  )}
                  Adicionar Foto
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>

              {/* Photo Editorial Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {currentPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group bg-[#100B24] shadow-xl"
                  >
                    <img 
                      src={photo} 
                      alt={`Foto ${index + 1}`} 
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                      onClick={() => setSelectedPhotoFullscreen(photo)}
                    />

                    {/* Badge Principal */}
                    {index === 0 && (
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-lg">
                        ⭐ Principal
                      </span>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo)}
                          className="p-2 rounded-full bg-red-600/90 hover:bg-red-700 text-white shadow-lg transition-transform hover:scale-110"
                          title="Remover Foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryPhoto(photo)}
                          className="w-full py-2 rounded-xl bg-purple-600/90 hover:bg-purple-700 text-white text-[11px] font-black shadow-lg"
                        >
                          Tornar Principal
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: MEUS ROLÊS */}
          {activeTab === 'activities' && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Meus Convites & Rolês Criados
                  </h3>
                  <p className="text-xs text-zinc-400">Atividades publicadas por você no radar.</p>
                </div>
              </div>

              {myActivities.created.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {myActivities.created.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-2xl bg-[#120B24]/90 border border-purple-500/25 space-y-2 shadow-xl"
                    >
                      {act.photo_url && (
                        <div className="w-full h-28 rounded-xl overflow-hidden mb-2">
                          <img src={act.photo_url} alt={act.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge className="bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[10px] font-black">
                          {act.category}
                        </Badge>
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          {act.scheduled_time}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">{act.title}</h4>
                      <p className="text-xs text-zinc-300 truncate">{act.location_name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-[#120B24]/50 border border-white/5 text-center space-y-2">
                  <Zap className="w-8 h-8 text-zinc-500 mx-auto" />
                  <p className="text-sm font-bold text-zinc-300">Você ainda não criou nenhum convite ativo.</p>
                  <p className="text-xs text-zinc-500">Crie um rolê pelo botão "Criar Rolê" na Home ou no Modo Agora!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: CONQUISTAS */}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Suas Conquistas & Medalhas ({achievements.length})
                  </h3>
                  <p className="text-xs text-zinc-400">Selos de reputação e empatia desbloqueados.</p>
                </div>
              </div>

              {achievements.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {achievements.map((ach, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-[#120B24] border border-amber-500/25 flex items-center gap-3.5 shadow-xl"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                        {ach.icon || '🏆'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{ach.name || ach.title}</h4>
                        <p className="text-xs text-zinc-400 leading-tight">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-[#120B24]/50 border border-white/5 text-center space-y-2">
                  <Award className="w-8 h-8 text-zinc-500 mx-auto" />
                  <p className="text-sm font-bold text-zinc-300">Conecte-se e interaja para desbloquear suas primeiras conquistas!</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* 5. SLIDE-OVER / MODAL DE EDIÇÃO DO PERFIL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-gradient-to-b from-[#191136] via-[#0F0A24] to-[#070512] border border-purple-500/40 rounded-[32px] shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white overflow-hidden"
            >
              {/* Modal Header (Fixed) */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-[#160E30]/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">Editar Perfil VIP</h2>
                    <p className="text-xs text-zinc-400">Personalize suas fotos, bio e preferências.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-tabs Bar (Fixed) */}
              <div className="px-6 pt-3 pb-2 shrink-0 bg-[#120B28]/60 border-b border-white/5">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0B061A] border border-white/10 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'photos', label: '📸 Fotos' },
                    { id: 'basic', label: '👤 Dados & Bio' },
                    { id: 'interests', label: '🎯 Interesses' },
                    { id: 'status', label: '⚡ Status Radar' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setEditTab(st.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                        editTab === st.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. ABA FOTOS */}
                {editTab === 'photos' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-purple-200 uppercase tracking-wider">
                          Sua Galeria ({editForm.photos.length}/6)
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Mínimo de 2 fotos obrigatórias. Arraste ou clique para gerenciar.
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto || editForm.photos.length >= MAX_PHOTOS}
                        className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-black h-8 shadow-md"
                      >
                        {uploadingPhoto ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 mr-1" />
                        )}
                        Adicionar Foto
                      </Button>
                    </div>

                    {/* 6 Photo Slots Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                      {[0, 1, 2, 3, 4, 5].map((slotIndex) => {
                        const photo = editForm.photos[slotIndex];
                        return (
                          <div
                            key={slotIndex}
                            className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${
                              photo 
                                ? 'border-purple-500/40 bg-[#120B28] shadow-md group' 
                                : slotIndex < 2 
                                  ? 'border-dashed border-pink-500/50 bg-pink-950/10 hover:bg-pink-950/20' 
                                  : 'border-dashed border-white/10 bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            {photo ? (
                              <>
                                <img src={photo} alt={`Slot ${slotIndex + 1}`} className="w-full h-full object-cover" />
                                
                                {/* Slot Badge */}
                                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black shadow-lg backdrop-blur-md ${
                                  slotIndex === 0 
                                    ? 'bg-black/75 text-amber-300 border border-amber-500/40' 
                                    : 'bg-black/75 text-zinc-200 border border-white/10'
                                }`}>
                                  {slotIndex === 0 ? '⭐ Principal' : `Foto ${slotIndex + 1}`}
                                </span>

                                {/* Hover Action Controls */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePhoto(photo)}
                                      className="p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                      title="Remover"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {slotIndex !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimaryPhoto(photo)}
                                      className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black shadow-lg"
                                    >
                                      Tornar Principal
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                                className="w-full h-full flex flex-col items-center justify-center p-3 text-center space-y-1.5 cursor-pointer"
                              >
                                <div className={`p-2 rounded-full ${slotIndex < 2 ? 'bg-pink-500/20 text-pink-300' : 'bg-white/5 text-zinc-400'}`}>
                                  <Camera className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-black text-white">
                                  {slotIndex === 0 ? 'Foto de Rosto' : slotIndex === 1 ? 'Foto de Corpo' : '+ Foto Extra'}
                                </span>
                                <span className={`text-[9px] font-bold uppercase ${slotIndex < 2 ? 'text-pink-400' : 'text-zinc-500'}`}>
                                  {slotIndex < 2 ? 'Obrigatória' : 'Opcional'}
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. ABA DADOS BÁSICOS & BIO */}
                {editTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">Nome de Exibição</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Seu nome"
                          className="w-full p-3 rounded-xl bg-[#120B28] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">Idade</label>
                        <input
                          type="number"
                          value={editForm.age}
                          onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                          min={18}
                          max={99}
                          className="w-full p-3 rounded-xl bg-[#120B28] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Gênero Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Gênero</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'female', label: '👩 Feminino' },
                          { id: 'male', label: '👨 Masculino' },
                          { id: 'non_binary', label: '✨ Não-binário' }
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, gender: g.id })}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                              editForm.gender === g.id
                                ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                                : 'bg-[#120B28] border-white/10 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cidade */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Sua Cidade</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-pink-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={editForm.location_city}
                          onChange={(e) => setEditForm({ ...editForm, location_city: e.target.value })}
                          placeholder="Ex: Salvador, BA"
                          className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#120B28] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Estilo Social */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Estilo Social</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'introverted', label: '🧘 Introvertido', sub: 'Prefere lugares calmos' },
                          { id: 'shy', label: '🌱 Tímido', sub: 'Observador e tranquilo' },
                          { id: 'flexible', label: '✨ Flexível', sub: 'Topa qualquer rolê' },
                          { id: 'extroverted', label: '⚡ Extrovertido', sub: 'Adora fazer amizades' }
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, social_style: st.id })}
                            className={`p-2.5 rounded-xl text-left border transition-all ${
                              editForm.social_style === st.id
                                ? 'bg-purple-950/80 border-purple-400 text-white shadow-md'
                                : 'bg-[#120B28] border-white/10 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <p className="text-xs font-bold">{st.label}</p>
                            <p className="text-[10px] text-zinc-400 truncate">{st.sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-300">Bio / Sobre Você</label>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {editForm.bio.length}/300 caracteres
                        </span>
                      </div>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value.slice(0, 300) })}
                        rows={3}
                        placeholder="Escreva sobre o que você curte fazer, seus lugares favoritos e o tipo de pessoas que quer conhecer..."
                        className="w-full p-3.5 rounded-2xl bg-[#120B28] border border-white/10 text-white text-xs font-normal focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* 3. ABA INTERESSES & PERSONALIDADE */}
                {editTab === 'interests' && (
                  <div className="space-y-5">
                    {/* Tags de Personalidade */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-purple-300 uppercase tracking-wider">
                          Tags de Personalidade ({editForm.personality_tags.length}/8)
                        </label>
                        <span className="text-[10px] text-zinc-400">Toque para selecionar</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {PERSONALITY_TAGS_OPTIONS.map((tag) => {
                          const active = editForm.personality_tags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleTogglePersonalityTag(tag)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                active
                                  ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                                  : 'bg-[#120B28] border-white/10 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interesses por Categoria */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-pink-300 uppercase tracking-wider">
                          Interesses & Hobbies ({editForm.interests.length}/15)
                        </label>
                        <span className="text-[10px] text-zinc-400">Selecione seus favoritos</span>
                      </div>

                      <div className="space-y-3.5">
                        {INTEREST_PRESETS.map((cat, idx) => (
                          <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-[#120B28]/60 border border-white/5">
                            <p className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                              <cat.icon className="w-3.5 h-3.5 text-pink-400" />
                              <span>{cat.category}</span>
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.items.map((item) => {
                                const active = editForm.interests.includes(item);
                                return (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => handleToggleInterest(item)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                      active
                                        ? 'bg-pink-600 border-pink-400 text-white shadow-sm'
                                        : 'bg-[#0B071A] border-white/10 text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    {item}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ABA STATUS NO RADAR */}
                {editTab === 'status' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                      <p className="text-xs font-black text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Status ao Vivo no Radar</span>
                      </p>
                      <p className="text-xs text-zinc-300">
                        Seu status aparece destacado para as pessoas próximas a você no mapa e no radar.
                      </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-300">Sugestões Rápidas</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          '☕ Tomando um café',
                          '🍸 Drinks pós-trabalho',
                          '🎾 Beach Tennis / Treino',
                          '⚡ Livre para conversar',
                          '🍕 Rota da Pizza',
                          '💻 No coworking / Focado'
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, current_status_text: preset })}
                            className="p-2 rounded-xl bg-[#120B28] border border-white/10 hover:border-purple-500/50 text-left text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Status Personalizado</label>
                      <input
                        type="text"
                        value={editForm.current_status_text}
                        onChange={(e) => setEditForm({ ...editForm, current_status_text: e.target.value })}
                        placeholder="Ex: Passeando com o pet no parque 🐶"
                        className="w-full p-3 rounded-xl bg-[#120B28] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Tempo de Ativação do Status</label>
                      <select
                        value={editForm.available_until_hours}
                        onChange={(e) => setEditForm({ ...editForm, available_until_hours: parseInt(e.target.value) })}
                        className="w-full p-3 rounded-xl bg-[#120B28] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-purple-500"
                      >
                        <option value={2}>Ativo pelas próximas 2 horas</option>
                        <option value={4}>Ativo pelas próximas 4 horas</option>
                        <option value={8}>Ativo pelas próximas 8 horas</option>
                        <option value={24}>Ativo até amanhã</option>
                      </select>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Sticky Footer (Always Visible) */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 shrink-0 bg-[#160E30]/90 backdrop-blur-md">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-zinc-400 hover:text-white text-xs font-bold h-10 px-4"
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingEdit || editForm.photos.length < MIN_PHOTOS}
                  className={`h-10 px-6 rounded-xl font-black text-xs shadow-xl transition-all flex items-center gap-2 ${
                    editForm.photos.length >= MIN_PHOTOS
                      ? 'bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] text-white hover:opacity-95 shadow-pink-500/25 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  {savingEdit ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Salvar Perfil</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. FULLSCREEN PHOTO LIGHTBOX */}
      <AnimatePresence>
        {selectedPhotoFullscreen && (
          <div 
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedPhotoFullscreen(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedPhotoFullscreen(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedPhotoFullscreen} 
              alt="Ampliada" 
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" 
            />
          </div>
        )}
      </AnimatePresence>

      {/* 7. EMPATHY POINTS LEDGER MODAL */}
      <AnimatePresence>
        {showEmpathyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#120B24] border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-black text-white">Extrato de Empatia</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmpathyModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center py-3 bg-purple-950/40 rounded-2xl border border-purple-500/20 space-y-1">
                <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Saldo de Pontos</p>
                <p className="text-3xl font-black text-amber-400">{currentProf.empathy_points || stats?.empathy_points || 0}</p>
                <p className="text-[11px] text-zinc-400">Ganhe pontos participando de rolês, sendo gentil e completando seu perfil!</p>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <p className="text-xs font-bold text-zinc-400 uppercase">Histórico Recente</p>
                {empathyLedger.length > 0 ? (
                  empathyLedger.map((tx, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{tx.reason || tx.description || 'Interação Positiva'}</p>
                        <p className="text-[10px] text-zinc-500">{new Date(tx.created_at || Date.now()).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <span className="font-black text-emerald-400">+{tx.points} pts</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 italic text-center py-4">Nenhuma transação registrada ainda.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
