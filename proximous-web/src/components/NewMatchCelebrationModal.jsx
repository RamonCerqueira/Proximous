import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, MessageCircle, X, ArrowRight, Zap, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { matchingAPI } from '../lib/api';
import { Button } from '@/components/ui/button';

// Helper to get seen matches from localStorage
const getSeenMatchIds = (userId) => {
  if (!userId) return new Set();
  try {
    const raw = localStorage.getItem(`proximous_seen_matches_${userId}`);
    if (raw) {
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    }
  } catch (e) {
    console.warn('Error reading seen matches from localStorage:', e);
  }
  return new Set();
};

const saveSeenMatchId = (userId, matchId) => {
  if (!userId || !matchId) return;
  try {
    const seenSet = getSeenMatchIds(userId);
    seenSet.add(matchId);
    localStorage.setItem(
      `proximous_seen_matches_${userId}`,
      JSON.stringify(Array.from(seenSet))
    );
  } catch (e) {
    console.warn('Error saving seen match to localStorage:', e);
  }
};

/**
 * 🌟 Self-Contained 3D Neon Particle & Starfield Canvas
 * Zero external dependencies — works smoothly on any browser & VPS!
 */
const ThreeMatchCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 3D Particles
    const numParticles = 140;
    const particles = [];
    const colors = ['#9B20F0', '#FF2B68', '#FF80BF', '#FFD700', '#35E38A'];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 100,
        radius: Math.random() * 2.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedZ: Math.random() * 1.8 + 0.8,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const fov = 400;

    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move towards screen in 3D
        p.z -= p.speedZ;
        p.angle += p.rotSpeed;

        if (p.z <= 0) {
          p.z = 800;
          p.x = (Math.random() - 0.5) * width * 1.5;
          p.y = (Math.random() - 0.5) * height * 1.5;
        }

        // Orbit rotation around center
        const rx = p.x * Math.cos(p.angle) - p.y * Math.sin(p.angle);
        const ry = p.x * Math.sin(p.angle) + p.y * Math.cos(p.angle);

        // 3D Perspective Projection
        const scale = fov / (fov + p.z);
        const sx = cx + rx * scale;
        const sy = cy + ry * scale;
        const sr = p.radius * scale * 2.2;

        if (sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
          const alpha = Math.min(1, Math.max(0.1, (1 - p.z / 800) * 1.2));
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 12 * scale;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden" />;
};

export const NewMatchCelebrationModal = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [unseenMatches, setUnseenMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let isMounted = true;

    const checkNewMatches = async () => {
      try {
        const res = await matchingAPI.getMatches({ page: 1, per_page: 50 });
        const allMatches = res.data?.matches || [];
        const seenSet = getSeenMatchIds(user.id);

        // Filter out matches that have already been shown
        const newOnes = allMatches.filter((m) => m && m.id && !seenSet.has(m.id) && m.other_user);

        if (isMounted && newOnes.length > 0) {
          setUnseenMatches(newOnes);
          setCurrentIndex(0);
          setIsOpen(true);
        }
      } catch (err) {
        console.warn('Could not check new matches on login:', err);
      }
    };

    // Delay slightly to let initial layout settle smoothly after login
    const timer = setTimeout(() => {
      checkNewMatches();
    }, 1200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isAuthenticated, user?.id]);

  if (!isOpen || unseenMatches.length === 0) {
    return null;
  }

  const currentMatch = unseenMatches[currentIndex];
  if (!currentMatch || !currentMatch.other_user) {
    return null;
  }

  const otherUser = currentMatch.other_user;
  const myPhoto =
    user?.profile_photo_url ||
    (user?.photos && user.photos.length > 0 ? user.photos[0] : null) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Eu')}&background=9B20F0&color=fff`;

  const otherPhoto =
    otherUser?.profile_photo_url ||
    (otherUser?.photos && otherUser.photos.length > 0 ? otherUser.photos[0] : null) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'Match')}&background=FF2B68&color=fff`;

  const handleDismissCurrent = () => {
    // Record current match as seen
    saveSeenMatchId(user.id, currentMatch.id);
    matchingAPI.markMatchSeen(currentMatch.id).catch(() => {});

    if (currentIndex + 1 < unseenMatches.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handleSendMessage = () => {
    // Record as seen
    saveSeenMatchId(user.id, currentMatch.id);
    matchingAPI.markMatchSeen(currentMatch.id).catch(() => {});

    setIsOpen(false);
    navigate('/messages', { state: { selectedUserId: otherUser.id } });
  };

  const remainingCount = unseenMatches.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/92 backdrop-blur-xl overflow-hidden">
        
        {/* 3D Three.js Visual Universe Background */}
        <ThreeMatchCanvas />

        {/* Ambient Radial Color Spotlight */}
        <div className="absolute w-[360px] h-[360px] sm:w-[540px] sm:h-[540px] rounded-full bg-gradient-to-tr from-purple-600/35 via-pink-600/35 to-amber-500/25 blur-[110px] pointer-events-none animate-pulse" />

        {/* Main Modal Card */}
        <motion.div
          key={currentMatch.id}
          initial={{ opacity: 0, scale: 0.85, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -25 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#1E113D]/95 via-[#120B28]/95 to-[#080514]/98 border border-purple-500/50 rounded-[36px] p-6 sm:p-8 text-center shadow-[0_20px_90px_rgba(155,32,240,0.45)] backdrop-blur-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={handleDismissCurrent}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Queue pill badge if multiple matches */}
          {remainingCount > 1 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-[11px] font-black mb-3 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Novo match ({currentIndex + 1} de {remainingCount})</span>
            </div>
          )}

          {/* Animated Header */}
          <div className="space-y-1 mb-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.15, 1], opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2"
            >
              <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
              <h2 className="text-3xl sm:text-4xl font-black italic tracking-wider bg-gradient-to-r from-[#FF4FA3] via-[#FF2B68] to-[#FFAA00] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(255,43,104,0.6)]">
                DEU MATCH!
              </h2>
              <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
            </motion.div>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium">
              Você e <strong className="text-white font-black">{otherUser.name || 'uma nova pessoa'}</strong> curtiram o perfil um do outro!
            </p>
          </div>

          {/* Interlocking Colliding Avatars */}
          <div className="relative h-44 flex items-center justify-center my-4">
            
            {/* Ambient Avatar Glow */}
            <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-purple-600/40 to-pink-600/40 blur-2xl pointer-events-none" />

            {/* Left Avatar (Current User) */}
            <motion.div
              initial={{ x: -100, scale: 0.6, rotate: -25 }}
              animate={{ x: -28, scale: 1, rotate: -8 }}
              transition={{ type: "spring", damping: 18, stiffness: 220, delay: 0.2 }}
              className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-[#9B20F0] shadow-[0_10px_35px_rgba(155,32,240,0.6)]"
            >
              <img
                src={myPhoto}
                alt={user?.name || 'Você'}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-black text-purple-300 border border-purple-500/30">
                Você
              </span>
            </motion.div>

            {/* Center Heart Explosion Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: [0, 1.35, 1], rotate: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 280, delay: 0.45 }}
              className="absolute z-30 w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF2B68] to-[#9B20F0] border-2 border-white flex items-center justify-center text-white shadow-[0_0_25px_rgba(255,43,104,0.9)]"
            >
              <Heart className="w-6 h-6 fill-white text-white animate-pulse" />
            </motion.div>

            {/* Right Avatar (Matched User) */}
            <motion.div
              initial={{ x: 100, scale: 0.6, rotate: 25 }}
              animate={{ x: 28, scale: 1, rotate: 8 }}
              transition={{ type: "spring", damping: 18, stiffness: 220, delay: 0.2 }}
              className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-[#FF2B68] shadow-[0_10px_35px_rgba(255,43,104,0.6)]"
            >
              <img
                src={otherPhoto}
                alt={otherUser.name || 'Match'}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-black text-pink-300 border border-pink-500/30 whitespace-nowrap">
                {otherUser.name?.split(' ')[0] || 'Match'}
              </span>
            </motion.div>
          </div>

          {/* Compatibility Pill & Details */}
          <div className="space-y-3 mt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-zinc-300 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Conexão em Tempo Real pelo Proximous</span>
            </div>

            {otherUser.bio && (
              <p className="text-xs text-zinc-400 italic line-clamp-2 px-2">
                "{otherUser.bio}"
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-6">
            <Button
              type="button"
              onClick={handleSendMessage}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#FF2B68] hover:opacity-95 text-white font-black text-sm shadow-[0_8px_30px_rgba(255,43,104,0.4)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white/20" />
              <span>Enviar Mensagem Agora</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleDismissCurrent}
              className="w-full h-10 rounded-2xl text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              {remainingCount > 1 && currentIndex + 1 < remainingCount ? (
                <span className="flex items-center gap-1">
                  Ver Próximo Match ({currentIndex + 2}/{remainingCount}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              ) : (
                'Continuar Explorando'
              )}
            </Button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewMatchCelebrationModal;
