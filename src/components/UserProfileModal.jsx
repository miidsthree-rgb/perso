import React from 'react';
import { User, Mail, Calendar, LogOut, ShieldCheck, X } from 'lucide-react';
import { logoutUser } from '../utils/storage';

export default function UserProfileModal({ user, onClose, onLogout }) {
  const handleLogout = () => {
    logoutUser();
    onLogout();
    onClose();
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      })
    : 'Récemment';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-600/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{user?.name || 'Utilisateur'}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> {user?.email}
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" /> Membre depuis
            </span>
            <span className="text-slate-200 font-semibold capitalize">{memberSince}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Statut du compte
            </span>
            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Vérifié Local
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-xl transition-all flex items-center justify-center space-x-2 text-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
