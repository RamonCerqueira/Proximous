import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supportAPI } from '../lib/api';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Mail, 
  LifeBuoy, 
  Plus, 
  RefreshCw, 
  FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Contact = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'my_tickets'

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    category: 'technical',
    priority: 'medium',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [formError, setFormError] = useState('');

  // Tickets List State
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Ticket Detail / Chat Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (activeTab === 'my_tickets') {
      fetchMyTickets();
    }
  }, [activeTab]);

  const fetchMyTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await supportAPI.getMyTickets();
      setTickets(res.data?.tickets || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.subject.trim() || !formData.message.trim()) {
      setFormError('Por favor, preencha o assunto e a mensagem do chamado.');
      return;
    }

    setLoading(true);

    try {
      const res = await supportAPI.createTicket({
        user_name: formData.name || user?.name || 'Usuário',
        user_email: formData.email || user?.email || '',
        subject: formData.subject,
        category: formData.category || 'technical',
        priority: formData.priority || 'medium',
        description: formData.message
      });

      setSubmittedTicket(res.data?.ticket || { id: 'novo' });
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        category: 'technical',
        priority: 'medium',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      setFormError('Falha ao abrir chamado. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicketDetails = async (ticketId) => {
    try {
      setLoadingDetails(true);
      const res = await supportAPI.getTicket(ticketId);
      setSelectedTicket(res.data?.ticket);
    } catch (err) {
      console.error('Error loading ticket details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      await supportAPI.addMessage(selectedTicket.id, { content: replyText });
      setReplyText('');
      // Reload ticket details
      handleOpenTicketDetails(selectedTicket.id);
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      open: { label: 'Aberto', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      in_progress: { label: 'Em Atendimento', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      resolved: { label: 'Resolvido', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      closed: { label: 'Fechado', class: 'bg-slate-500/20 text-slate-400 border-slate-500/30' }
    };
    const c = config[status] || config.open;
    return (
      <Badge className={`${c.class} border text-[10px] font-black px-2 py-0.5 rounded-full`}>
        {c.label}
      </Badge>
    );
  };

  const categories = [
    { value: 'account', label: 'Problemas com conta' },
    { value: 'technical', label: 'Problemas técnicos' },
    { value: 'payment', label: 'Pagamentos e assinaturas' },
    { value: 'safety', label: 'Segurança e denúncias' },
    { value: 'feature', label: 'Sugestões de recursos' },
    { value: 'other', label: 'Outros assuntos' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-border/60 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
              <LifeBuoy className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Central de Suporte & Atendimento</h1>
              <p className="text-xs text-purple-200 font-medium">Estamos prontos para te ajudar 24 horas por dia</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/60 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('new'); setSubmittedTicket(null); }}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-purple-600 text-white font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="h-4 w-4" />
              Novo Chamado
            </button>
            <button
              onClick={() => setActiveTab('my_tickets')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'my_tickets'
                  ? 'bg-purple-600 text-white font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Meus Chamados
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="luxury-glass-card border border-border/80 p-6 rounded-3xl space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Informações de Atendimento</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Email Oficial</p>
                    <p className="text-muted-foreground">suporte@proximous.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Horário de Operação</p>
                    <p className="text-muted-foreground">24 horas / 7 dias por semana</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Tempo Médio de Resposta</p>
                    <p className="text-muted-foreground">Até 24 horas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="luxury-glass-card border border-border/80 p-6 rounded-3xl space-y-4 text-xs">
              <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Central de Ajuda</h3>
              <a
                href="/help"
                className="flex items-center gap-2 p-3 rounded-xl bg-accent/50 hover:bg-accent text-foreground font-bold transition-all"
              >
                <HelpCircle className="h-4 w-4 text-purple-400" />
                <span>Perguntas Frequentes (FAQ)</span>
              </a>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-2">
            
            {/* TAB 1: NOVO CHAMADO */}
            {activeTab === 'new' && (
              <div>
                {submittedTicket ? (
                  <div className="luxury-glass-card border border-emerald-500/30 p-8 rounded-3xl text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-black text-foreground">Chamado Criado com Sucesso!</h2>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Sua solicitação foi registrada na nossa fila de suporte. Nossa equipe analisará os dados e enviará uma resposta em breve.
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => setActiveTab('my_tickets')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl py-2.5 px-6"
                      >
                        Acompanhar Meus Chamados
                      </Button>
                      <Button
                        onClick={() => setSubmittedTicket(null)}
                        variant="outline"
                        className="text-xs font-bold rounded-xl py-2.5 px-6"
                      >
                        Abrir Outro Chamado
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="luxury-glass-card border border-border/80 p-6 sm:p-8 rounded-3xl">
                    <h3 className="text-base font-black text-foreground mb-6">Abrir Novo Ticket de Atendimento</h3>

                    {formError && (
                      <div className="mb-6 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-foreground mb-1.5">Seu Nome</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-card border border-border/80 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Seu nome"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-foreground mb-1.5">Seu Email</label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-card border border-border/80 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="seu@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-foreground mb-1.5">Categoria</label>
                          <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-card border border-border/80 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {categories.map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-foreground mb-1.5">Prioridade</label>
                          <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-card border border-border/80 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-foreground mb-1.5">Assunto</label>
                        <input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-card border border-border/80 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Resumo do problema ou dúvida"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-foreground mb-1.5">Descrição Detalhada</label>
                        <textarea
                          required
                          rows={5}
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-card border border-border/80 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          placeholder="Descreva detalhadamente o que aconteceu..."
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-xs py-3 px-8 rounded-2xl shadow-lg"
                        >
                          {loading ? 'Enviando Chamado...' : 'Enviar Chamado para o Suporte'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MEUS CHAMADOS */}
            {activeTab === 'my_tickets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-foreground">Histórico de Chamados</h3>
                  <Button
                    onClick={fetchMyTickets}
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold rounded-xl"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loadingTickets ? 'animate-spin' : ''}`} />
                    Atualizar Lista
                  </Button>
                </div>

                {loadingTickets ? (
                  <div className="luxury-glass-card border border-border/80 p-8 rounded-3xl text-center text-xs text-muted-foreground">
                    Carregando seus chamados...
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="luxury-glass-card border border-border/80 p-8 rounded-3xl text-center space-y-3">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                    <p className="text-xs font-bold text-foreground">Você ainda não possui chamados abertos.</p>
                    <p className="text-[11px] text-muted-foreground">Precisa de ajuda? Clique na aba "Novo Chamado" para falar com o suporte.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleOpenTicketDetails(t.id)}
                        className="luxury-glass-card border border-border/80 p-4 rounded-2xl hover:border-purple-500/40 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-extrabold text-xs text-foreground truncate">{t.subject}</span>
                            {getStatusBadge(t.status)}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{t.description}</p>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t.created_at ? new Date(t.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs font-bold text-purple-400 group-hover:text-purple-300">
                          Ver Conversa →
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* TICKET DETAILS / CHAT MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-extrabold text-foreground">{selectedTicket.subject}</h3>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <p className="text-xs text-muted-foreground">Chamado #{selectedTicket.id?.substring(0, 8)}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-2"
              >
                ✕
              </button>
            </div>

            {/* Messages Chat Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs my-2 pr-1">
              {loadingDetails ? (
                <div className="text-center py-8 text-muted-foreground">Carregando histórico do chamado...</div>
              ) : selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                selectedTicket.messages.map((msg) => {
                  const isUser = msg.sender_type === 'user' || msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl ${
                          isUser
                            ? 'bg-purple-600 text-white rounded-tr-none'
                            : 'bg-accent text-foreground rounded-tl-none border border-border/60'
                        }`}
                      >
                        <p className="font-bold text-[10px] opacity-80 mb-1">
                          {isUser ? 'Você' : `Suporte (${msg.sender_name || 'Atendente'})`}
                        </p>
                        <p className="leading-relaxed font-medium">{msg.content}</p>
                        <p className="text-[9px] opacity-60 text-right mt-1">
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhuma mensagem registrada.</p>
              )}
            </div>

            {/* Reply Form */}
            {selectedTicket.status !== 'closed' ? (
              <form onSubmit={handleSendReply} className="pt-3 border-t border-border/60 flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escreva uma resposta para o suporte..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-accent/60 border border-border/80 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button
                  type="submit"
                  disabled={sendingReply}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="pt-3 border-t border-border/60 text-center text-xs text-muted-foreground">
                Este chamado foi encerrado pelo suporte.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
