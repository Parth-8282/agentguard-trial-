export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Consumer' | 'Fraud Analyst' | 'Merchant' | 'Admin';
  badge: string;
  phone?: string;
  avatarColor?: string;
  initials?: string;
}

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user_aryan',
    name: 'Aryan Chippa',
    email: 'aryan@agentguard.ai',
    role: 'Consumer',
    badge: 'Habitual Spender',
    phone: '+91 98765 43210',
    avatarColor: 'from-blue-600 to-indigo-600',
    initials: 'AC',
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena.rostova@agentguard.security',
    role: 'Fraud Analyst',
    badge: 'Lead SecOps',
    phone: '+91 98220 11945',
    avatarColor: 'from-purple-600 to-pink-600',
    initials: 'ER',
  },
  {
    id: 'user_vikram',
    name: 'Vikram Patel',
    email: 'vikram@patel-enterprises.in',
    role: 'Merchant',
    badge: 'Verified Business',
    phone: '+91 97654 32109',
    avatarColor: 'from-amber-600 to-orange-600',
    initials: 'VP',
  },
  {
    id: 'user_aarav',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@fintech.dev',
    role: 'Consumer',
    badge: 'New Account (Low Age)',
    phone: '+91 99112 23344',
    avatarColor: 'from-emerald-600 to-teal-600',
    initials: 'AM',
  },
];

const STORAGE_ACTIVE_USER = 'agentguard_active_user';
const STORAGE_USER_LIST = 'agentguard_users_list';

export function getStoredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USER_LIST);
    if (!raw) {
      localStorage.setItem(STORAGE_USER_LIST, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure default users are merged in
      const existingEmails = new Set(parsed.map((u: UserProfile) => u.email.toLowerCase()));
      const merged = [...parsed];
      for (const def of DEFAULT_USERS) {
        if (!existingEmails.has(def.email.toLowerCase())) {
          merged.push(def);
        }
      }
      return merged;
    }
    return DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: UserProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_USER_LIST, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users in localStorage:', err);
  }
}

export function getActiveUser(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USERS[0];
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name && parsed.email) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_USERS[0];
}

export function setActiveUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ACTIVE_USER, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save active user:', err);
  }
}

export function registerUser(name: string, email: string, role: UserProfile['role'] = 'Consumer', phone?: string): UserProfile {
  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    setActiveUser(existing);
    return existing;
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'U';

  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    name,
    email,
    role,
    badge: 'Member',
    phone: phone || '+91 99999 88888',
    avatarColor: 'from-blue-600 to-cyan-600',
    initials,
  };

  const updated = [newUser, ...users];
  saveStoredUsers(updated);
  setActiveUser(newUser);
  return newUser;
}

export function switchUser(user: UserProfile) {
  setActiveUser(user);
}

export function deleteStoredUser(userId: string) {
  const users = getStoredUsers().filter((u) => u.id !== userId);
  saveStoredUsers(users);
}
