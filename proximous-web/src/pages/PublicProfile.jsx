import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Sparkles, 
  MapPin, 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Coffee, 
  Award,
  Zap,
  Radio,
  Send
} from 'lucide-react';
import { usersAPI, matchingAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [complimentModalOpen, setComplimentModalOpen] = useState(false);
  const [complimentText, setComplimentText] = useState('');
  const [sendingCompliment, setSendingCompliment] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const fetchUserProfile = async (id) => {
    try {
      setLoading(true);
      const res = await usersAPI.getUser(id);
      setProfile(res.data.user || res.data);
    } catch (err) {
      console.error('Error fetching public profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendLike = async () => {
    if (!profile || liked) return;
    try {
      await matchingAPI.sendLike({
        receiver_id: profile.id,
        like_type: 'like'
      });
      setLiked(true);
      setActionFeedback('Curtida enviada com sucesso! ❤️');
      setTimeout(() => setActionFeedback(''), 3000);
    } catch (err) {
      console.error('Error sending like:', err);
      setActionFeedback('Erro ao curtir ou você já curtiu hoje.');
      setTimeout(() => setActionFeedback(''), 3000);
    }
  };

  const handleSendCompliment = async (e) => {
    e.preventDefault();
    if (!complimentText.trim() || !profile) return;

    try {
      setSendingCompliment(true);
      await matchingAPI.sendLike({
        receiver_id: profile.id,
        like_type: 'compliment',
        message: complimentText.trim()
      });
      setLiked(true);
      setComplimentModalOpen(false);
      setComplimentText('');
      setActionFeedback('Elogio enviado com sucesso! 💌');
      setTimeout(() => setActionFeedback(''), 3000);
    } catch (err) {
      console.error('Error sending compliment:', err);
      setActionFeedback('Erro ao enviar elogio.');
      setTimeout(() => setActionFeedback(''), 3000);
    } finally {
      setSendingCompliment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070611] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-purple-300 font-bold text-sm">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#070611] text-white p-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
          <Sparkles className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black mb-2">Perfil não encontrado</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          Este usuário pode estar invisível ou desativou a conta temporariamente.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-sm shadow-lg"
        >
          Voltar
        </button>
      </div>
    );
  }

  const photos = profile.photos && profile.photos.length > 0
    ? profile.photos
    : [profile.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'];

  return (
    <div className="min-h-screen bg-[#070611] text-white pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-[#070611]/80 backdrop-blur-xl border-b border-[#30204D] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-2xl bg-[#16112A] border border-[#30204D] text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-extrabold text-base truncate max-w-[200px] text-center">
          {profile.name}
        </h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Feedback Toast */}
      {actionFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold p-4 rounded-2xl text-center shadow-2xl text-sm"
        >
          {actionFeedback}
        </motion.div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Photo Gallery Card */}
        <div className="relative rounded-3xl overflow-hidden border border-[#30204D] bg-[#0D0A1C] shadow-2xl">
          <div className="aspect-[4/5] sm:aspect-square relative overflow-hidden bg-[#16112A]">
            <img
              src={photos[activePhotoIdx]}
              alt={profile.name}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070611] via-transparent to-black/30 pointer-events-none" />

            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {profile.is_available_now && (
                <span className="bg-emerald-500/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> Modo AGORA
                </span>
              )}
              {profile.compatibility_score && (
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" /> {profile.compatibility_score}% Compatível
                </span>
              )}
            </div>

            {/* Photo Navigation Indicators */}
            {photos.length > 1 && (
              <div className="absolute top-4 right-4 flex gap-1.5 bg-black/50 backdrop-blur-md p-1.5 rounded-full">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activePhotoIdx === i ? 'bg-pink-400 scale-125' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Profile Info Overlay at Bottom */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-black drop-shadow-md">
                      {profile.name}{profile.age ? `, ${profile.age}` : ''}
                    </h2>
                    {profile.is_verified && (
                      <CheckCircle2 className="w-6 h-6 text-sky-400 fill-sky-400 drop-shadow" />
                    )}
                  </div>
                  {profile.location_city && (
                    <p className="text-white/80 text-xs font-semibold flex items-center gap-1 mt-1 drop-shadow">
                      <MapPin className="w-3.5 h-3.5 text-pink-400" />
                      {profile.location_city} {profile.distance_formatted ? `• ${profile.distance_formatted}` : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Photo Thumbnails if multiple */}
          {photos.length > 1 && (
            <div className="p-3 bg-[#0D0A1C] border-t border-[#30204D] flex gap-2 overflow-x-auto">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activePhotoIdx === idx ? 'border-pink-500 scale-105 shadow-md' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSendLike}
            disabled={liked}
            className={`py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
              liked
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 cursor-default'
                : 'bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] text-white hover:scale-[1.02] active:scale-95'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-pink-400 text-pink-400' : ''}`} />
            {liked ? 'Curtido ❤️' : 'Curtir Perfil'}
          </button>

          <button
            onClick={() => setComplimentModalOpen(true)}
            className="py-4 rounded-2xl font-black text-sm bg-[#16112A] border border-[#30204D] text-white hover:border-purple-500/50 hover:bg-[#1E1738] transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
            Enviar Elogio
          </button>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <div className="p-6 rounded-3xl bg-[#0D0A1C] border border-[#30204D] space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">
              Sobre mim
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Status / Modo Agora */}
        {profile.current_status_text && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/60 to-pink-950/60 border border-purple-500/30 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-ping" /> Status Atual
            </span>
            <p className="text-white text-sm font-bold">
              "{profile.current_status_text}"
            </p>
          </div>
        )}

        {/* Interests & Personality Tags */}
        <div className="p-6 rounded-3xl bg-[#0D0A1C] border border-[#30204D] space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">
            Interesses & Afinidades
          </h3>
          
          {profile.interests && profile.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#16112A] border border-[#30204D] text-purple-200"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum interesse listado.</p>
          )}

          {profile.personality_tags && profile.personality_tags.length > 0 && (
            <div className="pt-2 border-t border-[#30204D]/60">
              <h4 className="text-[11px] font-bold text-muted-foreground mb-2">Personalidade</h4>
              <div className="flex flex-wrap gap-2">
                {profile.personality_tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-pink-500/10 border border-pink-500/20 text-pink-300"
                  >
                    ✨ {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compliment Modal */}
      {complimentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setComplimentModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0D0A1C] border border-[#30204D] p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Enviar um Elogio Gentil
            </h3>
            <p className="text-xs text-muted-foreground">
              Quebre o gelo com uma mensagem respeitosa e atenciosa para <strong>{profile.name}</strong>.
            </p>

            <form onSubmit={handleSendCompliment} className="space-y-4">
              <textarea
                value={complimentText}
                onChange={e => setComplimentText(e.target.value)}
                rows={3}
                placeholder="Ex: Adorei seus gostos musicais! Que tipo de som você mais ouve ultimamente?"
                className="w-full bg-[#16112A] border border-[#30204D] rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={sendingCompliment || !complimentText.trim()}
                  className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  {sendingCompliment ? 'Enviando...' : 'Enviar Elogio'}
                </button>
                <button
                  type="button"
                  onClick={() => setComplimentModalOpen(false)}
                  className="px-5 py-3.5 rounded-2xl bg-[#16112A] border border-[#30204D] font-bold text-sm text-white/80"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
