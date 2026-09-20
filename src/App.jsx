import React, { useState, useEffect } from 'react';
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
import { playChimeSound } from './utils/audio';
import {
  loadTasks,
  saveTasks,
  loadSettings,
  saveSettings,
  loadSessions,
  saveSessions,
  loadUserAccount,
  isUserLoggedIn,
} from './utils/storage';
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

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

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

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
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
      )}

      {/* Profile Modal */}
      {isProfileOpen && user && (
        <UserProfileModal
          user={user}
          onClose={() => setIsProfileOpen(false)}
          onLogout={handleLogout}
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
