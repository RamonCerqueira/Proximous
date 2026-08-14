import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  MapPin, 
  Sparkles, 
  Image as ImageIcon,
  X,
  Send,
  Lock,
  CheckCircle2,
  RefreshCw,
  Camera,
  Upload,
  Link as LinkIcon,
  Smile,
  Globe,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { momentsAPI } from '../lib/api';
import { EmojiStyle } from 'emoji-picker-react';

const EmojiPicker = React.lazy(() => import('emoji-picker-react'));

const MomentsFeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostPhoto, setNewPostPhoto] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Icebreaker Modal State
  const [selectedIcebreakerMoment, setSelectedIcebreakerMoment] = useState(null);
  const [icebreakerText, setIcebreakerText] = useState('');
  const [sendingIcebreaker, setSendingIcebreaker] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const whatsappEmojis = [
    '😊', '🥰', '😎', '✨', '💖', '☕', '🌿', '📚', '🌅', '🎧', '🎨', '🚴', '🍕', '🌟', '🔥', '💬',
    '❤️', '💕', '💫', '🎉', '🍀', '🌸', '🌞', '🍷', '🏝️', '📸', '🧘‍♀️', '☕', '🍵', '🥐', '🎶', '✌️'
  ];

  const presetPhotos = [
    { label: '☕ Café', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&h=1080&fit=crop' },
    { label: '🌿 Natureza', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&h=1080&fit=crop' },
    { label: '📖 Leitura', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1080&h=1080&fit=crop' },
    { label: '🏙️ Cidade', url: 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?w=1080&h=1080&fit=crop' },
  ];

  const whatsappActivities = [
    { label: '☕ Tomando café', text: '☕ Tomando um bom café...' },
    { label: '📖 Lendo livro', text: '📖 Lendo um bom livro...' },
    { label: '🌿 Na natureza', text: '🌿 Em meio à natureza...' },
    { label: '🎧 Ouvindo música', text: '🎧 Ouvindo minha playlist...' }
  ];



  useEffect(() => {
    fetchMoments();
  }, []);

  const fetchMoments = async () => {
    try {
      setLoading(true);
      const res = await momentsAPI.getMoments();
      setMoments(res.data.moments || []);
    } catch (err) {
      console.warn('Using fallback moments:', err);
      setMoments([
        {
          id: 'm1',
          user_name: 'Mariana Silva',
          user_age: 24,
          user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
          user_city: 'São Paulo',
          user_id: 'user1',
          content: 'Domingo perfeito lendo um bom livro num café calmo. Alguém indica novidades de ficção científica? ☕📚',
          photo_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&h=1080&fit=crop',
          likes_count: 24,
          liked_by_me: false,
          created_at: '2026-08-12T14:00:00Z'
        },
        {
          id: 'm2',
          user_name: 'Lucas Santos',
          user_age: 27,
          user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          user_city: 'São Paulo',
          user_id: 'user2',
          content: 'Trilha matinal no fim de semana para recarregar as energias. Lugares silenciosos são os melhores. 🌿⛰️',
          photo_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&h=1080&fit=crop',
          likes_count: 41,
          liked_by_me: true,
          created_at: '2026-08-12T11:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (id) => {
    try {
      const res = await momentsAPI.toggleLike(id);
      setMoments(prev =>
        prev.map(m => {
          if (m.id === id) {
            return {
              ...m,
              liked_by_me: res.data.liked_by_me,
              likes_count: res.data.likes_count
            };
          }
          return m;
        })
      );
    } catch (err) {
      console.warn('Like toggle notice:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setNewPostPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPresetPhoto = (url) => {
    setPhotoPreview(url);
    setNewPostPhoto(url);
    setShowUrlInput(false);
  };

  const removePhoto = () => {
    setPhotoPreview('');
    setNewPostPhoto('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setPublishing(true);
    try {
      const finalPhoto = photoPreview || newPostPhoto || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&h=1080&fit=crop';
      const res = await momentsAPI.createMoment({
        content: newPostContent.trim(),
        photo_url: finalPhoto
      });
      setMoments([res.data.moment, ...moments]);
      setNewPostContent('');
      setNewPostPhoto('');
      setPhotoPreview('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating moment:', err);
    } finally {
      setPublishing(false);
    }
  };

  const handleOpenIcebreaker = (moment) => {
    setSelectedIcebreakerMoment(moment);
    setIcebreakerText(`Adorei o momento que você postou sobre "${moment.content.slice(0, 30)}..."!`);
  };

  const handleSendIcebreaker = async (e) => {
    e.preventDefault();
    if (!selectedIcebreakerMoment || !icebreakerText.trim()) return;

    setSendingIcebreaker(true);
    try {
      const res = await momentsAPI.sendIcebreaker(
        selectedIcebreakerMoment.id,
        icebreakerText.trim()
      );
      setSelectedIcebreakerMoment(null);
      navigate('/messages', { state: { selectedUserId: res.data.conversation_id } });
    } catch (err) {
      console.error('Error sending icebreaker:', err);
    } finally {
      setSendingIcebreaker(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight luxury-gradient-text">
              Feed de Momentos
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Compartilhe fotos e pensamentos sem a pressão de comentários públicos.
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="proximous-button-primary text-xs px-4 py-2.5 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Momento</span>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
            <p className="text-xs font-bold text-muted-foreground">Carregando momentos...</p>
          </div>
        )}

        {/* Moments Stream */}
        {!loading && (
          <div className="space-y-6">
            {moments.map((moment) => (
              <Card key={moment.id} className="luxury-glass-card border border-border/80 rounded-3xl overflow-hidden shadow-xl">
                {/* Moment Author Header */}
                <div className="p-4 flex items-center justify-between border-b border-border/40">
                  <div 
                    onClick={() => navigate('/discover', { state: { targetUserId: moment.user_id } })}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={moment.user_avatar || user?.profile_photo_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'}
                      alt={moment.user_name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500 transition-all"
                    />
                    <div>
                      <h3 className="font-extrabold text-foreground text-sm group-hover:text-purple-400 transition-colors">
                        {moment.user_name}, {moment.user_age || 25}
                      </h3>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-purple-400" />
                        {moment.user_city || 'São Paulo'}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400 bg-purple-500/10 font-bold">
                    {moment.created_at ? new Date(moment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recente'}
                  </Badge>
                </div>

                {/* 1:1 Aspect Ratio Photo */}
                {moment.photo_url && (
                  <div className="w-full aspect-square bg-black/90 overflow-hidden relative">
                    <img
                      src={moment.photo_url}
                      alt="Momento"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Moment Content Text */}
                <CardContent className="p-4 space-y-3">
                  <p className="text-foreground text-xs sm:text-sm leading-relaxed font-normal">
                    {moment.content}
                  </p>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => handleToggleLike(moment.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 sm:px-3.5 py-1.5 rounded-xl transition-all ${
                          moment.liked_by_me
                            ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                            : 'bg-card/70 text-muted-foreground hover:bg-pink-500/10 hover:text-pink-400 border border-border/40'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${moment.liked_by_me ? 'fill-pink-500 text-pink-500' : ''}`} />
                        <span>{moment.likes_count || 0}</span>
                      </button>

                      <button
                        onClick={() => handleOpenIcebreaker(moment)}
                        className="flex items-center gap-1.5 text-xs font-extrabold bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/30 px-3 sm:px-4 py-1.5 rounded-xl shadow-sm transition-all"
                      >
                        <MessageCircle className="h-4 w-4 text-purple-400" />
                        <span>Puxar Assunto 💬</span>
                      </button>
                    </div>

                    <button className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ICEBREAKER DIALOG MODAL */}
      <AnimatePresence>
        {selectedIcebreakerMoment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="luxury-glass-card rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 border border-border/80"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-400" />
                  <h3 className="font-extrabold text-foreground text-base">
                    Puxar Assunto com {selectedIcebreakerMoment.user_name}
                  </h3>
                </div>
                <button onClick={() => setSelectedIcebreakerMoment(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-xs text-purple-300">
                <span className="font-extrabold block text-[10px] uppercase tracking-wider text-purple-400 mb-1">
                  💬 Sobre o post de {selectedIcebreakerMoment.user_name}:
                </span>
                <p className="italic text-foreground font-medium">"{selectedIcebreakerMoment.content}"</p>
              </div>

              <form onSubmit={handleSendIcebreaker} className="space-y-4">
                <div>
                  <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-1">
                    Sua mensagem privada
                  </label>
                  <textarea
                    rows={3}
                    value={icebreakerText}
                    onChange={e => setIcebreakerText(e.target.value)}
                    className="w-full rounded-2xl bg-card border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                    placeholder="Escreva como gostaria de iniciar essa conversa..."
                    required
                  />
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span>Sua mensagem irá direto para o Chat Privado! (+20 Pts)</span>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={sendingIcebreaker}
                    className="w-full proximous-button-primary rounded-2xl py-3 flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sendingIcebreaker ? 'Enviando...' : 'Enviar no Chat Privado'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE MOMENT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="luxury-glass-card rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden border border-border/80"
            >
              {/* Top Modal Navigation Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full proximous-gradient flex items-center justify-center text-white font-bold text-xs">
                    ✨
                  </div>
                  <h3 className="font-extrabold text-foreground text-base">
                    Criar Publicação
                  </h3>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Author Profile Info Header */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={user?.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                  alt={user?.name || 'Seu Perfil'}
                  className="w-10 h-10 rounded-full object-cover border border-purple-500/30"
                />
                <div>
                  <h4 className="font-bold text-foreground text-xs sm:text-sm">
                    {user?.name || 'Você'}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 w-fit mt-0.5">
                    <Lock className="h-2.5 w-2.5" />
                    <span>Sem comentários públicos</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="relative border border-border focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/30 rounded-2xl p-3 bg-card/60 transition-all">
                  <textarea
                    rows={4}
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    maxLength={300}
                    placeholder="No que você está pensando? Compartilhe seu momento..."
                    className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground resize-none"
                    required
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-1.5 rounded-full transition-all flex items-center gap-1 text-xs font-semibold ${
                          showEmojiPicker 
                            ? 'bg-purple-500/20 text-purple-400 shadow-sm' 
                            : 'text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10'
                        }`}
                        title="Emojis"
                      >
                        <Smile className="h-4 w-4 text-purple-400" />
                        <span>Emojis</span>
                      </button>
                    </div>

                    <span className="text-[10px] text-muted-foreground font-medium">
                      {newPostContent.length}/300
                    </span>
                  </div>

                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.98 }}
                        className="mt-2 z-30"
                      >
                        <div className="flex items-center justify-between pb-1 px-1">
                          <span className="text-[11px] font-bold text-muted-foreground">Selecione um emoji:</span>
                          <button 
                            type="button"
                            onClick={() => setShowEmojiPicker(false)}
                            className="text-xs font-bold text-muted-foreground hover:text-foreground"
                          >
                            Fechar ✕
                          </button>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
                          <React.Suspense fallback={
                            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground font-medium">
                              Carregando seletor de emojis...
                            </div>
                          }>
                            <EmojiPicker
                              onEmojiClick={(emojiData) => setNewPostContent(prev => prev + emojiData.emoji)}
                              autoFocusSearch={false}
                              theme="auto"
                              emojiStyle={EmojiStyle.APPLE}
                              searchPlaceHolder="Buscar emoji..."
                              width="100%"
                              height={320}
                              lazyLoadEmojis={true}
                              previewConfig={{ showPreview: false }}
                              skinTonesDisabled={true}
                            />
                          </React.Suspense>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Image Upload Preview Container */}
                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-square max-h-56 w-full bg-black border border-border group">
                    <img 
                      src={photoPreview} 
                      alt="Prévia do Momento" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                      Formato 1:1 Quadrado
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30 text-xs font-bold transition-all"
                      >
                        <Camera className="h-4 w-4 text-purple-400" />
                        <span>Carregar Foto</span>
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="flex items-center justify-center gap-2 p-3 bg-card hover:bg-accent text-foreground rounded-2xl border border-border text-xs font-bold transition-all"
                      >
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Link de Imagem</span>
                      </button>
                    </div>

                    {showUrlInput && (
                      <div className="mt-2">
                        <Input
                          value={newPostPhoto}
                          onChange={e => {
                            setNewPostPhoto(e.target.value);
                            setPhotoPreview(e.target.value);
                          }}
                          placeholder="Cole a URL da foto (https://...)"
                          className="rounded-2xl border-border text-xs bg-card text-foreground"
                        />
                      </div>
                    )}

                    <div className="mt-3">
                      <span className="text-[11px] text-muted-foreground font-bold block mb-1">
                        Ou escolha uma foto temática:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {presetPhotos.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => selectPresetPhoto(preset.url)}
                            className="p-1.5 bg-card border border-border hover:border-purple-500 rounded-xl text-[11px] font-semibold text-foreground transition-all text-center truncate shadow-sm"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-purple-500/10 rounded-2xl text-[11px] text-purple-300 flex items-start gap-2 border border-purple-500/20">
                  <Lock className="h-4 w-4 flex-shrink-0 text-purple-400 mt-0.5" />
                  <span>
                    <strong>Feed Protegido:</strong> Os usuários interagem somente via curtida discreta ou mensagem privada.
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={publishing || !newPostContent.trim()}
                    className="w-full proximous-button-primary rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="h-4 w-4" />
                    {publishing ? 'Publicando...' : 'Publicar Momento (+15 Pts de Empatia)'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MomentsFeed;


