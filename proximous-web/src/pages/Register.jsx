import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  Heart, 
  MapPin, 
  Sparkles, 
  UserPlus, 
  ArrowLeft, 
  Crown, 
  CheckCircle2, 
  Copy, 
  Check, 
  QrCode, 
  Zap,
  ChevronRight,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { setToken, setUser } from '@/lib/auth';

const PIX_CPF_KEY = '03207834566';

const Register = () => {
  const { register: authRegister } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    social_style: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Post-registration Plan Selection Modal States
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planStep, setPlanStep] = useState('select'); // 'select' | 'pix_payment' | 'pending_approval'
  const [copiedPix, setCopiedPix] = useState(false);
  const [registeringPayment, setRegisteringPayment] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authRegister(formData);
      if (result.success) {
        setRegisteredUser(result.user);
        // Show post-registration VIP / Free Plan Selection Modal
        setShowPlanModal(true);
      } else {
        setError(result.error || 'Erro ao criar conta. Tente novamente.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(PIX_CPF_KEY);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleConfirmPixPayment = () => {
    setRegisteringPayment(true);
    
    // Register pending VIP approval in localStorage for SuperAdmin verification
    try {
      const pendingRequests = JSON.parse(localStorage.getItem('proximous_pending_vip_requests') || '[]');
      const newPending = {
        user_id: registeredUser?.id || 'usr_' + Date.now(),
        name: registeredUser?.name || formData.name,
        email: registeredUser?.email || formData.email,
        amount: 'R$ 29,90',
        pix_key: PIX_CPF_KEY,
        status: 'pending_admin_approval',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('proximous_pending_vip_requests', JSON.stringify([newPending, ...pendingRequests]));
    } catch (e) {
      console.warn('Error saving pending VIP:', e);
    }

    setTimeout(() => {
      setRegisteringPayment(false);
      setPlanStep('pending_approval');
    }, 1200);
  };

  const handleSelectFreePlan = () => {
    setShowPlanModal(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden text-foreground">
      {/* Ambient Luxury Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-pink-600/15 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="luxury-glass-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
          <CardContent className="p-8 sm:p-10 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-2">
                <img
                  src="/logoProximouCompleta.png"
                  alt="Proximous"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logoProximou.png';
                  }}
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Crie sua Conta</h1>
              <p className="text-xs text-muted-foreground font-medium">Descubra conexões autênticas e rolês em tempo real</p>
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-2xl border-red-500/50 bg-red-500/10 text-red-400 text-xs">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-1"
              >
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Nome Completo</Label>
                <Input
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12 bg-card/80 border border-border/80 rounded-2xl text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-purple-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-1"
              >
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">E-mail</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 bg-card/80 border border-border/80 rounded-2xl text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-purple-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-1"
              >
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Senha</Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className="h-12 bg-card/80 border border-border/80 rounded-2xl text-foreground placeholder:text-muted-foreground text-sm pr-12 focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground ml-1">Idade</label>
                  <Input
                    name="age"
                    type="number"
                    placeholder="18+"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="18"
                    max="100"
                    className="h-11 text-xs bg-card/80 border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground ml-1">Gênero</label>
                  <Select onValueChange={(value) => handleSelectChange('gender', value)}>
                    <SelectTrigger className="h-11 border border-border/80 rounded-xl bg-card/80 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground ml-1">Estilo Social</label>
                  <Select onValueChange={(value) => handleSelectChange('social_style', value)}>
                    <SelectTrigger className="h-11 border border-border/80 rounded-xl bg-card/80 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shy">Tímido(a)</SelectItem>
                      <SelectItem value="introverted">Introvertido(a)</SelectItem>
                      <SelectItem value="extroverted">Extrovertido(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  className="w-full h-12 proximous-button-primary rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Criando seu perfil...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Criar Minha Conta ✨</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center pt-2"
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-black luxury-gradient-text hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Já tem uma conta? Faça login
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 👑 POST-REGISTRATION PLAN SELECTION MODAL */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#0D0A1C] border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white my-8 relative"
            >
              {planStep === 'select' && (
                <>
                  <div className="text-center space-y-2">
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md inline-flex items-center gap-1">
                      <Crown className="h-3 w-3 fill-slate-950" /> CONTA CRIADA COM SUCESSO!
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Escolha seu Plano no Proximous</h2>
                    <p className="text-xs text-muted-foreground font-medium">Selecione o plano ideal para iniciar sua experiência na plataforma</p>
                  </div>

                  {/* Plans Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Free Plan Option */}
                    <div className="bg-[#100D21] border border-border/60 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-purple-500/40 transition-all">
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conta Padrão</span>
                        <h3 className="text-xl font-black text-white">Gratuito</h3>
                        <p className="text-[11px] text-muted-foreground font-medium">Recursos básicos para experimentar o aplicativo</p>

                        <ul className="space-y-1.5 pt-2 text-xs text-slate-300">
                          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> 10 curtidas/dia</li>
                          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> 10 mensagens/dia</li>
                          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Busca por radar</li>
                        </ul>
                      </div>

                      <button
                        onClick={handleSelectFreePlan}
                        className="w-full mt-4 py-2.5 px-4 rounded-xl border border-border text-xs font-black text-slate-300 hover:bg-white/10 transition-all flex items-center justify-center gap-1"
                      >
                        <span>Continuar Grátis</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* VIP Plan Option (Highlighted) */}
                    <div className="bg-gradient-to-b from-[#250C42] to-[#120524] border-2 border-purple-500 rounded-2xl p-5 space-y-3 flex flex-col justify-between relative shadow-xl">
                      <span className="absolute -top-3 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                        RECOMENDADO ⭐
                      </span>

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <Crown className="h-3.5 w-3.5 fill-amber-400" /> Plano VIP Promocional
                        </span>
                        <div className="flex items-baseline gap-1">
                          <h3 className="text-2xl font-black text-white">R$ 29,90</h3>
                          <span className="text-xs text-purple-300 font-bold">/mês</span>
                        </div>
                        <p className="text-[11px] text-purple-200/80 font-medium">Acesso total e ilimitado a todas as conexões</p>

                        <ul className="space-y-1.5 pt-2 text-xs text-white font-medium">
                          <li className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Curtidas Ilimitadas ⚡</li>
                          <li className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Mensagens Ilimitadas 💬</li>
                          <li className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Ver Quem te Curtiu 👑</li>
                          <li className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Selo VIP no Perfil ✨</li>
                        </ul>
                      </div>

                      <button
                        onClick={() => setPlanStep('pix_payment')}
                        className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-black shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Crown className="h-4 w-4 fill-white" />
                        <span>Quero Ser VIP via PIX</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {planStep === 'pix_payment' && (
                /* STEP 2: PIX QR CODE PAYMENT */
                <div className="space-y-5 text-center">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <button
                      onClick={() => setPlanStep('select')}
                      className="text-xs text-muted-foreground hover:text-white font-bold flex items-center gap-1"
                    >
                      ← Voltar aos Planos
                    </button>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <QrCode className="h-3 w-3" /> PIX INSTANTÂNEO
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">Pagamento PIX - Ativação VIP ⚡</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      Escaneie o QR Code abaixo ou copie a Chave CPF para concluir a assinatura VIP
                    </p>
                  </div>

                  {/* QR Code Graphic Generator for CPF 03207834566 */}
                  <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto shadow-2xl flex items-center justify-center border-4 border-purple-500/50">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${PIX_CPF_KEY}`}
                      alt="QRCode PIX 03207834566"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Copyable PIX CPF Key Box */}
                  <div className="bg-[#100D21] border border-purple-500/40 rounded-2xl p-4 space-y-2 text-left">
                    <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider">Chave PIX (CPF do Recebedor)</span>
                    <div className="flex items-center justify-between bg-black/50 p-2.5 rounded-xl border border-white/10 font-mono text-sm text-amber-400 font-bold">
                      <span>{PIX_CPF_KEY}</span>
                      <button
                        type="button"
                        onClick={handleCopyPixKey}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all"
                      >
                        {copiedPix ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-300" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copiar CPF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="text-left bg-purple-950/30 border border-purple-500/20 p-3.5 rounded-2xl space-y-1 text-xs text-purple-200 font-medium">
                    <p className="font-bold text-white text-xs mb-1">Passo a passo no app do seu banco:</p>
                    <p>1. Abra o app do seu banco e selecione <strong>PIX</strong>.</p>
                    <p>2. Escolha <strong>Pagar por Chave CPF</strong> ou <strong>QRCode</strong>.</p>
                    <p>3. Informe o CPF <strong>03207834566</strong>.</p>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      onClick={handleConfirmPixPayment}
                      disabled={registeringPayment}
                      className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:opacity-90 text-slate-950 font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {registeringPayment ? (
                        <div className="flex items-center gap-2 text-slate-950">
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Registrando solicitação...</span>
                        </div>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-slate-950" />
                          <span>Já Paguei / Enviar para Aprovação do Admin ⚡</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSelectFreePlan}
                      className="text-xs text-muted-foreground hover:text-white font-bold py-1"
                    >
                      Pagar depois (Usar Conta Gratuita por enquanto)
                    </button>
                  </div>
                </div>
              )}

              {planStep === 'pending_approval' && (
                /* STEP 3: PENDING SUPERADMIN APPROVAL CONFIRMATION */
                <div className="space-y-6 text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-2xl animate-bounce">
                    ⏳
                  </div>

                  <div className="space-y-2">
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                      SOLICITAÇÃO VIP REGISTRADA - AGUARDANDO ADMIN
                    </span>
                    <h3 className="text-2xl font-black text-white">Pagamento Registrado!</h3>
                    <p className="text-xs text-purple-200/90 font-medium leading-relaxed max-w-sm mx-auto">
                      Seu aviso de pagamento PIX de R$ 29,90 para o CPF <strong>{PIX_CPF_KEY}</strong> foi enviado. O SuperAdmin irá conferir o extrato e ativar seu selo e plano VIP em instantes!
                    </p>
                  </div>

                  <div className="bg-[#100D21] border border-amber-500/30 p-4 rounded-2xl text-left space-y-2 text-xs">
                    <p className="font-bold text-amber-300">📌 Status da sua Conta:</p>
                    <p className="text-slate-300">• Conta Padrão: <span className="text-emerald-400 font-bold">Ativa</span> (já pode usar o app)</p>
                    <p className="text-slate-300">• Assinatura VIP: <span className="text-amber-400 font-bold">Pendente de Aprovação do Admin</span></p>
                  </div>

                  <button
                    onClick={handleSelectFreePlan}
                    className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-black text-xs shadow-xl transition-all active:scale-95"
                  >
                    Entrar no Aplicativo Agora 🚀
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
