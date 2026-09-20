import { formatLocalDate } from './recurrence';

const STORAGE_KEYS = {
  TASKS: 'focuspulse_tasks',
  SETTINGS: 'focuspulse_settings',
  SESSIONS: 'focuspulse_sessions',
  USER_ACCOUNT: 'focuspulse_user_account',
  ACTIVE_SESSION: 'focuspulse_active_session',
};

const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundVolume: 0.7,
  ambientSound: 'none',
  theme: 'dark',
};

const DEFAULT_TASKS = [
  {
    id: '1',
    title: 'Explorer et utiliser FocusPulse',
    description: 'Tester les fonctionnalités de tâches, de chrono Pomodoro et de suivi de productivité.',
    category: 'Perso',
    priority: 'Haute',
    status: 'In Progress',
    estimatedMinutes: 30,
    spentMinutes: 15,
    dueDate: formatLocalDate(new Date()),
    reminderTime: '10:00',
    reminderEnabled: true,
    subtasks: [
      { id: '1-1', title: 'Lancer un chrono Pomodoro', completed: true },
      { id: '1-2', title: 'Découvrir le calendrier', completed: false },
    ],
    createdAt: new Date().toISOString(),
  }
];

export const loadUserAccount = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_ACCOUNT);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error loading user account:', err);
    return null;
  }
};

export const saveUserAccount = (userAccount) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(userAccount));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, 'true');
  } catch (err) {
    console.error('Error saving user account:', err);
  }
};

export const isUserLoggedIn = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION) === 'true';
  } catch (err) {
    return false;
  }
};

export const logoutUser = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  } catch (err) {
    console.error('Error logging out:', err);
  }
};

export const loadTasks = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : DEFAULT_TASKS;
  } catch (err) {
    return DEFAULT_TASKS;
  }
};

export const saveTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks:', err);
  }
};

export const loadSettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
};

export const loadSessions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
};

export const saveSessions = (sessions) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Error saving sessions:', err);
  }
};
