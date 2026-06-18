import type {
  AppLanguage,
  Course,
  Certificate,
  CourseProgress,
  MentorLesson,
  NastavChatSession,
  Opportunity,
  Roadmap,
  SavedOpportunity,
  StudentProfile,
} from '@/types/mentoria';
import { isAppLanguage, LANGUAGE_STORAGE_KEY, LEGACY_LANGUAGE_STORAGE_KEY } from '@/lib/i18n';

const KEYS = {
  PROFILE: 'mentoria_profile',
  ROADMAP: 'mentoria_roadmap',
  SAVED_OPPORTUNITIES: 'mentoria_saved_opportunities',
  COURSE_PROGRESS: 'mentoria_course_progress',
  CUSTOM_OPPORTUNITIES: 'mentoria_custom_opportunities',
  CUSTOM_COURSES: 'mentoria_custom_courses',
  CERTIFICATES: 'mentoria_certificates',
  MENTOR_LESSONS: 'mentoria_mentor_lessons',
  THEME: 'mentoria_theme',
  LANGUAGE: LANGUAGE_STORAGE_KEY,
  USER_ID: 'mentoria-user-id',
  NASTAV_CHATS: 'mentoria-nastav-chats',
  NASTAV_ACTIVE_CHAT_ID: 'mentoria-nastav-active-chat-id',
} as const;

function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

export const storage = {
  getUserId: () => {
    if (typeof window === 'undefined') return '';
    const existing = localStorage.getItem(KEYS.USER_ID);
    if (existing) return existing;
    const next = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `mh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEYS.USER_ID, next);
    return next;
  },

  getProfile: () => get<StudentProfile | null>(KEYS.PROFILE, null),
  setProfile: (profile: StudentProfile) => set(KEYS.PROFILE, profile),

  getRoadmap: () => get<Roadmap | null>(KEYS.ROADMAP, null),
  setRoadmap: (roadmap: Roadmap) => set(KEYS.ROADMAP, roadmap),
  clearRoadmap: () => {
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(KEYS.ROADMAP); } catch { /* ignore */ }
  },

  getSavedOpportunities: () => get<SavedOpportunity[]>(KEYS.SAVED_OPPORTUNITIES, []),
  saveOpportunity: (opportunityId: string) => {
    const saved = get<SavedOpportunity[]>(KEYS.SAVED_OPPORTUNITIES, []);
    if (!saved.some(s => s.opportunityId === opportunityId)) {
      set(KEYS.SAVED_OPPORTUNITIES, [...saved, { opportunityId, savedAt: new Date().toISOString(), reminderSent: true }]);
    }
  },
  unsaveOpportunity: (opportunityId: string) => {
    const saved = get<SavedOpportunity[]>(KEYS.SAVED_OPPORTUNITIES, []);
    set(KEYS.SAVED_OPPORTUNITIES, saved.filter(s => s.opportunityId !== opportunityId));
  },
  setReminderStatus: (opportunityId: string, status: 'sent' | 'preview') => {
    const saved = get<SavedOpportunity[]>(KEYS.SAVED_OPPORTUNITIES, []);
    set(KEYS.SAVED_OPPORTUNITIES, saved.map(s => s.opportunityId === opportunityId ? { ...s, reminderStatus: status } : s));
  },
  isOpportunitySaved: (opportunityId: string): boolean => {
    return get<SavedOpportunity[]>(KEYS.SAVED_OPPORTUNITIES, []).some(s => s.opportunityId === opportunityId);
  },

  getCourseProgress: () => get<CourseProgress[]>(KEYS.COURSE_PROGRESS, []),
  getCourseProgressById: (courseId: string): CourseProgress | null => {
    return get<CourseProgress[]>(KEYS.COURSE_PROGRESS, []).find(p => p.courseId === courseId) ?? null;
  },
  completeLesson: (courseId: string, lessonId: string, quizScore?: number) => {
    const all = get<CourseProgress[]>(KEYS.COURSE_PROGRESS, []);
    const existing = all.find(p => p.courseId === courseId);
    if (existing) {
      if (!existing.completedLessonIds.includes(lessonId)) existing.completedLessonIds.push(lessonId);
      if (quizScore !== undefined) existing.quizResults[lessonId] = quizScore;
      existing.lastAccessedAt = new Date().toISOString();
      set(KEYS.COURSE_PROGRESS, all);
    } else {
      set(KEYS.COURSE_PROGRESS, [...all, {
        courseId,
        completedLessonIds: [lessonId],
        lastAccessedAt: new Date().toISOString(),
        quizResults: quizScore !== undefined ? { [lessonId]: quizScore } : {},
      }]);
    }
  },

  getCustomOpportunities: () => get<Opportunity[]>(KEYS.CUSTOM_OPPORTUNITIES, []),
  addCustomOpportunity: (opp: Opportunity) => {
    const existing = get<Opportunity[]>(KEYS.CUSTOM_OPPORTUNITIES, []);
    set(KEYS.CUSTOM_OPPORTUNITIES, [...existing, opp]);
  },
  deleteCustomOpportunity: (id: string) => {
    const existing = get<Opportunity[]>(KEYS.CUSTOM_OPPORTUNITIES, []);
    set(KEYS.CUSTOM_OPPORTUNITIES, existing.filter(o => o.id !== id));
  },
  updateCustomOpportunity: (id: string, updates: Partial<Opportunity>) => {
    const existing = get<Opportunity[]>(KEYS.CUSTOM_OPPORTUNITIES, []);
    set(KEYS.CUSTOM_OPPORTUNITIES, existing.map(o => o.id === id ? { ...o, ...updates } : o));
  },

  getCustomCourses: () => get<Course[]>(KEYS.CUSTOM_COURSES, []),
  addCustomCourse: (course: Course) => {
    const existing = get<Course[]>(KEYS.CUSTOM_COURSES, []);
    set(KEYS.CUSTOM_COURSES, [...existing, course]);
  },
  deleteCustomCourse: (id: string) => {
    const existing = get<Course[]>(KEYS.CUSTOM_COURSES, []);
    set(KEYS.CUSTOM_COURSES, existing.filter(course => course.id !== id));
  },

  getCertificates: () => get<Certificate[]>(KEYS.CERTIFICATES, []),
  addCertificate: (certificate: Certificate) => {
    const existing = get<Certificate[]>(KEYS.CERTIFICATES, []);
    if (!existing.some(c => c.courseId === certificate.courseId)) {
      set(KEYS.CERTIFICATES, [...existing, certificate]);
    }
  },

  getMentorLessons: () => get<MentorLesson[]>(KEYS.MENTOR_LESSONS, []),
  addMentorLesson: (lesson: MentorLesson) => {
    const existing = get<MentorLesson[]>(KEYS.MENTOR_LESSONS, []);
    set(KEYS.MENTOR_LESSONS, [lesson, ...existing]);
  },

  getTheme: () => get<'dark' | 'light'>(KEYS.THEME, 'dark'),
  setTheme: (theme: 'dark' | 'light') => set(KEYS.THEME, theme),

  getLanguage: () => {
    const current = get<AppLanguage>(KEYS.LANGUAGE, 'ru');
    if (isAppLanguage(current)) return current;
    const legacy = get<AppLanguage>(LEGACY_LANGUAGE_STORAGE_KEY, 'ru');
    return isAppLanguage(legacy) ? legacy : 'ru';
  },
  setLanguage: (language: AppLanguage) => {
    set(KEYS.LANGUAGE, language);
    set(LEGACY_LANGUAGE_STORAGE_KEY, language);
  },

  getNastavChats: () => get<NastavChatSession[]>(KEYS.NASTAV_CHATS, []),
  saveNastavChats: (chats: NastavChatSession[]) => set(KEYS.NASTAV_CHATS, chats),
  getActiveNastavChatId: () => get<string | null>(KEYS.NASTAV_ACTIVE_CHAT_ID, null),
  setActiveNastavChatId: (id: string | null) => set(KEYS.NASTAV_ACTIVE_CHAT_ID, id),

  clearAll: () => {
    if (typeof window === 'undefined') return;
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  },
};
