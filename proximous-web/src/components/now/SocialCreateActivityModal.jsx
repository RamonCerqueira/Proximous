import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  Camera, 
  Image as ImageIcon, 
  Pencil, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Sparkles, 
  Zap, 
  Flame, 
  Coffee, 
  Wine, 
  Dumbbell, 
  Film, 
  MoreHorizontal, 
  Check, 
  Info,
  Search,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { activitiesAPI } from '@/lib/api';

const IMAGE_SUGGESTIONS = [
  {
    id: 'coffee',
    label: 'Café',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    title: 'Café da tarde & papo bom',
    category: '☕ Café & Papo',
    defaultDesc: 'Bora tomar um café especial, bater papo e colocar as novidades em dia? ☕✨'
  },
  {
    id: 'drinks',
    label: 'Drinks',
    url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    title: 'Drinks & Sunset pós-trabalho',
    category: '🍻 Drinks & Bar',
    defaultDesc: 'Fim de tarde com drinks artesanais, vista boa e conversa descontraída! 🍸🌅'
  },
  {
    id: 'cinema',
    label: 'Cinema',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    title: 'Cinema & Pipoca hoje à noite',
    category: '🍿 Cinema & Pipoca',
    defaultDesc: 'Assistir a estreia no cinema e depois comentar o filme em uma lanchonete! 🍿🎬'
  },
  {
    id: 'sport',
    label: 'Treino',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
    title: 'Corrida & Treino no Parque',
    category: '🏃 Corrida & Treino',
    defaultDesc: 'Treino funcional e caminhada ao ar livre para recarregar as energias! 🌿👟'
  }
];

const CATEGORIES = [
  { id: 'coffee', label: 'Café', icon: Coffee, emoji: '☕', defaultTitle: 'Café & Bate-papo' },
  { id: 'drinks', label: 'Drinks', icon: Wine, emoji: '🍸', defaultTitle: 'Drinks no início da noite' },
  { id: 'sport', label: 'Treino', icon: Dumbbell, emoji: '🏋️', defaultTitle: 'Treino ou Corrida' },
  { id: 'cinema', label: 'Cinema', icon: Film, emoji: '🍿', defaultTitle: 'Sessão Cinema' },
  { id: 'more', label: 'Mais', icon: MoreHorizontal, emoji: '⚡', defaultTitle: 'Rolê Espontâneo' },
];

const TIME_PRESETS = ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

export const SocialCreateActivityModal = ({
  show,
  onClose,
  onCreate,
  isCreating: externalIsCreating,
  initialLocation = 'Salvador',
  availableUsers = [],
}) => {
  const fileInputRef = useRef(null);

  // Multi-step Flow: 1 (Foto) -> 2 (Detalhes) -> 3 (Convidar) -> 4 (Confirmar)
  const [step, setStep] = useState(1);
  
  // Step 1: Photo State
  const [photoUrl, setPhotoUrl] = useState('');
  const [showAlertBanner, setShowAlertBanner] = useState(true);

  // Step 2: Details State
  const [category, setCategory] = useState('coffee');
  const [customCategory, setCustomCategory] = useState('');
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState('today'); // 'now', 'today', 'tomorrow', 'other'
  const [time, setTime] = useState('16:30');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [location, setLocation] = useState('Café do Mirante, Rio Vermelho');
  const [showRefInput, setShowRefInput] = useState(false);
  const [locationRef, setLocationRef] = useState('');
  const [description, setDescription] = useState('Bora tomar um café, conversar e colocar o papo em dia? ☕✨');
  const [radiusVisible, setRadiusVisible] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState(4);

  // Step 3: Invite State
  const [broadcastRadar, setBroadcastRadar] = useState(true);
  const [selectedInvitedIds, setSelectedInvitedIds] = useState(new Set());
  const [searchContact, setSearchContact] = useState('');

  // Submission State
  const [internalIsCreating, setInternalIsCreating] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (show) {
      setStep(1);
      if (!photoUrl) {
        // Pre-select first suggestion for convenience or keep empty
      }
      if (!location) {
        setLocation(`Rio Vermelho, ${initialLocation}`);
      }
    }
  }, [show]);

  if (!show) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSuggestion = (sug) => {
    setPhotoUrl(sug.url);
    if (!title || title.includes('Café') || title.includes('Drinks')) {
      setTitle(sug.title);
    }
    if (sug.id === 'coffee') setCategory('coffee');
    if (sug.id === 'drinks') setCategory('drinks');
    if (sug.id === 'cinema') setCategory('cinema');
    if (sug.id === 'sport') setCategory('sport');
    setDescription(sug.defaultDesc);
  };

  const toggleInviteUser = (userId) => {
    setSelectedInvitedIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleFinalPublish = async () => {
    try {
      setInternalIsCreating(true);

      const categoryLabel = category === 'more' 
        ? (customCategory || '⚡ Rolê Espontâneo') 
        : (CATEGORIES.find(c => c.id === category)?.emoji + ' ' + (CATEGORIES.find(c => c.id === category)?.label || 'Rolê'));

      const whenText = when === 'now' 
        ? 'Agora' 
        : when === 'today' 
          ? `Hoje às ${time}` 
          : when === 'tomorrow' 
            ? `Amanhã às ${time}` 
            : `Em breve às ${time}`;

      const payload = {
        title: title || 'Rolê Espontâneo no Radar',
        category: categoryLabel,
        location_name: locationRef ? `${location} (${locationRef})` : location,
        scheduled_time: whenText,
        description: description,
        photo_url: photoUrl,
        max_participants: parseInt(maxParticipants) || 4,
      };

      if (onCreate) {
        await onCreate(payload);
      } else {
        await activitiesAPI.create(payload);
      }

      onClose();
    } catch (err) {
      console.error('Error creating activity:', err);
    } finally {
      setInternalIsCreating(false);
    }
  };

  const isCreating = externalIsCreating || internalIsCreating;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          className="bg-[#0D081D] text-white rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-purple-500/25 relative max-h-[92vh] flex flex-col justify-between overflow-hidden"
        >
          
          {/* TOP HEADER */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  <span className="text-lg">🔥</span> Criar Rolê
                </h3>
                <p className="text-[11px] text-zinc-400 font-normal">
                  Convide pessoas e faça algo incrível!
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP PROGRESS INDICATOR */}
          <div className="flex items-center justify-between py-3 px-1 border-b border-white/5">
            {[
              { num: 1, label: 'Foto' },
              { num: 2, label: 'Detalhes' },
              { num: 3, label: 'Convidar' },
              { num: 4, label: 'Confirmar' }
            ].map((s, idx) => {
              const isDone = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
                    isDone 
                      ? 'bg-pink-600 text-white' 
                      : isCurrent 
                        ? 'bg-[#9B20F0] text-white ring-2 ring-purple-400/40 shadow-[0_0_10px_#9B20F0]' 
                        : 'bg-white/10 text-zinc-400'
                  }`}>
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                  </div>
                  <span className={`text-[11px] font-normal hidden sm:inline ${
                    isCurrent ? 'text-white font-medium' : isDone ? 'text-pink-300' : 'text-zinc-500'
                  }`}>
                    {s.label}
                  </span>
                  {idx < 3 && <div className="w-4 sm:w-6 h-px bg-white/10 mx-1" />}
                </div>
              );
            })}
          </div>

          {/* HIDDEN FILE INPUT SUPPORTING CAMERA & GALLERY */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* SCROLLABLE STEP CONTENT BODY */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 scrollbar-none">

            {/* ================= STEP 1: FOTO ================= */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Imagem do rolê</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/30">
                    Obrigatório
                  </span>
                </div>

                {/* Big Upload Area or Preview */}
                {!photoUrl ? (
                  <div className="border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-3xl p-6 flex flex-col items-center justify-center text-center bg-[#130D26]/60 transition-all">
                    <div className="w-14 h-14 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3 shadow-[0_0_20px_rgba(155,32,240,0.2)]">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">Adicione uma imagem</h4>
                    <p className="text-[11px] text-zinc-400 font-normal mt-0.5 mb-4">
                      Mostre o clima do seu rolê!
                    </p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#9B20F0] to-[#E846A5] hover:opacity-95 text-white text-xs font-semibold shadow-[0_4px_20px_rgba(232,70,165,0.35)] active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Escolher imagem</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden h-[180px] sm:h-[200px] border border-purple-500/40 shadow-xl group">
                    <img src={photoUrl} alt="Preview do rolê" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                    
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                      title="Remover foto"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2.5 left-2.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white text-[11px] font-medium border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Trocar imagem</span>
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-zinc-400 font-normal flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>Use fotos reais do lugar ou algo que represente o rolê.</span>
                </p>

                {/* Suggestions Carousel */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold text-white block">Sugestões de imagens</span>
                  <div className="grid grid-cols-4 gap-2">
                    {IMAGE_SUGGESTIONS.map((sug) => {
                      const isSelected = photoUrl === sug.url;
                      return (
                        <div
                          key={sug.id}
                          onClick={() => handleSelectSuggestion(sug)}
                          className={`relative h-28 rounded-xl overflow-hidden cursor-pointer border transition-all ${
                            isSelected ? 'ring-2 ring-pink-500 border-pink-500 shadow-md scale-102' : 'border-white/10 hover:border-purple-500/50'
                          }`}
                        >
                          <img src={sug.url} alt={sug.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-medium text-white truncate text-center">
                            {sug.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mandatory Image Alert Banner */}
                {showAlertBanner && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-[#1E1138] to-[#140C28] border border-purple-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 fill-pink-400" />
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-white">A imagem do rolê é obrigatória</h5>
                        <p className="text-[10px] text-zinc-400 font-normal">
                          Ela ajuda a chamar mais pessoas e mostra o clima da sua ideia!
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAlertBanner(false)}
                      className="text-zinc-500 hover:text-zinc-300 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ================= STEP 2: DETALHES ================= */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {/* Photo Mini Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Imagem do rolê</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/30">
                      Obrigatório
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden h-[120px] sm:h-[140px] border border-purple-500/40">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                    
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                      title="Editar imagem"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 hover:bg-black text-white text-[10px] font-medium border border-white/20 backdrop-blur-md flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Trocar imagem</span>
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white block">O que é o rolê?</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {CATEGORIES.map((cat) => {
                      const isSelected = category === cat.id;
                      const IconComp = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategory(cat.id);
                            if (!title || CATEGORIES.some(c => c.defaultTitle === title)) {
                              setTitle(cat.defaultTitle);
                            }
                            if (cat.id === 'more') {
                              setShowMoreCategories(true);
                            }
                          }}
                          className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all border ${
                            isSelected 
                              ? 'bg-purple-950/80 border-purple-400 text-white shadow-[0_0_12px_rgba(155,32,240,0.35)]' 
                              : 'bg-[#150F28] border-white/5 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <IconComp className={`w-4 h-4 mb-1 ${isSelected ? 'text-pink-400' : 'text-zinc-400'}`} />
                          <span className="text-[10px] font-medium truncate w-full">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {showMoreCategories && (
                    <div className="pt-2">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Ex: 🍕 Pizza, 🎾 Beach Tennis, 🐶 Pets, 🎸 Música..."
                        className="w-full p-2.5 rounded-xl bg-[#150F28] border border-purple-500/30 text-white text-xs font-medium placeholder:text-zinc-500 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white block">Título do Rolê</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Café Especial & Bate-Papo no Fim de Tarde"
                    className="w-full p-3 rounded-xl bg-[#150F28] border border-white/10 text-white text-xs font-medium placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* When / Quando? */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white block">Quando?</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'now', label: '⚡ Agora' },
                      { id: 'today', label: '📅 Hoje' },
                      { id: 'tomorrow', label: '📅 Amanhã' },
                      { id: 'other', label: '📅 Outro dia' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setWhen(item.id)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-medium border transition-all ${
                          when === item.id 
                            ? 'bg-purple-950/90 border-purple-400 text-white shadow-[0_0_10px_rgba(155,32,240,0.3)]' 
                            : 'bg-[#150F28] border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horário */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white block">Horário</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      className="w-full p-2.5 rounded-xl bg-[#150F28] border border-white/10 text-white text-xs font-medium flex items-center justify-between hover:border-purple-500 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>{time}</span>
                      </div>
                      <ChevronLeft className="w-3.5 h-3.5 rotate-[-90deg] text-zinc-400" />
                    </button>

                    {showTimeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#160E2E] border border-purple-500/40 rounded-xl p-2 max-h-36 overflow-y-auto grid grid-cols-4 gap-1.5 shadow-2xl">
                        {TIME_PRESETS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setTime(t);
                              setShowTimeDropdown(false);
                            }}
                            className={`p-1.5 rounded-lg text-[11px] font-medium text-center ${
                              time === t ? 'bg-purple-600 text-white' : 'hover:bg-white/5 text-zinc-300'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Onde vai ser? */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white block">Onde vai ser?</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Café do Mirante, Rio Vermelho"
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#150F28] border border-white/10 text-white text-xs font-medium placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                    {location && (
                      <button
                        type="button"
                        onClick={() => setLocation('')}
                        className="absolute right-2.5 top-3 text-zinc-500 hover:text-zinc-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {!showRefInput ? (
                    <button
                      type="button"
                      onClick={() => setShowRefInput(true)}
                      className="text-[11px] text-purple-400 hover:text-purple-300 font-normal block pt-0.5"
                    >
                      + Adicionar referência (opcional)
                    </button>
                  ) : (
                    <input
                      type="text"
                      value={locationRef}
                      onChange={(e) => setLocationRef(e.target.value)}
                      placeholder="Ex: Próximo à praça de alimentação"
                      className="w-full p-2 rounded-xl bg-[#120D24] border border-purple-500/20 text-white text-xs font-normal placeholder:text-zinc-600 focus:outline-none"
                    />
                  )}
                </div>

                {/* Sobre o rolê */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white">Sobre o rolê</label>
                    <span className="text-[10px] text-zinc-500 font-normal">
                      {description.length}/200
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={200}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bora tomar um café, conversar e colocar o papo em dia? ☕✨"
                    className="w-full p-2.5 rounded-xl bg-[#150F28] border border-white/10 text-white text-xs font-normal placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                {/* Quem pode ver? */}
                <div className="p-3 rounded-2xl bg-[#150F28] border border-white/5 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-white">Quem pode ver?</h5>
                    <p className="text-[11px] text-zinc-400 font-normal mt-0.5">
                      Pessoas próximas a até 25 km
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRadiusVisible(!radiusVisible)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      radiusVisible ? 'bg-gradient-to-r from-purple-600 to-pink-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      radiusVisible ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 3: CONVIDAR ================= */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">Quem você quer convidar?</h4>
                  <p className="text-[11px] text-zinc-400 font-normal mt-0.5">
                    Transmita no Radar ou convide contatos específicos diretamente.
                  </p>
                </div>

                {/* Radar Broadcast Toggle */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1D1036] to-[#140D28] border border-purple-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white">Transmitir no Radar</h5>
                      <p className="text-[10px] text-zinc-400 font-normal">
                        Notificar pessoas com interesses compatíveis no raio de 25 km
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBroadcastRadar(!broadcastRadar)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                      broadcastRadar ? 'bg-gradient-to-r from-purple-600 to-pink-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      broadcastRadar ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Direct People Selector */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Pessoas no seu Radar</span>
                    <span className="text-[10px] text-purple-400 font-medium">
                      {selectedInvitedIds.size} selecionados
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-none pr-1">
                    {(availableUsers.length > 0 ? availableUsers : [
                      { id: 'u_1', name: 'Camila Rocha', distance: 1.2, profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
                      { id: 'u_2', name: 'Lucas Santos', distance: 2.1, profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
                      { id: 'u_3', name: 'Beatriz Costa', distance: 2.5, profile_photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200' },
                      { id: 'u_4', name: 'João Silva', distance: 2.8, profile_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
                      { id: 'u_5', name: 'Ana Lima', distance: 3.1, profile_photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200' }
                    ]).map((person) => {
                      const isSelected = selectedInvitedIds.has(person.id);
                      return (
                        <div
                          key={person.id}
                          onClick={() => toggleInviteUser(person.id)}
                          className={`p-2.5 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${
                            isSelected 
                              ? 'bg-purple-950/60 border-purple-500/50' 
                              : 'bg-[#150F28] border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={person.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`}
                              alt={person.name}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-purple-500/30"
                            />
                            <div>
                              <h5 className="text-xs font-semibold text-white">{person.name}</h5>
                              <p className="text-[10px] text-zinc-400 font-normal">
                                {person.distance ? `${person.distance} km de você` : 'No seu radar'}
                              </p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            isSelected ? 'bg-pink-600 border-pink-500 text-white' : 'border-white/20'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 4: CONFIRMAR ================= */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">Quase lá! Veja como ficou:</h4>
                  <p className="text-[11px] text-zinc-400 font-normal mt-0.5">
                    Seu rolê será publicado no Radar em tempo real.
                  </p>
                </div>

                {/* LIVE EVENT CARD PREVIEW */}
                <div className="relative rounded-2xl overflow-hidden h-[240px] border border-purple-500/40 shadow-2xl p-4 flex flex-col justify-between">
                  <img
                    src={photoUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800'}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30" />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500 text-black uppercase tracking-wider">
                      {when === 'now' ? 'AGORA' : 'HOJE'}
                    </span>

                    <span className="text-[11px] font-medium text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                      👥 Vagas Abertas
                    </span>
                  </div>

                  {/* Bottom Content */}
                  <div className="relative z-10 space-y-1.5">
                    <h3 className="font-semibold text-base text-white leading-snug line-clamp-2">
                      "{title || 'Café & Bate-papo'}"
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-zinc-300">
                      <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="truncate">{location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>{when === 'now' ? 'Agora' : `Hoje às ${time}`}</span>
                    </div>
                  </div>
                </div>

                {/* Summary Details Box */}
                <div className="p-3 rounded-2xl bg-[#150F28] border border-white/5 space-y-1.5 text-xs font-normal text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">📍 Local:</span>
                    <span className="font-medium text-white">{location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">⏱ Horário:</span>
                    <span className="font-medium text-white">{when === 'now' ? 'Agora' : `Hoje às ${time}`}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">📡 Alcance:</span>
                    <span className="font-medium text-purple-300">Raio de 25 km ({initialLocation})</span>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* BOTTOM STICKY ACTION BUTTON */}
          <div className="pt-3 border-t border-white/5">
            {step === 1 && (
              <button
                type="button"
                disabled={!photoUrl}
                onClick={() => setStep(2)}
                className={`w-full py-3.5 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  photoUrl
                    ? 'bg-gradient-to-r from-[#9B20F0] to-[#FF2B85] hover:opacity-95 text-white shadow-[0_4px_25px_rgba(255,43,133,0.4)] active:scale-95'
                    : 'bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <span>Continuar</span>
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-3.5 px-4 rounded-full text-xs font-semibold bg-gradient-to-r from-[#9B20F0] to-[#FF2B85] hover:opacity-95 text-white shadow-[0_4px_25px_rgba(255,43,133,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Continuar para convidar</span>
                <span>➔</span>
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full py-3.5 px-4 rounded-full text-xs font-semibold bg-gradient-to-r from-[#9B20F0] to-[#FF2B85] hover:opacity-95 text-white shadow-[0_4px_25px_rgba(255,43,133,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Continuar para confirmação</span>
                <span>➔</span>
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                disabled={isCreating}
                onClick={handleFinalPublish}
                className="w-full py-3.5 px-4 rounded-full text-xs font-semibold bg-gradient-to-r from-[#9B20F0] via-[#D91680] to-[#FF2B85] hover:opacity-95 text-white shadow-[0_4px_30px_rgba(255,43,133,0.5)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {isCreating ? (
                  <span>Publicando rolê...</span>
                ) : (
                  <>
                    <span>Publicar Rolê no Radar</span>
                    <span>⚡</span>
                  </>
                )}
              </button>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SocialCreateActivityModal;
