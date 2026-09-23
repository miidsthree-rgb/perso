import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  LogOut,
  X,
  Cloud,
  RefreshCw,
  Smartphone,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { logoutUser } from '../utils/storage';
import { signOutWithSupabase } from '../utils/supabase';

export default function UserProfileModal({ user, onClose, onLogout, onManualSync }) {
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const handleLogout = async () => {
    try {
      await signOutWithSupabase();
    } catch (e) {
      console.error(e);
    }
    logoutUser();
    onLogout();
    onClose();
  };

  const handleSyncNow = async () => {
    if (!onManualSync) return;
    setSyncing(true);
    setSyncDone(false);
    try {
      await onManualSync();
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 2000);
    } finally {
      setSyncing(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      })
    : 'Récemment';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Avatar & Identity */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-600/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-100 truncate">
              {user?.name || 'Utilisateur'}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
              <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Account Details Box */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" /> Membre depuis
            </span>
            <span className="text-slate-200 font-semibold capitalize">{memberSince}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-indigo-400" /> Compte Cloud
            </span>
            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connecté &amp; En ligne
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-rose-400" /> Appareils synchronisés
            </span>
            <span className="text-slate-300 font-medium">PC &amp; Téléphone</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {onManualSync && (
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-xs"
            >
              {syncDone ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Synchronisé avec succès !</span>
                </>
              ) : (
                <>
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Synchronisation...' : 'Synchroniser les tâches maintenant'}</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-xl transition-all flex items-center justify-center space-x-2 text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
