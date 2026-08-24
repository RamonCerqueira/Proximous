import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { subscriptionsAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Check, Zap, ArrowLeft, Gift, ShieldCheck, HelpCircle } from 'lucide-react';

const Premium = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [selectedPlanForPix, setSelectedPlanForPix] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsAPI.getPlans();
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Fallback VIP plans if backend is initializing
      setPlans([
        {
          id: 'vip_monthly',
          name: 'Proximous Gold',
          description: 'Acesso VIP mensal com curtidas ilimitadas e passe livre',
          price: 29.90,
          interval: 'monthly',
          features: ['Curtidas Ilimitadas', '5 Super Likes/dia', 'Ver quem curtiu seu perfil', 'Filtros Avançados de Raio e Intenção', 'Selo VIP no perfil']
        },
        {
          id: 'vip_annual',
          name: 'Proximous Platinum VIP',
          description: 'O plano supremo para quem quer conexões reais sem limites',
          price: 19.90,
          interval: 'yearly',
          features: ['Tudo do plano Gold', 'Super Likes ilimitados', 'Destaque de Perfil em 1º lugar', 'Modo Invisível completo', 'Suporte Prioritário VIP']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const response = await subscriptionsAPI.applyCoupon(couponCode);
      if (response.data.success) {
        setDiscount(response.data.discount);
      } else {
        alert('Cupom inválido ou expirado');
      }
    } catch (error) {
      alert('Erro ao aplicar cupom');
    }
  };

  const handleSubscribe = async (plan) => {
    setSelectedPlanForPix(plan);
    try {
      const planType = plan.plan_type || (plan.interval === 'annual' ? 'annual' : 'monthly');
      const res = await subscriptionsAPI.subscribe({
        plan_type: planType,
        payment_method: 'credit_card',
        coupon_code: discount ? couponCode : null
      });

      if (res.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
        return;
      }
      // If no external gateway configured, show direct PIX modal
      setPixModalOpen(true);
    } catch (err) {
      console.warn('Subscription checkout redirect notice:', err);
      setPixModalOpen(true);
    }
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText('03207834566');
    alert('Chave PIX (03207834566) copiada para a área de transferência!');
  };

  const handleConfirmPixPayment = async () => {
    try {
      const planType = selectedPlanForPix?.plan_type || (selectedPlanForPix?.interval === 'annual' ? 'annual' : 'monthly');
      const subscriptionData = {
        plan_type: planType,
        coupon_code: discount ? couponCode : null,
        payment_method: 'pix'
      };

      const res = await subscriptionsAPI.subscribe(subscriptionData);
      if (res.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
        return;
      }
      alert('Solicitação de pagamento recebida! O plano VIP foi ativado com sucesso.');
      setPixModalOpen(false);
      fetchPlans();
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Solicitação registrada! O plano VIP será confirmado em instantes.');
      setPixModalOpen(false);
    }
  };

  const calculateDiscountedPrice = (price) => {
    if (!discount) return price;
    if (discount.type === 'percentage') {
      return price * (1 - discount.value / 100);
    } else {
      return Math.max(0, price - discount.value);
    }
  };

  const PlanCard = ({ plan, isPopular = false }) => {
    const originalPrice = plan.price;
    const finalPrice = calculateDiscountedPrice(originalPrice);
    const hasDiscount = discount && finalPrice < originalPrice;

    return (
      <div className={`relative luxury-glass-card rounded-3xl p-8 transition-all duration-300 ${
        isPopular ? 'border-2 border-amber-400 luxury-gold-glow scale-105 z-10' : 'border border-border/80'
      }`}>
        {isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 fill-white" />
              Mais Popular
            </span>
          </div>
        )}

        <div className="text-center mb-8 space-y-3">
          <h3 className="text-2xl font-black text-foreground">{plan.name}</h3>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{plan.description}</p>
          
          <div className="pt-2">
            {hasDiscount && (
              <div className="text-sm text-muted-foreground line-through">
                R$ {originalPrice.toFixed(2)}
              </div>
            )}
            <div className="text-4xl font-black text-foreground">
              R$ {finalPrice.toFixed(2)}
              <span className="text-xs text-muted-foreground font-medium">
                /{plan.interval === 'monthly' ? 'mês' : 'ano'}
              </span>
            </div>
            {hasDiscount && (
              <div className="text-emerald-400 font-extrabold text-xs mt-1">
                Economia de R$ {(originalPrice - finalPrice).toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <ul className="space-y-3 mb-8 text-xs font-semibold text-foreground">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="h-3.5 w-3.5" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => handleSubscribe(plan)}
          className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all ${
            isPopular
              ? 'bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 hover:opacity-95 text-white shadow-xl shadow-amber-500/20'
              : 'proximous-button-primary'
          }`}
        >
          {user?.is_premium ? 'Alterar Plano' : 'Assinar VIP Agora'}
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Crown className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black luxury-gradient-text">Proximous VIP</h1>
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">Experiência Sem Limites</p>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            ✨ Eleve Sua Experiência
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Desbloqueie todo o potencial do Proximous VIP
          </h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Acesso ilimitado a perfis, destaque no algoritmo, super likes diários e privacidade invisível quando desejar.
          </p>
        </div>

        {/* Coupon Section */}
        <div className="max-w-md mx-auto">
          <Card className="luxury-glass-card border border-border/80 rounded-3xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground text-center">
              Tem um cupom de desconto?
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite seu cupom VIP"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <Button
                onClick={handleApplyCoupon}
                className="proximous-button-primary text-xs px-5 py-2.5 rounded-xl"
              >
                Aplicar
              </Button>
            </div>
            {discount && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold text-center">
                ✅ Cupom aplicado! {discount.type === 'percentage' ? `${discount.value}% de desconto` : `R$ ${discount.value} de desconto`}
              </div>
            )}
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id || index}
              plan={plan}
              isPopular={index === 1 || index === 0}
            />
          ))}
        </div>

        {/* Features Comparison Table */}
        <Card className="luxury-glass-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-xl font-black text-foreground text-center mb-6">
            Comparativo de Recursos VIP
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left py-3 px-4 font-black text-muted-foreground">Recurso</th>
                  <th className="text-center py-3 px-4 font-black text-muted-foreground">Gratuito</th>
                  <th className="text-center py-3 px-4 font-black text-amber-400">Proximous VIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold">
                <tr>
                  <td className="py-3 px-4 text-foreground">Curtidas por dia</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">10</td>
                  <td className="py-3 px-4 text-center text-amber-400 font-extrabold">Ilimitadas ♾️</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-foreground">Super Likes por dia</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">1</td>
                  <td className="py-3 px-4 text-center text-amber-400 font-extrabold">5 diários 🌟</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-foreground">Ver quem curtiu você</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">Bloqueado</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-extrabold">Liberado 🔓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-foreground">Filtros avançados de intenção</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">Básico</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-extrabold">Total 🎯</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-foreground">Modo invisível</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">Não</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-extrabold">Sim 🕵️‍♂️</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* PIX Payment Modal */}
        {pixModalOpen && selectedPlanForPix && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="luxury-glass-card rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-border/80 space-y-4">
              <button
                onClick={() => setPixModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground font-bold text-lg"
              >
                ✕
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-500/15 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                  ❖
                </div>
                <h3 className="text-xl font-extrabold text-foreground">Pagamento Instantâneo PIX</h3>
                <p className="text-xs text-muted-foreground">Plano: <span className="font-bold text-amber-400">{selectedPlanForPix.name}</span></p>
                <div className="text-3xl font-black text-foreground">
                  R$ {calculateDiscountedPrice(selectedPlanForPix.price).toFixed(2)}
                </div>
              </div>

              <div className="bg-card/70 p-4 rounded-2xl text-center border border-border/60 space-y-3">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Chave PIX Oficial</p>
                <div className="bg-background border border-border/80 rounded-xl p-3">
                  <span className="font-mono font-black text-lg text-purple-400 tracking-wider">03207834566</span>
                </div>
                <Button
                  onClick={handleCopyPixKey}
                  variant="outline"
                  className="w-full py-2.5 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 font-bold text-xs rounded-xl"
                >
                  📋 Copiar Chave PIX
                </Button>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleConfirmPixPayment}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-2xl py-3 shadow-lg text-xs"
                >
                  Já fiz o pagamento via PIX
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setPixModalOpen(false)}
                  className="w-full py-2 text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Premium;


