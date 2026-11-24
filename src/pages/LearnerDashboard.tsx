import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useTenant } from '../context/TenantContext.js';
import { Course, Enrollment, Certificate } from '../types/index.js';
import { CertificateModal } from '../components/CertificateModal.js';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  Award, 
  ArrowRight, 
  Sparkles,
  Layers,
  Search
} from 'lucide-react';

export const LearnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, primaryColor, organizationName } = useTenant();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        ApiClient.get('/courses'),
        ApiClient.get('/enrollments/my')
      ]);
      setCourses(coursesData);
      setEnrollments(enrollmentsData);
    } catch (err) {
      console.error('Failed to load learner catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelfEnroll = async (courseId: string) => {
    try {
      await ApiClient.post('/enrollments/self', { courseId });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to enroll');
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Personalized Welcome Banner */}
      <div 
        className="rounded-3xl p-8 text-white relative overflow-hidden shadow-lg"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, #0f172a)` }}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back to {organizationName}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hi, {user?.firstName}!
          </h1>
          <p className="mt-2 text-sm text-white/80 leading-relaxed">
            Continue where you left off, expand your competencies, and earn verified {t('credential', 'Certificates')}.
          </p>
        </div>
      </div>

      {/* ACTIVE ENROLLMENTS: CONTINUE LEARNING */}
      {enrollments.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-600" />
              <span>Continue Learning</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {enrollments.filter(e => e.status !== 'COMPLETED').length} in progress
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enr) => (
              <div 
                key={enr.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {enr.course?.category || 'General'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      enr.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {enr.status === 'COMPLETED' ? 'Completed' : `${enr.progressPct}% Done`}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                    {enr.course?.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {enr.course?.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Curriculum Progress</span>
                      <span>{enr.progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${enr.progressPct}%`, backgroundColor: primaryColor }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {enr.status === 'COMPLETED' && enr.certificate ? (
                    <button
                      onClick={() => setActiveCert(enr.certificate!)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800"
                    >
                      <Award className="w-4 h-4" />
                      <span>View Credential</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {enr.progressPct === 0 ? 'Not started' : 'In progress'}
                    </span>
                  )}

                  <Link
                    to={`/learn/${enr.courseId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                  >
                    <span>{enr.progressPct === 100 ? 'Review Course' : 'Resume'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CATALOG BROWSER */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Available {t('courses', 'Courses')} Catalog</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore courses curated for your department and role at {organizationName}.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div 
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div>
                {course.coverImageUrl ? (
                  <img src={course.coverImageUrl} alt={course.title} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-slate-800 flex items-center justify-center text-white">
                    <BookOpen className="w-10 h-10 opacity-30" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {course.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {course.level}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{course.description}</p>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.estimatedHours} hrs
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {course._count?.modules || 0} Modules
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                {course.isEnrolled ? (
                  <Link
                    to={`/learn/${course.id}`}
                    className="w-full py-2 text-center text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Go to Classroom →
                  </Link>
                ) : (
                  <button
                    onClick={() => handleSelfEnroll(course.id)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Credential Modal */}
      <CertificateModal
        certificate={activeCert}
        onClose={() => setActiveCert(null)}
      />
    </div>
  );
};
