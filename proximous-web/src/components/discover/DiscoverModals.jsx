import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, 
  MapPin, 
  Users, 
  SlidersHorizontal, 
  Clock, 
  Plus, 
  Zap, 
  Sparkles, 
  RotateCcw, 
  Check,
  Calendar
} from 'lucide-react';
import LocationPickerMap from './LocationPickerMap';

export const FilterModal = ({
  show,
  onClose,
  genderFilter,
  setGenderFilter,
  radius,
  setRadius,
  socialStyleFilter,
  setSocialStyleFilter,
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border relative text-foreground"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Filtros de Descoberta</h3>
              <p className="text-xs text-muted-foreground font-bold">Ajuste os critérios para encontrar pessoas próximas.</p>
            </div>
          </div>

          <div className="space-y-5 text-xs">
            {/* Gender Filter */}
            <div>
              <label className="font-extrabold text-foreground block mb-2">Gênero</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'female', label: 'Mulheres' },
                  { id: 'male', label: 'Homens' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGenderFilter(item.id)}
                    className={`p-2.5 rounded-xl font-black border transition-all ${
                      genderFilter === item.id
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-accent/40 border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Radius Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-extrabold text-foreground">Raio de Busca</label>
                <span className="font-black text-purple-600 dark:text-purple-400">{radius} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-bold mt-1">
                <span>5 km</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </div>

            {/* Social Style Filter */}
            <div>
              <label className="font-extrabold text-foreground block mb-2">Estilo Social / Personalidade</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: '✨ Qualquer Estilo' },
                  { id: 'extroverted', label: '🎉 Extrovertido(a)' },
                  { id: 'introverted', label: '🤔 Introvertido(a)' },
                  { id: 'ambiverted', label: '⚖️ Ambivertido(a)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSocialStyleFilter(item.id)}
                    className={`p-2.5 rounded-xl font-bold border transition-all text-left ${
                      socialStyleFilter === item.id
                        ? 'bg-purple-600 text-white border-purple-500 font-black shadow-sm'
                        : 'bg-accent/40 border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-8">
            <Button
              onClick={() => {
                setGenderFilter('all');
                setRadius(25);
                setSocialStyleFilter('all');
              }}
              variant="outline"
              className="flex-1 rounded-xl border-border text-foreground font-black text-xs py-3"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" /> Resetar
            </Button>

            <Button
              onClick={onClose}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-3 rounded-xl shadow-md"
            >
              Aplicar Filtros
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const AvailabilityModal = ({
  show,
  onClose,
  availStatusText,
  setAvailStatusText,
  availHours,
  setAvailHours,
  onSave,
  isUpdating,
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border relative text-foreground"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Zap className="h-5 w-5 fill-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground tracking-tight">Ficar Visível no Radar</h3>
              <p className="text-xs text-muted-foreground font-semibold">Avisar conexões próximas que você está livre.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-extrabold text-foreground block mb-1">Qual o plano para agora?</label>
              <Input
                value={availStatusText}
                onChange={(e) => setAvailStatusText(e.target.value)}
                placeholder="Ex: Tomar um café na Paulista"
                className="rounded-xl bg-background border border-border text-foreground font-semibold text-sm placeholder:text-muted-foreground/60 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-extrabold text-foreground block mb-1">Duração da visibilidade</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, 8].map((h) => (
                  <button
                    key={h}
                    onClick={() => setAvailHours(h)}
                    className={`p-2.5 rounded-xl font-bold border transition-all ${
                      availHours === h
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md font-extrabold'
                        : 'bg-accent/40 border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={() => onSave(true)}
              variant="outline"
              disabled={isUpdating}
              className="flex-1 rounded-xl border-border text-red-500 hover:text-red-600 font-bold text-xs py-3"
            >
              Desativar
            </Button>
            <Button
              onClick={() => onSave(false)}
              disabled={isUpdating}
              className="flex-1 proximous-btn-emerald text-white font-black text-xs rounded-xl py-3 shadow-md"
            >
              {isUpdating ? 'Salvando...' : 'Ativar no Radar ⚡'}
            </Button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const CreateActivityModal = ({
  show,
  onClose,
  newActTitle,
  setNewActTitle,
  newActCategory,
  setNewActCategory,
  newActLocation,
  setNewActLocation,
  newActTime,
  setNewActTime,
  newActMaxParticipants,
  setNewActMaxParticipants,
  newActDesc,
  setNewActDesc,
  onCreate,
  isCreating,
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border relative text-foreground max-h-[90vh] overflow-y-auto scrollbar-none"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Criar Convite Espontâneo</h3>
              <p className="text-xs text-muted-foreground font-bold">Convide 1, 2 ou mais pessoas para um rolê.</p>
            </div>
          </div>

          <form onSubmit={onCreate} className="space-y-4 text-xs">
            <div>
              <label className="font-extrabold text-foreground block mb-1">Título do Encontro</label>
              <Input
                value={newActTitle}
                onChange={(e) => setNewActTitle(e.target.value)}
                placeholder="Ex: Tomar um café no Girondino"
                className="rounded-xl bg-background border border-border text-foreground font-semibold text-sm placeholder:text-muted-foreground/60 focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-extrabold text-foreground block mb-1">Categoria</label>
                <select
                  value={newActCategory}
                  onChange={(e) => setNewActCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-border text-foreground font-semibold text-xs focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="coffee">☕ Café & Conversa</option>
                  <option value="drinks">🍻 Drinks & Happy Hour</option>
                  <option value="sports">🏃 Esportes & Treino</option>
                  <option value="culture">🎭 Cinema & Cultura</option>
                  <option value="games">🎮 Games & Hobbies</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-foreground block mb-1">Vagas Abertas</label>
                <select
                  value={newActMaxParticipants}
                  onChange={(e) => setNewActMaxParticipants(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-background border border-border text-foreground font-semibold text-xs focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value={2}>👥 Aberto p/ 2 pessoas</option>
                  <option value={3}>👥 Aberto p/ 3 pessoas</option>
                  <option value={4}>👥 Aberto p/ 4 pessoas</option>
                  <option value={6}>👥 Grupo (6 pessoas)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-extrabold text-foreground block mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-purple-500" /> Horário do Encontro
              </label>
              <Input
                value={newActTime}
                onChange={(e) => setNewActTime(e.target.value)}
                placeholder="Ex: Hoje às 19:30"
                className="rounded-xl bg-background border border-border text-foreground font-semibold text-sm placeholder:text-muted-foreground/60 focus:border-purple-500"
              />
            </div>

            {/* Interactive Leaflet GPS Location Picker Map with Autocomplete */}
            <LocationPickerMap
              locationName={newActLocation}
              onLocationNameChange={setNewActLocation}
              selectedPoint={[-23.5505, -46.6333]}
              onSelectPoint={(coords) => console.log('Selected coords:', coords)}
            />

            <div>
              <label className="font-extrabold text-foreground block mb-1">Descrição</label>
              <textarea
                value={newActDesc}
                onChange={(e) => setNewActDesc(e.target.value)}
                rows={3}
                placeholder="Explique a ideia do encontro e como pretende se reunir..."
                className="w-full p-3 rounded-xl bg-background border border-border text-foreground text-xs font-semibold placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <Button
              type="submit"
              disabled={!newActTitle || isCreating}
              className="w-full proximous-btn-primary text-xs font-black py-3 rounded-xl shadow-md mt-4"
            >
              {isCreating ? 'Publicando...' : 'Publicar Convite Espontâneo 🚀'}
            </Button>
          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
