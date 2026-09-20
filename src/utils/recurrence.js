// Utility functions for task and calendar repetitions / recurrences

export const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Ne pas répéter' },
  { value: 'daily', label: 'Tous les jours (Quotidien)' },
  { value: 'weekdays', label: 'Jours ouvrés (Lun - Ven)' },
  { value: 'weekly', label: 'Toutes les semaines (Hebdo)' },
  { value: 'monthly', label: 'Tous les mois (Mensuel)' },
];

/**
 * Format local Date object to YYYY-MM-DD safely without timezone/UTC offset shifts.
 * @param {Date|string} d
 * @returns {string}
 */
export function formatLocalDate(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getRecurrenceLabel(recurrence) {
  switch (recurrence) {
    case 'daily':
      return 'Tous les jours';
    case 'weekdays':
      return 'Jours ouvrés';
    case 'weekly':
      return 'Hebdomadaire';
    case 'monthly':
      return 'Mensuel';
    default:
      return null;
  }
}

/**
 * Checks if a task is scheduled on a given date (considering recurrence).
 * @param {Object} task
 * @param {string} dateStr 'YYYY-MM-DD'
 * @returns {boolean}
 */
export function isTaskOnDate(task, dateStr) {
  if (!task || !task.dueDate || !dateStr) return false;

  // Direct match
  if (task.dueDate === dateStr) return true;

  // If no recurrence or invalid recurrence
  if (!task.recurrence || task.recurrence === 'none') return false;

  // Recurrence only occurs on or after the starting due date
  if (dateStr < task.dueDate) return false;

  const targetDate = new Date(dateStr + 'T00:00:00');
  const startDate = new Date(task.dueDate + 'T00:00:00');

  switch (task.recurrence) {
    case 'daily':
      return true;

    case 'weekdays': {
      const day = targetDate.getDay();
      return day >= 1 && day <= 5; // Monday to Friday
    }

    case 'weekly':
      return targetDate.getDay() === startDate.getDay();

    case 'monthly':
      return targetDate.getDate() === startDate.getDate();

    default:
      return false;
  }
}

/**
 * Calculate the next occurrence date after a given date.
 * @param {string} fromDateStr 'YYYY-MM-DD'
 * @param {string} recurrence
 * @returns {string} 'YYYY-MM-DD'
 */
export function getNextOccurrence(fromDateStr, recurrence) {
  if (!recurrence || recurrence === 'none') return fromDateStr;

  const baseDate = new Date(fromDateStr + 'T00:00:00');

  switch (recurrence) {
    case 'daily':
      baseDate.setDate(baseDate.getDate() + 1);
      break;

    case 'weekdays': {
      baseDate.setDate(baseDate.getDate() + 1);
      const day = baseDate.getDay();
      if (day === 6) {
        // Saturday -> Monday (+2)
        baseDate.setDate(baseDate.getDate() + 2);
      } else if (day === 0) {
        // Sunday -> Monday (+1)
        baseDate.setDate(baseDate.getDate() + 1);
      }
      break;
    }

    case 'weekly':
      baseDate.setDate(baseDate.getDate() + 7);
      break;

    case 'monthly':
      baseDate.setMonth(baseDate.getMonth() + 1);
      break;

    default:
      return fromDateStr;
  }

  return formatLocalDate(baseDate);
}
