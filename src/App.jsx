import React, { useState, useEffect, useRef } from 'react';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import TaskManager from './components/TaskManager';
import CalendarView from './components/CalendarView';
import RemindersManager from './components/RemindersManager';
import PomodoroTimer from './components/PomodoroTimer';
import StatsDashboard from './components/StatsDashboard';
import SettingsView from './components/Settings';
import ZenMode from './components/ZenMode';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import MobileNav from './components/MobileNav';
import { playChimeSound } from './utils/audio';
import {
  loadTasks,
  saveTasks,
  loadSettings,
  saveSettings,
  loadSessions,
  saveSessions,
  loadUserAccount,
  saveUserAccount,
  logoutUser,
  isUserLoggedIn,
} from './utils/storage';
import {
  getSupabase,
  isSupabaseConfigured,
  fetchTasksFromCloud,
  syncTasksToCloud,
  signOutWithSupabase,
} from './utils/supabase';
import { formatLocalDate, isTaskOnDate } from './utils/recurrence';

export default function App() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [user, setUser] = useState(() => loadUserAccount());
  const [isLoggedIn, setIsLoggedIn] = useState(() => isUserLoggedIn());
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [tasks, setTasks] = useState(() => loadTasks());
  const [settings, setSettings] = useState(() => loadSettings());
  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [isZenOpen, setIsZenOpen] = useState(false);
  const [triggeredReminders, setTriggeredReminders] = useState({});

  // Timer state
  const [sessionType, setSessionType] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(() => (settings.focusDuration || 25) * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Keep a ref of tasks to compare during realtime echo
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  // 1. Supabase Session Check & Auth State Listener
  useEffect(() => {
    const client = getSupabase();
    if (!client) return;

    // Check if there is an active session in Supabase
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const cloudUser = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          email: session.user.email,
          isCloud: true,
          createdAt: session.user.created_at,
        };
        setUser(cloudUser);
        setIsLoggedIn(true);
        saveUserAccount(cloudUser);
      }
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const cloudUser = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          email: session.user.email,
          isCloud: true,
          createdAt: session.user.created_at,
        };
        setUser(cloudUser);
        setIsLoggedIn(true);
        saveUserAccount(cloudUser);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 2. Fetch Tasks from Cloud when user is logged in
  useEffect(() => {
    if (!isLoggedIn || !user?.id || !user?.isCloud) return;

    let isMounted = true;
    const loadCloudTasks = async () => {
      try {
        const cloudTasks = await fetchTasksFromCloud(user.id);
        if (!isMounted) return;

        if (cloudTasks && cloudTasks.length > 0) {
          setTasks(cloudTasks);
        } else {
          // If Supabase has no tasks yet for this user, upload existing local tasks
          const localTasks = loadTasks();
          if (localTasks && localTasks.length > 0) {
            await syncTasksToCloud(localTasks, user.id);
          }
        }
      } catch (err) {
        console.error('Erreur chargement des tâches Supabase:', err);
      }
    };

    loadCloudTasks();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, user?.id, user?.isCloud]);

  // 3. Save tasks locally immediately, and debounce sync to Cloud
  useEffect(() => {
    saveTasks(tasks);

    if (!isLoggedIn || !user?.id || !user?.isCloud) return;

    const timer = setTimeout(() => {
      syncTasksToCloud(tasks, user.id);
    }, 600);

    return () => clearTimeout(timer);
  }, [tasks, isLoggedIn, user?.id, user?.isCloud]);

  // 4. Real-time Subscription to synchronize Mobile and PC instantly
  useEffect(() => {
    const client = getSupabase();
    if (!client || !isLoggedIn || !user?.id || !user?.isCloud) return;

    const channel = client
      .channel(`realtime-tasks-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          const freshTasks = await fetchTasksFromCloud(user.id);
          if (freshTasks) {
            // Check if changes actually differ to prevent state stutter
            if (JSON.stringify(freshTasks) !== JSON.stringify(tasksRef.current)) {
              setTasks(freshTasks);
            }
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [isLoggedIn, user?.id, user?.isCloud]);

  // Save Settings & Sessions
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Background Reminder Loop
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentDateStr = formatLocalDate(now);
      const currentHoursStr = String(now.getHours()).padStart(2, '0');
      const currentMinsStr = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHoursStr}:${currentMinsStr}`;

      tasks.forEach((task) => {
        if (
          task.reminderTime &&
          task.reminderEnabled !== false &&
          isTaskOnDate(task, currentDateStr) &&
          task.reminderTime === currentTimeStr
        ) {
          const reminderKey = `${task.id}-${currentDateStr}-${currentTimeStr}`;
          if (!triggeredReminders[reminderKey]) {
            playChimeSound('bell', settings.soundVolume || 0.8);
            if (window.electronAPI) {
              window.electronAPI.showNotification(
                '⏰ Rappel de Tâche - FocusPulse',
                `${task.title} (Prévue à ${task.reminderTime})`
              );
            }
            setTriggeredReminders((prev) => ({ ...prev, [reminderKey]: true }));
          }
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [tasks, triggeredReminders, settings.soundVolume, isLoggedIn]);

  const handleLoginSuccess = (account) => {
    setUser(account);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await signOutWithSupabase();
    } catch (e) {
      console.error(e);
    }
    logoutUser();
    setUser(null);
    setIsLoggedIn(false);
  };

  const handleManualSync = async () => {
    if (user?.id && user?.isCloud) {
      await syncTasksToCloud(tasks, user.id);
      const fresh = await fetchTasksFromCloud(user.id);
      if (fresh && fresh.length > 0) setTasks(fresh);
    }
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Title bar with profile button */}
      <TitleBar
        activeTab={activeTab}
        user={isLoggedIn ? user : null}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main App view or Authentication Overlay */}
      {!isLoggedIn ? (
        <AuthModal onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeTask={activeTask}
              activeSessionType={sessionType}
              isTimerRunning={isTimerRunning}
            />

            <main className="flex-1 flex overflow-hidden">
              {activeTab === 'tasks' && (
                <TaskManager
                  tasks={tasks}
                  setTasks={setTasks}
                  activeTaskId={activeTaskId}
                  setActiveTaskId={setActiveTaskId}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'calendar' && (
                <CalendarView
                  tasks={tasks}
                  setTasks={setTasks}
                  setActiveTaskId={setActiveTaskId}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'reminders' && (
                <RemindersManager tasks={tasks} setTasks={setTasks} />
              )}

              {activeTab === 'pomodoro' && (
                <PomodoroTimer
                  sessionType={sessionType}
                  setSessionType={setSessionType}
                  timeLeft={timeLeft}
                  setTimeLeft={setTimeLeft}
                  isRunning={isTimerRunning}
                  setIsRunning={setIsTimerRunning}
                  settings={settings}
                  activeTask={activeTask}
                  tasks={tasks}
                  setTasks={setTasks}
                  sessions={sessions}
                  setSessions={setSessions}
                  onOpenZen={() => setIsZenOpen(true)}
                />
              )}

              {activeTab === 'stats' && (
                <StatsDashboard tasks={tasks} sessions={sessions} />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  setSettings={setSettings}
                  tasks={tasks}
                  setTasks={setTasks}
                  sessions={sessions}
                  setSessions={setSessions}
                />
              )}
            </main>
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <MobileNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isTimerRunning={isTimerRunning}
          />
        </>
      )}

      {/* Profile Modal */}
      {isProfileOpen && user && (
        <UserProfileModal
          user={user}
          onClose={() => setIsProfileOpen(false)}
          onLogout={handleLogout}
          onManualSync={handleManualSync}
        />
      )}

      {/* Zen Mode */}
      {isZenOpen && (
        <ZenMode
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
          isRunning={isTimerRunning}
          setIsRunning={setIsTimerRunning}
          sessionType={sessionType}
          activeTask={activeTask}
          settings={settings}
          onExitZen={() => setIsZenOpen(false)}
        />
      )}
    </div>
  );
}
