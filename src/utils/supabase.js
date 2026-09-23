import { createClient } from '@supabase/supabase-js';

// Configuration keys: from environment variables or saved settings in localStorage
export const getSupabaseConfig = () => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
  const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '';
  
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('focuspulse_supabase_url') : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('focuspulse_supabase_anon_key') : '';

  const supabaseUrl = (envUrl || localUrl || '').trim();
  const supabaseAnonKey = (envKey || localKey || '').trim();

  return { supabaseUrl, supabaseAnonKey };
};

export const isSupabaseConfigured = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 20
  );
};

export const saveCustomSupabaseConfig = (url, key) => {
  if (url) localStorage.setItem('focuspulse_supabase_url', url.trim());
  if (key) localStorage.setItem('focuspulse_supabase_anon_key', key.trim());
  supabaseInstance = null; // Recreate client next time getSupabase() is called
  return getSupabase();
};

export const clearCustomSupabaseConfig = () => {
  localStorage.removeItem('focuspulse_supabase_url');
  localStorage.removeItem('focuspulse_supabase_anon_key');
  supabaseInstance = null;
};

// Internal client instance
let supabaseInstance = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  if (
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 20
  ) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.error('Erreur initialisation client Supabase:', err);
      supabaseInstance = null;
    }
  }

  return supabaseInstance;
};

// Re-initialize helper
export const reinitSupabase = (url, key) => {
  if (url && key) {
    return saveCustomSupabaseConfig(url, key);
  }
  supabaseInstance = null;
  return getSupabase();
};

// Transparent Proxy export so existing `supabase.auth` or `supabase.from()` calls always use the active instance
export const supabase = new Proxy(
  {},
  {
    get(target, prop) {
      const client = getSupabase();
      if (!client) return undefined;
      const val = client[prop];
      return typeof val === 'function' ? val.bind(client) : val;
    },
  }
);

// ----------------------------------------------------
// AUTHENTICATION FUNCTIONS
// ----------------------------------------------------

export async function signUpWithSupabase(email, password, fullName) {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase n\'est pas encore configuré. Veuillez renseigner l\'URL et la clé API.');
  }

  const { data, error } = await client.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithSupabase(email, password) {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase n\'est pas encore configuré. Veuillez renseigner l\'URL et la clé API.');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOutWithSupabase() {
  const client = getSupabase();
  if (!client) return;
  try {
    const { error } = await client.auth.signOut();
    if (error) console.error('Erreur déconnexion Supabase:', error);
  } catch (err) {
    console.error('Erreur signOut:', err);
  }
}

export async function getSupabaseUser() {
  const client = getSupabase();
  if (!client) return null;
  try {
    const { data: { user } } = await client.auth.getUser();
    return user;
  } catch (err) {
    return null;
  }
}

// ----------------------------------------------------
// TASK CONVERSION & CLOUD SYNC FUNCTIONS
// ----------------------------------------------------

export function toCloudTask(task, userId) {
  return {
    id: String(task.id),
    user_id: userId,
    title: task.title || 'Sans titre',
    description: task.description || '',
    category: task.category || 'Perso',
    priority: task.priority || 'Moyenne',
    status: task.status || 'Todo',
    estimated_minutes: task.estimatedMinutes ?? 30,
    spent_minutes: task.spentMinutes ?? 0,
    due_date: task.dueDate || '',
    reminder_time: task.reminderTime || null,
    reminder_enabled: task.reminderEnabled !== false,
    recurrence: task.recurrence || 'none',
    subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
    created_at: task.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function fromCloudTask(row) {
  return {
    id: String(row.id),
    title: row.title || 'Sans titre',
    description: row.description || '',
    category: row.category || 'Perso',
    priority: row.priority || 'Moyenne',
    status: row.status || 'Todo',
    estimatedMinutes: row.estimated_minutes ?? 30,
    spentMinutes: row.spent_minutes ?? 0,
    dueDate: row.due_date || '',
    reminderTime: row.reminder_time || null,
    reminderEnabled: row.reminder_enabled !== false,
    recurrence: row.recurrence || 'none',
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export async function fetchTasksFromCloud(userId) {
  const client = getSupabase();
  if (!client || !userId) return [];

  const { data, error } = await client
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur récupération tâches Supabase:', error);
    return [];
  }

  return (data || []).map(fromCloudTask);
}

/**
 * Sync local tasks to Supabase:
 * - Upserts all current tasks
 * - Removes tasks deleted from local state
 */
export async function syncTasksToCloud(tasks, userId) {
  const client = getSupabase();
  if (!client || !userId) return;

  try {
    // 1. Get current cloud task IDs for this user
    const { data: cloudRows, error: fetchErr } = await client
      .from('tasks')
      .select('id')
      .eq('user_id', userId);

    if (fetchErr) {
      console.error('Erreur lors de la vérification des tâches distantes:', fetchErr);
      return;
    }

    const cloudIds = new Set((cloudRows || []).map((r) => String(r.id)));
    const localIds = new Set(tasks.map((t) => String(t.id)));

    // 2. Delete tasks removed locally
    const toDelete = [...cloudIds].filter((id) => !localIds.has(id));
    if (toDelete.length > 0) {
      const { error: delErr } = await client
        .from('tasks')
        .delete()
        .in('id', toDelete)
        .eq('user_id', userId);

      if (delErr) {
        console.error('Erreur suppression tâches obsolètes:', delErr);
      }
    }

    // 3. Upsert current local tasks
    if (tasks.length > 0) {
      const cloudTasks = tasks.map((t) => toCloudTask(t, userId));
      const { error: upsertErr } = await client.from('tasks').upsert(cloudTasks);
      if (upsertErr) {
        console.error('Erreur upsert tâches Supabase:', upsertErr);
      }
    }
  } catch (err) {
    console.error('Erreur globale de synchronisation Supabase:', err);
  }
}
