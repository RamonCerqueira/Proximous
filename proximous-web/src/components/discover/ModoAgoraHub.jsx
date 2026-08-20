import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Plus, 
  MapPin, 
  Sparkles, 
  Radio, 
  Zap, 
  Trash2,
  Users,
  MessageCircle,
  UserCheck,
  UserX,
  UserPlus,
  Settings,
  PartyPopper,
  Navigation,
  Power,
  Info,
  Hourglass
} from 'lucide-react';
import { activitiesAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SponsoredAdSlot from '@/components/SponsoredAdSlot';

const QUICK_PRESETS = [
  { id: 'coffee', label: 'Café & Conversa ☕', text: 'Tomar um café agora' },
  { id: 'drinks', label: 'Drinks & Bar 🍻', text: 'Drinks pós-trabalho' },
  { id: 'sport', label: 'Corrida / Trilha 🏃', text: 'Treino no parque' },
  { id: 'cinema', label: 'Cinema 🍿', text: 'Pegar um cinema hoje' },
  { id: 'food', label: 'Jantar & Papo 🍕', text: 'Comer algo gostoso' },
];

const ModoAgoraHub = ({
  availableUsers = [],
  activitiesList = [],
  loadingActivities = false,
  radius = 25,
  onOpenAvailabilityModal,
  onOpenCreateActivityModal,
  onDeactivateRadar,
  onSwipeUser,
  onJoinActivity,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCreatedActivities, setMyCreatedActivities] = useState([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const defaultUserCity = user?.city || user?.location_name || 'Sua Região';

  useEffect(() => {
    fetchMyActivities();
  }, [activitiesList]);

  const fetchMyActivities = async () => {
    try {
      const res = await activitiesAPI.getMyActivities();
      // Backend returns { created_activities, requested_activities } or legacy { activities }
      const created = res.data.created_activities || res.data.activities || [];
      setMyCreatedActivities(created);
    } catch (err) {
      console.warn('Error fetching my activities:', err);
    }
  };

  const handleCancelActivity = async (activityId) => {
    try {
      await activitiesAPI.deleteActivity(activityId);
      setMyCreatedActivities(prev => prev.filter(a => a.id !== activityId));
      triggerFeedback('Convite cancelado com sucesso.');
    } catch (err) {
      console.error('Error cancelling activity:', err);
    }
  };

  const handleApproveCandidate = async (activityId, candidateUserId) => {
    try {
      await activitiesAPI.approveParticipant(activityId, candidateUserId);
      fetchMyActivities();
      triggerFeedback('Candidato(a) aprovado(a)! Chat liberado para conversarem.');
    } catch (err) {
      console.error('Error approving candidate:', err);
    }
  };

  const handleRejectCandidate = async (activityId, candidateUserId) => {
    try {
      await activitiesAPI.rejectParticipant(activityId, candidateUserId);
      fetchMyActivities();
      triggerFeedback('Solicitação recusada.');
    } catch (err) {
      console.error('Error rejecting candidate:', err);
    }
  };

  const handleConnectUser = async (userId) => {
    await onSwipeUser('right', userId);
    triggerFeedback('Solicitação enviada! Aguarde a pessoa aceitar.');
  };

  const handleJoinClick = async (actId) => {
    await onJoinActivity(actId);
    triggerFeedback('Solicitação enviada ao criador do convite! Aguarde ele(a) aceitar para liberar o chat.');
  };

  const handleOpenChat = (participantUserId) => {
    navigate('/messages', { state: { targetUserId: participantUserId } });
  };

  const triggerFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const filteredActivities = activitiesList.filter(act => {
    if (selectedCategoryTab === 'all') return true;
    return act.category === selectedCategoryTab;
  });

  const isUserAvailable = user?.is_available_now;

  return (
    <div className="space-y-8 text-white relative">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#16122B] text-white px-6 py-3.5 rounded-2xl font-extrabold text-xs shadow-2xl flex items-center gap-3 border border-purple-500/40"
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>{feedbackMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔮 RADAR HERO CARD (LIVE RADAR VISUALIZER & STATUS) */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-b from-[#18122B]/90 via-[#0F0C1B]/95 to-[#070611] backdrop-blur-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(155,32,240,0.18)]">
        
        {/* Glow ambient spots inside card */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar inside Radar Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
          
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className={`absolute inline-flex h-3 w-3 rounded-full ${isUserAvailable ? 'bg-emerald-400 animate-ping opacity-75' : 'bg-purple-400'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isUserAvailable ? 'bg-emerald-500 shadow-[0_0_12px_#10B981]' : 'bg-purple-500'}`} />
            </div>

            <span className="text-xs font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>{isUserAvailable ? 'Seu Sinal Está Ativo no Radar' : 'Radar em Espera (Inativo)'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/10 border border-purple-500/30 text-purple-300 font-extrabold text-[11px] px-3 py-1 rounded-full flex items-center gap-1">
              <Navigation className="h-3 w-3 text-purple-400" />
              Raio: {radius} km
            </Badge>

            {isUserAvailable && (
              <button
                onClick={onDeactivateRadar}
                className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 font-extrabold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                title="Desativar Visibilidade no Radar"
              >
                <Power className="h-3.5 w-3.5" />
                <span>Desativar Radar</span>
              </button>
            )}

            <button
              onClick={onOpenAvailabilityModal}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Settings className="h-3.5 w-3.5 text-purple-400" />
              <span>Configurar</span>
            </button>
          </div>
        </div>

        {/* Center Interactive Animated Radar Visual Graphic */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-2">
          
          {/* Radar Sonar Animation Display */}
          <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
            <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-[ping_3s_linear_infinite] opacity-30" />
            <div className="absolute inset-3 rounded-full border border-emerald-500/20 animate-[ping_4s_linear_infinite] opacity-20" />
            <div className="absolute inset-8 rounded-full border border-purple-500/40" />
            <div className="absolute inset-16 rounded-full border border-emerald-400/40" />
            
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(53,227,138,0.3)_360deg)] animate-[spin_4s_linear_infinite] origin-center rounded-full" />
            </div>

            {/* User Center Node Avatar */}
            <div className="relative z-10 p-1 bg-gradient-to-tr from-purple-600 to-emerald-400 rounded-full shadow-[0_0_25px_rgba(53,227,138,0.6)]">
              <img
                src={user?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Voce')}&background=9B20F0&color=fff`}
                alt={user?.name || 'Você'}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Voce')}&background=9B20F0&color=fff`;
                }}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#070611]"
              />
              {isUserAvailable && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                  <Zap className="h-3.5 w-3.5 fill-white" />
                </div>
              )}
            </div>

            {/* Satellite pulsing dots simulating active users near */}
            {availableUsers.slice(0, 3).map((u, i) => (
              <div 
                key={u.id || i}
                className={`absolute w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#35E38A] animate-pulse`}
                style={{
                  top: i === 0 ? '15%' : i === 1 ? '70%' : '35%',
                  left: i === 0 ? '75%' : i === 1 ? '20%' : '85%',
                }}
              />
            ))}
          </div>

          {/* Text & Quick Mood Action Controls */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center md:justify-start gap-1 mb-1">
                <Sparkles className="h-3.5 w-3.5" /> Encontros e Rolês Espontâneos
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                O que você topa fazer agora?
              </h2>
              <p className="text-xs text-purple-200/70 font-medium mt-1">
                {isUserAvailable && user?.current_status_text 
                  ? `Seu status no radar: "${user.current_status_text}" (Pessoas a até ${radius}km podem te ver)`
                  : 'Ative sua presença para aparecer no radar de pessoas próximas a você.'}
              </p>
            </div>

            {/* Quick Preset Chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={onOpenAvailabilityModal}
                  className="bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 text-purple-100 font-extrabold text-xs px-3.5 py-2 rounded-2xl transition-all active:scale-95 shadow-sm"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Main Primary Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={onOpenAvailabilityModal}
                className="w-full sm:w-auto flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-[0_0_25px_rgba(53,227,138,0.4)] text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Radio className="h-4 w-4 animate-pulse text-slate-950" />
                <span>{isUserAvailable ? 'Editar Presença no Radar ⚡' : 'Ativar Presença no Radar ⚡'}</span>
              </button>

              {isUserAvailable ? (
                <button
                  onClick={onDeactivateRadar}
                  className="w-full sm:w-auto flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-black py-3.5 px-6 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Power className="h-4 w-4 text-red-400" />
                  <span>Desativar Radar</span>
                </button>
              ) : (
                <button
                  onClick={onOpenCreateActivityModal}
                  className="w-full sm:w-auto flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-90 text-white font-black py-3.5 px-6 rounded-2xl shadow-[0_0_25px_rgba(212,20,168,0.4)] text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4 text-white" />
                  <span>Criar Convite Espontâneo</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* 📢 SPONSORED AD BANNER SLOT AT RADAR HUB */}
      <SponsoredAdSlot slotId="radar_mid" type="banner" />

      {/* 💡 FLUXO DE SEGURANÇA E APROVAÇÃO (EXPLICATIVO) */}
      <div className="bg-white/5 border border-purple-500/20 rounded-3xl p-4 sm:p-5 backdrop-blur-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-300">
          <Info className="h-4 w-4 text-purple-400" />
          <span>Fluxo Seguro com Aprovação Prévia</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
            <span className="text-emerald-400 font-black text-xs flex items-center gap-1">
              1. 🙋‍♂️ Envio da Solicitação
            </span>
            <p className="text-[11px] text-purple-200/70">
              Ao clicar em <strong>"Quero Ir!"</strong> ou <strong>"Conectar"</strong>, uma solicitação pendente é enviada ao criador do convite.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
            <span className="text-amber-400 font-black text-xs flex items-center gap-1">
              2. ⏳ Avaliação pelo Criador
            </span>
            <p className="text-[11px] text-purple-200/70">
              O criador do convite analisa quem solicitou e clica em <strong>"Aceitar ✓"</strong> para autorizar a presença.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
            <span className="text-purple-400 font-black text-xs flex items-center gap-1">
              3. 💬 Liberação do Chat Privado
            </span>
            <p className="text-[11px] text-purple-200/70">
              <strong>Somente após o criador aceitar</strong> a solicitação, o Chat Privado é liberado entre vocês!
            </p>
          </div>
        </div>
      </div>

      {/* 📋 GERENCIADOR DO CRIADOR: MEUS CONVITES & CANDIDATURAS */}
      {myCreatedActivities.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-400" />
              <span>Seus Convites Ativos - Pedidos para Aceitar ({myCreatedActivities.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCreatedActivities.map((myAct) => (
              <div 
                key={myAct.id} 
                className="bg-[#120E24]/90 border border-purple-500/30 p-5 rounded-3xl space-y-4 shadow-xl backdrop-blur-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase mb-1">
                      {myAct.category}
                    </Badge>
                    <h4 className="font-extrabold text-base text-white">{myAct.title}</h4>
                    <p className="text-xs text-purple-200/70 font-medium flex items-center gap-2 mt-1">
                      <span>📍 {myAct.location_name || defaultUserCity}</span>
                      <span>🕒 {myAct.scheduled_time || 'Hoje'}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleCancelActivity(myAct.id)}
                    className="text-xs font-extrabold border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl h-8 px-3 flex items-center gap-1 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Cancelar Convite
                  </button>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="text-xs font-extrabold text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-emerald-400" />
                      Pessoas Solicitando Entrada:
                    </span>
                    <span className="text-[10px] text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/40 font-black">
                      {myAct.participant_count || 0}/{myAct.max_participants || 2} Aceitos
                    </span>
                  </p>

                  {myAct.participants && myAct.participants.filter(p => p.user_id !== user?.id).length > 0 ? (
                    myAct.participants.filter(p => p.user_id !== user?.id).map((part) => (
                      <div key={part.id} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <img
                            src={part.user_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(part.user_name || 'User')}&background=9B20F0&color=fff`}
                            alt={part.user_name || 'Candidato'}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(part.user_name || 'User')}&background=9B20F0&color=fff`;
                            }}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-purple-500"
                          />
                          <div>
                            <p className="font-extrabold text-xs text-white">
                              {part.user_name || 'Usuário Interessado'}
                            </p>
                            <span className={`text-[10px] font-black uppercase flex items-center gap-1 mt-0.5 ${
                              part.status === 'approved' ? 'text-emerald-400' : part.status === 'rejected' ? 'text-red-400' : 'text-amber-400'
                            }`}>
                              {part.status === 'approved' ? (
                                <>✓ Aprovado(a) - Chat Liberado</>
                              ) : part.status === 'rejected' ? (
                                <>✗ Recusado(a)</>
                              ) : (
                                <><Hourglass className="h-3 w-3 animate-spin" /> Solicitou Participar (Pendente)</>
                              )}
                            </span>
                          </div>
                        </div>

                        {part.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveCandidate(myAct.id, part.user_id)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95"
                            >
                              <UserCheck className="h-3.5 w-3.5" /> Aceitar Pedido
                            </button>
                            <button
                              onClick={() => handleRejectCandidate(myAct.id, part.user_id)}
                              className="bg-white/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-xs font-bold py-1.5 px-2.5 rounded-xl transition-all"
                              title="Recusar"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : part.status === 'approved' ? (
                          <button
                            onClick={() => handleOpenChat(part.user_id)}
                            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-black py-1.5 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> Abrir Chat
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-bold">Recusado</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-purple-200/60 font-medium bg-white/5 p-3 rounded-2xl text-center border border-white/10 italic">
                      Nenhuma solicitação pendente no momento. As pessoas que clicarem em "Quero Ir!" aparecerão aqui para você aceitar.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📡 SECTION 1: PESSOAS NO RADAR */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <span>Pessoas Visíveis no Radar ({availableUsers.length})</span>
          </h3>
          
          <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full">
            📍 Raio: {radius} km
          </Badge>
        </div>

        {availableUsers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {availableUsers.map((person) => (
              <motion.div
                key={person.id}
                whileHover={{ scale: 1.03, y: -2 }}
                className="group relative rounded-3xl bg-gradient-to-b from-[#18122B]/80 to-[#0F0C1B]/90 border border-white/10 hover:border-emerald-500/50 p-4 flex flex-col items-center text-center transition-all shadow-lg hover:shadow-[0_0_25px_rgba(53,227,138,0.25)]"
              >
                <span className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-[9px] px-2 py-0.5 rounded-full">
                  {person.distance_range || '500 m'}
                </span>

                <div className="relative my-2">
                  <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 to-teal-300 ring-4 ring-emerald-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                    <img
                      src={person.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'User')}&background=35E38A&color=000`}
                      alt={person.name || 'Usuário'}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'User')}&background=35E38A&color=000`;
                      }}
                      className="w-full h-full rounded-full object-cover border-2 border-[#070611]"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#070611] shadow-[0_0_8px_#35E38A]" />
                </div>

                <h4 className="font-extrabold text-sm text-white truncate max-w-[120px] group-hover:text-emerald-400 transition-colors">
                  {person.name ? person.name.split(' ')[0] : 'Usuário'}, {person.age || 25}
                </h4>
                
                <p className="text-[10px] text-purple-200/70 font-semibold line-clamp-1 mt-0.5 italic">
                  "{person.current_status_text || 'Disponível agora'}"
                </p>

                <button 
                  onClick={() => handleConnectUser(person.id)}
                  className="mt-3 w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-black text-xs py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Conectar ⚡</span>
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center space-y-4 overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(53,227,138,0.2)]">
              <Radio className="h-8 w-8 animate-pulse text-emerald-400" />
            </div>

            <div className="max-w-md mx-auto">
              <h4 className="font-extrabold text-lg text-white">
                Sinal do Radar Livre na Sua Região
              </h4>
              <p className="text-xs text-purple-200/70 font-medium mt-1">
                Ninguém ativou a presença a até {radius} km no momento. Seja a primeira pessoa a acender seu sinal no mapa!
              </p>
            </div>

            <button
              onClick={onOpenAvailabilityModal}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm py-3.5 px-8 rounded-2xl shadow-[0_0_30px_rgba(53,227,138,0.4)] transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <Zap className="h-4 w-4 fill-slate-950" />
              <span>Ativar Minha Presença Agora ⚡</span>
            </button>
          </div>
        )}
      </div>

      {/* 🎉 SECTION 2: CONVITES ESPONTÂNEOS (SOCIAL EVENT CARDS) */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-purple-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">
              Convites Espontâneos ({activitiesList.length})
            </h3>
          </div>

          <button
            onClick={onOpenCreateActivityModal}
            className="bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-200 hover:text-white font-extrabold text-xs py-2 px-4 rounded-2xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="h-4 w-4 text-purple-400" />
            <span>+ Criar Convite</span>
          </button>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: 'all', label: '✨ Todos' },
            { id: 'coffee', label: '☕ Café & Papo' },
            { id: 'drinks', label: '🍻 Drinks & Bar' },
            { id: 'sport', label: '🏃 Esportes & Trilha' },
            { id: 'cinema', label: '🍿 Cinema & Cultura' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategoryTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap border ${
                selectedCategoryTab === tab.id
                  ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(155,32,240,0.4)]'
                  : 'bg-white/5 text-purple-200/70 border-white/10 hover:border-purple-500/30 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredActivities.length === 0 ? (
          <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-b from-[#18122B]/40 to-[#0F0C1B]/60 backdrop-blur-xl p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-md">
              <PartyPopper className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-white">
                Nenhum convite aberto nesta categoria
              </h4>
              <p className="text-xs text-purple-200/70 font-medium mt-1">
                Que tal criar um convite espontâneo para encontrar pessoas interessantes hoje?
              </p>
            </div>
            <button
              onClick={onOpenCreateActivityModal}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-90 text-white font-extrabold text-xs py-3 px-6 rounded-2xl shadow-lg transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>+ Criar Convite Espontâneo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActivities.map((act) => {
              const myParticipant = act.participants?.find(p => p.user_id === user?.id);
              const myStatus = myParticipant?.status;

              return (
                <motion.div 
                  key={act.id} 
                  whileHover={{ y: -3 }}
                  className="bg-gradient-to-b from-[#18122B]/90 to-[#0F0C1B]/95 border border-white/10 hover:border-purple-500/50 shadow-xl rounded-3xl p-5 flex flex-col justify-between transition-all backdrop-blur-xl group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase">
                        {act.category || 'Geral'}
                      </Badge>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <Users className="h-3 w-3 text-emerald-400" />
                        {act.participant_count || 0}/{act.max_participants || 2} Vagas
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
                      {act.title}
                    </h4>

                    <div className="space-y-1 text-xs text-purple-200/80 font-medium">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                        <span className="truncate">{act.location_name || defaultUserCity}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{act.scheduled_time || 'Hoje'}</span>
                      </p>
                    </div>

                    {act.description && (
                      <p className="text-xs text-purple-200/60 font-normal line-clamp-2 italic pt-1 border-t border-white/5">
                        "{act.description}"
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/10">
                    {act.user_id === user?.id ? (
                      <span className="text-xs font-black text-purple-400 block text-center py-1.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        Seu Convite ⭐
                      </span>
                    ) : myStatus === 'pending' ? (
                      <div className="w-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 text-center">
                        <Hourglass className="h-4 w-4 animate-spin text-amber-400" />
                        <span>Solicitação Pendente (Aguardando Criador Aceitar)</span>
                      </div>
                    ) : myStatus === 'approved' ? (
                      <button
                        onClick={() => handleOpenChat(act.user_id)}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-black py-2.5 rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Chat Liberado - Conversar com Criador 💬</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinClick(act.id)}
                        className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-90 text-white text-xs font-black py-2.5 rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Quero ir! (Enviar Pedido) 🙋‍♂️</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ModoAgoraHub;
