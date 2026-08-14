import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DEFAULT_ADS = [
  {
    id: 'mercadolivre',
    badge: 'MERCADO LIVRE ⚡ OFERTA',
    title: 'Achados do Dia com Frete Grátis 📦',
    desc: 'Até 60% OFF e cupons exclusivos da semana para usuários do Proximous!',
    cta: 'Ir para o Mercado Livre',
    link: 'https://www.mercadolivre.com.br',
    theme: 'yellow',
    icon: '📦',
    is_active: true
  },
  {
    id: 'motel_porto',
    badge: 'PARCEIRO PREMIUM 🍓',
    title: 'Motel Porto Sedução - O Motel do Amor',
    desc: 'Cortesia de Espumante e 20% OFF na Suíte Deluxe para casais do Proximous.',
    cta: 'Reservar Suíte 🥂',
    link: 'https://www.google.com',
    theme: 'pink',
    icon: '🍓',
    is_active: true
  },
  {
    id: 'cafe_aurora',
    badge: 'ESPECIAL 1º ENCONTRO ☕',
    title: 'Café & Confeitaria Aurora',
    desc: 'Mostre seu match no Proximous e ganhe 15% OFF no combo de café e torta!',
    cta: 'Ver Benefício 📍',
    link: 'https://www.google.com',
    theme: 'purple',
    icon: '☕',
    is_active: true
  }
];

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

  // SuperAdmin Ads Management State
  const [adsList, setAdsList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAd, setNewAd] = useState({
    badge: 'MERCADO LIVRE ⚡ OFERTA',
    title: 'Anúncio Destaque no Proximous',
    desc: 'Descrição da oferta especial para os usuários da plataforma.',
    cta: 'Acessar Oferta 🚀',
    link: 'https://www.google.com',
    theme: 'yellow',
    icon: '📦',
    is_active: true
  });

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchSettings();
    loadSuperAdminAds();
  }, []);

  const loadSuperAdminAds = () => {
    try {
      const stored = localStorage.getItem('proximous_custom_ads');
      if (stored) {
        setAdsList(JSON.parse(stored));
        return;
      }
    } catch (e) {
      console.warn('Error loading ads:', e);
    }
    setAdsList(DEFAULT_ADS);
    localStorage.setItem('proximous_custom_ads', JSON.stringify(DEFAULT_ADS));
  };

  const saveSuperAdminAds = (updatedList) => {
    setAdsList(updatedList);
    localStorage.setItem('proximous_custom_ads', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('proximous_ads_updated'));
  };

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

  const handleToggleAdStatus = (adId) => {
    const updated = adsList.map(ad => {
      if (ad.id === adId) {
        return { ...ad, is_active: !ad.is_active };
      }
      return ad;
    });
    saveSuperAdminAds(updated);
    setMessage('Status da publicidade atualizado em tempo real!');
  };

  const handleDeleteAd = (adId) => {
    const updated = adsList.filter(ad => ad.id !== adId);
    saveSuperAdminAds(updated);
    setMessage('Anúncio removido com sucesso!');
  };

  const handleCreateNewAd = (e) => {
    e.preventDefault();
    if (!newAd.title || !newAd.link) return;

    const createdAd = {
      ...newAd,
      id: 'ad_' + Date.now()
    };

    const updated = [createdAd, ...adsList];
    saveSuperAdminAds(updated);
    setShowAddModal(false);
    setMessage('Novo anúncio publicado e ativo no sistema!');
    setNewAd({
      badge: 'PARCEIRO LOCAL ☕',
      title: '',
      desc: '',
      cta: 'Ver Benefício 🚀',
      link: 'https://',
      theme: 'purple',
      icon: '☕',
      is_active: true
    });
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Painel do SuperAdmin & Mídia</h1>
          <p className="text-gray-600 mt-1">Gerencie os anúncios da plataforma e configurações sem mexer no código</p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-bold text-sm"
        >
          &larr; Dashboard
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-md">
          <p className="text-emerald-800 font-bold text-sm">{message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      )}

      {/* 📢 SUPERADMIN ADS MANAGEMENT CARD (Gestão de Publicidade Sem Código) */}
      <div className="bg-white shadow-xl rounded-2xl p-6 border-2 border-purple-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-700 font-black text-xl">
              📢
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Gestão de Publicidades & Slots Vendidos</h2>
              <p className="text-xs text-gray-500 font-medium">Crie, ative ou pause anúncios exibidos para todos os usuários em tempo real</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-all"
          >
            + Criar Novo Anúncio
          </button>
        </div>

        {/* Lista de Anúncios Cadastrados */}
        <div className="space-y-3">
          {adsList.map((ad) => (
            <div key={ad.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl p-2 bg-white rounded-lg shadow-sm">{ad.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {ad.badge}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      ad.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {ad.is_active ? '● Ativo' : '○ Pausado'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900 mt-1">{ad.title}</h4>
                  <p className="text-xs text-gray-600 font-medium line-clamp-1">{ad.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleAdStatus(ad.id)}
                  className={`text-xs font-black py-1.5 px-3 rounded-lg border transition-all ${
                    ad.is_active 
                      ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {ad.is_active ? 'Pausar Anúncio' : 'Ativar Anúncio'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAd(ad.id)}
                  className="text-xs font-bold text-red-600 hover:bg-red-50 p-1.5 rounded-lg border border-red-200"
                  title="Excluir Anúncio"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Criação de Novo Anúncio */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-gray-900 text-lg">Criar Novo Anúncio / Publicidade</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateNewAd} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Empresa / Badge (Ex: MERCADO LIVRE 📦)</label>
                <input
                  type="text"
                  value={newAd.badge}
                  onChange={e => setNewAd({ ...newAd, badge: e.target.value })}
                  className="w-full p-2.5 border rounded-lg font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Título do Anúncio</label>
                <input
                  type="text"
                  value={newAd.title}
                  onChange={e => setNewAd({ ...newAd, title: e.target.value })}
                  placeholder="Ex: Achados do Dia com Frete Grátis"
                  className="w-full p-2.5 border rounded-lg font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Descrição Comercial</label>
                <textarea
                  rows={2}
                  value={newAd.desc}
                  onChange={e => setNewAd({ ...newAd, desc: e.target.value })}
                  placeholder="Ex: Cupom de 60% OFF para usuários da plataforma"
                  className="w-full p-2.5 border rounded-lg font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Texto do Botão (CTA)</label>
                  <input
                    type="text"
                    value={newAd.cta}
                    onChange={e => setNewAd({ ...newAd, cta: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ícone Emoji</label>
                  <input
                    type="text"
                    value={newAd.icon}
                    onChange={e => setNewAd({ ...newAd, icon: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-semibold text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Link de Destino (URL)</label>
                <input
                  type="url"
                  value={newAd.link}
                  onChange={e => setNewAd({ ...newAd, link: e.target.value })}
                  className="w-full p-2.5 border rounded-lg font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tema Visual</label>
                <select
                  value={newAd.theme}
                  onChange={e => setNewAd({ ...newAd, theme: e.target.value })}
                  className="w-full p-2.5 border rounded-lg font-semibold"
                >
                  <option value="yellow">Amarelo & Azul (Mercado Livre)</option>
                  <option value="pink">Rosa & Vermelho (Motel / Encontro)</option>
                  <option value="purple">Roxo & Neon (Café / Geral)</option>
                  <option value="emerald">Verde Esmeralda (Bar / Drinks)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border font-bold text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-black"
                >
                  Publicar Anúncio 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORMULÁRIO PADRÃO DE CONFIGURAÇÕES */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-md rounded-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600 font-bold text-xl">
              👑
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Período de Premium Gratuito (Global)</h2>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-semibold"
              />
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
                <span className="font-semibold text-gray-800">Ativar Premium Promocional Global</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-purple-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-purple-700 shadow-md disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações Globais'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
