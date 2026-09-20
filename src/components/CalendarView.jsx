import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  Flame,
  Tag,
  Repeat,
  Copy,
} from 'lucide-react';
import {
  isTaskOnDate,
  getNextOccurrence,
  getRecurrenceLabel,
  RECURRENCE_OPTIONS,
  formatLocalDate,
} from '../utils/recurrence';

export default function CalendarView({ tasks, setTasks, setActiveTaskId, setActiveTab }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => formatLocalDate(new Date()));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Perso');
  const [newTaskPriority, setNewTaskPriority] = useState('Moyenne');
  const [newTaskTime, setNewTaskTime] = useState('09:00');
  const [newTaskRecurrence, setNewTaskRecurrence] = useState('none');

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatLocalDate(today));
  };

  // Generate calendar grid
  const firstDayOfMonth = new Date(year, month, 1);
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek < 0) startingDayOfWeek = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dateObj = new Date(year, month - 1, prevMonthDays - i);
    daysArray.push({
      dateStr: formatLocalDate(dateObj),
      dayNumber: prevMonthDays - i,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    daysArray.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
    });
  }

  // Next month padding to reach 35 or 42 cells
  const totalCellsNeeded = daysArray.length <= 35 ? 35 : 42;
  while (daysArray.length < totalCellsNeeded) {
    const nextDayNum = daysArray.length - startingDayOfWeek - daysInMonth + 1;
    const dateObj = new Date(year, month + 1, nextDayNum);
    daysArray.push({
      dateStr: formatLocalDate(dateObj),
      dayNumber: nextDayNum,
      isCurrentMonth: false,
    });
  }

  const todayStr = formatLocalDate(new Date());

  // Tasks active for the selected date (including recurrence matching)
  const tasksForSelectedDate = tasks.filter((t) => isTaskOnDate(t, selectedDateStr));

  const handleAddTaskForDate = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: '',
      category: newTaskCategory,
      priority: newTaskPriority,
      status: 'Todo',
      estimatedMinutes: 30,
      spentMinutes: 0,
      dueDate: selectedDateStr,
      reminderTime: newTaskTime,
      reminderEnabled: true,
      recurrence: newTaskRecurrence,
      subtasks: [],
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskRecurrence('none');
    setIsAddModalOpen(false);
  };

  // Toggle completion or advance recurrence
  const handleToggleTask = (task) => {
    if (task.recurrence && task.recurrence !== 'none') {
      const nextDate = getNextOccurrence(selectedDateStr, task.recurrence);
      setTasks(
        tasks.map((t) =>
          t.id === task.id
            ? { ...t, dueDate: nextDate, status: 'Todo' }
            : t
        )
      );
    } else {
      setTasks(
        tasks.map((t) =>
          t.id === task.id
            ? { ...t, status: t.status === 'Completed' ? 'Todo' : 'Completed' }
            : t
        )
      );
    }
  };

  // Duplicate / Repeat all tasks from selected day to next day or next week
  const handleRepeatDayTasks = (target = 'tomorrow') => {
    if (tasksForSelectedDate.length === 0) return;
    const baseDate = new Date(selectedDateStr + 'T00:00:00');
    if (target === 'tomorrow') {
      baseDate.setDate(baseDate.getDate() + 1);
    } else if (target === 'nextWeek') {
      baseDate.setDate(baseDate.getDate() + 7);
    }
    const targetDateStr = formatLocalDate(baseDate);

    const duplicatedTasks = tasksForSelectedDate.map((t) => ({
      ...t,
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5),
      dueDate: targetDateStr,
      status: 'Todo',
      spentMinutes: 0,
      createdAt: new Date().toISOString(),
    }));

    setTasks([...duplicatedTasks, ...tasks]);
    setSelectedDateStr(targetDateStr);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-slate-950 overflow-y-auto md:overflow-hidden p-3 md:p-6 gap-4 md:gap-6">
      {/* Calendar Main Grid Section */}
      <div className="flex-1 flex flex-col space-y-3 md:space-y-4 min-h-[380px] md:min-h-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
              Calendrier & Planning
            </h1>
            <p className="text-xs text-slate-400">
              Visualisez vos échéances et événements répétés.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={handleToday}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Aujourd'hui
            </button>

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 md:p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 md:px-3 text-xs font-bold text-slate-200 min-w-[95px] md:min-w-[110px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-[10px] md:text-xs font-semibold text-slate-400 pb-1">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
          <span>Dim</span>
        </div>

        {/* Calendar Grid */}
        <div
          className="flex-1 grid grid-cols-7 gap-1 md:gap-2 overflow-y-auto pr-0.5 md:pr-1"
          style={{ gridTemplateRows: `repeat(${totalCellsNeeded / 7}, minmax(0, 1fr))` }}
        >
          {daysArray.map((dayItem, idx) => {
            const isToday = dayItem.dateStr === todayStr;
            const isSelected = dayItem.dateStr === selectedDateStr;
            const dayTasks = tasks.filter((t) => isTaskOnDate(t, dayItem.dateStr));

            return (
              <div
                key={idx}
                onClick={() => setSelectedDateStr(dayItem.dateStr)}
                className={`p-1.5 md:p-2 rounded-xl md:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[50px] md:min-h-[75px] ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                    : isToday
                    ? 'border-rose-500/60 bg-rose-500/5'
                    : dayItem.isCurrentMonth
                    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900/40 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]'
                        : isSelected
                        ? 'text-indigo-400'
                        : dayItem.isCurrentMonth
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {dayItem.dayNumber}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Mobile: dot indicators */}
                <div className="flex items-center justify-center gap-1 md:hidden py-1">
                  {dayTasks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        t.priority === 'Haute' ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[8px] text-slate-500 font-bold leading-none">+</span>
                  )}
                </div>

                {/* Desktop: Task preview badges */}
                <div className="hidden md:block space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      className={`text-[9px] truncate px-1.5 py-0.5 rounded font-medium border flex items-center gap-0.5 ${
                        t.priority === 'Haute'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {t.recurrence && t.recurrence !== 'none' && (
                        <Repeat className="w-2.5 h-2.5 text-indigo-300 flex-shrink-0" />
                      )}
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <p className="text-[9px] text-slate-500 pl-1">+{dayTasks.length - 2} autres</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Details Panel for Selected Date */}
      <div className="w-full md:w-80 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-200">
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h2>
              <p className="text-xs text-slate-400">{tasksForSelectedDate.length} tâche(s) active(s)</p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-colors"
              title="Ajouter à cette date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Task list for selected day */}
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {tasksForSelectedDate.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-10 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto stroke-[1.5] text-slate-600" />
                <p>Aucune tâche planifiée pour ce jour.</p>
              </div>
            ) : (
              tasksForSelectedDate.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => handleToggleTask(t)}
                        className="text-slate-400 hover:text-indigo-400"
                      >
                        {t.status === 'Completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <h3
                        className={`font-semibold flex-1 ${
                          t.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {t.title}
                      </h3>
                    </div>
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                      {t.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      {t.reminderTime && (
                        <span className="flex items-center gap-1 text-indigo-400">
                          <Clock className="w-3 h-3" /> {t.reminderTime}
                        </span>
                      )}
                      {t.recurrence && t.recurrence !== 'none' && (
                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                          <Repeat className="w-2.5 h-2.5" />
                          {getRecurrenceLabel(t.recurrence)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setActiveTaskId(t.id);
                        setActiveTab('pomodoro');
                      }}
                      className="text-xs text-indigo-400 hover:underline font-medium"
                    >
                      Concentration ➔
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Day Repeat tool */}
        {tasksForSelectedDate.length > 0 && (
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-indigo-400" />
              <span>Répéter les tâches de ce jour :</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRepeatDayTasks('tomorrow')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                title="Dupliquer les tâches de ce jour pour demain"
              >
                <Copy className="w-3 h-3 text-indigo-400" />
                <span>Pour Demain</span>
              </button>
              <button
                onClick={() => handleRepeatDayTasks('nextWeek')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                title="Dupliquer les tâches de ce jour pour la semaine prochaine"
              >
                <Repeat className="w-3 h-3 text-emerald-400" />
                <span>+1 Semaine</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal for Specific Date */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              Ajouter une Tâche le {selectedDateStr}
            </h2>

            <form onSubmit={handleAddTaskForDate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Titre de la tâche / rappel</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Réunion d'équipe, Révisions..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Catégorie</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Perso">Perso</option>
                    <option value="Études">Études</option>
                    <option value="Projet">Projet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Priorité</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Haute">Haute</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Basse">Basse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Heure du Rappel</label>
                  <input
                    type="time"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                  </input>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1">
                    <Repeat className="w-3 h-3 text-indigo-400" />
                    Répéter sur le calendrier
                  </label>
                  <select
                    value={newTaskRecurrence}
                    onChange={(e) => setNewTaskRecurrence(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {RECURRENCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-md transition-colors"
                >
                  Créer la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
