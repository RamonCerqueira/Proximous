import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'Todas as categorias', icon: '📋' },
    { id: 'account', name: 'Conta e Perfil', icon: '👤' },
    { id: 'matching', name: 'Matches e Curtidas', icon: '💖' },
    { id: 'messages', name: 'Mensagens', icon: '💬' },
    { id: 'premium', name: 'Premium e Pagamentos', icon: '⭐' },
    { id: 'safety', name: 'Segurança', icon: '🛡️' },
    { id: 'technical', name: 'Problemas Técnicos', icon: '⚙️' },
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'Como criar uma conta no Proximous?',
      answer: 'Para criar uma conta, clique em "Criar conta" na página inicial, preencha seus dados básicos (nome, email, data de nascimento) e siga as instruções para verificar seu email. Depois, complete seu perfil com fotos e informações sobre você.'
    },
    {
      id: 2,
      category: 'account',
      question: 'Como editar meu perfil?',
      answer: 'Vá até a aba "Perfil" no menu inferior, toque no ícone de edição e você poderá alterar suas fotos, biografia, interesses e outras informações. Lembre-se de salvar as alterações.'
    },
    {
      id: 3,
      category: 'account',
      question: 'Como excluir minha conta?',
      answer: 'Nas configurações do seu perfil, role até o final e selecione "Excluir conta". Esta ação é irreversível e todos os seus dados serão permanentemente removidos.'
    },
    {
      id: 4,
      category: 'matching',
      question: 'Como funciona o sistema de matches?',
      answer: 'Um match acontece quando duas pessoas se curtem mutuamente. Quando isso ocorre, vocês podem começar a conversar. Use a aba "Descobrir" para ver pessoas próximas e deslize para a direita para curtir.'
    },
    {
      id: 5,
      category: 'matching',
      question: 'Quantas curtidas posso dar por dia?',
      answer: 'Usuários gratuitos podem dar até 10 curtidas por dia. Usuários Premium têm curtidas ilimitadas. O limite é renovado a cada 24 horas.'
    },
    {
      id: 6,
      category: 'matching',
      question: 'O que são Super Likes?',
      answer: 'Super Likes são uma forma especial de demonstrar interesse. Quando você dá um Super Like, a pessoa é notificada imediatamente. Usuários gratuitos têm 1 Super Like por dia, Premium têm 5.'
    },
    {
      id: 7,
      category: 'messages',
      question: 'Por que não consigo enviar mensagens?',
      answer: 'Você só pode enviar mensagens para pessoas com quem fez match. Se vocês fizeram match mas ainda não consegue enviar mensagens, verifique sua conexão com a internet ou tente reiniciar o app.'
    },
    {
      id: 8,
      category: 'messages',
      question: 'Como sei se minha mensagem foi lida?',
      answer: 'Mensagens lidas aparecem com um ícone de "visto" ao lado. Se a pessoa está online, você verá um ponto verde no perfil dela.'
    },
    {
      id: 9,
      category: 'premium',
      question: 'Quais são os benefícios do Premium?',
      answer: 'Premium inclui: curtidas ilimitadas, 5 Super Likes por dia, ver quem curtiu você, filtros avançados, modo invisível, suporte prioritário e muito mais.'
    },
    {
      id: 10,
      category: 'premium',
      question: 'Como cancelar minha assinatura Premium?',
      answer: 'Vá em Configurações > Assinatura > Cancelar. Você continuará tendo acesso aos recursos Premium até o final do período pago.'
    },
    {
      id: 11,
      category: 'premium',
      question: 'Posso usar cupons de desconto?',
      answer: 'Sim! Na página de upgrade para Premium, há um campo para inserir cupons de desconto. Digite seu código e clique em "Aplicar" para ver o desconto.'
    },
    {
      id: 12,
      category: 'safety',
      question: 'Como denunciar um usuário?',
      answer: 'No perfil da pessoa, toque nos três pontos no canto superior direito e selecione "Denunciar". Escolha o motivo da denúncia e nossa equipe analisará o caso.'
    },
    {
      id: 13,
      category: 'safety',
      question: 'Meus dados estão seguros?',
      answer: 'Sim, levamos a privacidade muito a sério. Seus dados são criptografados e nunca compartilhamos informações pessoais com terceiros sem seu consentimento.'
    },
    {
      id: 14,
      category: 'safety',
      question: 'Como bloquear alguém?',
      answer: 'No perfil da pessoa ou na conversa, toque nos três pontos e selecione "Bloquear". A pessoa não poderá mais ver seu perfil ou entrar em contato.'
    },
    {
      id: 15,
      category: 'technical',
      question: 'O app não está carregando, o que fazer?',
      answer: 'Primeiro, verifique sua conexão com a internet. Se o problema persistir, tente fechar e abrir o app novamente, ou reiniciar seu dispositivo. Se ainda não funcionar, entre em contato conosco.'
    },
    {
      id: 16,
      category: 'technical',
      question: 'Não estou recebendo notificações',
      answer: 'Verifique se as notificações estão habilitadas nas configurações do seu dispositivo para o Proximous. Também confira as configurações de notificação dentro do app.'
    },
    {
      id: 17,
      category: 'technical',
      question: 'Como atualizar minha localização?',
      answer: 'Sua localização é atualizada automaticamente quando você abre o app. Certifique-se de que o GPS está habilitado e que você deu permissão de localização para o Proximous.'
    }
  ];

  const quickActions = [
    {
      title: 'Fale Conosco',
      description: 'Entre em contato com nossa equipe de suporte',
      icon: '📞',
      action: () => navigate('/contact')
    },
    {
      title: 'Denunciar Problema',
      description: 'Reporte bugs ou problemas técnicos',
      icon: '🐛',
      action: () => navigate('/report')
    },
    {
      title: 'Sugestões',
      description: 'Envie ideias para melhorar o Proximous',
      icon: '💡',
      action: () => navigate('/feedback')
    },
    {
      title: 'Status do Sistema',
      description: 'Verifique se há problemas conhecidos',
      icon: '📊',
      action: () => window.open('https://status.proximous.com', '_blank')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Central de Ajuda</h1>
                <p className="text-gray-600">Como podemos ajudar você hoje?</p>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por perguntas, palavras-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-3">{action.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-3 rounded-lg text-center transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="text-xl mb-1">{category.icon}</div>
                <div className="text-xs font-medium">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Perguntas Frequentes
            </h2>
            <span className="text-sm text-gray-500">
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>

          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.4a7.962 7.962 0 01-8-7.691c0-4.411 3.589-8 8-8s8 3.589 8 8a7.962 7.962 0 01-2 5.291z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600">
                Tente buscar por outras palavras-chave ou selecione uma categoria diferente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        expandedFAQ === faq.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-6 py-4 bg-white border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Não encontrou o que procurava?</h3>
          <p className="mb-6 opacity-90">
            Nossa equipe de suporte está sempre pronta para ajudar você
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Fale Conosco
            </button>
            <button
              onClick={() => window.open('mailto:suporte@proximous.com')}
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Enviar Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;

