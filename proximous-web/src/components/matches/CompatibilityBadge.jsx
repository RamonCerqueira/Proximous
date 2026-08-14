import React from 'react';

const CompatibilityBadge = ({ score = 94, variant = 'solid' }) => {
  if (variant === 'text') {
    return (
      <span className="text-xs font-black text-[#FF4FA3]">
        {score}% compatibilidade
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-[#0D0A1C]/90 backdrop-blur-md border border-purple-500/30 text-purple-300 text-[11px] font-black px-2.5 py-1 rounded-xl shadow-md">
      <span className="text-[#FF4FA3] font-black">{score}%</span>
      <span className="text-[#AAA5BA] font-extrabold text-[10px]">Compatibilidade</span>
    </div>
  );
};

export default CompatibilityBadge;
