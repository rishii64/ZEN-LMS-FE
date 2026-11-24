import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useTenant } from '../context/TenantContext.js';
import { Course, Lesson, Certificate } from '../types/index.js';
import { CertificateModal } from '../components/CertificateModal.js';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  FileText, 
  Video, 
  HelpCircle, 
  Award, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const CoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { t, primaryColor } = useTenant();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  // Quiz state
  const [assessmentData, setAssessmentData] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const fetchCourse = async () => {
    if (!courseId) return;
    try {
      const data = await ApiClient.get(`/courses/${courseId}`);
      setCourse(data);

      // Find first uncompleted lesson or first lesson overall
      let targetLesson = activeLesson;
      if (!targetLesson && data.modules?.length > 0) {
        for (const m of data.modules) {
          if (m.lessons?.length > 0) {
            targetLesson = m.lessons[0];
            break;
          }
        }
      }
      setActiveLesson(targetLesson);

      if (targetLesson?.contentType === 'QUIZ' && targetLesson.assessment) {
        loadAssessment(targetLesson.assessment.id);
      }
    } catch (err) {
      console.error('Failed to load course player:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessment = async (assessmentId: string) => {
    try {
      const data = await ApiClient.get(`/assessments/${assessmentId}`);
      setAssessmentData(data);
      setSelectedAnswers({});
      setQuizResult(null);
    } catch (err) {
      console.error('Failed to load assessment details:', err);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setQuizResult(null);
    if (lesson.contentType === 'QUIZ' && lesson.assessment) {
      loadAssessment(lesson.assessment.id);
    }
  };

  const handleMarkComplete = async (lesson: Lesson) => {
    if (!course) return;
    try {
      const res = await ApiClient.post('/progress/lesson', {
        courseId: course.id,
        lessonId: lesson.id,
        isCompleted: true
      });
      // Refresh course to update progress percentages and check certificate
      await fetchCourse();
      if (res.enrollment?.certificate) {
        setActiveCert(res.enrollment.certificate);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update progress');
    }
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentData || !course) return;
    setSubmittingQuiz(true);
    try {
      const res = await ApiClient.post(`/assessments/${assessmentData.id}/submit`, {
        courseId: course.id,
        answers: selectedAnswers
      });
      setQuizResult(res);
      await fetchCourse();
    } catch (err: any) {
      alert(err.message || 'Failed to submit assessment');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    const progressList = course?.enrollment?.lessonProgress;
    if (!progressList) return false;
    const item = progressList.find(p => p.lessonId === lessonId);
    return Boolean(item?.isCompleted);
  };

  const enrollment = course?.enrollment;
  const progressPct = enrollment?.progressPct || 0;

  if (loading || !course) {
    return <div className="p-12 text-center text-slate-500 text-sm">Loading classroom experience...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Learning Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/learner"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <h1 className="text-sm font-bold text-white truncate max-w-md">
            {course.title}
          </h1>
        </div>

        {/* Progress Display */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">{progressPct}% Complete</span>
            <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%`, backgroundColor: primaryColor }}
              />
            </div>
          </div>

          {progressPct >= 100 && enrollment?.certificate && (
            <button
              onClick={() => setActiveCert(enrollment.certificate!)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition animate-bounce"
            >
              <Award className="w-4 h-4" />
              <span>Claim {t('credential', 'Certificate')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Classroom Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Curriculum Sidebar */}
        <aside className="w-full md:w-80 bg-slate-950/70 border-r border-slate-800 overflow-y-auto shrink-0 flex flex-col justify-between">
          <div className="p-4 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Curriculum Lessons
            </div>

            <div className="space-y-4">
              {course.modules?.map((m, mIndex) => (
                <div key={m.id} className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    {m.title}
                  </div>
                  <div className="space-y-1">
                    {m.lessons?.map((l) => {
                      const completed = isLessonCompleted(l.id);
                      const isActive = activeLesson?.id === l.id;
                      return (
                        <button
                          key={l.id}
                          onClick={() => handleSelectLesson(l)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                            isActive 
                              ? 'bg-blue-600 text-white font-bold' 
                              : 'text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                            )}
                            <span className="truncate">{l.title}</span>
                          </div>

                          {l.contentType === 'VIDEO' && <Video className="w-3.5 h-3.5 opacity-60" />}
                          {l.contentType === 'QUIZ' && <HelpCircle className="w-3.5 h-3.5 opacity-60" />}
                          {l.contentType === 'MARKDOWN' && <FileText className="w-3.5 h-3.5 opacity-60" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 bg-slate-900 p-6 md:p-12 overflow-y-auto">
          {activeLesson ? (
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Lesson Title Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {activeLesson.contentType}
                    </span>
                    <span className="text-xs text-slate-400">
                      Duration: {activeLesson.durationMinutes} minutes
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white mt-1">
                    {activeLesson.title}
                  </h2>
                </div>

                {!isLessonCompleted(activeLesson.id) && activeLesson.contentType !== 'QUIZ' && (
                  <button
                    onClick={() => handleMarkComplete(activeLesson)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete & Next</span>
                  </button>
                )}
              </div>

              {/* VIDEO LESSON */}
              {activeLesson.contentType === 'VIDEO' && (
                <div className="space-y-4">
                  {activeLesson.contentUrl ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
                      <iframe
                        src={activeLesson.contentUrl}
                        title={activeLesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                      No video source configured.
                    </div>
                  )}

                  {activeLesson.contentText && (
                    <div className="p-4 bg-slate-950/40 rounded-xl text-sm text-slate-300 leading-relaxed">
                      {activeLesson.contentText}
                    </div>
                  )}
                </div>
              )}

              {/* MARKDOWN LESSON */}
              {activeLesson.contentType === 'MARKDOWN' && (
                <div className="prose prose-invert max-w-none bg-slate-950/30 p-8 rounded-2xl border border-slate-800/60 leading-relaxed text-slate-300">
                  <div className="whitespace-pre-line text-sm leading-7">
                    {activeLesson.contentText || 'No content provided for this reading unit.'}
                  </div>
                </div>
              )}

              {/* QUIZ ASSESSMENT */}
              {activeLesson.contentType === 'QUIZ' && (
                <div className="bg-slate-950/60 p-8 rounded-2xl border border-slate-800 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-amber-400" />
                      <span>{assessmentData?.title || 'Knowledge Assessment'}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Passing Benchmark: {assessmentData?.passingScore || 70}% correct answers required.
                    </p>
                  </div>

                  {quizResult && (
                    <div className={`p-4 rounded-xl border ${
                      quizResult.isPassed 
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    }`}>
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {quizResult.isPassed ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span>Score Achieved: {quizResult.score}% ({quizResult.isPassed ? 'PASSED' : 'NOT PASSED'})</span>
                      </div>
                      <p className="text-xs mt-1 text-slate-300">{quizResult.feedback}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmitQuiz} className="space-y-6">
                    {assessmentData?.questions?.map((q: any, idx: number) => (
                      <div key={q.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="text-sm font-semibold text-white flex items-start gap-2">
                          <span className="text-slate-500">{idx + 1}.</span>
                          <span>{q.text}</span>
                        </div>

                        <div className="space-y-2 pl-4">
                          {q.options?.map((opt: any) => (
                            <label 
                              key={opt.id} 
                              className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition ${
                                selectedAnswers[q.id] === opt.id
                                  ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                                  : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={opt.id}
                                checked={selectedAnswers[q.id] === opt.id}
                                onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: opt.id })}
                                className="accent-blue-500"
                              />
                              <span>{opt.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={submittingQuiz || (assessmentData?.questions?.length || 0) === 0}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                      >
                        {submittingQuiz ? 'Submitting & Evaluating...' : 'Submit Answers'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500 text-sm">
              Select a lesson from the curriculum sidebar to begin.
            </div>
          )}
        </main>
      </div>

      {/* Official Certificate Modal */}
      <CertificateModal
        certificate={activeCert}
        onClose={() => setActiveCert(null)}
      />
    </div>
  );
};
