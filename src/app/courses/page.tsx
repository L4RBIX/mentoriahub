/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { COURSES } from '@/lib/data/courses';
import { getAllCourses } from '@/lib/mvp';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { AppHeader } from '@/components/AppHeader';
import type { Course, CourseProgress } from '@/types/mentoria';

const LEVEL_STYLES = {
  Beginner: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Intermediate: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Advanced: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

// Brand-rooted gradients: violet anchor (#5941ff) tinted toward each course's domain
// — not stock AI palette, intentionally derived from the Mentoria violet brand token
const COURSE_GRADIENTS = [
  'from-[#5941ff]/25 to-[#2d1fa3]/15',   // English: deep violet
  'from-[#5941ff]/20 to-[#0f4a6e]/15',   // CS: violet into dark slate-blue
  'from-[#5941ff]/20 to-[#1a3a1a]/15',   // Uni: violet into very dark forest
];

export default function CoursesPage() {
  const { tt } = useI18n();
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress | null>>({});
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [mounted, setMounted] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    const allCourses = getAllCourses(storage.getCustomCourses());
    setCourses(allCourses);
    const map: Record<string, CourseProgress | null> = {};
    for (const course of allCourses) {
      map[course.id] = storage.getCourseProgressById(course.id);
    }
    setProgressMap(map);
    const roadmap = storage.getRoadmap();
    if (roadmap?.recommendedCourses?.length) {
      setRecommendedCourses(new Set(roadmap.recommendedCourses));
    }
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">{tt('home')}</Link>
            <span className="text-white/20">/</span>
            <span className="text-white/60 text-sm">{tt('courses')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {tt('coursesTitle')}
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            {tt('coursesSubtitle')}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap gap-8">
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <BookOpen className="w-4 h-4 text-[#5941ff]" />
            <span><span className="text-white font-semibold">{courses.length}</span> {tt('courses')}</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Clock className="w-4 h-4 text-[#5941ff]" />
            <span><span className="text-white font-semibold">{courses.reduce((a, c) => a + c.estimatedHours, 0)}</span> {tt('hoursContent')}</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <CheckCircle2 className="w-4 h-4 text-[#5941ff]" />
            <span>
              <span className="text-white font-semibold">
                {mounted ? Object.values(progressMap).filter(p => p && p.completedLessonIds.length > 0).length : 0}
              </span> {tt('coursesStartedLabel')}
            </span>
          </div>
        </div>
      </div>

      {/* Course cards */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => {
            const progress = mounted ? progressMap[course.id] : null;
            const completedCount = progress?.completedLessonIds.length ?? 0;
            const progressPct = Math.round((completedCount / course.lessons.length) * 100);
            const hasStarted = completedCount > 0;
            const isComplete = completedCount >= course.lessons.length;

            return (
              <div
                key={course.id}
                className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 transition-all duration-300 flex flex-col"
              >
                {/* Gradient accent top */}
                <div className={`h-1 w-full bg-gradient-to-r ${COURSE_GRADIENTS[index % COURSE_GRADIENTS.length]}`} />

                {/* Card inner top accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${COURSE_GRADIENTS[index % COURSE_GRADIENTS.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl`} />

                <div className="relative p-6 flex flex-col gap-4 flex-1">
                  {/* Badges row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${LEVEL_STYLES[course.level]}`}>
                      {course.level === 'Beginner'
                        ? tt('levelBeginner')
                        : course.level === 'Intermediate'
                          ? tt('levelIntermediate')
                          : tt('levelAdvanced')}
                    </span>
                    {mounted && recommendedCourses.has(course.id) && (
                      <span className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border bg-[#5941ff]/15 border-[#5941ff]/35 text-[#8b7fff]">
                        <span className="w-1 h-1 rounded-full bg-[#5941ff]" />
                        {tt('recommendedBadge')}
                      </span>
                    )}
                  </div>

                  {/* Title & description */}
                  <div className="flex-1">
                    <h2 className="text-white font-bold text-xl leading-snug mb-2 group-hover:text-[#a89fff] transition-colors">
                      {course.title}
                    </h2>
                    <p className="text-white/55 text-sm leading-relaxed line-clamp-3">
                      {course.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {course.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-white/8 text-white/45 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-white/45 text-sm">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.lessons.length} {tt('lessonUnit')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {course.estimatedHours} {tt('hourShort')}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#5941ff] rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/40">
                      {!mounted
                        ? '...'
                        : isComplete
                          ? tt('courseCompleteStatus')
                          : hasStarted
                            ? `${completedCount} / ${course.lessons.length}`
                            : tt('notStarted')
                      }
                    </p>
                  </div>

                  {/* CTA button */}
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex items-center justify-center gap-2 py-3 px-5 bg-[#5941ff] hover:bg-[#4730dd] text-white text-sm font-semibold rounded-xl transition-colors duration-200 group/btn"
                  >
                    {isComplete ? tt('repeatBtn') : hasStarted ? tt('continueBtn') : tt('startBtn')}
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center py-12 border border-white/10 rounded-2xl bg-white/3">
          <p className="text-2xl font-bold text-white mb-2">{tt('soonMore')}</p>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            {tt('moreCoursesText')}
          </p>
        </div>
      </div>
    </main>
  );
}
