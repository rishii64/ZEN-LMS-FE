import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, Play, Plus, Send, Calendar } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuthContext } from '../../hooks/useAuthContext.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Modal, StatusBadge, LoadingSkeleton } from '../../components/ui/Primitives.jsx';

export function CoursesCatalogPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const { terminology, hasPermission } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', code: '', summary: '', deliveryMode: 'self_paced', estimatedMinutes: 60, isMandatory: false });

  const q = useQuery({ queryKey: ['courses'], queryFn: () => api.get('/courses') });

  const createMut = useMutation({
    mutationFn: (p) => api.post('/courses', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      setOpen(false);
      setForm({ title: '', code: '', summary: '', deliveryMode: 'self_paced', estimatedMinutes: 60, isMandatory: false });
      addToast({ title: `${terminology.course} created`, message: 'Saved as draft.', type: 'success' });
    },
    onError: (err) => addToast({ title: 'Error', message: err.message, type: 'error' })
  });

  const transitionMut = useMutation({
    mutationFn: ({ id, action }) => api.post(`/courses/${id}/transition`, { action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      addToast({ title: 'Workflow updated', message: 'Course status transitioned.', type: 'success' });
    },
    onError: (err) => addToast({ title: 'Error', message: err.message, type: 'error' })
  });

  const enrollSelfMut = useMutation({
    mutationFn: (courseId) => api.post('/enrollments', { courseId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      addToast({ title: 'Enrolled', message: 'You are now enrolled in this course.', type: 'success' });
    },
    onError: (err) => addToast({ title: 'Enrollment failed', message: err.message, type: 'error' })
  });

  if (q.isLoading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{terminology.courses} Catalog</h1>
          <p className="text-sm text-slate-500">Author, review, publish, and enroll in structured learning courses.</p>
        </div>
        {hasPermission('courses', 'create') && (
          <button className="btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New {terminology.course}</button>
        )}
      </div>

      <DataTable
        data={q.data?.data || []}
        searchPlaceholder={`Search ${terminology.courses.toLowerCase()}...`}
        columns={[
          {
            key: 'title',
            label: terminology.course,
            render: (r) => (
              <div>
                <Link to={`/courses/${r.id}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">{r.title}</Link>
                <p className="text-xs text-slate-500">{r.code || '—'} · {r.lessons_count} lessons · {r.estimated_minutes} min</p>
              </div>
            )
          },
          { key: 'delivery_mode', label: 'Delivery', render: (r) => <span className="capitalize text-xs">{r.delivery_mode.replace('_', ' ')}</span> },
          { key: 'enrolled_count', label: 'Enrolled' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (r) => (
              <div className="flex flex-wrap gap-1.5">
                <Link to={`/courses/${r.id}`} className="btn-secondary px-2.5 py-1 text-xs">Open</Link>
                {r.status === 'published' && (
                  <button className="btn-primary px-2.5 py-1 text-xs" onClick={() => enrollSelfMut.mutate(r.id)}>Enroll</button>
                )}
                {r.status === 'draft' && hasPermission('courses', 'edit') && (
                  <button className="btn-secondary px-2.5 py-1 text-xs" onClick={() => transitionMut.mutate({ id: r.id, action: 'submit_review' })}>Submit Review</button>
                )}
                {r.status === 'in_review' && hasPermission('courses', 'approve') && (
                  <button className="btn-secondary px-2.5 py-1 text-xs" onClick={() => transitionMut.mutate({ id: r.id, action: 'approve' })}>Approve</button>
                )}
                {['draft', 'in_review', 'approved'].includes(r.status) && hasPermission('courses', 'publish') && (
                  <button className="btn-primary px-2.5 py-1 text-xs" onClick={() => transitionMut.mutate({ id: r.id, action: 'publish' })}>Publish</button>
                )}
              </div>
            )
          }
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={`Create ${terminology.course}`}>
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-3">
          <input className="input-field" required placeholder="Course Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="input-field" placeholder="Course Code (e.g. SEC-102)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <textarea className="input-field" rows={3} placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <select className="input-field" value={form.deliveryMode} onChange={(e) => setForm({ ...form, deliveryMode: e.target.value })}>
              <option value="self_paced">Self-paced</option>
              <option value="instructor_led">Instructor-led</option>
              <option value="virtual_live">Virtual Live</option>
              <option value="blended">Blended</option>
            </select>
            <input type="number" className="input-field" min={5} value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.isMandatory} onChange={(e) => setForm({ ...form, isMandatory: e.target.checked })} />
            Mandatory compliance training
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create {terminology.course}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function CourseDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const { hasPermission } = useAuthContext();
  const [modTitle, setModTitle] = useState('');
  const [lessonForm, setLessonForm] = useState({ moduleId: '', title: '', contentType: 'text', bodyMarkdown: '', externalUrl: '', durationMinutes: 15 });
  const [activeLesson, setActiveLesson] = useState(null);

  const courseQ = useQuery({ queryKey: ['course', id], queryFn: () => api.get(`/courses/${id}`) });
  const myEnrollQ = useQuery({ queryKey: ['enrollments', 'mine'], queryFn: () => api.get('/enrollments?mine=true') });

  const myEnrollment = (myEnrollQ.data?.data || []).find((e) => e.course_id === id);

  const progressQ = useQuery({
    queryKey: ['progress', myEnrollment?.id],
    queryFn: () => api.get(`/progress/enrollment/${myEnrollment.id}`),
    enabled: Boolean(myEnrollment?.id)
  });

  const addModMut = useMutation({
    mutationFn: (title) => api.post(`/courses/${id}/modules`, { title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', id] });
      setModTitle('');
      addToast({ title: 'Module added', message: 'Course structure updated.', type: 'success' });
    }
  });

  const addLessonMut = useMutation({
    mutationFn: (p) => api.post(`/courses/${id}/modules/${p.moduleId}/lessons`, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', id] });
      setLessonForm({ moduleId: '', title: '', contentType: 'text', bodyMarkdown: '', externalUrl: '', durationMinutes: 15 });
      addToast({ title: 'Lesson added', message: 'Lesson saved to module.', type: 'success' });
    }
  });

  const completeLessonMut = useMutation({
    mutationFn: (lessonId) => api.post('/progress/lesson', {
      enrollmentId: myEnrollment.id,
      lessonId,
      isCompleted: true,
      timeSpentSeconds: 300
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['progress', myEnrollment.id] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      addToast({
        title: 'Progress recorded',
        message: `Course completion: ${res.data.completion.completion_percent}%`,
        type: 'success'
      });
    }
  });

  if (courseQ.isLoading) return <LoadingSkeleton rows={6} />;
  const course = courseQ.data?.data;
  const completedSet = new Set((progressQ.data?.data?.lessons || []).filter((l) => l.is_completed).map((l) => l.lesson_id));
  const completionPct = progressQ.data?.data?.completion?.completion_percent ?? myEnrollment?.completion_percent ?? 0;

  return (
    <div className="space-y-6">
      <div className="card p-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <StatusBadge status={course.status} />
          </div>
          <p className="text-sm text-slate-500 mt-1">{course.summary || course.description}</p>
        </div>
        {myEnrollment && (
          <div className="min-w-[200px]">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Your Completion</span>
              <span>{completionPct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curriculum Tree */}
        <div className="space-y-4">
          {(course.modules || []).map((mod) => (
            <div key={mod.id} className="card p-4 space-y-2">
              <h3 className="text-sm font-bold">{mod.title}</h3>
              <div className="space-y-1">
                {(mod.lessons || []).map((lesson) => {
                  const done = completedSet.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition ${
                        activeLesson?.id === lesson.id ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Play className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        <span className="truncate">{lesson.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{lesson.duration_minutes}m</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {hasPermission('courses', 'edit') && (
            <form onSubmit={(e) => { e.preventDefault(); addModMut.mutate(modTitle); }} className="card p-4 space-y-2">
              <p className="text-xs font-semibold">Add Module</p>
              <input className="input-field" required placeholder="Module title" value={modTitle} onChange={(e) => setModTitle(e.target.value)} />
              <button className="btn-secondary w-full text-xs">Add Module</button>
            </form>
          )}
        </div>

        {/* Lesson Player & Authoring */}
        <div className="lg:col-span-2 space-y-4">
          {activeLesson ? (
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-semibold text-blue-600">{activeLesson.content_type}</span>
                  <h2 className="text-xl font-bold">{activeLesson.title}</h2>
                </div>
                {myEnrollment && (
                  <button
                    onClick={() => completeLessonMut.mutate(activeLesson.id)}
                    disabled={completedSet.has(activeLesson.id) || completeLessonMut.isPending}
                    className="btn-primary"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {completedSet.has(activeLesson.id) ? 'Completed' : 'Mark Complete'}
                  </button>
                )}
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
                {activeLesson.body_markdown || activeLesson.external_url || 'Content unit ready.'}
              </div>
              {activeLesson.transcript && (
                <details className="text-xs text-slate-500">
                  <summary className="cursor-pointer font-semibold">View Transcript</summary>
                  <p className="mt-2">{activeLesson.transcript}</p>
                </details>
              )}
            </div>
          ) : (
            <div className="card p-10 text-center text-sm text-slate-500">
              Select a lesson on the left to start learning.
            </div>
          )}

          {hasPermission('courses', 'edit') && (course.modules || []).length > 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const moduleId = lessonForm.moduleId || course.modules[0].id;
                addLessonMut.mutate({ ...lessonForm, moduleId });
              }}
              className="card p-5 space-y-3"
            >
              <h3 className="text-sm font-semibold">Add Lesson Unit</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select className="input-field" value={lessonForm.moduleId || course.modules[0].id} onChange={(e) => setLessonForm({ ...lessonForm, moduleId: e.target.value })}>
                  {course.modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
                <input className="input-field" required placeholder="Lesson title" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
                <select className="input-field" value={lessonForm.contentType} onChange={(e) => setLessonForm({ ...lessonForm, contentType: e.target.value })}>
                  <option value="text">Text / Article</option>
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video</option>
                  <option value="presentation">Presentation</option>
                  <option value="audio">Audio</option>
                  <option value="external_link">External Link</option>
                </select>
              </div>
              <textarea className="input-field" rows={3} placeholder="Lesson content / markdown..." value={lessonForm.bodyMarkdown} onChange={(e) => setLessonForm({ ...lessonForm, bodyMarkdown: e.target.value })} />
              <button className="btn-primary text-xs">Save Lesson</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function LearningPathsPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const { hasPermission } = useAuthContext();
  const [title, setTitle] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);

  const lpQ = useQuery({ queryKey: ['learning-paths'], queryFn: () => api.get('/learning-paths') });
  const coursesQ = useQuery({ queryKey: ['courses'], queryFn: () => api.get('/courses') });

  const createMut = useMutation({
    mutationFn: (p) => api.post('/learning-paths', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learning-paths'] });
      setTitle('');
      setSelectedCourses([]);
      addToast({ title: 'Learning path created', message: 'Program saved.', type: 'success' });
    }
  });

  const enrollMut = useMutation({
    mutationFn: (id) => api.post(`/learning-paths/${id}/enroll`, {}),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      addToast({ title: 'Enrolled in program', message: `Enrolled in ${res.enrolledCount} course(s).`, type: 'success' });
    }
  });

  if (lpQ.isLoading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Learning Paths & Programs</h1>

      {hasPermission('learning_paths', 'create') && (
        <form
          onSubmit={(e) => { e.preventDefault(); createMut.mutate({ title, courseIds: selectedCourses }); }}
          className="card p-5 space-y-3"
        >
          <h3 className="text-sm font-semibold">Create Learning Path</h3>
          <input className="input-field" required placeholder="Program title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {(coursesQ.data?.data || []).map((c) => (
              <label key={c.id} className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCourses.includes(c.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedCourses([...selectedCourses, c.id]);
                    else setSelectedCourses(selectedCourses.filter((x) => x !== c.id));
                  }}
                />
                {c.title}
              </label>
            ))}
          </div>
          <button className="btn-primary">Create Program</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(lpQ.data?.data || []).map((lp) => (
          <div key={lp.id} className="card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold">{lp.title}</h3>
                <p className="text-xs text-slate-500">{(lp.items || []).length} courses</p>
              </div>
              <button className="btn-primary text-xs px-3 py-1.5" onClick={() => enrollMut.mutate(lp.id)}>Enroll in Path</button>
            </div>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {(lp.items || []).map((item, idx) => (
                <li key={item.id}>{idx + 1}. {item.course_title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EnrollmentsSessionsPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const { terminology, hasPermission } = useAuthContext();
  const [assignForm, setAssignForm] = useState({ courseId: '', departmentId: '' });
  const [sessionForm, setSessionForm] = useState({ courseId: '', title: '', meetingUrl: '', startsAt: '', endsAt: '' });

  const enrQ = useQuery({ queryKey: ['enrollments'], queryFn: () => api.get('/enrollments') });
  const sessQ = useQuery({ queryKey: ['sessions'], queryFn: () => api.get('/enrollments/sessions') });
  const coursesQ = useQuery({ queryKey: ['courses'], queryFn: () => api.get('/courses') });
  const deptsQ = useQuery({ queryKey: ['org', 'depts'], queryFn: () => api.get('/departments') });

  const assignMut = useMutation({
    mutationFn: (p) => api.post('/enrollments', p),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      addToast({ title: 'Assigned', message: `Created ${res.data.length} enrollment(s).`, type: 'success' });
    },
    onError: (err) => addToast({ title: 'Error', message: err.message, type: 'error' })
  });

  const sessMut = useMutation({
    mutationFn: (p) => api.post('/enrollments/sessions', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      setSessionForm({ courseId: '', title: '', meetingUrl: '', startsAt: '', endsAt: '' });
      addToast({ title: 'Live session scheduled', message: 'Added to learning calendar.', type: 'success' });
    }
  });

  if (enrQ.isLoading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Enrollments & Live Training Sessions</h1>

      {hasPermission('enrollments', 'create') && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            assignMut.mutate({ courseId: assignForm.courseId, departmentId: assignForm.departmentId || undefined });
          }}
          className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">{terminology.course}</label>
            <select className="input-field" required value={assignForm.courseId} onChange={(e) => setAssignForm({ ...assignForm, courseId: e.target.value })}>
              <option value="">Select course...</option>
              {(coursesQ.data?.data || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Assign to {terminology.department} (optional)</label>
            <select className="input-field" value={assignForm.departmentId} onChange={(e) => setAssignForm({ ...assignForm, departmentId: e.target.value })}>
              <option value="">Self-enrollment</option>
              {(deptsQ.data?.data || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <button className="btn-primary"><Send className="w-4 h-4" /> Assign Learning</button>
        </form>
      )}

      <DataTable
        data={enrQ.data?.data || []}
        searchPlaceholder="Search enrollments..."
        columns={[
          { key: 'learner_name', label: terminology.learner },
          { key: 'course_title', label: terminology.course, render: (r) => <Link to={`/courses/${r.course_id}`} className="text-blue-600 hover:underline font-medium">{r.course_title}</Link> },
          { key: 'department_name', label: terminology.department },
          { key: 'completion_percent', label: 'Progress', render: (r) => `${r.completion_percent || 0}%` },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> }
        ]}
      />

      {/* Live Sessions */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600" /> Live Training Calendar</h3>
        {hasPermission('courses', 'edit') && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sessMut.mutate({
                ...sessionForm,
                startsAt: new Date(sessionForm.startsAt).toISOString(),
                endsAt: new Date(sessionForm.endsAt).toISOString()
              });
            }}
            className="grid grid-cols-1 sm:grid-cols-5 gap-2"
          >
            <select className="input-field" required value={sessionForm.courseId} onChange={(e) => setSessionForm({ ...sessionForm, courseId: e.target.value })}>
              <option value="">Course...</option>
              {(coursesQ.data?.data || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input className="input-field" required placeholder="Session title" value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} />
            <input className="input-field" placeholder="Meeting URL" value={sessionForm.meetingUrl} onChange={(e) => setSessionForm({ ...sessionForm, meetingUrl: e.target.value })} />
            <input type="datetime-local" className="input-field" required value={sessionForm.startsAt} onChange={(e) => setSessionForm({ ...sessionForm, startsAt: e.target.value })} />
            <input type="datetime-local" className="input-field" required value={sessionForm.endsAt} onChange={(e) => setSessionForm({ ...sessionForm, endsAt: e.target.value })} />
            <button className="btn-primary sm:col-span-5">Schedule Live Session</button>
          </form>
        )}
        <div className="space-y-2 text-xs">
          {(sessQ.data?.data || []).map((s) => (
            <div key={s.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold">{s.title} — {s.course_title}</p>
                <p className="text-slate-500">{new Date(s.starts_at).toLocaleString()} to {new Date(s.ends_at).toLocaleTimeString()}</p>
              </div>
              {s.meeting_url && <a href={s.meeting_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Join Link</a>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
