import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  MapPin, 
  Flame, 
  Heart, 
  Zap, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Camera, 
  Coffee, 
  Compass, 
  CheckCircle2, 
  Lock,
  Globe,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070512] text-white selection:bg-[#FF2B68] selection:text-white flex flex-col justify-between overflow-x-hidden relative">
      
      {/* 🔮 AMBIENT LIGHT BLOBS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#9B20F0]/20 via-[#FF2B68]/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[45%] -left-40 w-[450px] h-[450px] bg-purple-700/15 blur-[130px] pointer-events-none" />
      <div className="absolute top-[65%] -right-40 w-[450px] h-[450px] bg-pink-600/15 blur-[130px] pointer-events-none" />

      {/* 🧭 TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-[#0B061A]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logoProximouCompleta.png" 
              alt="Proximous" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logoProximou.png';
              }}
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-400">
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#radar" className="hover:text-white transition-colors">Radar ao Vivo</a>
            <a href="#roles" className="hover:text-white transition-colors">Modo AGORA</a>
            <a href="#momentos" className="hover:text-white transition-colors">Feed de Momentos</a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-zinc-300 hover:text-white hover:bg-white/5 text-xs font-black rounded-xl h-10 px-4"
            >
              Entrar
            </Button>

            <Button
              onClick={() => navigate('/register')}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#9B20F0] to-[#FF2B68] text-white font-black text-xs shadow-[0_4px_20px_rgba(255,43,104,0.35)] hover:opacity-95 transition-all active:scale-95"
            >
              Cadastre-se
            </Button>
          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <main className="flex-1">
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          
          {/* Tag Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1033] border border-purple-500/40 text-purple-300 text-xs font-extrabold shadow-lg mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>A Rede Social das Conexões Reais & Presenciais</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto"
          >
            Conecte-se com pessoas incríveis ao seu redor{' '}
            <span className="bg-gradient-to-r from-[#9B20F0] via-[#FF2B68] to-[#FF9E00] bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(255,43,104,0.3)]">
              agora mesmo.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-xl text-zinc-400 font-normal max-w-2xl mx-auto leading-relaxed"
          >
            Sem conversas infinitas que não dão em nada. Descubra quem está por perto, combine cafés, treinos e rolês espontâneos com 100% de perfis reais.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <Button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] text-white font-black text-sm shadow-[0_10px_35px_rgba(255,43,104,0.4)] hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Criar Minha Conta Grátis</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#120B28] border border-white/15 hover:bg-white/10 text-white font-bold text-sm transition-all"
            >
              Já tenho uma conta
            </Button>
          </motion.div>

          {/* Micro Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Perfis com fotos reais
            </span>
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-purple-400 animate-pulse" /> Geolocalização em tempo real
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Convites para hoje
            </span>
          </div>

          {/* 📱 INTERACTIVE 3D APP HERO CARDS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 sm:mt-20 relative max-w-4xl mx-auto"
          >
            <div className="relative rounded-[32px] sm:rounded-[40px] p-2 sm:p-3 bg-gradient-to-b from-purple-500/30 via-pink-500/20 to-transparent border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.8)]">
              <div className="rounded-[28px] sm:rounded-[36px] bg-[#0E0822] overflow-hidden border border-white/5 p-4 sm:p-8">
                
                {/* Floating Mock Cards inside Hero Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  
                  {/* Card 1: Radar de Pessoas */}
                  <div className="p-5 rounded-2xl bg-[#170E30]/80 border border-purple-500/25 space-y-3 relative overflow-hidden group hover:border-purple-500/50 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-purple-600/30 text-purple-300 text-[10px] font-black uppercase tracking-wider">
                        Radar Próximo
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 p-0.5 shadow-md">
                        <img 
                          src="https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=300&q=80" 
                          alt="Avatar" 
                          className="w-full h-full rounded-[14px] object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">Mariana, 24</h4>
                        <p className="text-xs text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-pink-400" /> A 800 metros de você
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 italic">
                      "Tomando um café no Rio Vermelho ☕ Bora papear?"
                    </p>
                  </div>

                  {/* Card 2: Rolê no Modo AGORA */}
                  <div className="p-5 rounded-2xl bg-[#170E30]/80 border border-pink-500/30 space-y-3 relative overflow-hidden group hover:border-pink-500/60 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-pink-600/30 text-pink-300 text-[10px] font-black uppercase tracking-wider">
                        Convite para Hoje
                      </span>
                      <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    <h4 className="text-sm font-black text-white">🎾 Beach Tennis na Praia</h4>
                    <p className="text-xs text-zinc-300">
                      Dupla mista às 17:30. Nível iniciante/médio!
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                      <span className="text-emerald-400 font-bold">2 vagas restantes</span>
                      <span className="px-3 py-1 rounded-lg bg-pink-600 text-white font-bold text-[11px]">Quero ir! ⚡</span>
                    </div>
                  </div>

                  {/* Card 3: Deu Match */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-[#221245] to-[#140B28] border border-amber-500/30 space-y-3 relative overflow-hidden group hover:border-amber-500/60 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                        Deu Match! 🔥
                      </span>
                      <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
                    </div>
                    <div className="flex items-center -space-x-3 py-1">
                      <div className="w-10 h-10 rounded-full border-2 border-purple-500 overflow-hidden shadow-md">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" alt="User 1" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-pink-500 overflow-hidden shadow-md">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="User 2" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Conexão em tempo real verificada pelo Proximous.
                    </p>
                  </div>

                </div>

              </div>
            </div>
          </motion.div>

        </section>

        {/* 🌟 4 PILLARS FEATURE SECTION */}
        <section id="recursos" className="py-20 border-t border-white/5 bg-[#0B061A]/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <h2 className="text-xs font-black text-purple-400 uppercase tracking-widest">
                Tudo o que você precisa
              </h2>
              <h3 className="text-3xl sm:text-4xl font-black text-white">
                Projetado para encontros na vida real.
              </h3>
              <p className="text-sm text-zinc-400">
                Uma experiência social completa, segura e focada em quem está ao seu redor.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Feature 1 */}
              <div className="p-6 rounded-3xl bg-[#120B28] border border-white/10 hover:border-purple-500/40 transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">Radar Inteligente</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Veja quem está nos mesmos lugares que você em tempo real com distância calculada com precisão.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-3xl bg-[#120B28] border border-white/10 hover:border-pink-500/40 transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-300 group-hover:scale-110 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">Modo AGORA</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Crie e entre em convites espontâneos para cafés, cinema, esportes e drinks marcados para o mesmo dia.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-3xl bg-[#120B28] border border-white/10 hover:border-amber-500/40 transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">Feed de Momentos</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Publique fotos e pensamentos do seu dia no feed local e acumule pontos de empatia na comunidade.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-3xl bg-[#120B28] border border-white/10 hover:border-emerald-500/40 transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">Perfis 100% Autênticos</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Exigência obrigatória de fotos reais de perfil e moderação ativa para sua total segurança.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* 💬 BOTTOM CTA BANNER */}
        <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl sm:rounded-[36px] bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] p-8 sm:p-14 text-center space-y-6 shadow-[0_20px_80px_rgba(255,43,104,0.3)]">
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Pronto para viver novas conexões?
            </h3>
            <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto font-medium">
              Junte-se à comunidade do Proximous e descubra quem está perto de você hoje mesmo.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => navigate('/register')}
                className="h-14 px-10 rounded-2xl bg-white text-purple-950 font-black text-sm hover:bg-white/90 shadow-2xl active:scale-95 transition-all"
              >
                Começar Gratuitamente 🚀
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* 🦶 MINIMALIST FOOTER */}
      <footer className="border-t border-white/10 bg-[#080414] py-12 text-zinc-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Brand Logo & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img 
              src="/logoProximouCompleta.png" 
              alt="Proximous" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logoProximou.png';
              }}
              className="h-8 w-auto object-contain opacity-80"
            />
            <span>© {new Date().getFullYear()} Proximous. Todos os direitos reservados.</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 font-medium">
            <Link to="/login" className="hover:text-white transition-colors">Entrar</Link>
            <Link to="/register" className="hover:text-white transition-colors">Criar Conta</Link>
            <Link to="/help" className="hover:text-white transition-colors">Central de Ajuda</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contato</Link>
            <Link to="/advertising" className="hover:text-white transition-colors">Anunciar</Link>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
