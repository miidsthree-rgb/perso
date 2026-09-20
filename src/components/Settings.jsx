import React, { useState } from 'react';
import { Settings, Volume2, Bell, Download, Upload, Trash2, Check, ShieldCheck } from 'lucide-react';

export default function SettingsView({
  settings,
  setSettings,
  tasks,
  setTasks,
  sessions,
  setSessions,
}) {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdate = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleExportJSON = async () => {
    const exportObject = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      tasks,
      sessions,
    };
    const jsonStr = JSON.stringify(exportObject, null, 2);

    if (window.electronAPI) {
      const res = await window.electronAPI.exportData(jsonStr, `focuspulse-backup-${Date.now()}.json`);
      if (res.success) {
        alert(`Sauvegarde exportée avec succès dans : ${res.path}`);
      }
    } else {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `focuspulse-backup-${Date.now()}.json`;
      a.click();
    }
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.sessions) setSessions(parsed.sessions);
        alert('Données réimportées avec succès !');
      } catch (err) {
        alert('Fichier de sauvegarde invalide.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('Voulez-vous vraiment réinitialiser toutes vos tâches et statistiques ?')) {
      setTasks([]);
      setSessions([]);
      alert('Toutes les données ont été réinitialisées.');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-100">Réglages & Options</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Personnalisez la durée de vos sessions, vos alertes et vos données.
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Pomodoro Timers */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            Durée des Sessions (en minutes)
          </h2>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Concentration</label>
              <input
                type="number"
                min="1"
                max="120"
                value={settings.focusDuration || 25}
                onChange={(e) => handleUpdate('focusDuration', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Pause Courte</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.shortBreakDuration || 5}
                onChange={(e) => handleUpdate('shortBreakDuration', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Pause Longue</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration || 15}
                onChange={(e) => handleUpdate('longBreakDuration', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Audio & Ambience */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            Sons & Ambiances de Concentration
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Ambiance de fond</label>
              <select
                value={settings.ambientSound || 'none'}
                onChange={(e) => handleUpdate('ambientSound', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-indigo-500"
              >
                <option value="none">Aucun son d'ambiance</option>
                <option value="rain">🌧️ Pluie apaisante</option>
                <option value="whitenoise">📻 Bruit blanc</option>
                <option value="waves">🌊 Vagues / Bruit doux</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Volume des alertes sonores ({(settings.soundVolume * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume || 0.7}
                onChange={(e) => handleUpdate('soundVolume', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Export / Backup Data */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Gestion des Données (Sauvegarde Locale)
          </h2>

          <div className="flex flex-wrap gap-3 text-xs">
            <button
              onClick={handleExportJSON}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Exporter mes données (JSON)</span>
            </button>

            <label className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-medium cursor-pointer border border-slate-700">
              <Upload className="w-4 h-4" />
              <span>Importer un fichier JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              onClick={handleClearData}
              className="flex items-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-4 py-2.5 rounded-xl font-medium ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
