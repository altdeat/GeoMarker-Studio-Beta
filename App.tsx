
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Editor } from './components/Editor';
import { Player } from './components/Player';
import { ObjectType, LevelObject, LevelMetadata } from './types';
import { OBJECT_CONFIG } from './constants';
import { generateLevelSection } from './services/geminiService';
import { menuMusic } from './services/audioService';
import { 
  Wand2, 
  Trash2, 
  Download, 
  Play, 
  Plus, 
  Minus,
  Sparkles,
  Zap,
  MousePointer2,
  RotateCw,
  XCircle,
  Move,
  MousePointerSquareDashed,
  Copy,
  Languages,
  Info,
  HelpCircle,
  MousePointer,
  Keyboard,
  Cpu,
  Youtube,
  Music,
  FileAudio,
  Pause,
  X
} from 'lucide-react';

// Game physics constants for synchronization
const BASE_PLAYER_SPEED = 9.0;
const FPS = 60;
const PIXELS_PER_SECOND = BASE_PLAYER_SPEED * FPS; // ~540px per second

export const translations = {
  en: {
    title: "GEOMARKER",
    studio: "STUDIO",
    play: "Play",
    stop: "Stop",
    export: "Export",
    importMusic: "Import Music",
    noMusic: "No music loaded",
    credits: "App Info",
    tutorial: "Tutorial",
    tools: "TOOLS",
    selection: "Selection",
    move: "Move",
    rotate: "Rotate",
    erase: "Erase",
    all: "All",
    none: "None",
    clone: "Clone",
    delete: "Delete",
    palette: "OBJECT PALETTE",
    aiArchitect: "AI ARCHITECT",
    aiPlaceholder: "Ex: Many spikes and platforms...",
    aiGenerate: "Generate AI",
    aiBuilding: "Building...",
    objects: "OBJECTS",
    selected: "SELECTED",
    chooseLang: "Choose your language",
    welcome: "Welcome to GeoMarker Studio",
    spanish: "Spanish",
    english: "English",
    portuguese: "Portuguese",
    french: "French",
    retry: "Retry",
    exit: "Exit",
    attempt: "Attempt",
    win: "LEVEL OK!",
    missionComplete: "Mission Complete!",
    editor: "Editor",
    jumpHint: "CLICK OR SPACE TO JUMP",
    stopPlayer: "STOP",
    close: "Close",
    creditsText: "Created by ALTDEAT via Google AI Studio",
    youtubeMessage: "If you want to visit my channel, here is the link 👇:",
    youtubeLink: "https://www.youtube.com/@ALTDEAT_OFICIAL",
    tutorialTitle: "How to use GeoMarker",
    tutorialSteps: [
      {
        title: "Building",
        desc: "Select an object from the palette and click on the grid to place it. Right click to delete.",
        icon: <Plus className="text-cyan-400" />
      },
      {
        title: "Tools",
        desc: "Use 'Select' to group objects, 'Move' to drag them, and 'Rotate' to change orientation.",
        icon: <MousePointer className="text-indigo-400" />
      },
      {
        title: "AI Architect",
        desc: "Type a description like 'challenging jumps' and the AI will build it for you!",
        icon: <Cpu className="text-purple-400" />
      },
      {
        title: "Controls",
        desc: "Press Play to test. Use Spacebar, Arrow Up or Click to jump/fly.",
        icon: <Keyboard className="text-orange-400" />
      }
    ],
    loadingMessages: [
      "Initializing Engine...",
      "Loading Assets...",
      "Configuring AI Architect...",
      "Syncing Rhythm...",
      "Preparing Studio..."
    ]
  },
  es: {
    title: "GEOMARKER",
    studio: "STUDIO",
    play: "Jugar",
    stop: "Parar",
    export: "Exportar",
    importMusic: "Importar Música",
    noMusic: "Sin música cargada",
    credits: "Info App",
    tutorial: "Tutorial",
    tools: "HERRAMIENTAS",
    selection: "Selección",
    move: "Mover",
    rotate: "Rotar",
    erase: "Borrar",
    all: "Todo",
    none: "Nada",
    clone: "Clonar",
    delete: "Borrar",
    palette: "PALETA DE OBJETOS",
    aiArchitect: "IA ARQUITECTO",
    aiPlaceholder: "Ej: Muchos pinchos y plataformas...",
    aiGenerate: "Generar IA",
    aiBuilding: "Construyendo...",
    objects: "OBJETOS",
    selected: "SELECCIONADOS",
    chooseLang: "Elige tu idioma",
    welcome: "Bienvenido a GeoMarker Studio",
    spanish: "Español",
    english: "Inglés",
    portuguese: "Portugués",
    french: "Francés",
    retry: "Reintentar",
    exit: "Salir",
    attempt: "Intento",
    win: "¡NIVEL OK!",
    missionComplete: "¡Misión cumplida!",
    editor: "Editor",
    jumpHint: "CLIC O ESPACIO PARA SALTAR",
    stopPlayer: "PARAR",
    close: "Cerrar",
    creditsText: "Creado por ALTDEAT a partir de Google AI Studio",
    youtubeMessage: "Si desean visitar mi canal, aquí les dejo el enlace 👇:",
    youtubeLink: "https://www.youtube.com/@ALTDEAT_OFICIAL",
    tutorialTitle: "Cómo usar GeoMarker",
    tutorialSteps: [
      {
        title: "Construcción",
        desc: "Selecciona un objeto de la paleta y haz clic en la cuadrícula. Clic derecho para borrar.",
        icon: <Plus className="text-cyan-400" />
      },
      {
        title: "Herramientas",
        desc: "Usa 'Selección' para agrupar, 'Mover' para arrastrar y 'Rotar' para girar objetos.",
        icon: <MousePointer className="text-indigo-400" />
      },
      {
        title: "Arquitecto IA",
        desc: "Escribe algo como 'saltos difíciles' y la IA construirá esa sección por ti.",
        icon: <Cpu className="text-purple-400" />
      },
      {
        title: "Controles",
        desc: "Pulsa Jugar para probar. Usa Espacio, Flecha Arriba o Clic para saltar/volar.",
        icon: <Keyboard className="text-orange-400" />
      }
    ],
    loadingMessages: [
      "Inicializando motor...",
      "Cargando recursos...",
      "Configurando IA Arquitecto...",
      "Sincronizando ritmo...",
      "Preparing Studio..."
    ]
  },
  pt: {
    title: "GEOMARKER",
    studio: "STUDIO",
    play: "Jogar",
    stop: "Parar",
    export: "Exportar",
    importMusic: "Importar Música",
    noMusic: "Nenhuma música cargada",
    credits: "Informações",
    tutorial: "Tutorial",
    tools: "FERRAMENTAS",
    selection: "Seleção",
    move: "Mover",
    rotate: "Rodar",
    erase: "Apagar",
    all: "Tudo",
    none: "Nada",
    clone: "Clonar",
    delete: "Excluir",
    palette: "PALETA DE OBJETOS",
    aiArchitect: "ARQUITETO IA",
    aiPlaceholder: "Ex: Muitos espinhos e plataformas...",
    aiGenerate: "Gerar IA",
    aiBuilding: "Construindo...",
    objects: "OBJETOS",
    selected: "SELECIONADOS",
    chooseLang: "Escolha seu idioma",
    welcome: "Bem-vindo ao GeoMarker Studio",
    spanish: "Espanhol",
    english: "Inglês",
    portuguese: "Português",
    french: "Francés",
    retry: "Tentar novamente",
    exit: "Sair",
    attempt: "Tentativa",
    win: "NÍVEL OK!",
    missionComplete: "Missão Cumprida!",
    editor: "Editor",
    jumpHint: "CLIQUE OU ESPAÇO PARA SALTAR",
    stopPlayer: "PARAR",
    close: "Fechar",
    creditsText: "Criado por ALTDEAT via Google AI Studio",
    youtubeMessage: "Se quiserem visitar o meu canal, aqui fica o link 👇:",
    youtubeLink: "https://www.youtube.com/@ALTDEAT_OFICIAL",
    tutorialTitle: "Como usar o GeoMarker",
    tutorialSteps: [
      {
        title: "Construção",
        desc: "Selecione um objeto da paleta e clique na grade para colocá-lo. Clique com o botão direito para excluir.",
        icon: <Plus className="text-cyan-400" />
      },
      {
        title: "Ferramentas",
        desc: "Use 'Seleção' para agrupar objetos, 'Mover' para arrastá-los e 'Rodar' para mudar a orientação.",
        icon: <MousePointer className="text-indigo-400" />
      },
      {
        title: "Arquiteto IA",
        desc: "Digite uma descripción como 'saltos desafiadores' e a IA construirá para você!",
        icon: <Cpu className="text-purple-400" />
      },
      {
        title: "Controles",
        desc: "Pressione Jogar para testar. Use Espaço, Seta para Cima ou Clique para pular/voar.",
        icon: <Keyboard className="text-orange-400" />
      }
    ],
    loadingMessages: [
      "Inicializando Motor...",
      "Carregando Recursos...",
      "Configurando Arquiteto IA...",
      "Sincronizando Ritmo...",
      "Preparando Estúdio..."
    ]
  },
  fr: {
    title: "GEOMARKER",
    studio: "STUDIO",
    play: "Jouer",
    stop: "Arrêter",
    export: "Exporter",
    importMusic: "Importer de la Musique",
    noMusic: "Aucune musique chargée",
    credits: "Infos App",
    tutorial: "Tutoriel",
    tools: "OUTILS",
    selection: "Sélection",
    move: "Déplacer",
    rotate: "Pivoter",
    erase: "Effacer",
    all: "Tout",
    none: "Aucun",
    clone: "Cloner",
    delete: "Supprimer",
    palette: "PALETTE D'OBJETS",
    aiArchitect: "ARCHITECTE IA",
    aiPlaceholder: "Ex: Beaucoup de pics et de plateformes...",
    aiGenerate: "Générer IA",
    aiBuilding: "Construction...",
    objects: "OBJETS",
    selected: "SÉLECTIONNÉS",
    chooseLang: "Choisissez votre langue",
    welcome: "Bienvenue sur GeoMarker Studio",
    spanish: "Espagnol",
    english: "Anglais",
    portuguese: "Portugais",
    french: "Français",
    retry: "Réessayer",
    exit: "Quitter",
    attempt: "Tentative",
    win: "NIVEAU OK !",
    missionComplete: "Mission Accomplie !",
    editor: "Éditeur",
    jumpHint: "CLIC OU ESPACE POUR SAUTER",
    stopPlayer: "ARRÊTER",
    close: "Fermer",
    creditsText: "Créé par ALTDEAT via Google AI Studio",
    youtubeMessage: "Si vous voulez visiter ma chaîne, voici le lien 👇 :",
    youtubeLink: "https://www.youtube.com/@ALTDEAT_OFICIAL",
    tutorialTitle: "Comment utiliser GeoMarker",
    tutorialSteps: [
      {
        title: "Construction",
        desc: "Sélectionnez un objet de la palette et cliquez sur la grille pour le placer. Clic droit pour supprimer.",
        icon: <Plus className="text-cyan-400" />
      },
      {
        title: "Outils",
        desc: "Utilisez 'Sélection' para grouper des objets, 'Déplacer' pour les faire glisser et 'Pivoter' pour changer l'orientation.",
        icon: <MousePointer className="text-indigo-400" />
      },
      {
        title: "Architecte IA",
        desc: "Tapez une description como 'sauts difficiles' et l'IA le construira pour vous !",
        icon: <Cpu className="text-purple-400" />
      },
      {
        title: "Commandes",
        desc: "Appuyez sur Jouer pour tester. Utilisez Espace, Flèche Haut ou Clic para sauter/voler.",
        icon: <Keyboard className="text-orange-400" />
      }
    ],
    loadingMessages: [
      "Initialisation du Moteur...",
      "Chargement des Ressources...",
      "Configuration de l'Architecte IA...",
      "Synchronisation du Rythme...",
      "Préparation du Studio..."
    ]
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'es' | 'en' | 'pt' | 'fr' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  
  const [objects, setObjects] = useState<LevelObject[]>([]);
  const [selectedTool, setSelectedTool] = useState<ObjectType | 'ERASER' | 'ROTATE' | 'SELECT' | 'MOVE'>(ObjectType.BLOCK);
  const [zoom, setZoom] = useState(window.innerWidth < 768 ? 0.6 : 1);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditorMusicPlaying, setIsEditorMusicPlaying] = useState(false);
  const [syncLineX, setSyncLineX] = useState<number | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [musicName, setMusicName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [metadata, setMetadata] = useState<LevelMetadata>({
    name: 'New Level',
    difficulty: 'Normal',
    author: 'Creator',
    speed: 1.0
  });

  const t = useMemo(() => translations[lang || 'en'], [lang]);

  const handleSelectLang = (selected: 'es' | 'en' | 'pt' | 'fr') => {
    setLang(selected);
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const name = await menuMusic.loadMusic(file);
        setMusicName(name);
      } catch (err) {
        console.error("Failed to load music", err);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      setIsEditorMusicPlaying(false);
      menuMusic.start();
    } else {
      if (!isEditorMusicPlaying) {
        menuMusic.stop();
        setSyncLineX(null);
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isEditorMusicPlaying) {
      menuMusic.start();
    } else if (!isPlaying) {
      menuMusic.stop();
      setSyncLineX(null);
    }
  }, [isEditorMusicPlaying, isPlaying]);

  useEffect(() => {
    let frameId: number;
    const updatePlayhead = () => {
      if (isEditorMusicPlaying) {
        const time = menuMusic.getCurrentTime();
        setSyncLineX(time * PIXELS_PER_SECOND);
        frameId = requestAnimationFrame(updatePlayhead);
      }
    };
    
    if (isEditorMusicPlaying) {
      frameId = requestAnimationFrame(updatePlayhead);
    } else {
      setSyncLineX(null);
    }
    
    return () => cancelAnimationFrame(frameId);
  }, [isEditorMusicPlaying]);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsLoading(false), 800);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 150);

      const msgInterval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % (t.loadingMessages?.length || 1));
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(msgInterval);
      };
    }
  }, [isLoading, t.loadingMessages?.length]);

  const handleAddObject = useCallback((obj: LevelObject) => {
    setObjects(prev => [...prev, obj]);
  }, []);

  const handleRemoveObject = useCallback((id: string) => {
    setObjects(prev => prev.filter(o => o.id !== id));
    setSelectedIds(prev => prev.filter(sid => sid !== id));
  }, []);

  const handleRemoveMultiple = useCallback((ids: string[]) => {
    setObjects(prev => prev.filter(o => !ids.includes(o.id)));
    setSelectedIds([]);
  }, []);

  const handleUpdateObject = useCallback((updatedObj: LevelObject) => {
    setObjects(prev => prev.map(o => o.id === updatedObj.id ? updatedObj : o));
  }, []);

  const handleMoveObjects = useCallback((ids: string[], deltaX: number, deltaY: number) => {
    if (ids.length === 0) return;
    setObjects(prev => {
      return prev.map(o => {
        if (ids.includes(o.id)) {
          return { ...o, x: o.x + deltaX, y: o.y + deltaY };
        }
        return o;
      });
    });
  }, []);

  const selectAll = () => setSelectedIds(objects.map(o => o.id));
  const deselectAll = () => setSelectedIds([]);

  const duplicateSelected = () => {
    if (selectedIds.length === 0) return;
    const toDuplicate = objects.filter(o => selectedIds.includes(o.id));
    const newOnes = toDuplicate.map(o => ({
      ...o,
      id: Math.random().toString(36).substr(2, 9),
      x: o.x + 1
    }));
    setObjects(prev => [...prev, ...newOnes]);
    setSelectedIds(newOnes.map(o => o.id));
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const maxX = objects.length > 0 ? Math.max(...objects.map(o => o.x)) : 0;
      const newObjectsRaw = await generateLevelSection(aiPrompt, maxX + 2);
      const newObjects: LevelObject[] = newObjectsRaw.map((o: any) => ({
        ...o,
        id: Math.random().toString(36).substr(2, 9),
        rotation: 0
      }));
      setObjects(prev => [...prev, ...newObjects]);
      setAiPrompt('');
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ metadata, objects }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
  };

  const Logo = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative mb-4">
        <div className="bg-cyan-500 w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.4)] rotate-3">
          <Zap className="w-12 h-12 md:w-16 md:h-16 text-slate-900 fill-current" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-slate-950 px-2 py-1 rounded-md border border-cyan-500/50">
          <span className="text-[10px] font-black text-cyan-400">STUDIO</span>
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">
        GEOMARKER
      </h1>
    </div>
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[110] p-4 h-[100dvh]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="mb-12 animate-pulse">
            <Logo />
          </div>
          <h2 className="text-white font-black italic tracking-widest text-xs mb-8 uppercase opacity-60">
            {t.loadingMessages[loadingMsgIdx]}
          </h2>
          <div className="relative h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
             <div 
               className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 via-blue-400 to-cyan-600 shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300 ease-out"
               style={{ width: `${loadingProgress}%` }}
             />
          </div>
          <div className="mt-4 flex justify-between items-center px-1">
             <span className="text-[9px] font-mono text-cyan-500/60 font-bold uppercase tracking-widest">GeoMarker beta 3.0.13</span>
             <span className="text-[10px] font-mono text-cyan-500 font-bold">{Math.round(loadingProgress)}%</span>
          </div>
        </div>
      </div>
    );
  }

  if (!lang) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[100] p-4 text-center overflow-y-auto h-[100dvh]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="relative z-10 animate-in fade-in zoom-in duration-700 w-full max-w-3xl mx-auto py-12">
          <Logo className="mb-12" />
          <p className="text-slate-400 text-xs md:text-sm mb-12 font-bold tracking-widest uppercase opacity-80">Version beta 3.0.13 - Level Creator Studio</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4">
            <button onClick={() => handleSelectLang('es')} className="group bg-slate-800 hover:bg-cyan-600 border-2 border-slate-700 hover:border-cyan-400 p-6 rounded-2xl transition-all duration-300 flex flex-col items-center">
              <Languages className="mb-2 text-slate-400 group-hover:text-white" />
              <span className="text-xl font-black text-white uppercase italic">Español</span>
            </button>
            <button onClick={() => handleSelectLang('en')} className="group bg-slate-800 hover:bg-indigo-600 border-2 border-slate-700 hover:border-indigo-400 p-6 rounded-2xl transition-all duration-300 flex flex-col items-center">
              <Languages className="mb-2 text-slate-400 group-hover:text-white" />
              <span className="text-xl font-black text-white uppercase italic">English</span>
            </button>
            <button onClick={() => handleSelectLang('pt')} className="group bg-slate-800 hover:bg-emerald-600 border-2 border-slate-700 hover:border-emerald-400 p-6 rounded-2xl transition-all duration-300 flex flex-col items-center">
              <Languages className="mb-2 text-slate-400 group-hover:text-white" />
              <span className="text-xl font-black text-white uppercase italic">Português</span>
            </button>
            <button onClick={() => handleSelectLang('fr')} className="group bg-slate-800 hover:bg-rose-600 border-2 border-slate-700 hover:border-rose-400 p-6 rounded-2xl transition-all duration-300 flex flex-col items-center">
              <Languages className="mb-2 text-slate-400 group-hover:text-white" />
              <span className="text-xl font-black text-white uppercase italic">Français</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-slate-950 animate-in fade-in duration-1000">
      <header className="h-16 bg-[#1e293b] border-b border-slate-700 flex items-center justify-between px-4 sm:px-6 shrink-0 z-50 shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-cyan-500 p-1.5 sm:p-2 rounded-lg shadow-lg shadow-cyan-500/20 shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 fill-current" />
          </div>
          <div className="min-w-0 flex flex-col">
            <h1 className="text-base sm:text-lg font-black tracking-tighter text-white uppercase italic leading-tight">
              {t.title} <span className="text-cyan-400">{t.studio}</span>
            </h1>
            <span className="text-[8px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest">beta 3.0.13</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <input type="file" ref={fileInputRef} onChange={handleMusicUpload} accept="audio/*" className="hidden" />
          
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
            <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all ${musicName ? 'text-cyan-400' : 'text-slate-400 hover:bg-slate-700'}`}>
              <Music size={16} />
              <span className="hidden sm:inline text-[9px] uppercase font-black tracking-wider truncate max-w-[80px]">{musicName || t.importMusic}</span>
            </button>
            {musicName && !isPlaying && (
              <button 
                onClick={() => setIsEditorMusicPlaying(!isEditorMusicPlaying)}
                className={`p-1.5 sm:p-2 rounded-md transition-all ${isEditorMusicPlaying ? 'bg-cyan-500 text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}
              >
                {isEditorMusicPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              </button>
            )}
          </div>

          <div className="flex items-center bg-slate-800/80 p-0.5 sm:p-1 rounded-lg border border-slate-700">
             <button onClick={() => setIsPlaying(!isPlaying)} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-md transition-all ${isPlaying ? 'bg-red-500 text-white font-black' : 'bg-cyan-600 hover:bg-cyan-500 text-white font-black'}`}>
               {isPlaying ? <XCircle size={14} /> : <Play size={14} className="fill-current" />}
               <span className="text-[10px] sm:text-xs uppercase tracking-widest">{isPlaying ? t.stop : t.play}</span>
             </button>
             {!isPlaying && (
               <div className="hidden sm:flex items-center border-l border-slate-700 ml-1 pl-1">
                 <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"><Minus size={14} /></button>
                 <span className="text-[9px] font-mono font-bold text-cyan-400 px-2 min-w-[45px] text-center">{Math.round(zoom * 100)}%</span>
                 <button onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"><Plus size={14} /></button>
               </div>
             )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setShowTutorial(true)} className="bg-slate-800 hover:bg-slate-700 p-1.5 sm:p-2 rounded-lg text-white border border-slate-700"><HelpCircle size={18} /></button>
            <button onClick={() => setShowCredits(true)} className="bg-slate-800 hover:bg-slate-700 p-1.5 sm:p-2 rounded-lg text-white border border-slate-700"><Info size={18} /></button>
            <button onClick={handleExport} className="bg-slate-700 hover:bg-slate-600 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-white font-bold flex items-center gap-2 border border-slate-600"><Download size={14} /> <span className="hidden lg:inline text-xs">{t.export}</span></button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {!isPlaying && (
          <aside className="w-64 lg:w-72 bg-[#0f172a] border-r border-slate-800 flex flex-col z-10 shadow-2xl overflow-y-auto shrink-0 hidden md:flex">
            <div className="p-5 flex-1 space-y-8">
              <section>
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{t.tools}</h2>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setSelectedTool('SELECT')} className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${selectedTool === 'SELECT' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-800/30'}`}>
                    <MousePointerSquareDashed size={20} className={selectedTool === 'SELECT' ? 'text-indigo-400' : 'text-slate-400'} />
                    <span className="text-[9px] font-black uppercase tracking-wider">{t.selection}</span>
                  </button>
                  <button onClick={() => setSelectedTool('MOVE')} className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${selectedTool === 'MOVE' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-800 bg-slate-800/30'}`}>
                    <Move size={20} className={selectedTool === 'MOVE' ? 'text-orange-400' : 'text-slate-400'} />
                    <span className="text-[9px] font-black uppercase tracking-wider">{t.move}</span>
                  </button>
                  <button onClick={() => setSelectedTool('ROTATE')} className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${selectedTool === 'ROTATE' ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-800 bg-slate-800/30'}`}>
                    <RotateCw size={20} className={selectedTool === 'ROTATE' ? 'text-yellow-400' : 'text-slate-400'} />
                    <span className="text-[9px] font-black uppercase tracking-wider">{t.rotate}</span>
                  </button>
                  <button onClick={() => setSelectedTool('ERASER')} className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${selectedTool === 'ERASER' ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-800/30'}`}>
                    <MousePointer2 size={20} className={selectedTool === 'ERASER' ? 'text-red-500' : 'text-slate-400'} />
                    <span className="text-[9px] font-black uppercase tracking-wider">{t.erase}</span>
                  </button>
                </div>
                {/* BOTONES DE CLONAR, BORRAR, TODOS Y NADA RESTAURADOS */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                   <button onClick={selectAll} className="p-2 bg-slate-800 hover:bg-slate-700 text-[9px] font-black uppercase rounded-lg border border-slate-700 text-slate-400">{t.all}</button>
                   <button onClick={deselectAll} className="p-2 bg-slate-800 hover:bg-slate-700 text-[9px] font-black uppercase rounded-lg border border-slate-700 text-slate-400">{t.none}</button>
                   {selectedIds.length > 0 && (
                     <>
                       <button onClick={duplicateSelected} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-[9px] font-black uppercase rounded-lg text-white"><Copy size={12} className="inline mr-1"/> {t.clone}</button>
                       <button onClick={() => handleRemoveMultiple(selectedIds)} className="p-2 bg-red-600 hover:bg-red-500 text-[9px] font-black uppercase rounded-lg text-white"><Trash2 size={12} className="inline mr-1"/> {t.delete}</button>
                     </>
                   )}
                </div>
              </section>

              <section>
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{t.palette}</h2>
                <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[45vh] pr-2 custom-scrollbar">
                  {Object.entries(ObjectType).map(([key, value]) => (
                    <button key={value} onClick={() => setSelectedTool(value as ObjectType)} className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${selectedTool === value ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-800/30 hover:border-slate-700'}`}>
                      <div className="w-6 h-6">{OBJECT_CONFIG[value as ObjectType].icon}</div>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">{t.aiArchitect}</h2>
              </div>
              <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder={t.aiPlaceholder} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs resize-none focus:border-cyan-500/50 outline-none mb-3 text-slate-300" />
              <button onClick={handleAiGenerate} disabled={isGenerating || !aiPrompt.trim()} className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${isGenerating ? 'bg-slate-800 text-slate-500' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20'}`}>
                {isGenerating ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Wand2 size={14} />}
                {isGenerating ? t.aiBuilding : t.aiGenerate}
              </button>
            </div>
          </aside>
        )}

        <main className="flex-1 relative flex flex-col min-w-0">
          {isPlaying ? (
            <Player objects={objects} onExit={() => setIsPlaying(false)} lang={lang as 'es' | 'en' | 'pt' | 'fr'} />
          ) : (
            <>
              <div className="flex-1 relative flex flex-col overflow-hidden">
                <Editor 
                  objects={objects}
                  selectedIds={selectedIds}
                  onAddObject={handleAddObject}
                  onRemoveObject={handleRemoveObject}
                  onUpdateObject={handleUpdateObject}
                  onMoveObjects={handleMoveObjects}
                  onSetSelectedIds={setSelectedIds}
                  selectedTool={selectedTool}
                  zoom={zoom}
                  lang={lang as 'es' | 'en' | 'pt' | 'fr'}
                  syncLineX={syncLineX}
                />
              </div>
              
              <div className="md:hidden bg-[#0f172a] border-t border-slate-800 p-2 z-20 space-y-2 shrink-0">
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide no-scrollbar">
                  <button onClick={() => setSelectedTool('SELECT')} className={`p-2.5 rounded-lg border-2 shrink-0 ${selectedTool === 'SELECT' ? 'border-indigo-500 bg-indigo-500/15' : 'border-slate-800 bg-slate-800/40'}`}><MousePointerSquareDashed size={18} className="text-indigo-400" /></button>
                  <button onClick={() => setSelectedTool('MOVE')} className={`p-2.5 rounded-lg border-2 shrink-0 ${selectedTool === 'MOVE' ? 'border-orange-500 bg-orange-500/15' : 'border-slate-800 bg-slate-800/40'}`}><Move size={18} className="text-orange-400" /></button>
                  <button onClick={() => setSelectedTool('ROTATE')} className={`p-2.5 rounded-lg border-2 shrink-0 ${selectedTool === 'ROTATE' ? 'border-yellow-500 bg-yellow-500/15' : 'border-slate-800 bg-slate-800/40'}`}><RotateCw size={18} className="text-yellow-400" /></button>
                  <button onClick={() => setSelectedTool('ERASER')} className={`p-2.5 rounded-lg border-2 shrink-0 ${selectedTool === 'ERASER' ? 'border-red-500 bg-red-500/15' : 'border-slate-800 bg-slate-800/40'}`}><Trash2 size={18} className="text-red-500" /></button>
                  <div className="w-px h-6 bg-slate-700 self-center mx-1 shrink-0" />
                  {Object.entries(ObjectType).map(([k,v]) => (
                    <button key={v} onClick={() => setSelectedTool(v as ObjectType)} className={`p-2.5 rounded-lg border-2 shrink-0 ${selectedTool === v ? 'border-cyan-500 bg-cyan-500/15' : 'border-slate-800 bg-slate-800/40'}`}><div className="w-4 h-4">{OBJECT_CONFIG[v as ObjectType].icon}</div></button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                   <button onClick={() => setIsSidebarOpen(true)} className="flex-1 py-2.5 bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-700 flex items-center justify-center gap-1.5"><Sparkles size={12} className="text-cyan-400"/> IA</button>
                   <button onClick={() => setShowTutorial(true)} className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-cyan-400"><HelpCircle size={16}/></button>
                   <div className="flex gap-1.5">
                      <button onClick={selectAll} className="px-3 py-2.5 bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-700">{t.all}</button>
                      <button onClick={deselectAll} className="px-3 py-2.5 bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-700">{t.none}</button>
                   </div>
                   {selectedIds.length > 0 && (
                     <div className="flex gap-1.5">
                       <button onClick={duplicateSelected} className="p-2.5 bg-indigo-600 rounded-lg text-white"><Copy size={16}/></button>
                       <button onClick={() => handleRemoveMultiple(selectedIds)} className="p-2.5 bg-red-600 rounded-lg text-white"><Trash2 size={16}/></button>
                     </div>
                   )}
                </div>
              </div>
              <footer className="h-8 bg-slate-900 border-t border-slate-800 flex items-center px-4 justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
                <div className="flex gap-6">
                  <span>{t.objects}: <span className="text-cyan-400 font-mono">{objects.length}</span></span>
                  {selectedIds.length > 0 && <span>{t.selected}: <span className="text-indigo-400 font-mono">{selectedIds.length}</span></span>}
                </div>
                <span className="opacity-50">GeoMarker beta 3.0.13</span>
              </footer>
            </>
          )}
        </main>
      </div>

      {/* MODAL TUTORIAL */}
      {showTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowTutorial(false)} />
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <h2 className="text-xl font-black italic text-white uppercase tracking-wider">{t.tutorialTitle}</h2>
              <button onClick={() => setShowTutorial(false)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
              {t.tutorialSteps.map((step, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 group-hover:border-cyan-500/50 transition-all shrink-0 h-fit shadow-lg">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase text-sm mb-2 tracking-widest">{step.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex justify-end">
              <button onClick={() => setShowTutorial(false)} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-cyan-900/20">
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREDITOS */}
      {showCredits && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCredits(false)} />
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-12 text-center">
              <div className="bg-cyan-500/10 p-6 rounded-3xl inline-block mb-8 border border-cyan-500/20 shadow-inner">
                <Zap size={48} className="text-cyan-400 fill-current" />
              </div>
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-4">GEOMARKER STUDIO</h2>
              <p className="text-cyan-400 font-black text-xs uppercase tracking-[0.3em] mb-12 opacity-80">v3.0.13 Professional Edition</p>
              
              <div className="space-y-6 mb-12">
                <p className="text-slate-300 text-sm font-bold">{t.creditsText}</p>
                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                   <p className="text-slate-400 text-xs mb-4">{t.youtubeMessage}</p>
                   <a 
                    href={t.youtubeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                   >
                     <Youtube size={20} />
                     YouTube Channel
                   </a>
                </div>
              </div>

              <button onClick={() => setShowCredits(false)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase text-xs tracking-[0.2em] rounded-xl transition-all border border-slate-700">
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
