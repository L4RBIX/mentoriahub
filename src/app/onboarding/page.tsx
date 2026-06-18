'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import type { Grade, Interest, Goal, StudentProfile } from '@/types/mentoria';

const INTERESTS: Interest[] = [
  'STEM', 'Business', 'Programming', 'English',
  'University Admissions', 'Science', 'Social Impact', 'Finance',
];

const GOALS: Goal[] = [
  'Top university admission',
  'Olympiad preparation',
  'IELTS/SAT',
  'Build portfolio',
  'Leadership & volunteering',
  'Entrepreneurship',
];

const INTEREST_ICONS: Record<Interest, string> = {
  'STEM': '🔬',
  'Business': '💼',
  'Programming': '💻',
  'English': '🌍',
  'University Admissions': '🎓',
  'Science': '⚗️',
  'Social Impact': '🤝',
  'Finance': '📊',
};

const LANGUAGE_LABELS = {
  russian: 'Русский',
  english: 'English',
  kazakh: 'Қазақша',
} as const;

type Language = 'russian' | 'english' | 'kazakh';

const gradeOptions = [8, 9, 10, 11] as Grade[];

interface FormState {
  name: string;
  grade: Grade | null;
  interests: Interest[];
  goals: Goal[];
  language: Language;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { language, tt } = useI18n();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    grade: null,
    interests: [],
    goals: [],
    language: 'russian',
  });

  function gradeLabel(g: number): string {
    if (language === 'en') return `Grade ${g}`;
    if (language === 'kz') return `${g} сынып`;
    return `${g} класс`;
  }

  const GOAL_LABELS: Record<Goal, string> = {
    'Top university admission': tt('goalUniversity'),
    'Olympiad preparation': tt('goalOlympiad'),
    'IELTS/SAT': tt('goalIELTS'),
    'Build portfolio': tt('goalPortfolio'),
    'Leadership & volunteering': tt('goalLeadership'),
    'Entrepreneurship': tt('goalEntrepreneur'),
  };

  function validateStep(s: number): boolean {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!form.name.trim()) newErrors.name = tt('errName');
      if (!form.grade) newErrors.grade = tt('errGrade');
    }
    if (s === 2) {
      if (form.interests.length === 0) newErrors.interests = tt('errInterests');
    }
    if (s === 3) {
      if (form.goals.length === 0) newErrors.goal = tt('errGoal');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep(s => Math.min(s + 1, 4));
  }

  function prevStep() {
    setErrors({});
    setStep(s => Math.max(s - 1, 1));
  }

  function toggleInterest(interest: Interest) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : [...f.interests, interest],
    }));
  }

  function toggleGoal(goal: Goal) {
    setForm(f => ({
      ...f,
      goals: f.goals.includes(goal)
        ? f.goals.filter(item => item !== goal)
        : [...f.goals, goal],
    }));
  }

  async function handleSubmit() {
    if (!form.name || !form.grade || form.goals.length === 0) return;
    const primaryGoal = form.goals[0];
    const profile: StudentProfile = {
      id: Date.now().toString(),
      name: form.name.trim(),
      grade: form.grade,
      interests: form.interests,
      subjects: [],
      goal: primaryGoal,
      goals: form.goals,
      language: form.language,
      createdAt: new Date().toISOString(),
    };
    storage.setProfile(profile);
    // Invalidate any cached roadmap so /roadmap generates fresh for the new profile.
    storage.clearRoadmap();
    setIsSubmitting(true);
    await new Promise<void>(r => setTimeout(r, 2600));
    router.push('/roadmap');
  }

  const stepTitles = [
    tt('onboardingStep1'),
    tt('onboardingStep2'),
    tt('onboardingStep3'),
    tt('onboardingStep4'),
  ];

  const choiceBaseClass =
    'onboarding-choice min-h-11 cursor-pointer rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]';
  const selectedChoiceClass = 'onboarding-choice-selected border-[#5941ff] bg-[#5941ff] text-white shadow-sm shadow-[#5941ff]/20';
  const unselectedChoiceClass = 'onboarding-choice-unselected border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/8 hover:text-white/80';

  return (
    <div className="mentoria-onboarding min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12">

      {/* Настав loading overlay */}
      {isSubmitting && (
        <div className="onboarding-loading-overlay fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[#5941ff]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#5941ff] animate-spin" />
            <div className="absolute inset-3 rounded-full bg-[#5941ff]/10 flex items-center justify-center text-[#8b7fff]">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">{tt('loadingProfile')}</h2>
          <p className="text-white/50 text-sm mb-8">{tt('loadingPlan')}</p>
          <div className="space-y-3 max-w-xs w-full">
            {[tt('loadingInterest'), tt('loadingOpportunities'), tt('loadingRoadmap')].map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border border-[#5941ff]/40 flex items-center justify-center shrink-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-[#5941ff] animate-pulse"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  />
                </div>
                <span className="text-white/50 text-sm">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-1.5 text-xs text-white/25">
            <span>Mentoria Hub</span>
            <span className="text-[#8b7fff] font-medium">Smart roadmap</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="onboarding-kicker inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#5941ff]" />
          Mentoria Hub
        </div>
        <h1 className="onboarding-title text-3xl md:text-4xl font-bold text-white mb-2">
          {stepTitles[step - 1]}
        </h1>
        <p className="onboarding-muted text-white/50 text-sm">{tt('stepOf')} {step} {tt('of')} 4</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(n => (
            <div
              key={n}
              className="onboarding-progress-segment h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{ background: n <= step ? '#5941ff' : 'var(--onboarding-progress-muted, rgba(255,255,255,0.1))' }}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="onboarding-card w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">

        {/* Step 1: Name + Grade */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="onboarding-label block text-sm font-medium text-white/70 mb-2">{tt('yourName')}</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={tt('namePlaceholder')}
                className="onboarding-input w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#5941ff] transition-colors"
              />
              {errors.name && <p className="mt-1 text-red-400 text-xs">{errors.name}</p>}
            </div>

            <div>
              <label className="onboarding-label block text-sm font-medium text-white/70 mb-2">{tt('grade')}</label>
              <p className="onboarding-helper mb-3 text-xs text-white/38">{tt('gradeHelper')}</p>
              <div className="grid grid-cols-4 gap-3">
                {gradeOptions.map(g => (
                  <button
                    key={g}
                    onClick={() => setForm(f => ({ ...f, grade: g }))}
                    className={`min-h-14 ${choiceBaseClass} text-lg font-semibold ${
                      form.grade === g ? selectedChoiceClass : unselectedChoiceClass
                    }`}
                    aria-pressed={form.grade === g}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {form.grade && (
                <div className="onboarding-selected-note mt-3 flex items-center gap-2 rounded-xl border border-[#5941ff]/20 bg-[#5941ff]/10 px-3 py-2 text-xs text-[#8b7fff]">
                  <Check className="h-3.5 w-3.5" />
                  {gradeLabel(form.grade)}
                </div>
              )}
              {errors.grade && <p className="mt-1 text-red-400 text-xs">{errors.grade}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div>
            <p className="onboarding-helper text-white/50 text-sm mb-4">{tt('interestsHelper')}</p>
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map(interest => {
                const selected = form.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`flex items-center gap-2 text-left ${choiceBaseClass} ${
                      selected ? 'onboarding-choice-selected-soft border-[#5941ff] bg-[#5941ff]/20 text-white' : unselectedChoiceClass
                    }`}
                    aria-pressed={selected}
                  >
                    <span className="text-base">{INTEREST_ICONS[interest]}</span>
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
            {errors.interests && <p className="mt-3 text-red-400 text-xs">{errors.interests}</p>}
          </div>
        )}

        {/* Step 3: Goal + Language */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="onboarding-label block text-sm font-medium text-white/70 mb-3">{tt('mainGoal')}</label>
              <div className="space-y-2">
                {GOALS.map(goal => {
                  const selected = form.goals.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`flex w-full items-center justify-between gap-3 text-left ${choiceBaseClass} ${
                        selected ? 'onboarding-choice-selected-soft border-[#5941ff] bg-[#5941ff]/20 text-white' : unselectedChoiceClass
                      }`}
                      aria-pressed={selected}
                    >
                      <span>{GOAL_LABELS[goal]}</span>
                      {selected && <Check className="h-4 w-4 shrink-0 text-[#8b7fff]" />}
                    </button>
                  );
                })}
              </div>
              {errors.goal && <p className="mt-1 text-red-400 text-xs">{errors.goal}</p>}
            </div>

            <div>
              <label className="onboarding-label block text-sm font-medium text-white/70 mb-3">{tt('interfaceLanguage')}</label>
              <div className="flex gap-2">
                {(Object.keys(LANGUAGE_LABELS) as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setForm(f => ({ ...f, language: lang }))}
                    className={`flex-1 ${choiceBaseClass} py-2.5 ${
                      form.language === lang ? selectedChoiceClass : unselectedChoiceClass
                    }`}
                    aria-pressed={form.language === lang}
                  >
                    {LANGUAGE_LABELS[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-5">
            <p className="onboarding-helper text-white/50 text-sm text-center mb-2">{tt('reviewBeforeRoadmap')}</p>

            <div className="space-y-3">
              <div className="onboarding-review-row flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                <span className="onboarding-muted text-white/50 text-sm">{tt('name')}</span>
                <span className="text-white font-medium">{form.name}</span>
              </div>
              <div className="onboarding-review-row flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                <span className="onboarding-muted text-white/50 text-sm">{tt('grade')}</span>
                <span className="text-white font-medium">{form.grade ? gradeLabel(form.grade) : '—'}</span>
              </div>
              <div className="onboarding-review-row bg-white/5 rounded-xl px-4 py-3">
                <p className="onboarding-muted text-white/50 text-sm mb-2">{tt('interests')}</p>
                <div className="flex flex-wrap gap-2">
                  {form.interests.map(i => (
                    <span key={i} className="px-2 py-1 rounded-lg bg-[#5941ff]/20 border border-[#5941ff]/40 text-xs text-white">
                      {INTEREST_ICONS[i]} {i}
                    </span>
                  ))}
                </div>
              </div>
              <div className="onboarding-review-row flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                <span className="onboarding-muted text-white/50 text-sm">{tt('goal')}</span>
                <span className="text-white font-medium text-sm text-right max-w-[60%]">
                  {form.goals.length > 0 ? form.goals.map(goal => GOAL_LABELS[goal]).join(', ') : '—'}
                </span>
              </div>
              <div className="onboarding-review-row flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                <span className="onboarding-muted text-white/50 text-sm">{tt('language')}</span>
                <span className="text-white font-medium">{LANGUAGE_LABELS[form.language]}</span>
              </div>
            </div>

            <div className="mt-2 p-3 rounded-xl bg-[#5941ff]/10 border border-[#5941ff]/20">
              <p className="text-[#8b7fff] text-xs text-center">
                {tt('reviewNote')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="w-full max-w-md mt-6 flex gap-3">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="onboarding-secondary-button flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            {tt('previous')}
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={nextStep}
            className="btn-primary-violet flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{ background: '#5941ff' }}
          >
            {tt('next')}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="btn-primary-violet flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #5941ff, #7c5cff)' }}
          >
            {tt('generateRoadmap')}
          </button>
        )}
      </div>

      {/* Footer note */}
      <p className="onboarding-footer-note mt-6 text-white/20 text-xs text-center">
        {tt('privacyNote')}
      </p>
    </div>
  );
}
