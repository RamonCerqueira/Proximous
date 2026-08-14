import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Heart, Zap, User, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

const Login = () => {
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authLogin(formData);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Erro ao fazer login. Tente novamente.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para login automático
  const handleAutoLogin = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const result = await authLogin({ email, password });
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Erro no login automático. Tente novamente.');
      }
    } catch (err) {
      console.error('Auto login error:', err);
      setError('Erro no login automático. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden text-foreground">
      {/* Ambient Luxury Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-pink-600/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [-15, 15, -15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="luxury-glass-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
          <CardContent className="p-8 sm:p-10 space-y-6">
            {/* Logo and Header */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-center space-y-3"
            >
              <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 rounded-3xl flex items-center justify-center shadow-xl shadow-purple-500/20 ring-4 ring-purple-500/10">

                <Heart className="h-10 w-10 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight luxury-gradient-text">
                  Proximous
                </h1>
                <p className="text-xs text-muted-foreground font-semibold flex items-center justify-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" />
                  Conexões autênticas & descobertas em tempo real
                </p>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert variant="destructive" className="border-red-500/30 bg-red-500/10 text-red-400 rounded-2xl">
                  <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-1"
              >
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">E-mail</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 text-sm bg-card/80 border border-border/80 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-purple-500/50"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-1"
              >
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Senha</label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-12 text-sm bg-card/80 border border-border/80 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-purple-500/50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-purple-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  className="w-full h-12 proximous-button-primary rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Entrando no Proximous...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Entrar na Plataforma
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Quick Test Shortcuts */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-4 border-t border-border/60 space-y-3"
            >
              <p className="text-[11px] text-muted-foreground text-center font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                <Zap className="h-3.5 w-3.5 text-purple-400" />
                Acesso Rápido de Teste
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleAutoLogin('teste@test.com', 'Password123')}
                  variant="outline"
                  className="h-10 text-[11px] font-extrabold border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-xl"
                  disabled={loading}
                >
                  Teste
                </Button>

                <Button
                  onClick={() => handleAutoLogin('user1@test.com', 'Password123')}
                  variant="outline"
                  className="h-10 text-[11px] font-extrabold border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-xl"
                  disabled={loading}
                >
                  User1
                </Button>

                <Button
                  onClick={() => handleAutoLogin('user2@test.com', 'Password123')}
                  variant="outline"
                  className="h-10 text-[11px] font-extrabold border-pink-500/30 text-pink-400 hover:bg-pink-500/10 rounded-xl"
                  disabled={loading}
                >
                  User2
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center pt-2 space-y-2"
            >
              <Link
                to="/register"
                className="block text-xs font-black luxury-gradient-text hover:opacity-80 transition-opacity"
              >
                Não tem uma conta? Cadastre-se gratuitamente ✨
              </Link>
              <Link
                to="/admin/login"
                className="block text-[10px] text-muted-foreground hover:text-foreground font-semibold transition-colors"
              >
                Painel Administrativo VIP 🔒
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;


