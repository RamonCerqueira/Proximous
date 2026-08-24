import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Sparkles, 
  Check, 
  Zap, 
  Star, 
  X, 
  Copy, 
  CheckCircle2, 
  QrCode, 
  ArrowRight,
  ShieldCheck,
  EyeOff,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionsAPI } from '@/lib/api';

const PIX_KEY = '03207834566';

const VipUpgradeModal = ({ isOpen, onClose, title, feature, description }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' | 'annual'
  const [showPixStep, setShowPixStep] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      // Register subscription request
      await subscriptionsAPI.subscribe({
        plan_type: selectedPlan === 'annual' ? 'annual' : 'monthly',
        payment_method: 'pix'
      }).catch((e) => console.warn('PIX request note:', e));

      // Also persist to localStorage for SuperAdmin review queue
      try {
        const pending = JSON.parse(localStorage.getItem('proximous_pending_vip_requests') || '[]');
        const newReq = {
          user_id: user?.id || 'usr_' + Date.now(),
          name: user?.name || 'Usuário Proximous',
          email: user?.email || '',
          amount: selectedPlan === 'annual' ? 'R$ 238,80 (R$ 19,90/mês)' : 'R$ 29,90/mês',
          pix_key: PIX_KEY,
          status: 'pending_admin_approval',
          created_at: new Date().toISOString()
        };
        localStorage.setItem('proximous_pending_vip_requests', JSON.stringify([newReq, ...pending]));
      } catch (err) {
        console.warn('Storage sync error:', err);
      }

      setConfirmed(true);
    } finally {
      setConfirming(false);
    }
  };

  const handleGoToFullPage = () => {
    onClose();
    setShowPixStep(false);
    setConfirmed(false);
    navigate('/premium');
  };

  const handleClose = () => {
    setShowPixStep(false);
    setConfirmed(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl selection:bg-[#FF4FA3] selection:text-white">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-[32px] border-2 border-purple-500/50 bg-gradient-to-b from-[#1C0F38] via-[#120A24] to-[#0A0516] p-5 sm:p-7 shadow-[0_0_80px_rgba(155,32,240,0.45)] text-white max-h-[92vh] overflow-y-auto scrollbar-none"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Ambient Top Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-purple-500/30 via-pink-500/20 to-transparent blur-3xl pointer-events-none" />

          {/* CONTENT: STEP 1 - BENEFITS & PLAN SELECTOR */}
          {!showPixStep && !confirmed && (
            <div className="space-y-5">
              {/* Header Badge & Title */}
              <div className="text-center space-y-2 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg">
                  <Crown className="w-3.5 h-3.5 fill-amber-300" />
                  <span>Acesso VIP Exclusivo</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  {title || 'Desbloqueie o Proximous VIP'}
                </h3>

                {feature && (
                  <div className="inline-block px-3 py-0.5 rounded-lg bg-purple-500/25 border border-purple-500/40 text-purple-200 text-xs font-bold">
                    Recurso Solicitado: <span className="text-white font-extrabold">{feature}</span>
                  </div>
                )}

                <p className="text-xs text-zinc-300 font-medium leading-relaxed max-w-sm mx-auto">
                  {description || 'Acesse recursos ilimitados, descubra quem te curtiu e destaque seu perfil na sua região.'}
                </p>
              </div>

              {/* VIP Benefits List */}
              <div className="rounded-2xl bg-[#170E32]/70 border border-purple-500/30 p-4 space-y-2.5 shadow-inner">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Vantagens Imediatas Inclusas:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-200">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-3 w-3 fill-amber-400" />
                    </div>
                    <span><strong>Curtidas</strong> Ilimitadas</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-3 w-3 fill-amber-400" />
                    </div>
                    <span><strong>Mensagens</strong> Ilimitadas</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-3 w-3 fill-pink-400 text-pink-400" />
                    </div>
                    <span><strong>Ver Quem Curtiu</strong> seu perfil</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Star className="h-3 w-3 fill-amber-400" />
                    </div>
                    <span><strong>Super Likes</strong> diários</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <EyeOff className="h-3 w-3 text-purple-300" />
                    </div>
                    <span><strong>Modo Incógnito</strong> / Invisível</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span><strong>100% Sem Anúncios</strong></span>
                  </div>
                </div>
              </div>

              {/* Plan Options Selector */}
              <div className="grid grid-cols-2 gap-3">
                {/* Monthly Plan */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    selectedPlan === 'monthly'
                      ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_20px_rgba(155,32,240,0.4)]'
                      : 'bg-[#120A24]/60 border-white/10 hover:border-white/25 text-zinc-400'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">Mensal</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-white">R$ 29,90</span>
                    <span className="text-[10px] text-zinc-400 font-bold">/mês</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-1">Cobrança mensal flexível</span>
                </button>

                {/* Annual Plan */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('annual')}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    selectedPlan === 'annual'
                      ? 'bg-purple-950/80 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
                      : 'bg-[#120A24]/60 border-white/10 hover:border-white/25 text-zinc-400'
                  }`}
                >
                  <span className="absolute -top-2.5 right-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                    ECONOMIZE 33%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">Anual VIP</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-white">R$ 19,90</span>
                    <span className="text-[10px] text-zinc-400 font-bold">/mês</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">R$ 238,80 cobrado anual</span>
                </button>
              </div>

              {/* CTA Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => setShowPixStep(true)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white text-sm font-black shadow-[0_10px_35px_rgba(212,20,168,0.5)] transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Crown className="w-4 h-4 fill-white" />
                  <span>Assinar VIP via PIX Instantâneo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 px-1">
                  <button
                    onClick={handleGoToFullPage}
                    className="text-purple-300 hover:text-white font-bold underline transition-colors"
                  >
                    Ver todos os detalhes dos planos
                  </button>
                  <button
                    onClick={handleClose}
                    className="hover:text-white transition-colors"
                  >
                    Agora não
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT: STEP 2 - PIX PAYMENT & CONFIRMATION */}
          {showPixStep && !confirmed && (
            <div className="space-y-5 text-center">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <button
                  onClick={() => setShowPixStep(false)}
                  className="text-xs text-purple-300 hover:text-white font-bold flex items-center gap-1"
                >
                  ← Voltar aos Planos
                </button>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <QrCode className="h-3 w-3" /> PIX INSTANTÂNEO
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">Pagamento PIX - Ativação VIP ⚡</h3>
                <p className="text-xs text-zinc-300">
                  Plano selecionado: <strong className="text-white">{selectedPlan === 'annual' ? 'Anual VIP (R$ 238,80)' : 'Mensal VIP (R$ 29,90)'}</strong>
                </p>
              </div>

              {/* PIX Key Box */}
              <div className="p-4 rounded-2xl bg-[#0F081C] border border-purple-500/40 space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Chave PIX (CPF):
                </span>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <code className="text-sm font-mono font-black text-amber-400 tracking-wider">
                    {PIX_KEY}
                  </code>
                  <button
                    onClick={handleCopyPix}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      copied
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copiar Chave</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-left text-xs text-zinc-300 space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="font-bold text-white flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Como Funciona:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-300 pl-1 text-[11px]">
                  <li>Abra o aplicativo do seu banco e escolha <strong>Pagar via PIX</strong></li>
                  <li>Cole a chave CPF copiada acima e confirme o valor</li>
                  <li>Clique no botão abaixo para registrar a ativação do seu VIP</li>
                </ol>
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={confirming}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white text-sm font-black shadow-[0_10px_30px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {confirming ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Já Efetuei o Pagamento PIX</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* CONTENT: STEP 3 - SUCCESS CONFIRMATION */}
          {confirmed && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-white">Solicitação Recebida! 🎉</h3>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
                  Seu pagamento PIX foi registrado. O acesso <strong>VIP Proximous</strong> está sendo ativado na sua conta.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-black shadow-lg transition-all"
              >
                Continuar Navegando
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VipUpgradeModal;
