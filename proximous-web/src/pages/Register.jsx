import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Heart, MapPin, Sparkles, UserPlus, ArrowLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    social_style: ''
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

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(formData);
      
      if (response.data.access_token) {
        setToken(response.data.access_token);
        setUser(response.data.user);
        navigate('/');
      }
    } catch (error) {
      console.error('Register error:', error);
      setError(error.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden text-foreground">
      {/* Ambient Luxury Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-pink-600/15 rounded-full blur-3xl"
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
            {/* Header */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-center space-y-3"
            >
              <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 rounded-3xl flex items-center justify-center shadow-xl shadow-purple-500/20 ring-4 ring-purple-500/10">

                <UserPlus className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight luxury-gradient-text">
                  Junte-se ao Proximous
                </h1>
                <p className="text-xs text-muted-foreground font-semibold flex items-center justify-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" />
                  Crie seu perfil e conecte-se por afinidade
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
                <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground ml-1">Nome Completo</label>
                <Input
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-11 text-xs bg-card/80 border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-1"
              >
                <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground ml-1">E-mail</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 text-xs bg-card/80 border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-1"
              >
                <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground ml-1">Senha</label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-11 text-xs bg-card/80 border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-purple-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground ml-1">Idade</label>
                  <Input
                    name="age"
                    type="number"
                    placeholder="18+"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="18"
                    max="100"
                    className="h-11 text-xs bg-card/80 border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground ml-1">Gênero</label>
                  <Select onValueChange={(value) => handleSelectChange('gender', value)}>
                    <SelectTrigger className="h-11 border border-border/80 rounded-xl bg-card/80 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground ml-1">Estilo Social</label>
                  <Select onValueChange={(value) => handleSelectChange('social_style', value)}>
                    <SelectTrigger className="h-11 border border-border/80 rounded-xl bg-card/80 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shy">Tímido(a)</SelectItem>
                      <SelectItem value="introverted">Introvertido(a)</SelectItem>
                      <SelectItem value="extroverted">Extrovertido(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
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
                      Criando seu perfil...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Criar Minha Conta VIP
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center pt-2"
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-black luxury-gradient-text hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Já tem uma conta? Faça login
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;


