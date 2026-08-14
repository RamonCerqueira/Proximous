import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    global_free_premium_days: 120,
    global_free_premium_enabled: true,
    max_daily_likes_free: 10,
    max_daily_messages_free: 10,
    maintenance_mode: false,
    registration_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data && response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
      setError('Não foi possível carregar as configurações do sistema.');
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        logout();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        global_free_premium_days: parseInt(settings.global_free_premium_days, 10),
        global_free_premium_enabled: Boolean(settings.global_free_premium_enabled),
        max_daily_likes_free: parseInt(settings.max_daily_likes_free, 10),
        max_daily_messages_free: parseInt(settings.max_daily_messages_free, 10),
        maintenance_mode: Boolean(settings.maintenance_mode),
        registration_enabled: Boolean(settings.registration_enabled)
      };

      const response = await api.put('/admin/settings', payload);
      setMessage(response.data?.message || 'Configurações salvas com sucesso!');
      if (response.data?.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setError(err.response?.data?.error || 'Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Configurações do Sistema</h1>
          <p className="text-gray-600 mt-1">Gerencie a duração do período Premium e regras da plataforma</p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 font-medium"
        >
          &larr; Voltar ao Dashboard
        </button>
      </div>

      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-md">
          <p className="text-green-700 font-medium">{message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card: Período de Premium Gratuito */}
        <div className="bg-white shadow-md rounded-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600 font-bold text-xl">
              👑
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Período de Premium Gratuito (Promoção Global)</h2>
              <p className="text-sm text-gray-500">Configuração do período ativo para todos os usuários cadastrados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duração do Premium Ativo (em Dias)
              </label>
              <input
                type="number"
                name="global_free_premium_days"
                value={settings.global_free_premium_days}
                onChange={handleInputChange}
                min="0"
                max="3650"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-800"
              />
              <p className="text-xs text-gray-500 mt-2">
                Padrão: 120 dias. Todos os usuários registrados dentro deste período contarão com acesso Premium ativo.
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="global_free_premium_enabled"
                  checked={settings.global_free_premium_enabled}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <div>
                  <span className="font-semibold text-gray-800">Ativar Premium Promocional Global</span>
                  <p className="text-xs text-gray-500">
                    Se ativado, todos os usuários dentro do número de dias configurado possuem Premium.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Card: Limites de Usuários Gratuitos */}
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Limites Padrão (Contas Gratuitas)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curtidas Diárias (Gratuito)
              </label>
              <input
                type="number"
                name="max_daily_likes_free"
                value={settings.max_daily_likes_free}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagens Diárias (Gratuito)
              </label>
              <input
                type="number"
                name="max_daily_messages_free"
                value={settings.max_daily_messages_free}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Card: Opções Globais do Sistema */}
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Estado da Plataforma</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="registration_enabled"
                checked={settings.registration_enabled}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Permitir Novos Cadastros de Usuários</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="maintenance_mode"
                checked={settings.maintenance_mode}
                onChange={handleInputChange}
                className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Modo Manutenção (Restringir acesso geral)</span>
            </label>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-purple-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
