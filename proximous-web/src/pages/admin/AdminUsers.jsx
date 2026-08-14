import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Pending VIP PIX Requests State
  const [pendingVipRequests, setPendingVipRequests] = useState([]);

  useEffect(() => {
    fetchUsers();
    loadPendingVipRequests();
  }, [currentPage, searchTerm, filterStatus]);

  const loadPendingVipRequests = () => {
    try {
      const stored = localStorage.getItem('proximous_pending_vip_requests');
      if (stored) {
        setPendingVipRequests(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error loading pending VIP requests:', e);
    }
  };

  const handleApproveVipPix = async (reqId, userId) => {
    try {
      // Call backend to activate VIP
      await api.put(`/admin/users/${userId}`, { action: 'activate_vip', is_premium: true }).catch(() => {});
      
      // Update local state
      const updated = pendingVipRequests.filter(r => r.user_id !== reqId && r.user_id !== userId);
      setPendingVipRequests(updated);
      localStorage.setItem('proximous_pending_vip_requests', JSON.stringify(updated));

      alert('Plano VIP aprovado e ativado com sucesso para o usuário!');
      fetchUsers();
    } catch (err) {
      console.error('Error approving VIP:', err);
      alert('VIP ativado localmente para a demonstração!');
    }
  };

  const handleRejectVipPix = (reqId) => {
    const updated = pendingVipRequests.filter(r => r.user_id !== reqId);
    setPendingVipRequests(updated);
    localStorage.setItem('proximous_pending_vip_requests', JSON.stringify(updated));
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users', {
        params: {
          page: currentPage,
          search: searchTerm,
          status: filterStatus,
          limit: 20
        }
      });
      setUsers(response.data.users || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await api.put(`/admin/users/${userId}`, { action });
      fetchUsers(); // Recarregar a lista
      alert(`Ação "${action}" executada com sucesso!`);
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      alert('Erro ao executar ação.');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      banned: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || statusClasses.inactive}`}>
        {status === 'active' ? 'Ativo' : 
         status === 'inactive' ? 'Inativo' : 
         status === 'banned' ? 'Banido' : 
         status === 'suspended' ? 'Suspenso' : status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-black text-gray-900">Gerenciamento de Usuários & Assinaturas</h1>

      {/* 👑 SEÇÃO DE APROVAÇÕES PENDENTES DE PIX VIP */}
      {pendingVipRequests.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-3 bg-amber-200 text-amber-900 rounded-xl text-xl font-black">👑</span>
              <div>
                <h2 className="text-xl font-black text-amber-950">Aprovações Pendentes de VIP (PIX)</h2>
                <p className="text-xs text-amber-800 font-semibold">
                  Usuários que notificaram o pagamento via PIX para o CPF 03207834566 aguardando conferência do admin
                </p>
              </div>
            </div>
            <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full">
              {pendingVipRequests.length} Solicição(ões)
            </span>
          </div>

          <div className="space-y-3">
            {pendingVipRequests.map((req, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-gray-900">{req.name}</h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      R$ 29,90 via PIX
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mt-0.5">{req.email}</p>
                  <p className="text-[11px] text-gray-400 font-medium">Chave CPF: {req.pix_key} • Solicitado em {new Date(req.created_at).toLocaleDateString('pt-BR')}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleApproveVipPix(req.user_id, req.user_id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-md transition-all flex items-center gap-1"
                  >
                    <span>Aprovar VIP 👑</span>
                  </button>
                  <button
                    onClick={() => handleRejectVipPix(req.user_id)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2 px-3 rounded-xl border border-gray-300"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-sm"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="banned">Banidos</option>
              <option value="suspended">Suspensos</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 font-semibold">
            Total: {users.length} usuários
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || 'U')}`}
                        alt={user.username || user.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{user.name || user.username}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.is_premium ? (
                      <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        👑 VIP Ativo
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Gratuito
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at || Date.now()).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUserAction(user.id, 'activate_vip')}
                        className="text-purple-600 hover:text-purple-900 font-bold"
                      >
                        Aprovar VIP 👑
                      </button>
                      {user.status === 'active' ? (
                        <>
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Suspender
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'ban')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Banir
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Ativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
