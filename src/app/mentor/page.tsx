/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Upload, Users, ArrowLeft, Shield } from 'lucide-react';
import { COURSES } from '@/lib/data/courses';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { AppHeader } from '@/components/AppHeader';
import type { MentorLesson } from '@/types/mentoria';

const emptyForm = {
  courseId: 'course-english',
  title: '',
  description: '',
  videoUrl: '',
  materialUrl: '',
  task: '',
};

export default function MentorPage() {
  const { tt } = useI18n();
  const [lessons, setLessons] = useState<MentorLesson[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLessons(storage.getMentorLessons());
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    const lesson: MentorLesson = {
      id: `mentor-${Date.now()}`,
      courseId: form.courseId,
      title: form.title.trim(),
      description: form.description.trim(),
      videoUrl: form.videoUrl.trim() || undefined,
      materialUrl: form.materialUrl.trim() || undefined,
      task: form.task.trim() || tt('defaultMentorTask'),
      createdAt: new Date().toISOString(),
    };

    storage.addMentorLesson(lesson);
    setLessons(storage.getMentorLessons());
    setForm(emptyForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> {tt('dashboard')}
          </Link>
          <Link href="/admin" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors">
            <Shield className="h-3.5 w-3.5" /> {tt('admin')}
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#8b7fff]/30 bg-[#8b7fff]/10">
                <Upload className="h-5 w-5 text-[#8b7fff]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8b7fff]">Content Studio</p>
                <h1 className="text-2xl font-bold md:text-4xl">{tt('mentorHeading')}</h1>
              </div>
            </div>
            <p className="mb-8 max-w-2xl text-sm text-white/55">
              {tt('mentorSubtitle')}
            </p>

            <form onSubmit={submit} className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-1.5 block text-xs text-white/45">{tt('course')}</span>
                  <select
                    value={form.courseId}
                    onChange={event => setForm(f => ({ ...f, courseId: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white"
                  >
                    {COURSES.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </label>
                <label className="md:col-span-2">
                  <span className="mb-1.5 block text-xs text-white/45">{tt('lessonTitle')}</span>
                  <input
                    value={form.title}
                    onChange={event => setForm(f => ({ ...f, title: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25"
                    placeholder="SAT Reading strategy"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="mb-1.5 block text-xs text-white/45">{tt('lessonDescription')}</span>
                  <textarea
                    value={form.description}
                    onChange={event => setForm(f => ({ ...f, description: event.target.value }))}
                    className="min-h-28 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25"
                    placeholder="Brief lesson content"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs text-white/45">{tt('videoLink')}</span>
                  <input
                    value={form.videoUrl}
                    onChange={event => setForm(f => ({ ...f, videoUrl: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25"
                    placeholder="https://..."
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs text-white/45">{tt('materialLink')}</span>
                  <input
                    value={form.materialUrl}
                    onChange={event => setForm(f => ({ ...f, materialUrl: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25"
                    placeholder="Google Drive / Notion / PDF"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="mb-1.5 block text-xs text-white/45">{tt('miniTask')}</span>
                  <input
                    value={form.task}
                    onChange={event => setForm(f => ({ ...f, task: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25"
                    placeholder="Write 3 key takeaways and one next step"
                  />
                </label>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/3 p-6 text-center">
                <Upload className="mx-auto mb-2 h-6 w-6 text-white/35" />
                <p className="text-sm text-white/50">{tt('uploadPlaceholder')}</p>
              </div>

              <button className="mt-5 rounded-xl bg-[#5941ff] px-5 py-3 text-sm font-semibold text-white">
                {tt('saveLesson')}
              </button>
              {saved && <span className="ml-3 text-sm text-emerald-300">{tt('lessonSavedMsg')}</span>}
            </form>
          </section>

          <aside className="space-y-4">
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <BookOpen className="mb-2 h-5 w-5 text-[#8b7fff]" />
                <p className="text-2xl font-bold">{lessons.length}</p>
                <p className="text-xs text-white/40">{tt('uploadedLessons')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Upload className="mb-2 h-5 w-5 text-[#8b7fff]" />
                <p className="text-2xl font-bold">{COURSES.length}</p>
                <p className="text-xs text-white/40">{tt('activeCourses')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Users className="mb-2 h-5 w-5 text-[#8b7fff]" />
                <p className="text-2xl font-bold">128</p>
                <p className="text-xs text-white/40">{tt('studentsEnrolled')}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 font-semibold text-white">{tt('lessonList')}</h2>
              <div className="space-y-3">
                {lessons.length === 0 ? (
                  <p className="text-sm text-white/35">{tt('noMentorLessons')}</p>
                ) : lessons.map(lesson => {
                  const course = COURSES.find(c => c.id === lesson.courseId);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${lesson.courseId}`}
                      className="block rounded-2xl border border-white/8 bg-white/4 p-3 hover:border-[#5941ff]/30"
                    >
                      <p className="text-sm font-semibold text-white">{lesson.title}</p>
                      <p className="mt-1 text-xs text-white/35">{course?.title}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
