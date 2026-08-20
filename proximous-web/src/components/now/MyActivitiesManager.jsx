import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Trash2, 
  UserCheck, 
  UserX, 
  MessageCircle, 
  Hourglass, 
  Plus, 
  Sparkles, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Flame,
  Ticket
} from 'lucide-react';

export const MyActivitiesModal = ({
  show,
  onClose,
  createdActivities = [],
  requestedActivities = [],
  currentUserId,
  onCancelActivity,
  onApproveCandidate,
  onRejectCandidate,
  onOpenChat,
  onOpenCreateModal,
}) => {
  const [activeTab, setActiveTab] = useState('created'); // 'created' | 'requested'

  if (!show) return null;

  const totalPendingCandidates = createdActivities.reduce((acc, act) => {
    const pendings = (act.participants || []).filter(p => p.user_id !== currentUserId && p.status === 'pending');
    return acc + pendings.length;
  }, 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="bg-[#0D081D] text-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-purple-500/25 relative max-h-[92vh] flex flex-col justify-between overflow-hidden"
        >
          
          {/* HEADER */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  Meus Rolês & Candidaturas
                </h3>
                <p className="text-[11px] text-zinc-400 font-normal">
                  Gerencie seus convites criados e pedidos para participar
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TAB SWITCHER */}
          <div className="py-3 flex gap-2 border-b border-white/5">
            <button
              onClick={() => setActiveTab('created')}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                activeTab === 'created'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                  : 'bg-[#150F28] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Rolês que Criei ({createdActivities.length})</span>
              {totalPendingCandidates > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-extrabold text-[10px] flex items-center justify-center animate-pulse">
                  {totalPendingCandidates}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('requested')}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                activeTab === 'requested'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                  : 'bg-[#150F28] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Rolês que Solicitei ({requestedActivities.length})</span>
            </button>
          </div>

          {/* SCROLLABLE CONTENT BODY */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-none">
            
            {/* ================= TAB 1: ROLÊS QUE EU CRIEI (ANFITRIÃO) ================= */}
            {activeTab === 'created' && (
              <div className="space-y-4">
                {createdActivities.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6 text-pink-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">
                      Você ainda não criou nenhum rolê
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto font-normal">
                      Crie um convite para um café, drinks ou treino. As pessoas no Radar poderão pedir para ir com você!
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCreateModal();
                      }}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-md inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Criar Primeiro Rolê ⚡</span>
                    </button>
                  </div>
                ) : (
                  createdActivities.map((act) => {
                    const candidates = (act.participants || []).filter(p => p.user_id !== currentUserId);
                    const approvedCount = candidates.filter(p => p.status === 'approved').length;

                    return (
                      <div
                        key={act.id}
                        className="bg-[#150F28] border border-purple-500/20 p-4 rounded-3xl space-y-3.5 shadow-xl"
                      >
                        {/* Event Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            {act.photo_url && (
                              <img
                                src={act.photo_url}
                                alt={act.title}
                                className="w-14 h-14 rounded-2xl object-cover border border-purple-500/30 shrink-0"
                              />
                            )}
                            <div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/30 uppercase">
                                {act.category || 'Rolê'}
                              </span>
                              <h4 className="font-semibold text-sm text-white mt-1 leading-snug">
                                {act.title}
                              </h4>
                              <div className="text-[11px] text-zinc-400 font-normal flex items-center gap-2 mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-pink-400" />
                                  <span className="truncate max-w-[120px]">{act.location_name || 'Salvador'}</span>
                                </span>
                                <span className="flex items-center gap-1 text-purple-300">
                                  <Clock className="w-3 h-3" />
                                  <span>{act.scheduled_time || 'Hoje'}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => onCancelActivity(act.id)}
                            className="p-1.5 rounded-xl hover:bg-red-500/10 text-red-400 border border-red-500/20 text-xs transition-colors shrink-0"
                            title="Encerrar rolê"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Candidates / Requests Section */}
                        <div className="pt-3 border-t border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-purple-400" />
                              <span>Pedidos de Entrada:</span>
                            </span>
                            <span className="text-[10px] font-semibold text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-full border border-purple-500/30">
                              {approvedCount}/{act.max_participants || 4} Vagas Ocupadas
                            </span>
                          </div>

                          {candidates.length > 0 ? (
                            <div className="space-y-2">
                              {candidates.map((candidate) => (
                                <div
                                  key={candidate.id || candidate.user_id}
                                  className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-black/30 border border-white/5"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={candidate.user_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.user_name || 'User')}`}
                                      alt={candidate.user_name}
                                      className="w-9 h-9 rounded-full object-cover ring-1 ring-purple-500/40"
                                    />
                                    <div>
                                      <p className="text-xs font-semibold text-white">
                                        {candidate.user_name}
                                        {candidate.user_age ? `, ${candidate.user_age}` : ''}
                                      </p>
                                      <span className={`text-[10px] font-medium flex items-center gap-1 ${
                                        candidate.status === 'approved' 
                                          ? 'text-emerald-400' 
                                          : candidate.status === 'rejected' 
                                            ? 'text-red-400' 
                                            : 'text-amber-400'
                                      }`}>
                                        {candidate.status === 'approved' && '✓ Confirmado(a)'}
                                        {candidate.status === 'rejected' && '✗ Recusado(a)'}
                                        {candidate.status === 'pending' && (
                                          <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                            Aguardando sua resposta
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Host Decision Action Buttons */}
                                  <div className="flex items-center gap-1.5">
                                    {candidate.status === 'pending' ? (
                                      <>
                                        <button
                                          onClick={() => onApproveCandidate(act.id, candidate.user_id)}
                                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-1 shadow-md transition-all active:scale-95"
                                        >
                                          <UserCheck className="w-3.5 h-3.5" />
                                          <span>Aceitar</span>
                                        </button>
                                        <button
                                          onClick={() => onRejectCandidate(act.id, candidate.user_id)}
                                          className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                                          title="Recusar pedido"
                                        >
                                          <UserX className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    ) : candidate.status === 'approved' ? (
                                      <button
                                        onClick={() => {
                                          onClose();
                                          onOpenChat(candidate.user_id);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-semibold flex items-center gap-1 shadow-md transition-all active:scale-95"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>Chat 💬</span>
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-zinc-500 px-2">Recusado</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-zinc-400 italic bg-black/20 p-3 rounded-2xl text-center border border-white/5">
                              Nenhum pedido pendente. Quando alguém clicar em "Quero ir ⚡", você poderá aceitar e liberar a conversa privada aqui!
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ================= TAB 2: ROLÊS QUE EU SOLICITEI (PARTICIPANTE) ================= */}
            {activeTab === 'requested' && (
              <div className="space-y-4">
                {requestedActivities.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">
                      Você ainda não pediu para ir a nenhum rolê
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto font-normal">
                      Navegue pelo feed ou Radar e clique em "Quero ir ⚡" para participar dos encontros em Salvador!
                    </p>
                  </div>
                ) : (
                  requestedActivities.map((act) => {
                    const isApproved = act.my_status === 'approved';
                    const isRejected = act.my_status === 'rejected';
                    const isPending = !isApproved && !isRejected;

                    return (
                      <div
                        key={act.id}
                        className={`p-4 rounded-3xl border transition-all shadow-xl space-y-3 ${
                          isApproved 
                            ? 'bg-gradient-to-r from-[#17271E] to-[#120F24] border-emerald-500/40 shadow-[0_0_20px_rgba(53,227,138,0.1)]' 
                            : 'bg-[#150F28] border-white/10'
                        }`}
                      >
                        {/* Event Details Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <img
                              src={act.photo_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400'}
                              alt={act.title}
                              className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0"
                            />
                            <div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/30 uppercase">
                                {act.category || 'Rolê'}
                              </span>
                              <h4 className="font-semibold text-sm text-white mt-1 leading-snug">
                                {act.title}
                              </h4>
                              <div className="text-[11px] text-zinc-400 font-normal flex items-center gap-2 mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-pink-400" />
                                  <span className="truncate max-w-[120px]">{act.location_name || 'Salvador'}</span>
                                </span>
                                <span className="flex items-center gap-1 text-purple-300">
                                  <Clock className="w-3 h-3" />
                                  <span>{act.scheduled_time || 'Hoje'}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Host Avatar */}
                          <div className="flex flex-col items-center shrink-0">
                            <img
                              src={act.creator_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(act.creator_name || 'Host')}`}
                              alt={act.creator_name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-purple-500/40"
                            />
                            <span className="text-[9px] text-zinc-400 truncate max-w-[50px] mt-0.5">
                              {act.creator_name?.split(' ')[0]}
                            </span>
                          </div>
                        </div>

                        {/* STATUS BANNER & CHAT ACTION */}
                        <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isApproved && (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Você foi aceito(a)! 🎉</span>
                              </div>
                            )}

                            {isPending && (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                                <Hourglass className="w-3.5 h-3.5 animate-spin" />
                                <span>Aguardando resposta do anfitrião...</span>
                              </div>
                            )}

                            {isRejected && (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span>Solicitação não aceita</span>
                              </div>
                            )}
                          </div>

                          {isApproved && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenChat(act.user_id);
                              }}
                              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-semibold flex items-center gap-1 shadow-md active:scale-95 transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Conversar com Anfitrião</span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>

          {/* FOOTER */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-normal">
              Notificações de novas respostas chegam em tempo real.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              Fechar
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MyActivitiesModal;
