import React from 'react';
import { Heart, Mail, Send } from 'lucide-react';

const MatchesTabs = ({ activeTab, setActiveTab, matchesCount = 0, receivedCount = 0, sentCount = 0 }) => {
  const tabs = [
    { id: 'matches', label: 'Matches', icon: Heart, count: matchesCount, badge: false },
    { id: 'received', label: 'Recebidos', icon: Mail, count: receivedCount, badge: true },
    { id: 'sent', label: 'Enviados', icon: Send, count: sentCount, badge: false }
  ];

  return (
    <div className="w-full bg-[#0D0A1C] border border-[#30204D] p-1.5 rounded-full backdrop-blur-xl shadow-inner flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
      {tabs.map(tab => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <div key={tab.id} className="relative flex-1 min-w-[120px]">
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`w-full py-2.5 px-4 rounded-full text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#9B20F0] via-[#D414A8] to-[#F01E55] text-white shadow-[0_0_25px_rgba(214,20,168,0.35)] scale-[1.02]'
                  : 'text-[#AAA5BA] hover:text-white bg-transparent'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>

            {/* Floating Notification Badge on Recebidos */}
            {tab.badge && tab.count > 0 && !isActive && (
              <span className="absolute -top-1 -right-1 bg-[#F01E75] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_#F01E75] border-2 border-[#070611] animate-pulse">
                {tab.count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MatchesTabs;
