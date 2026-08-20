import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error('Erro ao buscar estatísticas do dashboard:', err);
      setError('Não foi possível carregar as estatísticas do dashboard. Verifique sua conexão ou permissões.');
      // Redirecionar para o login se for erro de autenticação/autorização
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        logout();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card de Usuários Totais */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Usuários Totais</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_users}</p>
            </div>
            <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.146-1.284-.427-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.146-1.284.427-1.857m0 0A9.953 9.953 0 0112 5c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" />
            </svg>
          </div>
        </div>

        {/* Card de Usuários Ativos */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Usuários Ativos (24h)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.active_users_24h}</p>
            </div>
            <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8L11 2m9 9v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h8m-1 13a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Card de Assinaturas Premium */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Assinaturas Premium</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.premium_subscriptions}</p>
            </div>
            <svg className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L21 12m-2 2l2 2m-6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card de Receita Estimada (Mensal) */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Receita Estimada (Mês)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">R$ {stats?.estimated_monthly_revenue?.toFixed(2)}</p>
            </div>
            <svg className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Seções de Gerenciamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gerenciamento de Usuários */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gerenciamento de Usuários</h2>
          <p className="text-gray-600 mb-4">Visualize, edite e gerencie os usuários da plataforma.</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Gerenciar Usuários
          </button>
        </div>

        {/* Moderação de Conteúdo */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Moderação de Conteúdo</h2>
          <p className="text-gray-600 mb-4">Revise denúncias e modere o conteúdo gerado pelos usuários.</p>
          <button
            onClick={() => navigate('/admin/moderation')}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Moderar Conteúdo
          </button>
        </div>

        {/* Relatórios e Analytics */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Relatórios e Analytics</h2>
          <p className="text-gray-600 mb-4">Acesse relatórios detalhados e análises de dados da plataforma.</p>
          <button
            onClick={() => { alert('Módulo Analytics em breve!'); navigate('/admin/dashboard'); }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Ver Relatórios
          </button>
        </div>

        {/* Suporte e Tickets */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Suporte e Tickets</h2>
          <p className="text-gray-600 mb-4">Gerencie tickets de suporte e forneça assistência aos usuários.</p>
          <button
            onClick={() => navigate('/contact')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
          >
            Gerenciar Tickets
          </button>
        </div>

        {/* Configurações do Sistema & Premium */}
        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-500">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>👑</span> Configurações do Sistema & Premium
          </h2>
          <p className="text-gray-600 mb-4">Configure o período de Premium gratuito (dias) para todos os usuários e parâmetros da plataforma.</p>
          <button
            onClick={() => navigate('/admin/settings')}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium"
          >
            Configurar Período Premium
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

