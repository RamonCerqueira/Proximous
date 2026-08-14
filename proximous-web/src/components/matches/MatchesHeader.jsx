import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const MatchesHeader = ({ 
  showSearch, 
  setShowSearch, 
  searchQuery, 
  setSearchQuery, 
  onOpenFilters 
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#A020F0] via-[#FF4FA3] to-[#FF2B68] bg-clip-text text-transparent">
          Matches & Conexões
        </h1>
        <p className="text-xs sm:text-sm text-[#AAA5BA] font-medium mt-0.5">
          Conexões reais começam com um interesse em comum.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {showSearch ? (
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-[#AAA5BA]" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar conexões..."
              className="pl-8 pr-7 h-9 text-xs rounded-full bg-[#0D0A1C] border-[#30204D] text-white w-44 sm:w-60 focus:ring-[#9B20F0]"
              autoFocus
            />
            <button 
              onClick={() => { setSearchQuery(''); setShowSearch(false); }}
              className="absolute right-2 text-[#AAA5BA] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="p-2.5 rounded-full bg-[#0D0A1C] border border-[#30204D] text-[#AAA5BA] hover:text-white hover:border-[#9B20F0] transition-all shadow-md active:scale-95"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenFilters}
          className="p-2.5 rounded-full bg-[#0D0A1C] border border-[#30204D] text-[#AAA5BA] hover:text-white hover:border-[#9B20F0] transition-all shadow-md active:scale-95"
          title="Filtros"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#FF4FA3]" />
        </button>
      </div>
    </div>
  );
};

export default MatchesHeader;
