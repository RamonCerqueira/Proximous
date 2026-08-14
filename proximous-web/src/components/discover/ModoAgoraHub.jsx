import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Plus, 
  MapPin, 
  Sparkles, 
  Radio, 
  Zap, 
  Coffee, 
  Compass,
  Trash2,
  Users,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  UserCheck,
  UserX,
  UserPlus,
  Settings,
  PartyPopper
} from 'lucide-react';
import { activitiesAPI, usersAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const QUICK_PRESETS = [
  { label: 'Café & Conversa ☕', text: 'Tomar um café agora' },
  { label: 'Drinks & Bar 🍻', text: 'Drinks pós-trabalho' },
  { label: 'Corrida / Trilha 🏃', text: 'Treino no parque' },
  { label: 'Cinema 🍿', text: 'Pegar um cinema hoje' },
];

const ModoAgoraHub = ({
  availableUsers,
  activitiesList,
  loadingActivities,
  radius,
  onOpenAvailabilityModal,
  onOpenCreateActivityModal,
  onSwipeUser,
  onJoinActivity,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCreatedActivities, setMyCreatedActivities] = useState([]);

  useEffect(() => {
    fetchMyActivities();
  }, [activitiesList]);

  const fetchMyActivities = async () => {
    try {
      const res = await activitiesAPI.getMyActivities();
      const list = res.data.activities || [];
      const createdByMe = list.filter(a => a.user_id === user?.id);
      setMyCreatedActivities(createdByMe);
    } catch (err) {
      console.warn('Error fetching my activities:', err);
    }
  };

  const handleCancelActivity = async (activityId) => {
    try {
      await activitiesAPI.deleteActivity(activityId);
      setMyCreatedActivities(prev => prev.filter(a => a.id !== activityId));
    } catch (err) {
      console.error('Error cancelling activity:', err);
    }
  };

  const handleApproveCandidate = async (activityId, candidateUserId) => {
    try {
      await activitiesAPI.approveParticipant(activityId, candidateUserId);
      fetchMyActivities();
    } catch (err) {
      console.error('Error approving candidate:', err);
    }
  };

  const handleRejectCandidate = async (activityId, candidateUserId) => {
    try {
      await activitiesAPI.rejectParticipant(activityId, candidateUserId);
      fetchMyActivities();
    } catch (err) {
      console.error('Error rejecting candidate:', err);
    }
  };

  const handleOpenChat = (participantUserId) => {
    navigate('/messages', { state: { targetUserId: participantUserId } });
  };

  return (
    <div className="space-y-6 text-foreground">
      
      {/* 🔴 ACTIVE STATUS DASHBOARD (Fiel à captura de referência) */}
      {user?.is_available_now && (
        <div className="bg-white dark:bg-[#14192b] border border-gray-100 dark:border-gray-800 rounded-[28px] p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                SEU RADAR ESTÁ ATIVO NO MAPA ⚡
              </span>
            </div>

            <button
              onClick={onOpenAvailabilityModal}
              className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-extrabold text-xs px-3.5 py-1 rounded-full flex items-center gap-1 hover:bg-emerald-100 transition-all"
            >
              <Clock className="h-3.5 w-3.5" /> Editar
            </button>
          </div>

          <div className="bg-[#f0fdf4] dark:bg-emerald-950/30 border border-[#dcfce7] dark:border-emerald-900/40 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider">
                PLANO CADASTRADO:
              </p>
              <p className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                "{user?.current_status_text || 'Tomar um café agora'}"
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <Clock className="h-3.5 w-3.5" /> Válido para conexões a até {radius} km
              </p>
            </div>

            {/* Radar Sonar Visual Graphic */}
            <div className="relative w-16 h-16 hidden sm:flex items-center justify-center flex-shrink-0">
              <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping opacity-30" />
              <div className="w-12 h-12 rounded-full border border-emerald-500/40 flex items-center justify-center bg-emerald-500/10">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-md animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Card ("O que você quer fazer agora?") - Fiel ao Design de Referência */}
      <div className="bg-white dark:bg-[#14192b] border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
            <span>Radar ao vivo ⚡</span>
          </div>

          <button
            onClick={onOpenAvailabilityModal}
            className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 hover:bg-purple-100 font-extrabold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Configurar Status</span>
          </button>
        </div>

        {/* Title */}
        <div className="py-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#111827] dark:text-white tracking-tight">
            O que você quer fazer agora?
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 font-semibold mt-1">
            Fique visível no Radar para combinares com rolê da região!
          </p>
        </div>

        {/* Preset Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={onOpenAvailabilityModal}
              className="bg-white dark:bg-[#1b2238] hover:bg-gray-50 dark:hover:bg-[#232c48] text-[#1F2937] dark:text-gray-200 font-extrabold border border-gray-200 dark:border-gray-700 shadow-sm text-xs px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Main Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onOpenAvailabilityModal}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md text-xs sm:text-sm flex-1 flex items-center justify-center gap-2 transition-all"
          >
            <Radio className="h-4 w-4 text-white animate-pulse" />
            <span>Ativar Radar ⚡</span>
          </button>

          <button
            onClick={onOpenCreateActivityModal}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md text-xs sm:text-sm flex-1 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="h-4 w-4 text-white" />
            <span>+ Criar Convite Espontâneo</span>
          </button>
        </div>
      </div>

      {/* 📋 GERENCIADOR DO CRIADOR: MEUS CONVITES & CANDIDATURAS */}
      {myCreatedActivities.length > 0 && (
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-pink-500" />
            <span>Gerenciar Meus Convites ({myCreatedActivities.length})</span>
          </h3>

          <div className="space-y-3">
            {myCreatedActivities.map((myAct) => (
              <Card key={myAct.id} className="bg-white dark:bg-[#14192b] border border-purple-500/30 p-4 rounded-3xl space-y-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-black uppercase mb-1">
                      {myAct.category}
                    </Badge>
                    <h4 className="font-extrabold text-base text-foreground">{myAct.title}</h4>
                    <p className="text-xs text-muted-foreground font-semibold flex items-center gap-2 mt-1">
                      <span>📍 {myAct.location_name || 'São Paulo'}</span>
                      <span>🕒 {myAct.scheduled_time || 'Hoje'}</span>
                    </p>
                  </div>

                  <Button
                    onClick={() => handleCancelActivity(myAct.id)}
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold border-red-200 text-red-500 hover:bg-red-50 rounded-xl h-8 px-2.5"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Cancelar
                  </Button>
                </div>

                {/* Lista de Candidaturas */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <p className="text-xs font-extrabold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-emerald-500" />
                      Candidatos ao Encontro:
                    </span>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 font-black">
                      {myAct.participant_count || 0}/{myAct.max_participants || 2} Aceitos
                    </span>
                  </p>

                  {myAct.participants && myAct.participants.filter(p => p.user_id !== user?.id).length > 0 ? (
                    myAct.participants.filter(p => p.user_id !== user?.id).map((part) => (
                      <div key={part.id} className="flex items-center justify-between bg-gray-50 dark:bg-[#1b2238] p-2.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <img
                            src={part.user_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                            alt={part.user_name || 'Candidato'}
                            className="w-9 h-9 rounded-xl object-cover ring-2 ring-purple-500"
                          />
                          <div>
                            <p className="font-extrabold text-xs text-foreground">
                              {part.user_name || 'Usuário Interessado'}
                            </p>
                            <span className={`text-[10px] font-black uppercase ${
                              part.status === 'approved' ? 'text-emerald-600' : part.status === 'rejected' ? 'text-red-500' : 'text-amber-600'
                            }`}>
                              {part.status === 'approved' ? '✓ Aprovado(a)' : part.status === 'rejected' ? '✗ Recusado(a)' : '⏳ Pendente'}
                            </span>
                          </div>
                        </div>

                        {part.status === 'pending' ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApproveCandidate(myAct.id, part.user_id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-1 px-3 rounded-xl flex items-center gap-1 shadow-sm"
                            >
                              <UserCheck className="h-3.5 w-3.5" /> Aceitar
                            </button>
                            <button
                              onClick={() => handleRejectCandidate(myAct.id, part.user_id)}
                              className="bg-white dark:bg-gray-800 text-red-500 border border-red-200 hover:bg-red-50 text-xs font-bold py-1 px-2.5 rounded-xl"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : part.status === 'approved' ? (
                          <button
                            onClick={() => handleOpenChat(part.user_id)}
                            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-black py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-sm"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> Abrir Chat
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-bold">Recusado</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground font-medium bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-2xl text-center border border-gray-100 dark:border-gray-800">
                      Aguardando pessoas locais se candidatarem ao seu convite...
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: PESSOAS NO RADAR (Row of Avatars with Distance Badges) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#111827] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>PESSOAS NO RADAR ({availableUsers.length})</span>
          </h3>
          <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
            📍 Raio: {radius} km
          </span>
        </div>

        {/* Horizontal Carousel of Real Avatars with Distance Overlay Pills */}
        {availableUsers.length > 0 ? (
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1 px-0.5">
            {availableUsers.map((person) => (
              <div
                key={person.id}
                onClick={() => onSwipeUser('right', person.id)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={person.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                    alt={person.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-sm border border-white">
                    {person.distance_range || '500 m'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 mt-2 truncate max-w-[60px] text-center">
                  {person.name ? person.name.split(' ')[0] : 'Usuário'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State Banner */
          <div className="bg-white dark:bg-[#14192b] border border-gray-100 dark:border-gray-800 rounded-[28px] p-6 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-[#111827] dark:text-white">
                Sinal do Radar Livre
              </h4>
              <p className="text-xs text-[#6B7280] dark:text-gray-400 font-medium mt-1">
                Seja a primeira pessoa a ativar sua presença nesta região!
              </p>
            </div>
            <button
              onClick={onOpenAvailabilityModal}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 px-6 rounded-2xl shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Zap className="h-4 w-4 fill-white" />
              <span>Ativar Minha Presença Agora ⚡</span>
            </button>
          </div>
        )}
      </div>


      {/* Section 2: CONVITES ESPONTÂNEOS (Fiel à captura "Nenhum convite aberto ativo") */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#111827] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <PartyPopper className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>CONVITES ESPONTÂNEOS ({activitiesList.length})</span>
          </h3>
          <button
            onClick={onOpenCreateActivityModal}
            className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 py-1.5 px-3 rounded-full transition-all flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Criar Convite
          </button>
        </div>

        {activitiesList.length === 0 ? (
          <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-[28px] p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center mx-auto shadow-sm">
              <PartyPopper className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-[#111827] dark:text-white">
                Nenhum convite aberto ativo
              </h4>
              <p className="text-xs text-[#6B7280] dark:text-gray-400 font-medium mt-1">
                Crie um convite aberto para 2 ou mais pessoas na sua região!
              </p>
            </div>
            <button
              onClick={onOpenCreateActivityModal}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 text-white font-extrabold text-xs py-3 px-6 rounded-2xl shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>+ Criar Convite Espontâneo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {activitiesList.map((act) => (
              <Card key={act.id} className="bg-white dark:bg-[#14192b] border border-gray-100 dark:border-gray-800 shadow-sm rounded-3xl p-3.5 flex flex-col justify-between hover:border-purple-500/40 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[9px] font-black uppercase">
                      {act.category || 'Geral'}
                    </Badge>
                    <span className="text-[10px] font-black text-foreground bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      👥 {act.participant_count || 0}/{act.max_participants || 2}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs sm:text-sm text-[#111827] dark:text-white line-clamp-2 leading-snug">
                    {act.title}
                  </h4>

                  <div className="space-y-0.5 text-[10px] text-muted-foreground font-semibold">
                    <p className="flex items-center gap-1 text-purple-700 dark:text-purple-300">
                      <MapPin className="h-3 w-3 text-purple-500 flex-shrink-0" />
                      <span className="truncate">{act.location_name || 'São Paulo'}</span>
                    </p>
                    <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                      <Clock className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{act.scheduled_time || 'Hoje'}</span>
                    </p>
                  </div>

                  {act.description && (
                    <p className="text-[10px] text-muted-foreground font-medium line-clamp-2 italic pt-0.5">
                      "{act.description}"
                    </p>
                  )}
                </div>

                <div className="pt-2 mt-1.5 border-t border-gray-100 dark:border-gray-800">
                  {act.user_id === user?.id ? (
                    <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 block text-center py-0.5">
                      Seu Convite ⭐
                    </span>
                  ) : (
                    <button
                      onClick={() => onJoinActivity(act.id)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-extrabold py-2 rounded-xl shadow-sm flex items-center justify-center gap-1 transition-all"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Quero ir! 🙋‍♂️</span>
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModoAgoraHub;
