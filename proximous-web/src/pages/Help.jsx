import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  HelpCircle, 
  PhoneCall, 
  Bug, 
  Lightbulb, 
  Activity, 
  ChevronDown, 
  CheckCircle2, 
  ArrowLeft,
  Mail,
  Shield,
  User,
  Heart,
  MessageSquare,
  Star,
  Settings,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'Todas as categorias', icon: HelpCircle },
    { id: 'account', name: 'Conta e Perfil', icon: User },
    { id: 'matching', name: 'Matches e Curtidas', icon: Heart },
    { id: 'messages', name: 'Mensagens', icon: MessageSquare },
    { id: 'premium', name: 'Premium e VIP', icon: Star },
    { id: 'safety', name: 'Segurança', icon: Shield },
    { id: 'technical', name: 'Problemas Técnicos', icon: Settings },
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'Como criar uma conta no Proximous?',
      answer: 'Para criar uma conta, clique em "Criar conta" na página inicial, preencha seus dados básicos (nome, email, data de nascimento) e siga as instruções para verificar seu email. Depois, complete seu perfil com pelo menos 2 fotos.'
    },
    {
      id: 2,
      category: 'account',
      question: 'Como editar meu perfil e alterar fotos?',
      answer: 'Vá até a aba "Perfil" no menu inferior e clique em "Editar Perfil". Você pode alterar sua biografia, preferências e gerenciar sua galeria de fotos. Lembre-se de clicar em "Tornar Principal" para escolher sua imagem primária.'
    },
    {
      id: 3,
      category: 'account',
      question: 'Como funciona o sistema de Pontos de Empatia?',
      answer: 'Os Pontos de Empatia recompensam interações autênticas e positivas. Você ganha pontos ao publicar momentos (+15 pts), enviar icebreakers (+20 pts) e desbloquear conquistas (+10 pts). É possível ver seu extrato completo na tela de Perfil.'
    },
    {
      id: 4,
      category: 'matching',
      question: 'Como funciona o sistema de matches?',
      answer: 'Um match acontece quando duas pessoas se curtem mutuamente. Quando isso ocorre, vocês podem começar a conversar na aba "Mensagens". Use a aba "Descobrir" para encontrar pessoas próximas.'
    },
    {
      id: 5,
      category: 'matching',
      question: 'Quantas curtidas posso dar por dia?',
      answer: 'Usuários gratuitos possuem curtidas diárias para garantir interações de qualidade. Usuários com assinatura Premium possuem curtidas ilimitadas. O limite é renovado a cada 24 horas.'
    },
    {
      id: 6,
      category: 'matching',
      question: 'O que é o Modo AGORA (Atividade em Tempo Real)?',
      answer: 'O Modo AGORA permite sinalizar que você está disponível para um encontro ou conversa nas próximas horas (ex: "Tomando um café no shopping"). Outras pessoas próximas podem ver sua disponibilidade em tempo real.'
    },
    {
      id: 7,
      category: 'messages',
      question: 'Por que não consigo enviar mensagens?',
      answer: 'Você pode enviar mensagens para pessoas com quem fez match ou iniciar conversas enviando um Icebreaker em um Momento do Feed. Verifique sua conexão com a internet ou atualize o aplicativo caso enfrente lentidão.'
    },
    {
      id: 8,
      category: 'messages',
      question: 'O que são os Icebreakers?',
      answer: 'Icebreakers são mensagens diretas enviadas a partir de uma publicação no Feed de Momentos. Eles são uma forma divertida e natural de iniciar um assunto sobre algo que a pessoa postou.'
    },
    {
      id: 9,
      category: 'premium',
      question: 'Quais são os benefícios da assinatura Premium?',
      answer: 'A assinatura Premium oferece curtidas ilimitadas, modo invisível, filtro de distância expandido, destaque de perfil no Discover e atendimento prioritário na Central de Suporte.'
    },
    {
      id: 10,
      category: 'premium',
      question: 'Como ativar meu cupom VIP de teste?',
      answer: 'Na Central de Administração ou na página de upgrade para Premium, digite seu código de cupom no campo correspondente e clique em "Aplicar".'
    },
    {
      id: 11,
      category: 'safety',
      question: 'Como denunciar um perfil ou conduta inadequada?',
      answer: 'Em qualquer perfil ou conversa, você pode clicar nos três pontos e escolher "Denunciar". Sua denúncia é enviada diretamente para a equipe de moderação e mantida sob sigilo.'
    },
    {
      id: 12,
      category: 'safety',
      question: 'Meus dados e localização exata são exibidos?',
      answer: 'Não. O Proximous utiliza técnicas de privacidade (anti-trilateração) mostrando distâncias aproximadas (ex: "~2 km") para proteger a localização exata dos usuários.'
    },
    {
      id: 13,
      category: 'technical',
      question: 'O aplicativo não está carregando, o que fazer?',
      answer: 'Verifique sua conexão com a internet. Se o problema persistir, recarregue a página ou limpe o cache do navegador. Você também pode verificar o Status do Sistema no botão acima.'
    },
    {
      id: 14,
      category: 'technical',
      question: 'Não estou recebendo notificações no celular',
      answer: 'Certifique-se de que autorizou as permissões de notificação do Proximous em seu navegador ou dispositivo e confira se o status "Modo Invisível" não está ativo.'
    }
  ];

  const quickActions = [
    {
      title: 'Fale Conosco',
      description: 'Abra um chamado de suporte com nossa equipe',
      icon: PhoneCall,
      color: 'from-purple-600 to-pink-600',
      action: () => navigate('/contact')
    },
    {
      title: 'Denunciar Problema',
      description: 'Reporte um bug ou falha técnica',
      icon: Bug,
      color: 'from-red-600 to-amber-600',
      action: () => navigate('/contact?category=technical&subject=Reportar%20Bug')
    },
    {
      title: 'Sugestões',
      description: 'Envie ideias para melhorar a plataforma',
      icon: Lightbulb,
      color: 'from-amber-500 to-emerald-600',
      action: () => navigate('/contact?category=feature&subject=Sugest%C3%A3o%20de%20Recurso')
    },
    {
      title: 'Status do Sistema',
      description: 'Verifique o status de nossos servidores',
      icon: Activity,
      color: 'from-emerald-600 to-teal-600',
      action: () => setShowStatusModal(true)
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const systemServices = [
    { name: 'Servidor Principal (API REST)', status: 'operational', latency: '14ms' },
    { name: 'Banco de Dados SQL & Usuários', status: 'operational', latency: '8ms' },
    { name: 'Servidor de Mensagens Realtime (WebSockets)', status: 'operational', latency: '19ms' },
    { name: 'Algoritmo de Compatibilidade & Match', status: 'operational', latency: '22ms' },
    { name: 'Feed de Momentos & Galeria de Mídias', status: 'operational', latency: '25ms' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-border/60 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl mx-auto">
            <HelpCircle className="h-8 w-8 animate-bounce" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Como podemos te ajudar hoje?</h1>
          <p className="text-xs sm:text-sm text-purple-200 font-medium max-w-xl mx-auto">
            Pesquise por dúvidas frequentes ou acesse os canais diretos de suporte da plataforma Proximous.
          </p>

          {/* Search Input Bar */}
          <div className="pt-4 max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-7 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por dúvidas, palavras-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xl backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Ações Rápidas de Suporte</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  onClick={item.action}
                  className="luxury-glass-card border border-border/80 p-5 rounded-3xl cursor-pointer hover:border-purple-500/40 hover:shadow-purple-500/10 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-110 transition-transform`}>
                    <IconComp className="h-5 w-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-foreground mb-1">{item.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Categories Filter */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Categorias de Dúvidas</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md font-extrabold'
                      : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQs Accordion List */}
        <div className="luxury-glass-card border border-border/80 p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <h2 className="text-base font-black text-foreground">Perguntas Frequentes</h2>
            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'pergunta' : 'perguntas'}
            </Badge>
          </div>

          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-bold text-foreground">Nenhuma pergunta encontrada</h3>
              <p className="text-xs text-muted-foreground">Tente buscar com outros termos ou selecione a categoria "Todas as categorias".</p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {filteredFAQs.map((faq) => {
                const isOpen = expandedFAQ === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-border/80 rounded-2xl overflow-hidden transition-all bg-card/60"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full p-4 text-left font-bold text-xs sm:text-sm text-foreground hover:bg-accent/40 transition-colors flex items-center justify-between gap-3"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`h-4 w-4 text-purple-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-accent/20">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact Banner Footer */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 rounded-3xl p-8 text-center text-white shadow-2xl space-y-4">
          <h3 className="text-lg font-black">Ainda precisa de ajuda personalizada?</h3>
          <p className="text-xs text-purple-200 max-w-md mx-auto leading-relaxed">
            Nossa equipe técnica e de suporte responde chamados em tempo recorde para garantir a melhor experiência.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              onClick={() => navigate('/contact')}
              className="bg-white text-purple-900 hover:bg-purple-50 font-extrabold text-xs py-3 px-6 rounded-2xl shadow-lg"
            >
              Falar com o Suporte
            </Button>
            <Button
              onClick={() => window.location.href = 'mailto:suporte@proximous.com'}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-bold text-xs py-3 px-6 rounded-2xl"
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar E-mail
            </Button>
          </div>
        </div>

      </div>

      {/* SYSTEM STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowStatusModal(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Status do Sistema</h3>
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Todos os sistemas operacionais (100%)
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 text-xs">
              {systemServices.map((svc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-accent/40 border border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-foreground">{svc.name}</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px] font-black">
                    {svc.latency}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center text-[10px] text-muted-foreground">
              Uptime médio nos últimos 30 dias: <span className="font-extrabold text-foreground">99.98%</span>
            </div>

            <Button
              onClick={() => setShowStatusModal(false)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-2.5 rounded-xl"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Help;
