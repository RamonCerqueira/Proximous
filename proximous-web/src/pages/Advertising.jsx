import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const Advertising = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalImpressions: 0,
    totalClicks: 0,
    activeCampaigns: 0
  });

  useEffect(() => {
    fetchAdvertisingData();
  }, []);

  const fetchAdvertisingData = async () => {
    // Simulate API call
    setTimeout(() => {
      setCampaigns([
        {
          id: 1,
          name: 'Campanha Verão 2024',
          status: 'active',
          budget: 500,
          spent: 234.50,
          impressions: 12450,
          clicks: 234,
          ctr: 1.88,
          startDate: '2024-01-15',
          endDate: '2024-02-15'
        },
        {
          id: 2,
          name: 'Promoção Premium',
          status: 'paused',
          budget: 300,
          spent: 89.30,
          impressions: 5670,
          clicks: 89,
          ctr: 1.57,
          startDate: '2024-01-10',
          endDate: '2024-01-31'
        }
      ]);

      setStats({
        totalSpent: 323.80,
        totalImpressions: 18120,
        totalClicks: 323,
        activeCampaigns: 1
      });
    }, 1000);
  };

  const adFormats = [
    {
      type: 'banner',
      name: 'Banner Display',
      description: 'Anúncios em banner exibidos no feed principal',
      price: 'R$ 2,50 por 1000 impressões',
      icon: '🖼️'
    },
    {
      type: 'story',
      name: 'Story Ads',
      description: 'Anúncios em formato de story entre os perfis',
      price: 'R$ 3,00 por 1000 impressões',
      icon: '📱'
    },
    {
      type: 'boost',
      name: 'Boost de Perfil',
      description: 'Destaque seu perfil para mais usuários',
      price: 'R$ 0,10 por visualização',
      icon: '🚀'
    },
    {
      type: 'sponsored',
      name: 'Post Patrocinado',
      description: 'Promova conteúdo específico no feed',
      price: 'R$ 1,80 por 1000 impressões',
      icon: '📢'
    }
  ];

  const targetingOptions = [
    { label: 'Localização', options: ['Cidade', 'Estado', 'Raio específico'] },
    { label: 'Idade', options: ['18-25', '26-35', '36-45', '46+'] },
    { label: 'Gênero', options: ['Masculino', 'Feminino', 'Todos'] },
    { label: 'Interesses', options: ['Esportes', 'Música', 'Viagem', 'Tecnologia', 'Arte'] },
    { label: 'Comportamento', options: ['Usuários ativos', 'Premium', 'Novos usuários'] }
  ];

  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const CampaignCard = ({ campaign }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            campaign.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
          </span>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Orçamento</p>
          <p className="text-lg font-semibold text-gray-900">R$ {campaign.budget}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Gasto</p>
          <p className="text-lg font-semibold text-gray-900">R$ {campaign.spent}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Impressões</p>
          <p className="text-lg font-semibold text-gray-900">{campaign.impressions.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">CTR</p>
          <p className="text-lg font-semibold text-gray-900">{campaign.ctr}%</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-purple-600 h-2 rounded-full" 
          style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{campaign.startDate} - {campaign.endDate}</span>
        <span>{Math.round((campaign.spent / campaign.budget) * 100)}% do orçamento usado</span>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Investido"
          value={`R$ ${stats.totalSpent.toFixed(2)}`}
          subtitle="Este mês"
          icon="💰"
          color="green"
        />
        <StatCard
          title="Impressões"
          value={stats.totalImpressions.toLocaleString()}
          subtitle="Total de visualizações"
          icon="👁️"
          color="blue"
        />
        <StatCard
          title="Cliques"
          value={stats.totalClicks.toLocaleString()}
          subtitle={`CTR: ${((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2)}%`}
          icon="👆"
          color="purple"
        />
        <StatCard
          title="Campanhas Ativas"
          value={stats.activeCampaigns}
          subtitle="Em execução"
          icon="📊"
          color="orange"
        />
      </div>

      {/* Active Campaigns */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Campanhas Ativas</h2>
          <button
            onClick={() => setActiveTab('create')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
          >
            Nova Campanha
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </div>
  );

  const CreateCampaignTab = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Criar Nova Campanha</h2>

        {/* Ad Formats */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Escolha o Formato do Anúncio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adFormats.map((format) => (
              <div
                key={format.type}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">{format.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{format.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{format.description}</p>
                    <p className="text-purple-600 font-medium text-sm">{format.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Targeting */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segmentação de Público</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targetingOptions.map((option) => (
              <div key={option.label} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{option.label}</h4>
                <div className="space-y-2">
                  {option.options.map((item) => (
                    <label key={item} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="ml-2 text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orçamento e Cronograma</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orçamento Total
              </label>
              <input
                type="number"
                placeholder="R$ 100,00"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início
              </label>
              <input
                type="date"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim
              </label>
              <input
                type="date"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
            Criar Campanha
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Central de Publicidade</h1>
                <p className="text-gray-600">Promova seu negócio no Proximous</p>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Visão Geral', icon: '📊' },
              { id: 'create', name: 'Criar Campanha', icon: '➕' },
              { id: 'analytics', name: 'Analytics', icon: '📈' },
              { id: 'billing', name: 'Faturamento', icon: '💳' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'create' && <CreateCampaignTab />}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics em Desenvolvimento</h3>
            <p className="text-gray-600">Relatórios detalhados estarão disponíveis em breve.</p>
          </div>
        )}
        {activeTab === 'billing' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Faturamento em Desenvolvimento</h3>
            <p className="text-gray-600">Histórico de pagamentos estará disponível em breve.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Advertising;

