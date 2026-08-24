import React, { createContext, useContext, useState } from 'react';
import VipUpgradeModal from '@/components/VipUpgradeModal';

const VipModalContext = createContext(null);

export const VipModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: 'Desbloqueie o Proximous VIP',
    feature: null,
    description: 'Acesse recursos ilimitados, descubra quem te curtiu e destaque seu perfil na sua região.',
  });

  const openVipModal = (config = {}) => {
    setModalConfig({
      title: config.title || 'Desbloqueie o Proximous VIP',
      feature: config.feature || null,
      description: config.description || 'Acesse recursos ilimitados, descubra quem te curtiu e destaque seu perfil na sua região.',
    });
    setIsOpen(true);
  };

  const closeVipModal = () => {
    setIsOpen(false);
  };

  return (
    <VipModalContext.Provider value={{ isOpen, openVipModal, closeVipModal }}>
      {children}
      <VipUpgradeModal
        isOpen={isOpen}
        onClose={closeVipModal}
        title={modalConfig.title}
        feature={modalConfig.feature}
        description={modalConfig.description}
      />
    </VipModalContext.Provider>
  );
};

export const useVipModal = () => {
  const context = useContext(VipModalContext);
  if (!context) {
    throw new Error('useVipModal must be used within a VipModalProvider');
  }
  return context;
};
