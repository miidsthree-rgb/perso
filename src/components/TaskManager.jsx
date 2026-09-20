import React, { useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  LayoutList,
  Kanban,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Repeat,
  CheckSquare,
  X,
} from 'lucide-react';
import {
  getRecurrenceLabel,
  getNextOccurrence,
  RECURRENCE_OPTIONS,
  formatLocalDate,
} from '../utils/recurrence';

export default function TaskManager({
  tasks,
  setTasks,
  activeTaskId,
  setActiveTaskId,
  setActiveTab,
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', 'eisenhower'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Subtask creation state inside modal
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Perso',
    priority: 'Moyenne',
    estimatedMinutes: 30,
    dueDate: formatLocalDate(new Date()),
    reminderTime: '09:00',
    reminderEnabled: true,
    recurrence: 'none',
    subtasks: [],
  });

  // Categories available (removed Santé and Travail)
  const categories = ['Perso', 'Études', 'Projet'];
  const priorities = ['Haute', 'Moyenne', 'Basse'];

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setNewSubtaskInput('');
    setFormData({
      title: '',
      description: '',
      category: 'Perso',
      priority: 'Moyenne',
      estimatedMinutes: 30,
      dueDate: formatLocalDate(new Date()),
      reminderTime: '09:00',
      reminderEnabled: true,
      recurrence: 'none',
      subtasks: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setNewSubtaskInput('');
    setFormData({
      title: task.title,
      description: task.description || '',
      category: (task.category === 'Santé' || task.category === 'Travail') ? 'Perso' : task.category,
      priority: task.priority,
      estimatedMinutes: task.estimatedMinutes || 30,
      dueDate: task.dueDate || formatLocalDate(new Date()),
      reminderTime: task.reminderTime || '09:00',
      reminderEnabled: task.reminderEnabled ?? true,
      recurrence: task.recurrence || 'none',
      subtasks: task.subtasks ? [...task.subtasks] : [],
    });
    setIsModalOpen(true);
  };

  const handleAddSubtaskToForm = (e) => {
    e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    const newSub = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
      title: newSubtaskInput.trim(),
      completed: false,
    };
    setFormData({
      ...formData,
      subtasks: [...(formData.subtasks || []), newSub],
    });
    setNewSubtaskInput('');
  };

  const handleRemoveSubtaskFromForm = (subId) => {
    setFormData({
      ...formData,
      subtasks: (formData.subtasks || []).filter((s) => s.id !== subId),
    });
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask) {
      setTasks(
        tasks.map((t) => (t.id === editingTask.id ? { ...t, ...formData } : t))
      );
    } else {
      const newTask = {
        id: Date.now().toString(),
        ...formData,
        status: 'Todo',
        spentMinutes: 0,
        createdAt: new Date().toISOString(),
      };
      setTasks([newTask, ...tasks]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  // Toggle or advance status (supports recurrence auto-advance)
  const updateTaskStatus = (id, newStatus) => {
    setTasks(
      tasks.map((t) => {
        if (t.id !== id) return t;

        // If completing a recurring task, advance date and reset to Todo
        if (newStatus === 'Completed' && t.recurrence && t.recurrence !== 'none') {
          const nextDate = getNextOccurrence(
            t.dueDate || formatLocalDate(new Date()),
            t.recurrence
          );
          return {
            ...t,
            dueDate: nextDate,
            status: 'Todo',
            spentMinutes: 0,
            subtasks: (t.subtasks || []).map((s) => ({ ...s, completed: false })),
          };
        }

        return { ...t, status: newStatus };
      })
    );
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(
      tasks.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSubs = (task.subtasks || []).map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...task, subtasks: updatedSubs };
      })
    );
  };

  const handleClearCompleted = () => {
    if (confirm('Supprimer toutes les tâches terminées ?')) {
      setTasks(tasks.filter((t) => t.status !== 'Completed'));
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'todo' && t.status === 'Todo') ||
      (statusFilter === 'inprogress' && t.status === 'In Progress') ||
      (statusFilter === 'completed' && t.status === 'Completed');
    const matchesCategory =
      categoryFilter === 'all' || t.category === categoryFilter;
    const matchesPriority =
      priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden p-3 md:p-6 space-y-3 md:space-y-5">
      {/* Header & View Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            Gestionnaire de Tâches
          </h1>
          <p className="text-xs text-slate-400">
            Organisez vos tâches, routines et sous-objectifs.
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 self-start sm:self-auto">
          {/* View selector buttons */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Liste</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Tableau</span>
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Tâche</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-2.5 md:p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="todo">À faire</option>
          <option value="inprogress">En cours</option>
          <option value="completed">Terminé</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="all">Toutes les priorités</option>
          {priorities.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {completedCount > 0 && (
          <button
            onClick={handleClearCompleted}
            className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-800 transition-all"
            title="Supprimer les tâches terminées"
          >
            Purger terminées ({completedCount})
          </button>
        )}

        <button
          onClick={() => {
            if (confirm('Supprimer toutes les tâches ajoutées et ne garder que la démo ?')) {
              setTasks(tasks.filter((t) => ['1', '2', '3'].includes(t.id)));
            }
          }}
          className="text-xs text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20 transition-all flex items-center gap-1.5"
          title="Supprimer uniquement les tâches que vous avez créées"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Supprimer tâches ajoutées</span>
        </button>

        <button
          onClick={() => {
            if (confirm('Voulez-vous effacer TOUTES les tâches pour avoir une liste totalement vierge ?')) {
              setTasks([]);
            }
          }}
          className="text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 transition-all flex items-center gap-1.5"
          title="Vider complètement toutes les tâches"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Tout vider</span>
        </button>
      </div>

      {/* Dynamic View rendering */}
      <div className="flex-1 overflow-y-auto pr-1">
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center text-slate-500 py-12 text-sm">
                Aucune tâche trouvée.
              </div>
            ) : (
              filteredTasks.map((t) => {
                const subtasks = t.subtasks || [];
                const completedSubs = subtasks.filter((s) => s.completed).length;

                return (
                  <div
                    key={t.id}
                    className={`bg-slate-900/80 p-4 rounded-2xl border flex flex-col space-y-3 transition-all ${
                      activeTaskId === t.id
                        ? 'border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <button
                          onClick={() =>
                            updateTaskStatus(
                              t.id,
                              t.status === 'Completed' ? 'Todo' : 'Completed'
                            )
                          }
                          className="text-slate-400 hover:text-indigo-400 mt-0.5"
                        >
                          {t.status === 'Completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`font-semibold text-sm ${
                                t.status === 'Completed'
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-100'
                              }`}
                            >
                              {t.title}
                            </h3>

                            {t.recurrence && t.recurrence !== 'none' && (
                              <span className="bg-indigo-950/70 border border-indigo-800/50 text-indigo-300 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-medium">
                                <Repeat className="w-2.5 h-2.5" />
                                {getRecurrenceLabel(t.recurrence)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1 flex-wrap gap-y-1">
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                              {t.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] ${
                                t.priority === 'Haute'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : t.priority === 'Moyenne'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {t.priority}
                            </span>
                            {t.dueDate && (
                              <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                {t.dueDate}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">
                              ⏱️ {t.spentMinutes || 0}m / {t.estimatedMinutes}m
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => {
                            setActiveTaskId(t.id);
                            setActiveTab('pomodoro');
                          }}
                          className="px-2.5 sm:px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center space-x-1 transition-all"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Concentration</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subtasks checklist */}
                    {subtasks.length > 0 && (
                      <div className="pl-8 pt-1 border-t border-slate-800/60 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-0.5">
                          <span>Sous-tâches</span>
                          <span className="font-mono text-[10px] text-indigo-400">
                            {completedSubs}/{subtasks.length} faites
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                          {subtasks.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleToggleSubtask(t.id, sub.id)}
                              className={`flex items-center space-x-2 text-left p-1.5 rounded-lg text-xs transition-colors ${
                                sub.completed
                                  ? 'text-slate-500 bg-slate-950/40 line-through'
                                  : 'text-slate-300 bg-slate-950/70 hover:bg-slate-950 border border-slate-800/50'
                              }`}
                            >
                              <CheckCircle2
                                className={`w-3.5 h-3.5 flex-shrink-0 ${
                                  sub.completed ? 'text-emerald-400' : 'text-slate-600'
                                }`}
                              />
                              <span className="truncate">{sub.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {[
              { id: 'Todo', title: '📋 À faire', color: 'border-slate-800' },
              { id: 'In Progress', title: '⚡ En cours', color: 'border-indigo-500/40' },
              { id: 'Completed', title: '✅ Terminé', color: 'border-emerald-500/40' },
            ].map((column) => {
              const colTasks = filteredTasks.filter((t) => t.status === column.id);

              return (
                <div
                  key={column.id}
                  className={`bg-slate-900/60 border ${column.color} rounded-2xl p-4 flex flex-col space-y-3`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-bold text-xs text-slate-200">{column.title}</h3>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-xs text-slate-100">{t.title}</h4>
                          {t.recurrence && t.recurrence !== 'none' && (
                            <Repeat className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span className="bg-slate-900 px-2 py-0.5 rounded">{t.category}</span>
                          <button
                            onClick={() => {
                              const nextStatus =
                                t.status === 'Todo'
                                  ? 'In Progress'
                                  : t.status === 'In Progress'
                                  ? 'Completed'
                                  : 'Todo';
                              updateTaskStatus(t.id, nextStatus);
                            }}
                            className="text-indigo-400 hover:underline"
                          >
                            Avancer ➔
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {editingTask ? 'Modifier la Tâche' : 'Créer une Tâche'}
            </h2>

            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Titre de la tâche</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rédiger le rapport..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Priorité</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Date d'échéance</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1">
                    <Repeat className="w-3 h-3 text-indigo-400" />
                    Répéter sur le calendrier
                  </label>
                  <select
                    value={formData.recurrence || 'none'}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Estimation (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    step="5"
                    value={formData.estimatedMinutes}
                    onChange={(e) => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Heure de rappel (optionnel)</label>
                  <input
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Subtasks builder */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-slate-400 font-medium flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  Sous-étapes / Checklist
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ajouter une sous-étape..."
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtaskToForm(e);
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtaskToForm}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium text-xs"
                  >
                    Ajouter
                  </button>
                </div>

                {formData.subtasks && formData.subtasks.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                    {formData.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800/80 text-xs"
                      >
                        <span className="text-slate-300">{sub.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtaskFromForm(sub.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-md transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
