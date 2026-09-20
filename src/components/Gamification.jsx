import React from 'react';
import { Award, Flame, Zap, ShieldCheck, Trophy, Star, Target } from 'lucide-react';

export default function Gamification({ tasks, sessions }) {
  const focusSessionsCount = sessions.filter((s) => s.type === 'focus').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;

  // XP Calculation: 100 XP per Focus Session, 150 XP per Completed Task
  const totalXP = focusSessionsCount * 100 + completedTasksCount * 150;
  const level = Math.floor(totalXP / 500) + 1;
  const currentLevelXP = totalXP % 500;
  const xpProgressPercent = (currentLevelXP / 500) * 100;

  // Badges Definitions
  const BADGES = [
    {
      id: 'b1',
      title: 'Premier Pas 🚀',
      description: 'Terminer votre première session Pomodoro.',
      unlocked: focusSessionsCount >= 1,
    },
    {
      id: 'b2',
      title: 'Maître de la Concentration 🎯',
      description: 'Réaliser 5 sessions de concentration.',
      unlocked: focusSessionsCount >= 5,
    },
    {
      id: 'b3',
      title: 'Exécuteur de Tâches ⚡',
      description: 'Avoir complété au moins 3 tâches.',
      unlocked: completedTasksCount >= 3,
    },
    {
      id: 'b4',
      title: 'Légende de la Productivité 👑',
      description: 'Atteindre le Niveau 5 (2000+ XP).',
      unlocked: level >= 5,
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Trophy className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Niveau {level} - Producteur Élite</h2>
            <p className="text-xs text-slate-400">{totalXP} XP cumulés</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-xs bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-xl border border-rose-500/20 font-bold">
          <Flame className="w-4 h-4 fill-rose-500" />
          <span>Série : 3 jours 🔥</span>
        </div>
      </div>

      {/* XP Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Progression Niveau {level + 1}</span>
          <span>{currentLevelXP} / 500 XP</span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${xpProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        {BADGES.map((b) => (
          <div
            key={b.id}
            className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
              b.unlocked
                ? 'bg-slate-950/80 border-indigo-500/40 text-slate-200 shadow-md shadow-indigo-500/5'
                : 'bg-slate-950/30 border-slate-800/40 text-slate-600 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{b.title}</span>
              {b.unlocked ? (
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              )}
            </div>
            <p className="text-[10px] text-slate-400">{b.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
