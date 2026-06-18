import { NextRequest, NextResponse } from 'next/server';
import { COURSES } from '@/lib/data/courses';
import { MOCK_OPPORTUNITIES } from '@/lib/data/opportunities';
import { generateRoadmap } from '@/lib/recommendations';
import type { AppLanguage, Course, CourseProgress, Opportunity, SavedOpportunity, StudentProfile } from '@/types/mentoria';

interface RequestBody {
  profile: StudentProfile;
  opportunities?: Opportunity[];
  courses?: Course[];
  savedOpportunities?: SavedOpportunity[];
  courseProgress?: CourseProgress[];
  language?: AppLanguage;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.profile) {
    return NextResponse.json({ error: 'Missing profile' }, { status: 400 });
  }

  const roadmap = generateRoadmap(
    body.profile,
    body.opportunities?.length ? body.opportunities : MOCK_OPPORTUNITIES,
    body.courses?.length ? body.courses : COURSES,
    {
      saved: body.savedOpportunities,
      progress: body.courseProgress,
      language: body.language,
    },
  );

  return NextResponse.json({ roadmap });
}
