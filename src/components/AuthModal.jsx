import React, { useState } from 'react';
import { Flame, Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { saveUserAccount, loadUserAccount } from '../utils/storage';

export default function AuthModal({ onLoginSuccess }) {
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: '' };
    if (pass.length < 6) return { label: 'Court', color: 'bg-rose-500' };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      return { label: 'Très Fort 🔒', color: 'bg-emerald-500' };
    }
    return { label: 'Moyen', color: 'bg-amber-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Veuillez entrer une adresse email valide.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Le mot de passe doit contenir au moins 4 caractères.');
      return;
    }

    const existingUser = loadUserAccount();

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Veuillez entrer votre nom complet.');
        return;
      }

      const newUser = {
        name: fullName,
        email: email.toLowerCase().trim(),
        password: password, // Store password
        createdAt: new Date().toISOString(),
      };

      saveUserAccount(newUser);
      onLoginSuccess(newUser);
    } else {
      // Login mode
      if (
        existingUser &&
        existingUser.email === email.toLowerCase().trim() &&
        existingUser.password === password
      ) {
        saveUserAccount(existingUser);
        onLoginSuccess(existingUser);
      } else if (existingUser) {
        setErrorMessage('Adresse email ou mot de passe incorrect.');
      } else {
        // First time user trying to log in without existing account
        const autoUser = {
          name: email.split('@')[0],
          email: email.toLowerCase().trim(),
          password: password,
          createdAt: new Date().toISOString(),
        };
        saveUserAccount(autoUser);
        onLoginSuccess(autoUser);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
            <Flame className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Bienvenue sur <span className="text-indigo-400">FocusPulse</span>
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'signup'
              ? 'Créez votre compte pour synchroniser votre productivité.'
              : 'Connectez-vous pour retrouver votre espace.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 font-semibold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Créer un compte
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 font-semibold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Se connecter
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl">
            {errorMessage}
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

            {/* Password strength bar */}
            {mode === 'signup' && password && (
              <div className="flex items-center space-x-2 pt-1.5">
                <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: password.length > 8 ? '100%' : '50%' }} />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{strength.label}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-indigo-500 rounded"
              />
              <span>Se souvenir de moi</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 text-sm pt-2"
          >
            <span>{mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
