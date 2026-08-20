import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, 
  Sparkles, 
  Star, 
  ArrowLeft, 
  ShieldCheck, 
  Heart, 
  MessageCircle, 
  Coffee, 
  Zap, 
  Lock, 
  CheckCircle2,
  TrendingUp,
  History
} from 'lucide-react';
import { usersAPI } from '../lib/api';

const Achievements = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [empathyData, setEmpathyData] = useState({ total_points: 0, weekly_points: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('badges'); // 'badges' | 'history' | 'rules'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [achRes, empRes] = await Promise.allSettled([
        usersAPI.getAchievements(),
        usersAPI.getEmpathyHistory()
      ]);

      if (achRes.status === 'fulfilled') {
        setAchievements(achRes.value.data.achievements || []);
      }
      if (empRes.status === 'fulfilled') {
        setEmpathyData(empRes.value.data || { total_points: 0, weekly_points: 0, transactions: [] });
      }
    } catch (err) {
      console.error('Error loading achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (points) => {
    if (points >= 500) return { level: 5, title: 'Guardião da Gentileza', next: 1000, color: 'from-amber-500 to-yellow-300' };
    if (points >= 250) return { level: 4, title: 'Mestre da Empatia', next: 500, color: 'from-purple-500 to-pink-400' };
    if (points >= 100) return { level: 3, title: 'Construtor de Pontes', next: 250, color: 'from-sky-500 to-indigo-400' };
    if (points >= 30) return { level: 2, title: 'Coração Acolhedor', next: 100, color: 'from-emerald-500 to-teal-300' };
    return { level: 1, title: 'Iniciante Curioso', next: 30, color: 'from-violet-500 to-purple-400' };
  };

  const levelInfo = calculateLevel(empathyData.total_points || 0);
  const progressPercent = Math.min(100, Math.round(((empathyData.total_points || 0) / levelInfo.next) * 100));

  return (
    <div className="min-h-screen bg-[#070611] text-white pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-[#070611]/80 backdrop-blur-xl border-b border-[#30204D] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-2xl bg-[#16112A] border border-[#30204D] text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-extrabold text-base text-center">
          Pontos de Empatia & Conquistas
        </h1>
        <div className="w-9" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Main Hero Card */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-purple-500/30 bg-gradient-to-br from-purple-950/80 via-[#0D0A1C] to-pink-950/60 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Nível {levelInfo.level}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {levelInfo.title}
              </h2>
              <p className="text-xs text-purple-200/80 max-w-sm">
                Seus pontos aumentam conforme você interage com respeito e gentileza.
              </p>
            </div>

            {/* Total Points Badge */}
            <div className="bg-[#16112A]/90 border border-purple-500/40 px-6 py-4 rounded-3xl text-center shadow-xl">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-pink-200 bg-clip-text text-transparent">
                {empathyData.total_points || 0}
              </span>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-0.5">
                Pontos de Empatia
              </p>
            </div>
          </div>

          {/* Progress Bar to next level */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-purple-300">
              <span>Progresso para o próximo nível</span>
              <span>{empathyData.total_points || 0} / {levelInfo.next} pts ({progressPercent}%)</span>
            </div>
            <div className="h-3 bg-[#16112A] rounded-full overflow-hidden border border-[#30204D] p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1 }}
                className={`h-full rounded-full bg-gradient-to-r ${levelInfo.color} shadow-lg`}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#0D0A1C] border border-[#30204D] p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" /> Conquistas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> Histórico
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'rules'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Como Ganhar
          </button>
        </div>

        {/* Tab 1: Badges / Achievements List */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((ach) => {
              const isUnlocked = ach.unlocked;
              return (
                <div
                  key={ach.id}
                  className={`p-5 rounded-3xl border transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-purple-950/40 via-[#0D0A1C] to-pink-950/30 border-purple-500/40 shadow-xl'
                      : 'bg-[#0D0A1C]/60 border-[#30204D]/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(214,20,168,0.5)]'
                          : 'bg-[#16112A] text-muted-foreground border border-[#30204D]'
                      }`}
                    >
                      {isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-sm text-white truncate">{ach.name}</h4>
                        {isUnlocked && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Desbloqueada
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: History Transactions */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {empathyData.transactions.length === 0 ? (
              <div className="p-12 text-center bg-[#0D0A1C] border border-[#30204D] rounded-3xl space-y-2">
                <History className="w-8 h-8 mx-auto text-purple-400 opacity-60" />
                <p className="font-extrabold text-white text-sm">Nenhum histórico registrado</p>
                <p className="text-xs text-muted-foreground">Comece enviando elogios ou respondendo mensagens!</p>
              </div>
            ) : (
              empathyData.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-[#0D0A1C] border border-[#30204D] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      +{tx.points}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{tx.description}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'Recentemente'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400">+{tx.points} pts</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Rules & How to earn */}
        {activeTab === 'rules' && (
          <div className="p-6 rounded-3xl bg-[#0D0A1C] border border-[#30204D] space-y-4">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Como ganhar Pontos de Empatia?
            </h3>
            
            <div className="space-y-3 divide-y divide-[#30204D]">
              <div className="pt-3 first:pt-0 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Completar o perfil com fotos</h4>
                  <p className="text-xs text-muted-foreground">Adicione ao menos 2 fotos reais e sua bio</p>
                </div>
                <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
                  +15 pts
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Enviar um Elogio Gentil</h4>
                  <p className="text-xs text-muted-foreground">Quebre o gelo com uma mensagem atenciosa</p>
                </div>
                <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
                  +10 pts
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Responder a mensagens</h4>
                  <p className="text-xs text-muted-foreground">Mantenha conversas acolhedoras e ativas</p>
                </div>
                <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
                  +5 pts
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Publicar um Momento no Feed</h4>
                  <p className="text-xs text-muted-foreground">Compartilhe um momento autêntico do seu dia</p>
                </div>
                <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
                  +10 pts
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
