import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Image as ImageIcon,
  MapPin,
  X,
  AlertTriangle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usersAPI, uploadAPI } from '@/lib/api';
import { toast } from 'sonner';

export const MandatoryProfilePhotosGuard = ({ children }) => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);
  const fileInputRefExtra = useRef(null);

  const [photos, setPhotos] = useState(user?.photos || (user?.profile_photo_url ? [user.profile_photo_url] : []));
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.location_city || 'Salvador');
  const [socialStyle, setSocialStyle] = useState(user?.social_style || 'flexible');
  
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [saving, setSaving] = useState(false);

  // If not logged in, or admin, or user has at least 2 photos, render children normally
  const isProfileComplete = user?.type === 'admin' || (photos.length >= 2 && user?.photos?.length >= 2);

  if (!isAuthenticated || user?.type === 'admin' || isProfileComplete) {
    return children;
  }

  const handleUploadPhoto = async (file, slotIndex = null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    try {
      setUploadingSlot(slotIndex !== null ? slotIndex : 'extra');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('photo', file);

      const res = await uploadAPI.uploadPhoto(formData);
      const newUrl = res.data.photo_url || res.data.url;

      if (!newUrl) {
        throw new Error('URL da imagem não retornada pelo servidor');
      }

      setPhotos(prev => {
        let updated = [...prev];
        if (slotIndex !== null && slotIndex < updated.length) {
          updated[slotIndex] = newUrl;
        } else if (slotIndex !== null && slotIndex === updated.length) {
          updated.push(newUrl);
        } else {
          updated.push(newUrl);
        }
        return updated.slice(0, 6);
      });

      toast.success('Foto enviada com sucesso!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erro ao enviar foto. Tente novamente.');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveAndActivate = async () => {
    if (photos.length < 2) {
      toast.error('É obrigatório adicionar pelo menos 2 fotos para ativar seu perfil.');
      return;
    }

    try {
      setSaving(true);

      // 1. Update photos in backend
      await usersAPI.updatePhotos(photos);

      // 2. Update basic info if provided
      const profileUpdate = {
        profile_photo_url: photos[0],
        bio: bio.trim() || 'Olá! Estou no Proximous para conhecer pessoas e fazer novas amizades.',
        location_city: city.trim() || 'Salvador',
        social_style: socialStyle,
      };
      await usersAPI.updateProfile(profileUpdate);

      // 3. Update local auth user state
      if (updateUser) {
        updateUser({
          ...user,
          ...profileUpdate,
          photos: photos,
          has_required_photos: true
        });
      }

      toast.success('🎉 Perfil ativado com sucesso! Bem-vindo(a) ao Proximous.');
    } catch (err) {
      console.error('Error activating profile:', err);
      toast.error('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#070611] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Background Glows */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-xl w-full bg-gradient-to-b from-[#16102E] via-[#0E0920] to-[#070512] border border-purple-500/35 rounded-[32px] p-5 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] space-y-6 my-auto text-white"
      >
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/35 text-pink-300 text-xs font-black uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Perfil Incompleto • Bloqueio Ativo</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>Complete seu Perfil</span>
            <Sparkles className="w-6 h-6 text-amber-400" />
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
            Para segurança da comunidade e conexões reais, é <strong className="text-pink-400 font-bold">obrigatório adicionar pelo menos 2 fotos</strong> antes de navegar, curtir pessoas ou marcar rolês.
          </p>
        </div>

        {/* Status Counter Badge */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${photos.length >= 2 ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-xs font-bold text-zinc-200">
              Fotos enviadas: <span className={photos.length >= 2 ? 'text-emerald-400 font-black' : 'text-amber-300 font-black'}>{photos.length} de 2 mínimas</span>
            </span>
          </div>

          {photos.length >= 2 ? (
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Requisito atingido
            </span>
          ) : (
            <span className="text-xs font-extrabold text-amber-300">
              Falta {2 - photos.length} foto{2 - photos.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Photo Upload Slots Grid */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold text-purple-200 uppercase tracking-wider flex items-center justify-between">
            <span>Suas Fotos (Mínimo 2 Obrigatórias)</span>
            <span className="text-[10px] text-zinc-400 font-normal">Máx: 6 fotos</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            {/* Slot 1: Foto Principal de Rosto */}
            <div className="space-y-1">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-purple-500/40 hover:border-pink-500/60 bg-[#120B24] transition-all flex flex-col items-center justify-center group">
                {photos[0] ? (
                  <>
                    <img src={photos[0]} alt="Foto 1" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef1.current?.click()}
                        className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                        title="Trocar Foto"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(0)}
                        className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[9px] font-black text-white">
                      ⭐ Principal
                    </span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef1.current?.click()}
                    disabled={uploadingSlot === 0}
                    className="w-full h-full p-3 flex flex-col items-center justify-center text-center space-y-1.5 hover:bg-purple-900/20 transition-colors"
                  >
                    {uploadingSlot === 0 ? (
                      <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <div className="p-2 rounded-full bg-purple-600/30 text-purple-300">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-black text-white">Foto 1 (Rosto)</span>
                        <span className="text-[9px] text-pink-400 font-bold uppercase">Obrigatória</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef1}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadPhoto(e.target.files?.[0], 0)}
                />
              </div>
            </div>

            {/* Slot 2: Foto de Corpo / Estilo de Vida */}
            <div className="space-y-1">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-purple-500/40 hover:border-pink-500/60 bg-[#120B24] transition-all flex flex-col items-center justify-center group">
                {photos[1] ? (
                  <>
                    <img src={photos[1]} alt="Foto 2" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef2.current?.click()}
                        className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                        title="Trocar Foto"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(1)}
                        className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[9px] font-black text-white">
                      📸 Foto 2
                    </span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef2.current?.click()}
                    disabled={uploadingSlot === 1}
                    className="w-full h-full p-3 flex flex-col items-center justify-center text-center space-y-1.5 hover:bg-purple-900/20 transition-colors"
                  >
                    {uploadingSlot === 1 ? (
                      <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <div className="p-2 rounded-full bg-pink-600/30 text-pink-300">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-black text-white">Foto 2 (Corpo/Rolê)</span>
                        <span className="text-[9px] text-pink-400 font-bold uppercase">Obrigatória</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef2}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadPhoto(e.target.files?.[0], 1)}
                />
              </div>
            </div>

            {/* Slot 3: Foto Extra (Opcional) */}
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-white/10 hover:border-purple-500/40 bg-[#120B24] transition-all flex flex-col items-center justify-center group">
                {photos[2] ? (
                  <>
                    <img src={photos[2]} alt="Foto 3" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(2)}
                        className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRefExtra.current?.click()}
                    disabled={uploadingSlot === 'extra'}
                    className="w-full h-full p-3 flex flex-col items-center justify-center text-center space-y-1 hover:bg-white/5 transition-colors"
                  >
                    {uploadingSlot === 'extra' ? (
                      <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <div className="p-2 rounded-full bg-white/5 text-zinc-400">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-medium text-zinc-300">+ Foto Extra</span>
                        <span className="text-[9px] text-zinc-500">Opcional</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRefExtra}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadPhoto(e.target.files?.[0])}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Bio & City Fields */}
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">Sua Bio / Quem é você?</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ex: Curto café artesanal, trilhas, conversar sobre música e conhecer novos lugares na cidade."
              rows={2}
              className="w-full p-3 rounded-xl bg-[#120B24] border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Sua Cidade</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Salvador"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#120B24] border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Estilo Social</label>
              <select
                value={socialStyle}
                onChange={(e) => setSocialStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#120B24] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="introverted">Introvertido(a)</option>
                <option value="shy">Tímido(a) / Tranquilo(a)</option>
                <option value="flexible">Flexível / Adaptável</option>
                <option value="extroverted">Extrovertido(a)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={handleSaveAndActivate}
            disabled={photos.length < 2 || saving}
            className={`w-full py-4 text-sm font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all ${
              photos.length >= 2 
                ? 'bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] text-white hover:opacity-95 shadow-pink-500/25 cursor-pointer' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : photos.length >= 2 ? (
              <>
                <span>Salvar e Ativar Meu Perfil</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>Adicione pelo menos 2 fotos para continuar ({photos.length}/2)</span>
            )}
          </Button>
        </div>

      </motion.div>
    </div>
  );
};

export default MandatoryProfilePhotosGuard;
