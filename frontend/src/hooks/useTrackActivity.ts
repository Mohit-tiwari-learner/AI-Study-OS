import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to track user stats and activity on the dashboard.
 * Stats and activity are stored in localStorage per-user.
 */

interface UserStats {
  notesCaptured: number;
  quizzesGenerated: number;
  focusMinutes: number;
  planAdherence: number;
}

interface ActivityItem {
  iconName: string;
  title: string;
  meta: string;
  color: string;
}

function getStorageKey(uid: string, suffix: string) {
  return `studyos_${uid}_${suffix}`;
}

function loadStats(uid: string): UserStats {
  try {
    const raw = localStorage.getItem(getStorageKey(uid, "stats"));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { notesCaptured: 0, quizzesGenerated: 0, focusMinutes: 0, planAdherence: 0 };
}

function saveStats(uid: string, stats: UserStats) {
  try {
    localStorage.setItem(getStorageKey(uid, "stats"), JSON.stringify(stats));
  } catch { /* ignore */ }
}

function loadActivity(uid: string): ActivityItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(uid, "activity"));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveActivity(uid: string, items: ActivityItem[]) {
  try {
    localStorage.setItem(getStorageKey(uid, "activity"), JSON.stringify(items));
  } catch { /* ignore */ }
}

export function useTrackActivity() {
  const { user } = useAuth();

  const incrementStat = (key: keyof UserStats, amount: number = 1) => {
    if (!user?.uid) return;
    const stats = loadStats(user.uid);
    stats[key] = (stats[key] || 0) + amount;
    saveStats(user.uid, stats);
  };

  const addActivity = (item: Omit<ActivityItem, "meta"> & { meta?: string }) => {
    if (!user?.uid) return;
    const items = loadActivity(user.uid);
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    items.unshift({
      ...item,
      meta: item.meta || `Just now · ${timeString}`,
    });
    // Keep only last 20 items
    saveActivity(user.uid, items.slice(0, 20));
  };

  return { incrementStat, addActivity };
}
