import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, Sparkles, Maximize2, Radio } from 'lucide-react';
import { playChimeSound, startAmbientSound, stopAmbientSound } from '../utils/audio';

export default function PomodoroTimer({
  sessionType,
  setSessionType,
  timeLeft,
  setTimeLeft,
  isRunning,
  setIsRunning,
  settings,
  setSettings,
  activeTask,
  tasks,
  setTasks,
  sessions,
  setSessions,
  onOpenZen,
}) {
  const getSessionDuration = (type) => {
    switch (type) {
      case 'focus':
        return (settings.focusDuration || 25) * 60;
      case 'shortBreak':
        return (settings.shortBreakDuration || 5) * 60;
      case 'longBreak':
        return (settings.longBreakDuration || 15) * 60;
      default:
        return 25 * 60;
    }
  };

  const totalTime = getSessionDuration(sessionType);
  const progressPercent = Math.max(0, Math.min(100, ((totalTime - timeLeft) / totalTime) * 100));

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (isRunning && settings.ambientSound && settings.ambientSound !== 'none') {
      startAmbientSound(settings.ambientSound, settings.soundVolume || 0.5);
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [isRunning, settings.ambientSound]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    stopAmbientSound();
    playChimeSound(settings.chimePreset || 'bell', settings.soundVolume || 0.7);

    if (window.electronAPI) {
      window.electronAPI.showNotification(
        sessionType === 'focus' ? 'Session de Concentration Terminée ! 🎯' : 'Pause Terminée ! ☕',
        'Félicitations pour votre concentration.'
      );
    }

    const durationMins = Math.round(totalTime / 60);
    const newSession = {
      id: Date.now().toString(),
      taskId: activeTask ? activeTask.id : null,
      type: sessionType,
      durationMinutes: durationMins,
      completedAt: new Date().toISOString(),
    };
    setSessions([newSession, ...sessions]);

    if (sessionType === 'focus' && activeTask) {
      setTasks(
        tasks.map((t) =>
          t.id === activeTask.id
            ? { ...t, spentMinutes: (t.spentMinutes || 0) + durationMins }
            : t
        )
      );
    }

    if (sessionType === 'focus') {
      setSessionType('shortBreak');
      setTimeLeft(getSessionDuration('shortBreak'));
    } else {
      setSessionType('focus');
      setTimeLeft(getSessionDuration('focus'));
    }
  };

  const handleSwitchMode = (type) => {
    setIsRunning(false);
    setSessionType(type);
    setTimeLeft(getSessionDuration(type));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 bg-slate-950 select-none space-y-4 md:space-y-6 relative overflow-y-auto">
      {/* Zen Mode Button */}
      <button
        onClick={onOpenZen}
        className="absolute top-3 right-3 md:top-6 md:right-6 flex items-center space-x-1.5 md:space-x-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl border border-slate-800 shadow-lg text-[11px] md:text-xs font-semibold transition-all backdrop-blur"
      >
        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" />
        <span className="hidden xs:inline">Mode Zen</span>
      </button>

      {/* Mode selectors */}
      <div className="flex bg-slate-900/80 p-1 md:p-1.5 rounded-2xl border border-slate-800 shadow-xl max-w-full overflow-x-auto">
        <button
          onClick={() => handleSwitchMode('focus')}
          className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-medium text-[11px] sm:text-xs transition-all whitespace-nowrap ${
            sessionType === 'focus' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'
          }`}
        >
          🎯 Focus (25m)
        </button>
        <button
          onClick={() => handleSwitchMode('shortBreak')}
          className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-medium text-[11px] sm:text-xs transition-all whitespace-nowrap ${
            sessionType === 'shortBreak' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'
          }`}
        >
          ☕ Pause (5m)
        </button>
        <button
          onClick={() => handleSwitchMode('longBreak')}
          className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-medium text-[11px] sm:text-xs transition-all whitespace-nowrap ${
            sessionType === 'longBreak' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'
          }`}
        >
          🌿 Longue (15m)
        </button>
      </div>

      {/* Active Task Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl px-4 md:px-5 py-2 flex items-center justify-between text-xs max-w-md w-full">
        <span className="text-slate-400">Tâche active :</span>
        <span className="text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-none">
          {activeTask ? activeTask.title : 'Aucune tâche liée'}
        </span>
      </div>

      {/* Ring display */}
      <div className="relative w-60 h-60 sm:w-72 sm:h-72 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="50%" cy="50%" r="42%" className="stroke-slate-900 fill-none" strokeWidth="12" />
          <circle
            cx="50%"
            cy="50%"
            r="42%"
            className="stroke-indigo-500 fill-none transition-all duration-1000"
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progressPercent / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center space-y-1">
          <span className="text-5xl sm:text-6xl font-black tracking-tight font-mono text-slate-100">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-indigo-400 font-semibold">
            {sessionType === 'focus' ? 'Session de Concentration' : 'Pause'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setTimeLeft(getSessionDuration(sessionType))}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-2xl"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center space-x-2 shadow-xl transition-all ${
            isRunning
              ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
              : 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          <span>{isRunning ? 'Pause' : 'Démarrer'}</span>
        </button>

        <button
          onClick={handleSessionComplete}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-2xl"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Ambient Sounds Toolbar */}
      <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-2xl text-xs">
        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
          <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Ambiance :
        </span>
        {[
          { id: 'none', label: 'Silencieux' },
          { id: 'rain', label: '🌧️ Pluie' },
          { id: 'fire', label: '🔥 Feu' },
          { id: 'binaural', label: '🧘 432 Hz' },
          { id: 'whitenoise', label: '📻 Bruit blanc' },
        ].map((snd) => (
          <button
            key={snd.id}
            onClick={() => {
              const nextSound = settings.ambientSound === snd.id ? 'none' : snd.id;
              if (setSettings) setSettings({ ...settings, ambientSound: nextSound });
              if (isRunning) {
                if (nextSound === 'none') stopAmbientSound();
                else startAmbientSound(nextSound, settings.soundVolume || 0.5);
              }
            }}
            className={`px-2.5 py-1 rounded-xl transition-all text-xs font-medium ${
              settings.ambientSound === snd.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {snd.label}
          </button>
        ))}
      </div>
    </div>
  );
}
