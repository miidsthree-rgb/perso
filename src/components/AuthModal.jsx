import React, { useState } from 'react';
import {
  Flame,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Smartphone,
  Laptop,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { signUpWithSupabase, signInWithSupabase } from '../utils/supabase';
import { saveUserAccount } from '../utils/storage';

export default function AuthModal({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: '' };
    if (pass.length < 6) return { label: 'Court (min 6 car.)', color: 'bg-rose-500' };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      return { label: 'Très Fort 🔒', color: 'bg-emerald-500' };
    }
    return { label: 'Moyen', color: 'bg-amber-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Veuillez entrer une adresse email valide.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMessage('Veuillez entrer votre nom complet.');
          setLoading(false);
          return;
        }

        const res = await signUpWithSupabase(email, password, fullName);

        if (res?.user && !res?.session) {
          setInfoMessage(
            'Votre compte a été créé ! Si la confirmation d\'email est requise sur Supabase, vérifiez votre boîte de réception ou connectez-vous directement.'
          );
          setLoading(false);
          return;
        }

        if (res?.user) {
          const newUser = {
            id: res.user.id,
            name: fullName.trim(),
            email: res.user.email,
            isCloud: true,
            createdAt: res.user.created_at || new Date().toISOString(),
          };
          saveUserAccount(newUser);
          onLoginSuccess(newUser);
        }
      } else {
        // Sign In
        const res = await signInWithSupabase(email, password);
        if (res?.user) {
          const loggedInUser = {
            id: res.user.id,
            name: res.user.user_metadata?.full_name || email.split('@')[0],
            email: res.user.email,
            isCloud: true,
            createdAt: res.user.created_at || new Date().toISOString(),
          };
          saveUserAccount(loggedInUser);
          onLoginSuccess(loggedInUser);
        }
      }
    } catch (err) {
      console.error('Erreur authentification:', err);
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setErrorMessage('Adresse email ou mot de passe incorrect.');
      } else if (msg.includes('User already registered')) {
        setErrorMessage('Un compte existe déjà avec cette adresse email. Veuillez vous connecter.');
      } else if (msg.includes('Password should be at least')) {
        setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
      } else if (msg.includes('Email not confirmed')) {
        setErrorMessage(
          'Veuillez confirmer votre email avant de vous connecter (ou décochez "Confirm email" dans Supabase > Authentication > Providers > Email).'
        );
      } else {
        setErrorMessage(msg || 'Une erreur est survenue lors de la connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative z-10 space-y-5 my-auto">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
            <Flame className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Focus<span className="text-indigo-400">Pulse</span>
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'signup'
              ? 'Créez votre compte pour synchroniser vos tâches partout.'
              : 'Connectez-vous pour retrouver vos tâches sur votre PC et votre Téléphone.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setInfoMessage('');
            }}
            className={`flex-1 py-2.5 font-semibold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
              setInfoMessage('');
            }}
            className={`flex-1 py-2.5 font-semibold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Info Alert */}
        {infoMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Nom complet
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Alex Dupont"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-9 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength */}
            {mode === 'signup' && password && (
              <div className="flex items-center space-x-2 pt-1.5">
                <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: password.length >= 8 ? '100%' : '50%' }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Sync indicator */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-indigo-400" />
              <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
              <Smartphone className="w-3.5 h-3.5 text-rose-400" />
              Synchronisation PC &amp; Téléphone
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Automatique
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 text-sm pt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
