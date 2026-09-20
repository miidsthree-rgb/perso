import React, { useState, useEffect } from 'react';
import { Minimize2, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Flame, CheckCircle } from 'lucide-react';
import { startAmbientSound, stopAmbientSound } from '../utils/audio';

const MOTIVATIONAL_QUOTES = [
  "La concentration est la clé de toute réalisation exceptionnelle.",
  "Chaque minute d'attention est un investissement dans votre avenir.",
  "Faites une chose à la fois, et faites-la d'un cœur entier.",
  "Le succès est la somme de petits efforts répétés jour après jour.",
  "Respirer profondément, éliminer le superflu et créer avec passion.",
];

export default function ZenMode({
  timeLeft,
  setTimeLeft,
  isRunning,
  setIsRunning,
  sessionType,
  activeTask,
  settings,
  onExitZen,
}) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-12 select-none overflow-hidden animate-fade-in">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Top Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-wider text-slate-300">MODE ZEN CONCENTRATION PROFONDE</span>
        </div>

        <button
          onClick={onExitZen}
          className="flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl border border-slate-800 backdrop-blur transition-all"
        >
          <Minimize2 className="w-4 h-4" />
          <span className="text-xs font-semibold">Quitter le Mode Zen</span>
        </button>
      </div>

      {/* Center Focus Display */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 z-10">
        {activeTask && (
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-2xl">
            <Flame className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">{activeTask.title}</span>
          </div>
        )}

        <h1 className="text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-400 drop-shadow-2xl">
          {formatTime(timeLeft)}
        </h1>

        <p className="text-sm text-slate-400 italic max-w-lg transition-opacity duration-1000">
          "{MOTIVATIONAL_QUOTES[quoteIndex]}"
        </p>

        {/* Controls */}
        <div className="flex items-center space-x-6 pt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-10 py-5 rounded-2xl font-bold text-lg flex items-center space-x-3 shadow-2xl transition-all transform active:scale-95 ${
              isRunning
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-indigo-600 text-white shadow-indigo-600/40'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" />
                <span>Concentration</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom info */}
      <div className="flex justify-between items-center text-xs text-slate-500 z-10">
        <span>Session actuelle : {sessionType === 'focus' ? 'Concentration' : 'Pause'}</span>
        <span>Appuyez sur 'Quitter le Mode Zen' pour revenir à l'interface principale</span>
      </div>
    </div>
  );
}
