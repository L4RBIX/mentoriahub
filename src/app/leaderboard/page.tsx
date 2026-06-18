/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Award, Flame, Trophy } from 'lucide-react';
import { COURSES } from '@/lib/data/courses';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { AppHeader } from '@/components/AppHeader';
import type { CourseProgress, StudentProfile } from '@/types/mentoria';

type Category = 'overall' | 'english' | 'stem' | 'uni';

const mockRows = [
  { name: 'Айша Н.', category: 'english', completedLessons: 14, certificates: 2, streak: 9 },
  { name: 'Данияр К.', category: 'stem', completedLessons: 13, certificates: 1, streak: 7 },
  { name: 'Мира С.', category: 'uni', completedLessons: 11, certificates: 1, streak: 6 },
  { name: 'Алихан Т.', category: 'stem', completedLessons: 9, certificates: 1, streak: 5 },
  { name: 'София М.', category: 'english', completedLessons: 8, certificates: 0, streak: 4 },
] as const;

function points(completedLessons: number, certificates: number, streak: number): number {
  return completedLessons * 120 + certificates * 500 + streak * 35;
}

export default function LeaderboardPage() {
  const { tt } = useI18n();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [certificates, setCertificates] = useState(0);
  const [category, setCategory] = useState<Category>('overall');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(storage.getProfile());
    setProgress(storage.getCourseProgress());
    setCertificates(storage.getCertificates().length);
    setMounted(true);
  }, []);

  const currentCompleted = progress.reduce((sum, item) => sum + item.completedLessonIds.length, 0);
  const currentRow = useMemo(() => ({
    name: profile?.name ?? tt('you'),
    category: profile?.interests.includes('English') ? 'english' : profile?.interests.includes('University Admissions') ? 'uni' : 'stem',
    completedLessons: currentCompleted,
    certificates,
    streak: Math.max(1, Math.min(10, currentCompleted)),
    current: true,
  }), [certificates, currentCompleted, profile?.interests, profile?.name, tt]);

  const rows = useMemo(() => {
    return [...mockRows, currentRow]
      .filter(row => category === 'overall' || row.category === category)
      .map(row => ({ ...row, points: points(row.completedLessons, row.certificates, row.streak) }))
      .sort((a, b) => b.points - a.points);
  }, [category, currentRow]);

  if (!mounted) return <main className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link href="/dashboard" className="text-sm text-white/40 hover:text-white">← {tt('backDashboard')}</Link>
        <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#5941ff]/18 to-white/4 p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#8b7fff]">{tt('courseRetention')}</p>
              <h1 className="text-3xl font-bold md:text-5xl">{tt('leaderboardTitle')}</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/55">
                {tt('leaderboardSubtitle')}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-2xl font-bold">{currentCompleted}</p>
                <p className="text-xs text-white/40">{tt('lessons')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-2xl font-bold">{certificates}</p>
                <p className="text-xs text-white/40">{tt('certificates')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-2xl font-bold">{currentRow.streak}</p>
                <p className="text-xs text-white/40">{tt('streak')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="my-6 flex flex-wrap gap-2">
          {[
            ['overall', 'Overall'],
            ['english', 'English'],
            ['stem', 'STEM'],
            ['uni', 'University Prep'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key as Category)}
              className={`rounded-full border px-4 py-2 text-sm ${
                category === key ? 'border-[#5941ff] bg-[#5941ff] text-white' : 'border-white/10 bg-white/5 text-white/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10">
          {rows.map((row, index) => (
            <div
              key={row.name}
              className={`grid grid-cols-[44px_1fr] gap-3 border-b border-white/5 p-4 last:border-b-0 md:grid-cols-[56px_1fr_120px_120px_120px] md:items-center ${
                'current' in row ? 'bg-[#5941ff]/12' : 'bg-white/4'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-sm font-bold">
                {index < 3 ? <Trophy className="h-4 w-4 text-[#8b7fff]" /> : index + 1}
              </div>
              <div>
                <p className="font-semibold text-white">
                  {row.name}{'current' in row ? ` · ${tt('you')}` : ''}
                </p>
                <p className="text-xs text-white/40">{row.points} {tt('points')} · {COURSES.length}</p>
              </div>
              <div className="text-sm text-white/60"><Award className="mr-1 inline h-4 w-4 text-[#8b7fff]" /> {row.completedLessons} {tt('lessons')}</div>
              <div className="text-sm text-white/60">{row.certificates} {tt('certificates')}</div>
              <div className="text-sm text-white/60"><Flame className="mr-1 inline h-4 w-4 text-orange-300" /> {row.streak} {tt('streak')}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
