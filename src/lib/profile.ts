import type { Goal, StudentProfile } from '@/types/mentoria';

export function getProfileGoals(profile: StudentProfile): Goal[] {
  const goals = profile.goals?.length ? profile.goals : [profile.goal];
  return Array.from(new Set(goals.filter(Boolean)));
}

export function profileGoalsText(profile: StudentProfile): string {
  return getProfileGoals(profile).join(', ');
}

/**
 * Stable, deterministic fingerprint for a StudentProfile.
 * Used as a cache-invalidation key: if the fingerprint stored on a cached
 * Roadmap differs from the current profile's fingerprint the cache is stale
 * and the roadmap must be regenerated.
 *
 * Includes: id (changes every time the user completes onboarding), grade,
 * goals, and a sorted list of interests.  Sorting interests/goals makes the
 * fingerprint order-independent.
 */
export function profileFingerprint(p: StudentProfile): string {
  return [p.id, p.grade, ...getProfileGoals(p).sort(), ...p.interests.slice().sort()].join('|');
}

/**
 * Demo / last-resort fallback profile.  Used only when localStorage has no
 * profile at all (e.g. first visit, cleared storage).  Never used when a
 * real profile exists.
 */
export function getDefaultStudentProfile(): StudentProfile {
  return {
    id: 'default',
    name: 'Demo',
    grade: 9,
    interests: ['Business', 'Finance'],
    subjects: [],
    goal: 'Build portfolio',
    goals: ['Build portfolio'],
    language: 'russian',
    createdAt: new Date().toISOString(),
  };
}
