/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Edit2, X, Check, ExternalLink, RotateCcw, BookOpen, Target, Bookmark, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { AppHeader } from '@/components/AppHeader';
import { MOCK_OPPORTUNITIES } from '@/lib/data/opportunities';
import { COURSES } from '@/lib/data/courses';
import { storage } from '@/lib/storage';
import type { Course, Opportunity, OpportunityCategory, OpportunityDirection, Format, Grade } from '@/types/mentoria';

const CATEGORIES: OpportunityCategory[] = ['Olympiad', 'Hackathon', 'Summer School', 'Research', 'Scholarship', 'Volunteering', 'Internship', 'University Prep'];
const DIRECTIONS: OpportunityDirection[] = ['STEM', 'Business', 'Social Impact', 'Finance', 'Programming', 'Science', 'English', 'University Admissions'];
const FORMATS: Format[] = ['Online', 'Offline', 'Hybrid'];
const ALL_GRADES: Grade[] = [8, 9, 10, 11];

const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  Olympiad: 'Олимпиада', Hackathon: 'Хакатон', 'Summer School': 'Летняя школа',
  Research: 'Исследования', Scholarship: 'Стипендия', Volunteering: 'Волонтёрство',
  Internship: 'Стажировка', 'University Prep': 'Подготовка к вузу',
};

const CATEGORY_DOTS: Record<OpportunityCategory, string> = {
  Olympiad: 'bg-violet-400', Hackathon: 'bg-blue-400', 'Summer School': 'bg-emerald-400',
  Research: 'bg-amber-400', Scholarship: 'bg-yellow-400', Volunteering: 'bg-green-400',
  Internship: 'bg-orange-400', 'University Prep': 'bg-pink-400',
};

const emptyForm = {
  title: '',
  category: '' as OpportunityCategory | '',
  direction: '' as OpportunityDirection | '',
  grades: [] as Grade[],
  format: '' as Format | '',
  deadline: '',
  description: '',
  requirements: '',
  tags: '',
};

type FormState = typeof emptyForm;

interface FormErrors {
  title?: string;
  category?: string;
  deadline?: string;
}

function validate(form: FormState, tt: (key: string) => string): FormErrors {
  const errs: FormErrors = {};
  if (!form.title.trim()) errs.title = tt('requiredField');
  if (!form.category) errs.category = tt('chooseCategoryErr');
  if (!form.deadline) errs.deadline = tt('setDeadlineErr');
  return errs;
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#5941ff]/15 border border-[#5941ff]/20 flex items-center justify-center text-[#5941ff] shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-white/45 text-xs mb-0.5">{label}</p>
        <p className="text-white font-bold text-2xl leading-none">{value}</p>
        {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { tt } = useI18n();
  const [customOpps, setCustomOpps] = useState<Opportunity[]>([]);
  const [customCourses, setCustomCourses] = useState<Course[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');

  useEffect(() => {
    setMounted(true);
    setCustomOpps(storage.getCustomOpportunities());
    setCustomCourses(storage.getCustomCourses());
    setSavedCount(storage.getSavedOpportunities().length);
  }, []);

  const allOpps = [...MOCK_OPPORTUNITIES, ...customOpps];
  const allCourses = [...COURSES, ...customCourses];
  const today = new Date().toISOString().slice(0, 10);
  const activeOppsCount = allOpps.filter(o => o.deadline >= today).length;
  const expiredCount = allOpps.filter(o => o.deadline < today).length;

  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleGradeToggle = (g: Grade) => {
    setForm(f => ({
      ...f,
      grades: f.grades.includes(g) ? f.grades.filter(x => x !== g) : [...f.grades, g],
    }));
  };

  const handleSubmit = () => {
    const errs = validate(form, tt);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const opp: Opportunity = {
      id: editingId ?? `custom-${Date.now()}`,
      title: form.title.trim(),
      category: form.category as OpportunityCategory,
      direction: (form.direction || 'STEM') as OpportunityDirection,
      grades: form.grades.length ? form.grades : [9, 10, 11],
      format: (form.format || 'Online') as Format,
      deadline: form.deadline,
      description: form.description.trim(),
      requirements: form.requirements.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    if (editingId) {
      storage.updateCustomOpportunity(editingId, opp);
      flashSuccess(tt('oppUpdatedMsg'));
    } else {
      storage.addCustomOpportunity(opp);
      flashSuccess(tt('oppAddedMsg'));
    }

    const updated = storage.getCustomOpportunities();
    setCustomOpps(updated);
    setForm(emptyForm);
    setErrors({});
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (opp: Opportunity) => {
    setForm({
      title: opp.title,
      category: opp.category,
      direction: opp.direction,
      grades: opp.grades,
      format: opp.format,
      deadline: opp.deadline,
      description: opp.description,
      requirements: opp.requirements.join(', '),
      tags: opp.tags.join(', '),
    });
    setEditingId(opp.id);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    storage.deleteCustomOpportunity(id);
    setCustomOpps(storage.getCustomOpportunities());
    setDeleteConfirm(null);
    flashSuccess(tt('deletedMsg'));
  };

  const handleReset = () => {
    storage.clearAll();
    setCustomOpps([]);
    setSavedCount(0);
    setResetConfirm(false);
    flashSuccess(tt('dataResetMsg'));
  };

  const handleAddCourse = () => {
    if (!courseTitle.trim()) return;
    const course: Course = {
      id: `custom-course-${Date.now()}`,
      title: courseTitle.trim(),
      description: courseDescription.trim() || tt('defaultCourseDesc'),
      level: 'Beginner',
      lessonCount: 1,
      estimatedHours: 2,
      tags: ['Mentoria', 'Custom'],
      lessons: [
        {
          id: `custom-lesson-${Date.now()}`,
          title: tt('introLessonTitle'),
          content: tt('introLessonContent'),
          order: 1,
        },
      ],
    };
    storage.addCustomCourse(course);
    setCustomCourses(storage.getCustomCourses());
    setCourseTitle('');
    setCourseDescription('');
    flashSuccess(tt('courseAddedMsg'));
  };

  const handleDeleteCourse = (id: string) => {
    storage.deleteCustomCourse(id);
    setCustomCourses(storage.getCustomCourses());
    flashSuccess(tt('courseDeletedMsg'));
  };

  const inputCls = (err?: string) =>
    `w-full bg-white/8 border ${err ? 'border-red-500/60' : 'border-white/15'} rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#5941ff]/60 transition-colors`;

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-10 flex items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-[#5941ff]/20 border border-[#5941ff]/30 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-[#5941ff]" />
          </div>
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Mentoria Hub</p>
            <h1 className="text-3xl font-bold text-white">{tt('adminTitle')}</h1>
            <p className="text-white/45 text-sm mt-1">{tt('adminSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 shadow-xl">
          <Check className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* Stats */}
        <section>
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 text-white/40">{tt('statsLabel')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={<Target className="w-5 h-5" />} label={tt('totalOpps')} value={allOpps.length} sub={`${MOCK_OPPORTUNITIES.length} base`} />
            <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label={tt('activeOpps')} value={activeOppsCount} />
            <StatCard icon={<AlertCircle className="w-5 h-5" />} label={tt('expiredDeadlines')} value={expiredCount} />
            <StatCard icon={<Plus className="w-5 h-5" />} label={tt('addedManually')} value={customOpps.length} />
            <StatCard icon={<BookOpen className="w-5 h-5" />} label={tt('courses')} value={allCourses.length} />
            <StatCard icon={<Bookmark className="w-5 h-5" />} label={tt('savedByStudents')} value={mounted ? savedCount : 0} />
          </div>
        </section>

        {/* Tools */}
        <section>
          <h2 className="text-white/40 font-semibold text-sm uppercase tracking-wider mb-4">{tt('quickActions')}</h2>

          {/* Featured: Mentor Portal */}
          <a
            href="/mentor"
            className="mb-4 flex items-center gap-5 rounded-2xl border border-[#8b7fff]/25 bg-[#8b7fff]/8 p-5 transition-colors hover:border-[#8b7fff]/40 hover:bg-[#8b7fff]/12 group"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#8b7fff]/30 bg-[#8b7fff]/15 text-[#8b7fff]">
              <Upload className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">Mentor Portal</p>
              <p className="text-sm text-white/50">{tt('mentorSubtitle')}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 shrink-0 transition-colors" />
          </a>

          <div className="flex flex-wrap gap-3">
            {[
              { href: '/opportunities', label: tt('opportunities') },
              { href: '/courses', label: tt('allCourses') },
              { href: '/calendar', label: tt('deadlineCalendar') },
              { href: '/', label: tt('homepageLink') },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 hover:text-white hover:border-white/20 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> {label}
              </a>
            ))}
          </div>
        </section>

        {/* Course management */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">{tt('courses')}</h2>
            <a href="/mentor" className="text-sm text-[#8b7fff] hover:text-white">{tt('addLessonsToMentor')}</a>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="mb-4 text-sm font-semibold text-white">{tt('newCourse')}</p>
              <input
                value={courseTitle}
                onChange={event => setCourseTitle(event.target.value)}
                placeholder={tt('newCourse')}
                className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25"
              />
              <textarea
                value={courseDescription}
                onChange={event => setCourseDescription(event.target.value)}
                placeholder={tt('fieldDescription')}
                className="mb-3 min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25"
              />
              <button onClick={handleAddCourse} className="rounded-xl bg-[#5941ff] px-4 py-2.5 text-sm font-semibold text-white">
                {tt('addCourse')}
              </button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="mb-4 text-sm font-semibold text-white">{tt('customCoursesLabel')}</p>
              <div className="space-y-2">
                {customCourses.length === 0 ? (
                  <p className="text-sm text-white/35">{tt('noCustomCourses')}</p>
                ) : customCourses.map(course => (
                  <div key={course.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/4 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{course.title}</p>
                      <p className="text-xs text-white/35">{course.lessons.length} {tt('lessons')}</p>
                    </div>
                    <button onClick={() => handleDeleteCourse(course.id)} className="rounded-lg px-2 py-1 text-xs text-red-300 hover:bg-red-500/10">
                      {tt('deleteBtn')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Add / Edit form */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">{tt('opportunities')}</h2>
            <button
              onClick={() => { setShowForm(s => !s); setForm(emptyForm); setEditingId(null); setErrors({}); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#5941ff] hover:bg-[#4730dd] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? tt('cancel') : tt('addOpportunity')}
            </button>
          </div>

          {showForm && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-5">
              <h3 className="text-white font-semibold">
                {editingId ? tt('editOpportunityTitle') : tt('newOpportunityTitle')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="text-white/50 text-xs mb-1.5 block">{tt('fieldTitle')} *</label>
                  <input
                    type="text"
                    placeholder={tt('placeholderTitle')}
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className={inputCls(errors.title)}
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block">{tt('category')} *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as OpportunityCategory }))}
                    className={`${inputCls(errors.category)} bg-[#0a0a0a]`}
                  >
                    <option value="">{tt('placeholderSelectCategory')}</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                  {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
                </div>

                {/* Direction */}
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block">{tt('fieldDirection')}</label>
                  <select
                    value={form.direction}
                    onChange={e => setForm(f => ({ ...f, direction: e.target.value as OpportunityDirection }))}
                    className={`${inputCls()} bg-[#0a0a0a]`}
                  >
                    <option value="">{tt('placeholderSelectDirection')}</option>
                    {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block">{tt('format')}</label>
                  <select
                    value={form.format}
                    onChange={e => setForm(f => ({ ...f, format: e.target.value as Format }))}
                    className={`${inputCls()} bg-[#0a0a0a]`}
                  >
                    <option value="">{tt('placeholderSelectFormat')}</option>
                    {FORMATS.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
                  </select>
                </div>

                {/* Deadline */}
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block">{tt('deadline')} *</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className={`${inputCls(errors.deadline)} bg-[#0a0a0a] [color-scheme:dark]`}
                  />
                  {errors.deadline && <p className="text-red-400 text-xs mt-1">{errors.deadline}</p>}
                </div>

                {/* Grades */}
                <div className="md:col-span-2">
                  <label className="text-white/50 text-xs mb-2 block">{tt('fieldGrades')}</label>
                  <div className="flex gap-2">
                    {ALL_GRADES.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleGradeToggle(g)}
                        className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                          form.grades.includes(g)
                            ? 'bg-[#5941ff] border-[#5941ff] text-white'
                            : 'bg-white/5 border-white/15 text-white/50 hover:border-white/30'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-white/50 text-xs mb-1.5 block">{tt('fieldDescription')}</label>
                  <textarea
                    rows={3}
                    placeholder={tt('placeholderDescription')}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className={`${inputCls()} resize-none`}
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block">{tt('fieldRequirements')} <span className="text-white/25">{tt('commaSeparatedHint')}</span></label>
                  <textarea
                    rows={2}
                    placeholder={tt('placeholderRequirements')}
                    value={form.requirements}
                    onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
                    className={`${inputCls()} resize-none`}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block">{tt('fieldTags')} <span className="text-white/25">{tt('commaSeparatedHint')}</span></label>
                  <textarea
                    rows={2}
                    placeholder={tt('placeholderTags')}
                    value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    className={`${inputCls()} resize-none`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-[#5941ff] hover:bg-[#4730dd] text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {editingId ? tt('submitSave') : tt('addOpportunity')}
                </button>
                <button
                  onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); setErrors({}); }}
                  className="px-5 py-2.5 bg-white/5 border border-white/15 hover:border-white/25 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
                >
                  {tt('cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Opportunities table */}
          <div className="border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/3">
                    <th className="text-left px-4 py-3 text-white/35 font-medium text-xs uppercase tracking-wider">{tt('tableTitle')}</th>
                    <th className="text-left px-4 py-3 text-white/35 font-medium text-xs uppercase tracking-wider hidden md:table-cell">{tt('category')}</th>
                    <th className="text-left px-4 py-3 text-white/35 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">{tt('deadline')}</th>
                    <th className="text-left px-4 py-3 text-white/35 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">{tt('format')}</th>
                    <th className="text-right px-4 py-3 text-white/35 font-medium text-xs uppercase tracking-wider">{tt('tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allOpps.map(opp => (
                    <tr key={opp.id} className={`hover:bg-white/3 transition-colors ${opp.isCustom ? 'bg-[#5941ff]/3' : ''}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_DOTS[opp.category]}`} />
                          <span className="text-white/80 font-medium leading-snug line-clamp-1">{opp.title}</span>
                          {opp.isCustom && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-[#5941ff]/20 text-[#8b7fff] shrink-0">custom</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-white/45 hidden md:table-cell">{CATEGORY_LABELS[opp.category]}</td>
                      <td className="px-4 py-3.5 text-white/45 hidden lg:table-cell">{opp.deadline}</td>
                      <td className="px-4 py-3.5 text-white/45 hidden lg:table-cell">{opp.format}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {opp.isCustom ? (
                            <>
                              <button
                                onClick={() => handleEdit(opp)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                aria-label={tt('editBtn')}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {deleteConfirm === opp.id ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleDelete(opp.id)}
                                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                    aria-label={tt('confirmDeleteAriaLabel')}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                    aria-label={tt('cancel')}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(opp.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/15 text-white/40 hover:text-red-400 transition-colors"
                                  aria-label={tt('deleteBtn')}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-white/20 text-xs px-2" title={tt('systemRecordTitle')}>{tt('systemRecordLabel')}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Courses section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">{tt('courses')}</h2>
            <span className="text-white/30 text-xs px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              {tt('comingSoonManagement')}
            </span>
          </div>

          <div className="border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="text-left px-4 py-3 text-white/35 font-medium text-xs uppercase tracking-wider">{tt('tableCourse')}</th>
                  <th className="text-left px-4 py-3 text-white/35 font-medium text-xs uppercase tracking-wider hidden md:table-cell">{tt('tableLevel')}</th>
                  <th className="text-left px-4 py-3 text-white/35 font-medium text-xs uppercase tracking-wider hidden md:table-cell">{tt('lessons')}</th>
                  <th className="text-left px-4 py-3 text-white/35 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">{tt('tableHours')}</th>
                  <th className="text-right px-4 py-3 text-white/35 font-medium text-xs uppercase tracking-wider">{tt('tableActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {COURSES.map(course => (
                  <tr key={course.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="text-white/80 font-medium line-clamp-1">{course.title}</span>
                    </td>
                    <td className="px-4 py-3.5 text-white/45 hidden md:table-cell">{course.level}</td>
                    <td className="px-4 py-3.5 text-white/45 hidden md:table-cell">{course.lessons.length}</td>
                    <td className="px-4 py-3.5 text-white/45 hidden lg:table-cell">{course.estimatedHours} {tt('hoursAbbrev')}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        disabled
                        title={tt('comingSoonTitle')}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/25 cursor-not-allowed"
                      >
                        {tt('editBtn')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h2 className="text-white/40 font-semibold text-sm uppercase tracking-wider mb-4">{tt('dangerZoneHeading')}</h2>
          <div className="border border-red-500/20 rounded-2xl p-5 bg-red-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-white font-medium text-sm mb-1 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-red-400" /> {tt('resetDemoDataTitle')}
                </p>
                <p className="text-white/40 text-xs leading-relaxed max-w-sm">
                  {tt('resetDemoDataDesc')}
                </p>
              </div>
              {resetConfirm ? (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {tt('confirmResetBtn')}
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="px-4 py-2 bg-white/5 border border-white/15 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
                  >
                    {tt('cancel')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setResetConfirm(true)}
                  className="shrink-0 px-4 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm font-medium rounded-xl transition-colors"
                >
                  {tt('resetDataBtn')}
                </button>
              )}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
