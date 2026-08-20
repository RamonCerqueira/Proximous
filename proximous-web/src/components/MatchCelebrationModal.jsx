import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, X } from 'lucide-react';

const MatchCelebrationModal = ({ matchData, onClose }) => {
  const navigate = useNavigate();

  if (!matchData) return null;

  const { other_user } = matchData;

  const handleMessage = () => {
    onClose();
    navigate('/messages');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          className="relative w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-red-900" />
          
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#FF4FA3', '#A020F0', '#FFD700', '#FF6B6B', '#4ECDC4'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.8, 1, 0.8],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 p-8 text-center">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hearts */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex justify-center mb-4"
            >
              <Heart className="w-12 h-12 text-pink-400 fill-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
            </motion.div>

            <h2 className="text-3xl font-black text-white mb-1">É um Match!</h2>
            <p className="text-purple-200 text-sm mb-6">
              Você e <strong>{other_user?.name}</strong> se curtiram mutuamente! 💜
            </p>

            {/* Avatars */}
            <div className="flex justify-center items-center gap-3 mb-8">
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-pink-400 shadow-xl"
              >
                <img
                  src={other_user?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(other_user?.name || 'User')}&background=7c3aed&color=fff`}
                  alt={other_user?.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-2xl"
              >
                💜
              </motion.div>
              <motion.div
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-purple-400 shadow-xl bg-purple-800 flex items-center justify-center text-white font-black text-2xl"
              >
                <span>Eu</span>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleMessage}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar Mensagem
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-white/10 text-white font-bold py-3.5 rounded-2xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Continuar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchCelebrationModal;
