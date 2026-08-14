import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Eye, User, Image, MessageSquare, Search } from 'lucide-react';
import api from '@/lib/api';

const AdminModeration = () => {
  const [reports, setReports] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReports();
    fetchProfiles();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/admin/reports');
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error);
      // Mock data para demonstração
      setReports([
        {
          id: 1,
          type: 'profile',
          reason: 'Perfil falso',
          description: 'Usuário usando fotos de outra pessoa',
          reporter_name: 'Maria Silva',
          reported_user: 'João Santos',
          status: 'pending',
          created_at: '2024-01-20T10:30:00Z',
          priority: 'high'
        },
        {
          id: 2,
          type: 'message',
          reason: 'Conteúdo inadequado',
          description: 'Mensagens com conteúdo ofensivo',
          reporter_name: 'Ana Costa',
          reported_user: 'Pedro Lima',
          status: 'reviewing',
          created_at: '2024-01-19T15:45:00Z',
          priority: 'medium'
        },
        {
          id: 3,
          type: 'photo',
          reason: 'Foto inadequada',
          description: 'Foto com conteúdo impróprio',
          reporter_name: 'Carlos Oliveira',
          reported_user: 'Lucia Ferreira',
          status: 'resolved',
          created_at: '2024-01-18T09:15:00Z',
          priority: 'low'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await api.get('/admin/profiles/pending');
      setProfiles(response.data.profiles || []);
    } catch (error) {
      console.error('Erro ao buscar perfis pendentes:', error);
      // Mock data para demonstração
      setProfiles([
        {
          id: 1,
          name: 'Roberto Silva',
          age: 28,
          photos: ['https://via.placeholder.com/150'],
          bio: 'Desenvolvedor apaixonado por tecnologia',
          status: 'pending',
          created_at: '2024-01-20T08:00:00Z'
        },
        {
          id: 2,
          name: 'Fernanda Costa',
          age: 25,
          photos: ['https://via.placeholder.com/150'],
          bio: 'Designer gráfica e amante da arte',
          status: 'pending',
          created_at: '2024-01-19T14:30:00Z'
        }
      ]);
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      await api.post(`/admin/reports/${reportId}/action`, { action });
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'approve' ? 'resolved' : 'dismissed' }
          : report
      ));
    } catch (error) {
      console.error('Erro ao processar denúncia:', error);
    }
  };

  const handleProfileAction = async (profileId, action) => {
    try {
      await api.post(`/admin/profiles/${profileId}/action`, { action });
      setProfiles(profiles.filter(profile => profile.id !== profileId));
    } catch (error) {
      console.error('Erro ao processar perfil:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
      reviewing: { color: 'bg-blue-100 text-blue-800', text: 'Analisando' },
      resolved: { color: 'bg-green-100 text-green-800', text: 'Resolvido' },
      dismissed: { color: 'bg-gray-100 text-gray-800', text: 'Descartado' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { color: 'bg-red-100 text-red-800', text: 'Alta' },
      medium: { color: 'bg-orange-100 text-orange-800', text: 'Média' },
      low: { color: 'bg-green-100 text-green-800', text: 'Baixa' }
    };
    const config = priorityConfig[priority] || priorityConfig.medium;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getTypeIcon = (type) => {
    const icons = {
      profile: <User className="h-4 w-4" />,
      photo: <Image className="h-4 w-4" />,
      message: <MessageSquare className="h-4 w-4" />
    };
    return icons[type] || <AlertTriangle className="h-4 w-4" />;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reported_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Moderação de Conteúdo</h1>
        <p className="text-gray-600 mt-2">Gerencie denúncias e aprove novos perfis</p>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Denúncias</TabsTrigger>
          <TabsTrigger value="profiles">Perfis Pendentes</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Filtros para Denúncias */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por usuário ou motivo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="reviewing">Analisando</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="dismissed">Descartado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Denúncias */}
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(report.type)}
                      <div>
                        <CardTitle className="text-lg">
                          Denúncia contra {report.reported_user}
                        </CardTitle>
                        <CardDescription>
                          Reportado por {report.reporter_name} • {new Date(report.created_at).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getPriorityBadge(report.priority)}
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900">Motivo: {report.reason}</p>
                      <p className="text-gray-600 mt-1">{report.description}</p>
                    </div>
                    
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'review')}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Analisar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReportAction(report.id, 'approve')}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Proceder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'dismiss')}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Descartar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredReports.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma denúncia encontrada</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfis Aguardando Aprovação</CardTitle>
              <CardDescription>
                Revise e aprove novos perfis de usuários
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={profile.photos[0]}
                      alt={profile.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{profile.name}, {profile.age}</h3>
                      <p className="text-gray-600 mt-1">{profile.bio}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Cadastrado em {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleProfileAction(profile.id, 'approve')}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleProfileAction(profile.id, 'reject')}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {profiles.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum perfil pendente de aprovação</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModeration;

