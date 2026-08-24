import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useVipModal } from '@/context/VipModalContext';
import { usersAPI, authAPI } from '../lib/api';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Bell, 
  Shield, 
  Smartphone, 
  Trash2, 
  Check, 
  ChevronRight,
  ArrowLeft,
  Moon,
  Sun,
  Sparkles,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { user, logout } = useAuth();
  const { openVipModal } = useVipModal();
  const { theme, setTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Privacy states
  const [privacy, setPrivacy] = useState({
    hideDistance: user?.privacy_settings?.hide_distance || false,
    hideOnlineStatus: user?.privacy_settings?.hide_online || false,
    incognitoMode: user?.privacy_settings?.incognito || false,
    allowMessagesFromMatchesOnly: true,
  });

  // Notification states
  const [notifications, setNotifications] = useState({
    newMatches: true,
    newMessages: true,
    activityInvites: true,
    marketingEmails: false,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePrivacyToggle = async (key) => {
    if (key === 'incognitoMode' && !user?.is_premium) {
      openVipModal({
        title: 'Modo Incógnito VIP 👻',
        feature: 'Navegação Invisível',
        description: 'Navegue por perfis no mapa e no radar sem ser detectado ou aparecer no feed de visitantes.'
      });
      return;
    }

    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    try {
      await usersAPI.updatePrivacySettings(updated);
      toast.success('Configurações de privacidade atualizadas!');
    } catch (err) {
      toast.error('Erro ao salvar preferências de privacidade.');
    }
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Preferências de notificação salvas!');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As novas senhas não coincidem!');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres com letras e números.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });
      toast.success('Senha alterada com sucesso!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao alterar senha. Verifique sua senha atual.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (window.confirm('Tem certeza de que deseja desativar sua conta? Você poderá reativá-la ao fazer login novamente.')) {
      try {
        await usersAPI.deactivateAccount('Desativação solicitada pelo usuário');
        toast.info('Sua conta foi desativada.');
        logout();
      } catch (err) {
        toast.error('Erro ao desativar conta.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 text-foreground pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between luxury-glass-card p-6 rounded-3xl border border-border/80 shadow-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-2xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight luxury-gradient-text">Configurações</h1>
              <p className="text-xs text-muted-foreground font-medium">Gerencie sua conta, privacidade, notificações e tema de luxo</p>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="md:col-span-1 luxury-glass-card p-3 rounded-3xl border border-border/80 h-fit space-y-1.5 shadow-md">

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'account'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Conta & Perfil</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'privacy'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Privacidade</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'notifications'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notificações</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'security'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Segurança</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'appearance'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Temas de Luxo</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="md:col-span-3 luxury-glass-card p-6 rounded-3xl border border-border/80 shadow-xl">

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Informações da Conta</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Seus dados cadastrais básicos no Proximous</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo / Exibição</label>
                    <input
                      type="text"
                      disabled
                      value={user?.name || user?.username || ''}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-gray-600 dark:text-gray-300 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail Cadastrado</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-gray-600 dark:text-gray-300 cursor-not-allowed"
                    />
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-zinc-700 my-6" />

                <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-4 rounded-xl">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-1">Desativar Conta</h3>
                  <p className="text-xs text-red-600 dark:text-red-300 mb-4">
                    Sua conta ficará oculta do mapa e do feed de descobertas até que você faça login novamente.
                  </p>
                  <button
                    onClick={handleDeactivateAccount}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Desativar Minha Conta</span>
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Controles de Privacidade</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Escolha o que outros usuários podem ver sobre você</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700/40 rounded-xl">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Ocultar Distância Exata</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Não exibe quantos quilômetros você está do perfil</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.hideDistance}
                      onChange={() => handlePrivacyToggle('hideDistance')}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700/40 rounded-xl">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Ocultar Status Online</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ocultar o ponto verde quando você estiver navegando</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.hideOnlineStatus}
                      onChange={() => handlePrivacyToggle('hideOnlineStatus')}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700/40 rounded-xl">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Modo Incógnito (VIP)</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Navegar por perfis no mapa sem aparecer na lista recente</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.incognitoMode}
                      onChange={() => handlePrivacyToggle('incognitoMode')}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Preferências de Notificação</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Configure os alertas de atividades na plataforma</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700/40 rounded-xl">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Novos Matches</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notificar quando houver atração mútua</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.newMatches}
                      onChange={() => handleNotificationToggle('newMatches')}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700/40 rounded-xl">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Mensagens de Chat</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notificar ao receber novas mensagens</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.newMessages}
                      onChange={() => handleNotificationToggle('newMessages')}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700/40 rounded-xl">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Curtidas e Super Likes</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receber alertas de quem curtiu você</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.likes}
                      onChange={() => handleNotificationToggle('likes')}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Alterar Senha</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mantenha sua conta segura com uma senha forte</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Atual</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        aria-label={showCurrentPassword ? "Ocultar senha atual" : "Mostrar senha atual"}
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button
                        type="button"
                        aria-label={showNewPassword ? "Ocultar nova senha" : "Mostrar nova senha"}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Repita a nova senha"
                      />
                      <button
                        type="button"
                        aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md transition-colors"
                  >
                    {loading ? 'Atualizando...' : 'Salvar Nova Senha'}
                  </button>
                </form>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Temas de Luxo
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Personalize a experiência visual do Proximous com nossas paletas exclusivas de alto padrão.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Luxury Light Card */}
                  <div 
                    onClick={() => setTheme('luxury-light')}
                    className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${
                      theme === 'luxury-light'
                        ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/20 shadow-lg shadow-purple-200/50 dark:shadow-none ring-2 ring-purple-500/20'
                        : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
                          <Sun className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">Luxo Claro</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Pérola & Ouro Rosa</p>
                        </div>
                      </div>
                      {theme === 'luxury-light' && (
                        <span className="px-3 py-1 text-xs font-semibold bg-purple-600 text-white rounded-full">Ativo</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Design limpo e sofisticado com fundo pérola aquecido, detalhes dourados e cartões em vidro translúcido.
                    </p>
                    <div className="h-16 rounded-xl bg-gradient-to-r from-amber-100 via-purple-100 to-pink-100 border border-amber-200/80 flex items-center justify-center">
                      <span className="text-xs font-semibold text-purple-900">Estética Pérola Luxo</span>
                    </div>
                  </div>

                  {/* Luxury Dark Card */}
                  <div 
                    onClick={() => setTheme('luxury-dark')}
                    className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${
                      theme === 'luxury-dark'
                        ? 'border-purple-500 bg-zinc-900 shadow-xl shadow-purple-900/40 ring-2 ring-purple-500/20'
                        : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-950/80 rounded-xl text-purple-400 border border-purple-800/50">
                          <Moon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">Luxo Escuro</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Obsidiana Real & Ouro</p>
                        </div>
                      </div>
                      {theme === 'luxury-dark' && (
                        <span className="px-3 py-1 text-xs font-semibold bg-purple-500 text-black font-bold rounded-full">Ativo</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Ambiente noturno em tom preto obsidiana profundo com realces dourados champagne e brilho violeta metálico.
                    </p>
                    <div className="h-16 rounded-xl bg-gradient-to-r from-zinc-950 via-purple-950 to-amber-950 border border-purple-500/30 flex items-center justify-center">
                      <span className="text-xs font-semibold text-amber-300">Estética Obsidiana Real</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
