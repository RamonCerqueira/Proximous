import React from 'react';

const InterestPill = ({ label }) => {
  return (
    <span className="bg-[#100D21]/90 backdrop-blur-md border border-[#30204D] text-[#AAA5BA] font-extrabold text-[10px] px-2.5 py-1 rounded-xl shadow-sm">
      {label}
    </span>
  );
};

export default InterestPill;
