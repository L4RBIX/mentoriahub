/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, CheckCircle2, Circle, ChevronLeft, ChevronRight, BookOpen, Clock, ExternalLink, Send, Sparkles, RefreshCcw } from 'lucide-react';
import { COURSES } from '@/lib/data/courses';
import { MOCK_OPPORTUNITIES } from '@/lib/data/opportunities';
import { getAllCourses, getCourseWithMentorLessons, isCourseComplete, makeCertificate } from '@/lib/mvp';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { AppHeader } from '@/components/AppHeader';
import { YouTubeEmbed } from '@/components/YouTubeEmbed';
import type { AppLanguage, Course, Lesson, CourseProgress, MentorLesson, Quiz, StudentProfile } from '@/types/mentoria';

const LEVEL_STYLES = {
  Beginner: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Intermediate: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Advanced: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

interface QuizPanelProps {
  lesson: Lesson;
  questions: Quiz[];
  onComplete: (score: number) => void;
}

function QuizPanel({ lesson, questions, onComplete }: QuizPanelProps) {
  const { tt } = useI18n();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedByQuestion, setSelectedByQuestion] = useState<Record<number, number>>({});
  const [checkedByQuestion, setCheckedByQuestion] = useState<Record<number, boolean>>({});
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedByQuestion({});
    setCheckedByQuestion({});
    setShowScore(false);
  }, [lesson.id]);

  const currentQuestion = questions[currentQuestionIndex];
  const selected = selectedByQuestion[currentQuestionIndex] ?? null;
  const submitted = checkedByQuestion[currentQuestionIndex] ?? false;
  const isCorrect = selected === currentQuestion.correctIndex;
  const score = questions.reduce((total, question, index) => {
    return total + (selectedByQuestion[index] === question.correctIndex ? 1 : 0);
  }, 0);

  const handleCheck = () => {
    if (selected === null) return;
    setCheckedByQuestion(previous => ({ ...previous, [currentQuestionIndex]: true }));
    if (currentQuestionIndex === questions.length - 1) {
      setShowScore(true);
    }
  };

  const handleSelect = (optionIndex: number) => {
    if (submitted) return;
    setSelectedByQuestion(previous => ({ ...previous, [currentQuestionIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(index => index + 1);
      return;
    }
    setShowScore(true);
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedByQuestion({});
    setCheckedByQuestion({});
    setShowScore(false);
  };

  return (
    <div className="mt-8 overflow-hidden rounded-[22px] border border-white/10 bg-[#0f1118] shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
      <div className="border-b border-white/10 bg-white/[0.035] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">{tt('assignmentLabel')}</p>
            <p className="mt-1 text-base font-semibold text-white">{tt('practiceCheck')}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/60">
            {tt('questionLabel')} {currentQuestionIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-base font-semibold leading-snug text-white">{currentQuestion.question}</p>

        <div className="grid grid-cols-1 gap-2.5">
          {currentQuestion.options.map((option, i) => {
            let state: 'default' | 'selected' | 'correct' | 'wrong' = 'default';
            if (submitted) {
              if (i === currentQuestion.correctIndex) state = 'correct';
              else if (i === selected && !isCorrect) state = 'wrong';
            } else if (i === selected) {
              state = 'selected';
            }

            const styles: Record<typeof state, string> = {
              default: 'bg-white/5 border-white/10 text-white/70 hover:border-white/25 hover:bg-white/8',
              selected: 'bg-[#5941ff]/20 border-[#5941ff]/50 text-white',
              correct: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
              wrong: 'bg-red-500/20 border-red-500/50 text-red-300',
            };

            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => handleSelect(i)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-150 ${styles[state]}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                  state === 'selected' ? 'bg-[#5941ff] border-[#5941ff] text-white' :
                  state === 'correct' ? 'bg-emerald-500 border-emerald-500 text-white' :
                  state === 'wrong' ? 'bg-red-500 border-red-500 text-white' :
                  'bg-white/10 border-white/20 text-white/50'
                }`}>
                  {OPTION_LETTERS[i]}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <button
            disabled={selected === null}
            onClick={handleCheck}
            className="mt-2 w-full py-3 bg-[#5941ff] hover:bg-[#4730dd] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {tt('checkAnswer')}
          </button>
        ) : (
          <div className="space-y-3">
            <div className={`rounded-xl border px-4 py-3 text-sm ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-red-500/20 bg-red-500/10 text-red-300'}`}>
              <p className="mb-1 font-semibold">{isCorrect ? tt('correctAnswer') : tt('incorrectAnswer')}</p>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/35">{tt('explanationLabel')}</p>
              <p className="text-xs leading-relaxed text-white/70">{currentQuestion.explanation}</p>
            </div>

            {showScore ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/35">{tt('scoreLabel')}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{score}/{questions.length} {tt('correctCountLabel')}</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    {tt('tryAgain')}
                  </button>
                </div>
                <button
                  onClick={() => onComplete(score)}
                  className="mt-4 w-full rounded-xl bg-[#5941ff] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4730dd]"
                >
                  {tt('completeLesson')}
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-semibold text-white transition-colors hover:border-[#5941ff]/35 hover:bg-white/[0.07]"
              >
                {tt('nextLessonBtn')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MentorMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LessonMentorPanelProps {
  course: Course;
  lesson: Lesson;
  profile: StudentProfile | null;
  courses: Course[];
  language: AppLanguage;
}

function LessonMentorPanel({ course, lesson, profile, courses, language }: LessonMentorPanelProps) {
  const { tt } = useI18n();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInput('');
    setMessages([]);
    setLoading(false);
  }, [lesson.id]);

  const questions = lesson.quizQuestions?.length ? lesson.quizQuestions : lesson.quiz ? [lesson.quiz] : [];
  const summary = lesson.content.split('. ').slice(0, 2).join('. ');
  const quickPrompts = [
    tt('mentorPromptSimpler'),
    tt('mentorPromptExample'),
    tt('mentorPromptCheck'),
    tt('mentorPromptRemember'),
  ];

  const askMentor = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    const userMessage: MentorMessage = { role: 'user', content: trimmed };
    setMessages(previous => [...previous, userMessage]);
    setInput('');
    setLoading(true);

    const lessonContext = [
      `Student question: ${trimmed}`,
      `UI language: ${language}`,
      `Course: ${course.title}`,
      `Lesson: ${lesson.title}`,
      `Lesson summary: ${lesson.content}`,
      `Practice questions: ${questions.map((question, index) => `${index + 1}. ${question.question}`).join(' | ')}`,
      'Answer as a lesson mentor. Be concise, practical, and focused on this lesson. Do not mention providers or internal fallback.',
    ].join('\n');

    try {
      const savedIds = storage.getSavedOpportunities().map(saved => saved.opportunityId);
      const savedOpportunities = MOCK_OPPORTUNITIES.filter(opportunity => savedIds.includes(opportunity.id));
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: lessonContext,
          language,
          profile,
          roadmap: storage.getRoadmap(),
          savedOpportunities,
          courses,
          opportunities: MOCK_OPPORTUNITIES,
        }),
      });

      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !data.answer) {
        throw new Error(data.error ?? 'Assistant request failed');
      }

      setMessages(previous => [...previous, { role: 'assistant', content: data.answer ?? '' }]);
    } catch {
      setMessages(previous => [
        ...previous,
        { role: 'assistant', content: `${tt('mentorFallbackIntro')} ${summary}.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="rounded-[22px] border border-white/10 bg-[#0d0f16] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[#5941ff]/25 bg-[#5941ff]/12 text-[#b9b0ff]">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{tt('lessonMentorName')}</p>
          <p className="mt-0.5 text-xs text-white/45">{tt('lessonAssistantTitle')}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/35">{tt('lessonAssistantSummary')}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/68">{summary}.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {quickPrompts.map(prompt => (
          <button
            key={prompt}
            onClick={() => askMentor(prompt)}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-left text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
              message.role === 'user'
                ? 'ml-8 bg-[#5941ff] text-white'
                : 'mr-6 border border-white/10 bg-white/[0.04] text-white/72'
            }`}
          >
            {message.content}
          </div>
        ))}
        {loading && (
          <div className="mr-6 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white/50">
            {tt('mentorThinking')}
          </div>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void askMentor(input);
        }}
        className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 p-2 focus-within:border-[#5941ff]/45"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={tt('lessonMentorPlaceholder')}
          className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/32"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5941ff] text-white transition-colors hover:bg-[#4730dd] disabled:bg-white/10 disabled:text-white/30"
          aria-label={tt('askAboutLesson')}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </aside>
  );
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { tt, language } = useI18n();

  const LEVEL_LABELS = {
    Beginner: tt('levelBeginner'),
    Intermediate: tt('levelIntermediate'),
    Advanced: tt('levelAdvanced'),
  };

  const [allCourses, setAllCourses] = useState<Course[]>(COURSES);
  const baseCourse = allCourses.find(c => c.id === id);

  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [mentorLessons, setMentorLessons] = useState<MentorLesson[]>([]);
  const [certificateIssued, setCertificateIssued] = useState(false);

  const course = useMemo(
    () => (baseCourse ? getCourseWithMentorLessons(baseCourse.id, mentorLessons, allCourses) : null),
    [allCourses, baseCourse, mentorLessons],
  );

  useEffect(() => {
    const loadedCourses = getAllCourses(storage.getCustomCourses());
    setAllCourses(loadedCourses);
    const loadedBase = loadedCourses.find(c => c.id === id);
    if (!loadedBase) {
      router.replace('/courses');
      return;
    }
    setMounted(true);
    setProfile(storage.getProfile());
    setMentorLessons(storage.getMentorLessons());
    setCertificateIssued(storage.getCertificates().some(c => c.courseId === loadedBase.id));
    const saved = storage.getCourseProgressById(loadedBase.id);
    setProgress(saved);

    // Start at first incomplete lesson
    if (saved && saved.completedLessonIds.length > 0) {
      const firstIncomplete = loadedBase.lessons.findIndex(l => !saved.completedLessonIds.includes(l.id));
      setCurrentIndex(firstIncomplete === -1 ? loadedBase.lessons.length - 1 : firstIncomplete);
    }
  }, [id, router]);

  if (!course) return null;

  const completedIds = progress?.completedLessonIds ?? [];
  const currentLesson = course.lessons[currentIndex];
  const progressPct = Math.round((completedIds.length / course.lessons.length) * 100);
  const isCurrentCompleted = completedIds.includes(currentLesson.id);
  const complete = isCourseComplete(course, progress);
  const practiceQuestions = currentLesson.quizQuestions?.length
    ? currentLesson.quizQuestions
    : currentLesson.quiz
      ? [currentLesson.quiz]
      : [];

  const handleCompleteLesson = (score?: number) => {
    storage.completeLesson(course.id, currentLesson.id, score);
    const updated = storage.getCourseProgressById(course.id);
    setProgress(updated);
    setJustCompleted(currentLesson.id);

    // Advance to next lesson after a short delay
    if (currentIndex < course.lessons.length - 1) {
      setTimeout(() => {
        setCurrentIndex(i => i + 1);
        setJustCompleted(null);
      }, 800);
    }
  };

  const handleCertificate = () => {
    if (!profile || !complete) return;
    storage.addCertificate(makeCertificate(profile, course));
    setCertificateIssued(true);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />
      {/* Course hero */}
      <div className="border-b border-white/10 bg-white/2">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/courses" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors">
              <ChevronLeft className="w-4 h-4" /> {tt('backToCourses')}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border mb-3 ${LEVEL_STYLES[course.level]}`}>
                {LEVEL_LABELS[course.level]}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-snug">
                {course.title}
              </h1>
              <p className="text-white/55 text-sm leading-relaxed">{course.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {course.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-white/8 text-white/40 border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress card */}
            <div className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-5 min-w-[200px]">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#5941ff]" />
                <span className="text-white/60 text-xs">{course.lessons.length} {tt('lessons')}</span>
                <Clock className="w-4 h-4 text-[#5941ff] ml-2" />
                <span className="text-white/60 text-xs">{course.estimatedHours} {tt('hoursAbbrev')}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">{tt('progress')}</span>
                  <span className="text-white font-semibold">{mounted ? progressPct : 0}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5941ff] rounded-full transition-all duration-500"
                    style={{ width: `${mounted ? progressPct : 0}%` }}
                  />
                </div>
                <p className="text-white/35 text-xs">
                  {mounted ? `${completedIds.length} / ${course.lessons.length} ${tt('completedWord')}` : '...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning workspace */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-8 xl:grid-cols-[280px_minmax(0,1fr)_340px]">

        {/* Lesson sidebar */}
        <aside className="order-2 xl:order-1">
          <div className="sticky top-6 overflow-hidden rounded-[22px] border border-white/10 bg-[#0d0f16]">
            <div className="px-4 py-3.5 border-b border-white/10">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{tt('lessonsHeading')}</p>
            </div>
            <div className="divide-y divide-white/5">
              {course.lessons.map((lesson, i) => {
                const isCompleted = completedIds.includes(lesson.id);
                const isCurrent = i === currentIndex;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 ${
                      isCurrent ? 'bg-white/[0.075]' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#5941ff]" />
                      ) : (
                        <Circle className={`w-4 h-4 ${isCurrent ? 'text-white/60' : 'text-white/25'}`} />
                      )}
                    </span>
                    <span className={`text-sm leading-snug ${
                      isCurrent ? 'text-white font-medium' :
                      isCompleted ? 'text-white/60' : 'text-white/40'
                    }`}>
                      <span className="text-white/25 text-xs mr-1">{i + 1}.</span>
                      {lesson.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Lesson content */}
        <div className="order-1 min-w-0 xl:order-2">
          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0b0c12] shadow-[0_24px_90px_rgba(0,0,0,0.28)]">

            {/* Lesson header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-white/35 text-xs mb-1">{tt('lessonWord')} {currentIndex + 1}/{course.lessons.length}</p>
                <h2 className="text-white font-bold text-xl leading-snug">{currentLesson.title}</h2>
              </div>
              {isCurrentCompleted && (
                <span className="flex items-center gap-1.5 text-[#5941ff] text-xs font-medium bg-[#5941ff]/15 px-3 py-1.5 rounded-full border border-[#5941ff]/25">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {tt('completedBadge')}
                </span>
              )}
            </div>

            {/* Lesson video */}
            <section className="mx-6 mt-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{tt('videoLessonLabel')}</p>
                  {currentLesson.videoTitle && (
                    <p className="mt-1 text-sm font-medium text-white/75">{currentLesson.videoTitle}</p>
                  )}
                </div>
                {currentLesson.duration && (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/50">
                    {currentLesson.duration}
                  </span>
                )}
              </div>
              <YouTubeEmbed
                youtubeId={currentLesson.youtubeId}
                videoUrl={currentLesson.videoUrl}
                title={currentLesson.videoTitle ?? currentLesson.title}
              />
              {currentLesson.materialUrl && (
                <a
                  href={currentLesson.materialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/65 transition-colors hover:border-[#5941ff]/35 hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {tt('materialsLabel')}
                </a>
              )}
            </section>

            {/* Lesson text content */}
            <div className="px-6 py-6">
              <div className="rounded-[20px] border border-white/10 bg-white/[0.035] p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/35">{tt('lessonAssistantSummary')}</p>
                <p className="max-w-3xl text-sm leading-7 text-white/72">{currentLesson.content}</p>
              </div>
            </div>

            {/* Quiz or complete button */}
            <div className="px-6 pb-6">
              {practiceQuestions.length > 0 && !isCurrentCompleted ? (
                <QuizPanel lesson={currentLesson} questions={practiceQuestions} onComplete={handleCompleteLesson} />
              ) : !isCurrentCompleted ? (
                <button
                  onClick={() => handleCompleteLesson()}
                  className={`w-full py-3.5 font-semibold rounded-xl text-sm transition-all duration-200 ${
                    justCompleted === currentLesson.id
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                      : 'bg-[#5941ff] hover:bg-[#4730dd] text-white'
                  }`}
                >
                  {justCompleted === currentLesson.id ? `✓ ${tt('lessonCompletedMsg')}` : tt('completeLesson')}
                </button>
              ) : null}
            </div>

            {/* Lesson navigation */}
            <div className="px-6 pb-6 flex items-center justify-between gap-4 border-t border-white/8 pt-5">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(i => i - 1)}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> {tt('prevLessonBtn')}
              </button>

              <span className="text-white/20 text-xs">{currentIndex + 1} / {course.lessons.length}</span>

              <button
                disabled={currentIndex === course.lessons.length - 1}
                onClick={() => setCurrentIndex(i => i + 1)}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {tt('nextLessonBtn')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* All done state */}
          {complete && (
            <div className="mt-5 bg-[#5941ff]/10 border border-[#5941ff]/25 rounded-2xl p-6 text-center">
              <Award className="mx-auto mb-3 h-8 w-8 text-[#b9b0ff]" />
              <h3 className="text-white font-bold text-lg mb-1">{tt('courseCompleteTitle')}</h3>
              <p className="text-white/50 text-sm mb-4">{tt('courseCompletedPrefix')} {course.lessons.length} {tt('lessons')} «{course.title}»</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleCertificate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5941ff] hover:bg-[#4730dd] text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Award className="w-4 h-4" /> {certificateIssued ? tt('certificateReady') : tt('getCertificate')}
                </button>
                <Link
                  href="/certificates"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white/70 text-sm font-semibold rounded-xl hover:bg-white/5 transition-colors"
                >
                  {tt('openCertificates')}
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white/70 text-sm font-semibold rounded-xl hover:bg-white/5 transition-colors"
                >
                  <BookOpen className="w-4 h-4" /> {tt('moreCourses')}
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="order-3 xl:sticky xl:top-6 xl:self-start">
          <LessonMentorPanel
            course={course}
            lesson={currentLesson}
            profile={profile}
            courses={allCourses}
            language={language}
          />
        </div>
      </div>
    </main>
  );
}
