/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, Printer } from 'lucide-react';
import { COURSES } from '@/lib/data/courses';
import { isCourseComplete, makeCertificate } from '@/lib/mvp';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { AppHeader } from '@/components/AppHeader';
import type { Certificate, CourseProgress, StudentProfile } from '@/types/mentoria';

export default function CertificatesPage() {
  const { tt } = useI18n();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const prof = storage.getProfile();
    const progressItems = storage.getCourseProgress();
    const issued = storage.getCertificates();
    setProfile(prof);
    setProgress(progressItems);
    setCertificates(issued);
    setMounted(true);
  }, []);

  const available = useMemo(() => {
    if (!profile) return certificates;
    const generated = COURSES
      .filter(course => isCourseComplete(course, progress.find(p => p.courseId === course.id)))
      .map(course => certificates.find(c => c.courseId === course.id) ?? makeCertificate(profile, course));
    return generated.filter((certificate, index, arr) => arr.findIndex(c => c.courseId === certificate.courseId) === index);
  }, [certificates, profile, progress]);

  const issue = (certificate: Certificate) => {
    storage.addCertificate(certificate);
    setCertificates(storage.getCertificates());
  };

  if (!mounted) return <main className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader className="print:hidden" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link href="/dashboard" className="text-sm text-white/40 hover:text-white print:hidden">← {tt('backDashboard')}</Link>
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between print:hidden">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#8b7fff]">Mentoria credentials</p>
            <h1 className="text-3xl font-bold md:text-5xl">{tt('certificatesTitle')}</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/55">
              {tt('noCertText')}
            </p>
          </div>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-[#5941ff] px-5 py-3 text-sm font-semibold text-white">
            <Printer className="h-4 w-4" /> {tt('printPdf')}
          </button>
        </div>

        {available.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 px-4 py-20 text-center print:hidden">
            <p className="text-5xl">🎓</p>
            <h2 className="mt-4 text-xl font-bold text-white">{tt('noCertTitle')}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">{tt('noCertText')}</p>
            <Link href="/courses" className="mt-6 inline-flex rounded-xl bg-[#5941ff] px-5 py-3 text-sm font-semibold text-white">
              {tt('goToCourses')}
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6">
            {available.map(certificate => {
              const issued = certificates.some(c => c.courseId === certificate.courseId);
              return (
                <section key={certificate.courseId} className="rounded-[28px] border border-[#5941ff]/30 bg-[#f7f5ef] p-2 text-black shadow-2xl print:break-after-page">
                  <div className="rounded-[22px] border border-black/15 p-8 md:p-12">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#5941ff]">Mentoria Hub</p>
                        <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">Certificate</h2>
                        <p className="mt-3 text-sm text-black/55">This certifies successful completion of the asynchronous Mentoria course.</p>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-widest text-black/40">Certificate ID</p>
                        <p className="font-mono text-sm font-semibold">{certificate.id}</p>
                      </div>
                    </div>
                    <div className="my-10 h-px bg-black/15" />
                    <p className="text-sm uppercase tracking-widest text-black/45">Awarded to</p>
                    <p className="mt-2 text-3xl font-bold">{certificate.studentName}</p>
                    <p className="mt-8 text-sm uppercase tracking-widest text-black/45">Course</p>
                    <p className="mt-2 text-2xl font-semibold">{certificate.courseName}</p>
                    <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-black/40">Completion date</p>
                        <p className="font-semibold">{new Date(certificate.issuedAt).toLocaleDateString('ru-RU')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Mentoria Hub</p>
                        <p className="text-sm text-black/45">Student Growth Command Center</p>
                      </div>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-2 print:hidden">
                      {!issued && (
                        <button onClick={() => issue(certificate)} className="rounded-xl bg-[#5941ff] px-4 py-2 text-sm font-semibold text-white">
                          {tt('getCertificate')}
                        </button>
                      )}
                      <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-black/15 px-4 py-2 text-sm font-semibold">
                        <Download className="h-4 w-4" /> {tt('printPdf')}
                      </button>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
