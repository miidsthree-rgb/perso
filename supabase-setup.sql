-- ========================================================
-- FOCUSPULSE - SCRIPT D'INITIALISATION DE LA BASE SUPABASE
-- Copiez et collez l'intégralité de ce script dans l'onglet
-- "SQL Editor" de votre projet Supabase (https://supabase.com)
-- puis cliquez sur "Run".
-- ========================================================

-- 1. Création de la table des tâches
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'Perso',
    priority TEXT DEFAULT 'Moyenne',
    status TEXT DEFAULT 'Todo',
    estimated_minutes INTEGER DEFAULT 30,
    spent_minutes INTEGER DEFAULT 0,
    due_date TEXT DEFAULT '',
    reminder_time TEXT,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    recurrence TEXT DEFAULT 'none',
    subtasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour optimiser les requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);

-- 2. Activation de la sécurité Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 3. Règles d'accès privées (chaque utilisateur ne peut lire, modifier ou supprimer que ses propres tâches)
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" 
ON public.tasks FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" 
ON public.tasks FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks" 
ON public.tasks FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Activation de la réplication temps réel (synchronisation instantanée PC & Téléphone)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
    END IF;
END $$;
