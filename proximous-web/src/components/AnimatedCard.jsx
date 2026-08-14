import React from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  }
};

const AnimatedCard = ({ 
  children, 
  className = '', 
  onClick, 
  delay = 0,
  enableHover = true,
  enableTap = true 
}) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={enableHover ? "hover" : undefined}
      whileTap={enableTap ? "tap" : undefined}
      onClick={onClick}
      className={`cursor-pointer ${className}`}
      style={{
        transition: 'all 0.3s ease',
      }}
      custom={delay}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;

