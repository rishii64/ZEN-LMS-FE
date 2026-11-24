import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api.js';
import { useTenant } from '../context/TenantContext.js';
import { Course, Module, Lesson } from '../types/index.js';
import { 
  BookOpen, 
  Plus, 
  Layers, 
  FileText, 
  Video, 
  HelpCircle, 
  CheckCircle, 
  Eye, 
  Edit3, 
  ArrowLeft,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';

export const InstructorStudio: React.FC = () => {
  const { t, primaryColor } = useTenant();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // New Course Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Technology');
  const [newLevel, setNewLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');

  // New Module Modal
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');

  // New Lesson Modal
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<'MARKDOWN' | 'VIDEO' | 'QUIZ'>('MARKDOWN');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');

  // New Quiz Questions
  const [qText, setQText] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [correctOpt, setCorrectOpt] = useState(1);

  const fetchCourses = async () => {
    try {
      const data = await ApiClient.get('/courses');
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetail = async (id: string) => {
    try {
      const data = await ApiClient.get(`/courses/${id}`);
      setSelectedCourse(data);
    } catch (err) {
      console.error('Failed to load course details:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await ApiClient.post('/courses', {
        title: newTitle,
        description: newDesc,
        category: newCategory,
        level: newLevel
      });
      setShowCourseModal(false);
      setNewTitle('');
      setNewDesc('');
      fetchCourses();
      fetchCourseDetail(created.id);
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await ApiClient.put(`/courses/${course.id}`, { status: newStatus });
      fetchCourses();
      if (selectedCourse?.id === course.id) {
        setSelectedCourse({ ...selectedCourse, status: newStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update course status');
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await ApiClient.post(`/courses/${selectedCourse.id}/modules`, {
        title: moduleTitle
      });
      setShowModuleModal(false);
      setModuleTitle('');
      fetchCourseDetail(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'Failed to add module');
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !targetModuleId) return;
    try {
      const createdLesson = await ApiClient.post(`/courses/modules/${targetModuleId}/lessons`, {
        title: lessonTitle,
        contentType: lessonType,
        contentText: lessonContent,
        contentUrl: lessonVideoUrl
      });

      // If Quiz, also create assessment
      if (lessonType === 'QUIZ') {
        await ApiClient.post(`/courses/lessons/${createdLesson.id}/assessment`, {
          title: `${lessonTitle} Assessment`,
          passingScore: 70,
          questions: [
            {
              text: qText || 'Which of the following best describes this concept?',
              type: 'SINGLE_CHOICE',
              points: 1,
              options: [
                { text: opt1 || 'First comprehensive option', isCorrect: correctOpt === 1 },
                { text: opt2 || 'Second alternative option', isCorrect: correctOpt === 2 }
              ]
            }
          ]
        });
      }

      setShowLessonModal(false);
      setLessonTitle('');
      setLessonContent('');
      setLessonVideoUrl('');
      fetchCourseDetail(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'Failed to add lesson');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {selectedCourse ? (
        /* Course Curriculum Builder Detail View */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{selectedCourse.title}</h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedCourse.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {selectedCourse.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedCourse.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTogglePublish(selectedCourse)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  selectedCourse.status === 'PUBLISHED'
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedCourse.status === 'PUBLISHED' ? 'Unpublish to Draft' : 'Publish Course'}
              </button>
              <button
                onClick={() => setShowModuleModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Module</span>
              </button>
            </div>
          </div>

          {/* Curriculum Structure */}
          <div className="space-y-4">
            {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
              selectedCourse.modules.map((m, mIndex) => (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {mIndex + 1}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">{m.title}</h3>
                    </div>

                    <button
                      onClick={() => { setTargetModuleId(m.id); setShowLessonModal(true); }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lesson / Quiz</span>
                    </button>
                  </div>

                  {/* Lessons list */}
                  <div className="p-4 space-y-2">
                    {m.lessons && m.lessons.length > 0 ? (
                      m.lessons.map((l, lIndex) => (
                        <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 transition">
                          <div className="flex items-center gap-3">
                            {l.contentType === 'VIDEO' ? (
                              <Video className="w-4 h-4 text-rose-500" />
                            ) : l.contentType === 'QUIZ' ? (
                              <HelpCircle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-500" />
                            )}
                            <div>
                              <div className="text-xs font-bold text-slate-800">{l.title}</div>
                              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                                {l.contentType} • {l.durationMinutes} mins
                              </span>
                            </div>
                          </div>

                          {l.assessment && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                              Pass Mark: {l.assessment.passingScore}%
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No lessons added to this module yet.
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Curriculum Modules Yet</h4>
                <p className="text-xs text-slate-400 mt-1">Add your first module to assemble lessons and assessments.</p>
                <button
                  onClick={() => setShowModuleModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow"
                >
                  Create Module 1
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Course Catalog Management View */
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                {t('instructor', 'Instructor')} Course Studio
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Curriculum Authoring & Course Governance
              </h1>
            </div>

            <button
              onClick={() => setShowCourseModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New {t('course', 'Course')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between">
                <div>
                  {course.coverImageUrl ? (
                    <img src={course.coverImageUrl} alt={course.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center text-white">
                      <BookOpen className="w-12 h-12 opacity-40" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {course.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        course.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {course.status}
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
                  <button
                    onClick={() => handleTogglePublish(course)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => fetchCourseDetail(course.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <span>Curriculum Studio</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create New {t('course', 'Course')}</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Course Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Database Architecture"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Outline core objectives and curriculum..."
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Level</label>
                  <select
                    value={newLevel}
                    onChange={(e: any) => setNewLevel(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Curriculum Module</h3>
            <form onSubmit={handleAddModule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Module Title</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Module 3: Security & Access Control"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
                >
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Lesson Unit</h3>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. 3.1 Implementing Token Verification"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Content Type</label>
                <select
                  value={lessonType}
                  onChange={(e: any) => setLessonType(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                >
                  <option value="MARKDOWN">Interactive Reading (Markdown)</option>
                  <option value="VIDEO">Video Lecture (Embed URL)</option>
                  <option value="QUIZ">Graded Quiz / Assessment</option>
                </select>
              </div>

              {lessonType === 'MARKDOWN' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Markdown Content</label>
                  <textarea
                    rows={5}
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    placeholder="Write structured lesson text with headings, lists, and code blocks..."
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono text-xs"
                  />
                </div>
              )}

              {lessonType === 'VIDEO' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Video Embed URL</label>
                  <input
                    type="url"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              )}

              {lessonType === 'QUIZ' && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <div className="text-xs font-bold text-amber-900">Quiz Assessment Question</div>
                  <input
                    type="text"
                    required
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="Enter question prompt..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={opt1}
                      onChange={(e) => setOpt1(e.target.value)}
                      placeholder="Option 1"
                      className="px-2.5 py-1.5 text-xs rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      required
                      value={opt2}
                      onChange={(e) => setOpt2(e.target.value)}
                      placeholder="Option 2"
                      className="px-2.5 py-1.5 text-xs rounded border border-slate-300"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                    <span>Correct Answer:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={correctOpt === 1}
                        onChange={() => setCorrectOpt(1)}
                      />
                      Option 1
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={correctOpt === 2}
                        onChange={() => setCorrectOpt(2)}
                      />
                      Option 2
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
                >
                  Add Lesson Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
