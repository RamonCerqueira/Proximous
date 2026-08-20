import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Users, Trash2, UserCheck, UserX, MessageCircle, Hourglass, Plus, Sparkles, MapPin, Clock } from 'lucide-react';

const MyActivitiesManager = ({
  myActivities = [],
  currentUserId,
  onCancelActivity,
  onApproveCandidate,
  onRejectCandidate,
  onOpenChat,
  onOpenCreateModal,
}) => {
  if (myActivities.length === 0) {
    return (
      <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-b from-[#18122B]/60 to-[#0F0C1B]/80 backdrop-blur-xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(155,32,240,0.2)]">
          <Sparkles className="h-8 w-8 text-pink-400" />
        </div>
        <div className="max-w-md mx-auto">
          <h4 className="font-extrabold text-lg text-white">
            Você ainda não criou nenhum convite espontâneo
          </h4>
          <p className="text-xs text-purple-200/70 font-medium mt-1">
            Crie um convite para um café, drinks, trilha ou cinema. As pessoas próximas poderão pedir para ir com você!
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] hover:opacity-95 text-white font-black text-xs sm:text-sm py-3.5 px-8 rounded-2xl shadow-[0_0_30px_rgba(212,20,168,0.4)] transition-all inline-flex items-center gap-2 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Meu Primeiro Convite ⚡</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {myActivities.map((act) => {
        const candidateParticipants = (act.participants || []).filter(p => p.user_id !== currentUserId);

        return (
          <div
            key={act.id}
            className="bg-[#120E24]/90 border border-purple-500/30 p-5 sm:p-6 rounded-3xl space-y-4 shadow-2xl backdrop-blur-2xl"
          >
            {/* Event Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase mb-1.5">
                  {act.category || 'Rolê'}
                </Badge>
                <h4 className="font-black text-lg text-white leading-snug">{act.title}</h4>
                <div className="text-xs text-purple-200/70 font-bold flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    {act.location_name || 'Local a combinar'}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {act.scheduled_time || 'Hoje'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onCancelActivity(act.id)}
                className="text-xs font-extrabold border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl px-3 py-1.5 flex items-center gap-1.5 transition-all flex-shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Encerrar</span>
              </button>
            </div>

            {/* Candidates Application Section */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-white">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Users className="h-4 w-4" />
                  Candidaturas & Pedidos para Entrar:
                </span>
                <span className="text-[10px] text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/40">
                  {act.participant_count || 0}/{act.max_participants || 2} Vagas Ocupadas
                </span>
              </div>

              {candidateParticipants.length > 0 ? (
                <div className="space-y-2.5">
                  {candidateParticipants.map((part) => (
                    <div
                      key={part.id || part.user_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={part.user_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(part.user_name || 'User')}&background=9B20F0&color=fff`}
                          alt={part.user_name || 'Candidato'}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(part.user_name || 'User')}&background=9B20F0&color=fff`;
                          }}
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-purple-500"
                        />
                        <div>
                          <p className="font-extrabold text-sm text-white">
                            {part.user_name || 'Usuário Interessado'}
                          </p>
                          <span className={`text-[10px] font-black uppercase flex items-center gap-1 mt-0.5 ${
                            part.status === 'approved' ? 'text-emerald-400' : part.status === 'rejected' ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            {part.status === 'approved' ? (
                              <>✓ Aprovado(a) • Chat Liberado</>
                            ) : part.status === 'rejected' ? (
                              <>✗ Recusado(a)</>
                            ) : (
                              <><Hourglass className="h-3 w-3 animate-spin" /> Pediu para participar (Pendente)</>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons per candidate */}
                      <div className="flex items-center gap-2 justify-end">
                        {part.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => onApproveCandidate(act.id, part.user_id)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Aceitar ✓</span>
                            </button>
                            <button
                              onClick={() => onRejectCandidate(act.id, part.user_id)}
                              className="bg-white/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold py-2 px-2.5 rounded-xl transition-all"
                              title="Recusar"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : part.status === 'approved' ? (
                          <button
                            onClick={() => onOpenChat(part.user_id)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-black py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Abrir Chat 💬</span>
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-500 font-bold px-2">Recusado</span>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-purple-200/60 font-medium bg-white/5 p-4 rounded-2xl text-center border border-white/10 italic">
                  Nenhum pedido pendente ainda. Quando alguém clicar em "Quero Ir!", você poderá aceitar e liberar a conversa privada aqui.
                </p>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default MyActivitiesManager;
