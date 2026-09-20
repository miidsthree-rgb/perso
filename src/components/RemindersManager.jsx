import React from 'react';
import { Bell, Clock, Calendar, CheckCircle2, AlertCircle, Trash2, Repeat } from 'lucide-react';
import { getRecurrenceLabel } from '../utils/recurrence';

export default function RemindersManager({ tasks, setTasks }) {
  // Tasks with reminders set
  const tasksWithReminders = tasks.filter((t) => t.reminderTime);

  const toggleReminder = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, reminderEnabled: !t.reminderEnabled } : t
      )
    );
  };

  const removeReminder = (id) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, reminderTime: null } : t))
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6 space-y-6 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-400" />
          Rappels & Notifications Programmés
        </h1>
        <p className="text-sm text-slate-400">
          Gérez vos rappels à heure fixe et recevez des notifications sonores et bureau sur Windows.
        </p>
      </div>

      <div className="space-y-3 max-w-3xl">
        {tasksWithReminders.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 space-y-3">
            <Bell className="w-10 h-10 mx-auto stroke-[1.5] text-slate-600" />
            <p className="text-sm">Aucun rappel programmé pour le moment.</p>
            <p className="text-xs text-slate-600">
              Ajoutez une heure de rappel lors de la création d'une tâche ou depuis le calendrier.
            </p>
          </div>
        ) : (
          tasksWithReminders.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between transition-all hover:border-slate-700"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-100 text-sm">{t.title}</h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1 text-indigo-400">
                      <Clock className="w-3.5 h-3.5" /> {t.reminderTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> {t.dueDate}
                    </span>
                    {t.recurrence && t.recurrence !== 'none' && (
                      <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border border-emerald-500/20 font-medium">
                        <Repeat className="w-2.5 h-2.5" /> {getRecurrenceLabel(t.recurrence)}
                      </span>
                    )}
                    <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded-full">
                      {t.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleReminder(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    t.reminderEnabled !== false
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {t.reminderEnabled !== false ? 'Actif' : 'Désactivé'}
                </button>

                <button
                  onClick={() => removeReminder(t.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                  title="Supprimer le rappel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
