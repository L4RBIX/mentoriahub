export type Grade = 8 | 9 | 10 | 11 | 12;
export type Interest = 'STEM' | 'Business' | 'Programming' | 'English' | 'University Admissions' | 'Science' | 'Social Impact' | 'Finance';
export type Goal = 'Top university admission' | 'Olympiad preparation' | 'IELTS/SAT' | 'Build portfolio' | 'Leadership & volunteering' | 'Entrepreneurship';
export type OpportunityCategory = 'Olympiad' | 'Hackathon' | 'Summer School' | 'Research' | 'Scholarship' | 'Volunteering' | 'Internship' | 'University Prep';
export type OpportunityDirection = 'STEM' | 'Business' | 'Social Impact' | 'Finance' | 'Programming' | 'Science' | 'English' | 'University Admissions';
export type Format = 'Online' | 'Offline' | 'Hybrid';

export interface StudentProfile {
  id: string;
  name: string;
  grade: Grade;
  interests: Interest[];
  subjects: string[];
  /** Primary goal kept for backward compatibility with older localStorage profiles. */
  goal: Goal;
  /** Full multi-goal selection from onboarding. Falls back to [goal] when absent. */
  goals?: Goal[];
  language: 'russian' | 'english' | 'kazakh';
  createdAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  direction: OpportunityDirection;
  grades: Grade[];
  format: Format;
  deadline: string;
  description: string;
  requirements: string[];
  tags: string[];
  isCustom?: boolean;
  createdAt?: string;
  // Localized overrides — title/description/requirements above are the
  // Russian default. EN/KZ fall back to the RU fields when these are not
  // set (e.g. for custom opportunities added via the admin form, or titles
  // that are already an international proper noun and don't need a
  // translated variant).
  titleEn?: string;
  titleKz?: string;
  descriptionEn?: string;
  descriptionKz?: string;
  requirementsEn?: string[];
  requirementsKz?: string[];
  benefits?: string[];
  benefitsEn?: string[];
  benefitsKz?: string[];
  // External links + provenance for the detail page.
  applyUrl?: string;
  websiteUrl?: string;
  sourceLabel?: string;
  source?: 'telegram' | 'mock' | 'admin';
  sourceChannel?: string;
  sourceUrl?: string;
}

export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  youtubeId?: string;
  videoProvider?: 'youtube';
  videoTitle?: string;
  duration?: string;
  materialUrl?: string;
  quiz?: Quiz;
  quizQuestions?: Quiz[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessonCount: number;
  estimatedHours: number;
  tags: string[];
  lessons: Lesson[];
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  completed?: boolean;
  // legacy fields (fallback generator)
  timeframe?: string;
  opportunityIds?: string[];
  courseIds?: string[];
  // Recommendation-enriched fields
  type?: 'course' | 'opportunity' | 'portfolio' | 'deadline' | 'application' | 'milestone';
  reason?: string;
  nextAction?: string;
  recommendedCourses?: string[];
  recommendedOpportunities?: string[];
}

export interface Roadmap {
  title: string;
  summary: string;
  steps: RoadmapStep[];
  generatedAt: string;
  source?: 'deepseek' | 'fallback' | 'local';
  // top-level AI recommendations
  recommendedOpportunities?: string[];
  recommendedCourses?: string[];
  // Cache-invalidation fingerprint: [id|grade|sorted-goals|sorted-interests].
  // If the current profile's fingerprint differs from this value the
  // cached roadmap is stale and must be regenerated.
  profileSnapshot?: string;
}

export interface SavedOpportunity {
  opportunityId: string;
  savedAt: string;
  reminderSent: boolean;
  reminderStatus?: 'sent' | 'preview';
}

export interface CourseProgress {
  courseId: string;
  completedLessonIds: string[];
  lastAccessedAt: string;
  quizResults: Record<string, number>;
}

export interface Certificate {
  id: string;
  courseId: string;
  studentName: string;
  courseName: string;
  issuedAt: string;
}

export interface MentorLesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  materialUrl?: string;
  task: string;
  createdAt: string;
}

export type AppLanguage = 'ru' | 'en' | 'kz';

export interface NastavMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: { label: string; href: string }[];
  createdAt: string;
}

export interface NastavChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: NastavMessage[];
  language: AppLanguage;
}
