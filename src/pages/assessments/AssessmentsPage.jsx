import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, Play, Plus } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuthContext } from '../../hooks/useAuthContext.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Modal, StatusBadge, LoadingSkeleton } from '../../components/ui/Primitives.jsx';

export function AssessmentsPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const { hasPermission } = useAuthContext();
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ courseId: '', title: '', assessmentType: 'quiz', passingScorePercent: 70, maxAttempts: 3, timeLimitMinutes: 30 });
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [answers, setAnswers] = useState({});

  const assessQ = useQuery({ queryKey: ['assessments'], queryFn: () => api.get('/assessments') });
  const coursesQ = useQuery({ queryKey: ['courses'], queryFn: () => api.get('/courses') });
  const enrQ = useQuery({ queryKey: ['enrollments', 'mine'], queryFn: () => api.get('/enrollments?mine=true') });
  const gradebookQ = useQuery({ queryKey: ['gradebook'], queryFn: () => api.get('/assessments/gradebook/entries') });

  const createMut = useMutation({
    mutationFn: (p) => api.post('/assessments', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assessments'] });
      setOpenCreate(false);
      addToast({ title: 'Assessment created', message: 'Ready for questions.', type: 'success' });
    },
    onError: (err) => addToast({ title: 'Error', message: err.message, type: 'error' })
  });

  const startMut = useMutation({
    mutationFn: ({ assessmentId, enrollmentId }) => api.post('/assessment-attempts/start', { assessmentId, enrollmentId }),
    onSuccess: (res) => {
      setActiveAttempt(res.data);
      setAnswers({});
    },
    onError: (err) => addToast({ title: 'Cannot start', message: err.message, type: 'error' })
  });

  const submitMut = useMutation({
    mutationFn: ({ attemptId, payload }) => api.post(`/assessment-attempts/${attemptId}/submit`, payload),
    onSuccess: (res) => {
      setActiveAttempt(null);
      qc.invalidateQueries({ queryKey: ['gradebook'] });
      addToast({
        title: 'Assessment submitted',
        message: `Score: ${res.data.percentage ?? 'Pending manual review'}%`,
        type: 'success'
      });
    },
    onError: (err) => addToast({ title: 'Submit failed', message: err.message, type: 'error' })
  });

  if (assessQ.isLoading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Assessments, Exams & Gradebook</h1>
          <p className="text-sm text-slate-500">Timed quizzes, question banks, automatic & manual grading.</p>
        </div>
        {hasPermission('assessments', 'create') && (
          <button className="btn-primary" onClick={() => setOpenCreate(true)}><Plus className="w-4 h-4" /> Create Assessment</button>
        )}
      </div>

      {activeAttempt && (
        <div className="card p-6 space-y-5 border-2 border-blue-500">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Active Attempt #{activeAttempt.attempt.attempt_number}</h2>
            <button className="btn-secondary text-xs" onClick={() => setActiveAttempt(null)}>Close</button>
          </div>
          {(activeAttempt.questions || []).map((q, idx) => (
            <div key={q.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <p className="font-semibold text-sm">{idx + 1}. {q.prompt} <span className="text-xs text-slate-400">({q.points} pts)</span></p>
              {q.options?.length > 0 ? (
                <div className="space-y-1.5">
                  {q.options.map((o) => (
                    <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type={q.question_type === 'mcq_multi' ? 'checkbox' : 'radio'}
                        name={`q_${q.id}`}
                        checked={(answers[q.id]?.selectedOptionIds || []).includes(o.id)}
                        onChange={(e) => {
                          const prev = answers[q.id]?.selectedOptionIds || [];
                          const next = q.question_type === 'mcq_multi'
                            ? (e.target.checked ? [...prev, o.id] : prev.filter((x) => x !== o.id))
                            : [o.id];
                          setAnswers({ ...answers, [q.id]: { questionId: q.id, selectedOptionIds: next } });
                        }}
                      />
                      <span>{o.option_text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Type your response..."
                  value={answers[q.id]?.textResponse || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: { questionId: q.id, textResponse: e.target.value } })}
                />
              )}
            </div>
          ))}
          <button
            className="btn-primary"
            disabled={submitMut.isPending}
            onClick={() => submitMut.mutate({
              attemptId: activeAttempt.attempt.id,
              payload: { answers: Object.values(answers) }
            })}
          >
            Submit Assessment
          </button>
        </div>
      )}

      <DataTable
        data={assessQ.data?.data || []}
        searchPlaceholder="Search assessments..."
        columns={[
          { key: 'title', label: 'Assessment', render: (r) => <div><p className="font-semibold">{r.title}</p><p className="text-xs text-slate-500">{r.course_title}</p></div> },
          { key: 'assessment_type', label: 'Type', render: (r) => <span className="capitalize text-xs">{r.assessment_type}</span> },
          { key: 'question_count', label: 'Questions' },
          { key: 'passing_score_percent', label: 'Pass %', render: (r) => `${r.passing_score_percent}%` },
          {
            key: 'actions',
            label: 'Take',
            sortable: false,
            render: (r) => {
              const enr = (enrQ.data?.data || []).find((e) => e.course_id === r.course_id);
              return enr ? (
                <button className="btn-primary px-3 py-1 text-xs" onClick={() => startMut.mutate({ assessmentId: r.id, enrollmentId: enr.id })}>
                  <Play className="w-3.5 h-3.5" /> Start
                </button>
              ) : (
                <span className="text-xs text-slate-400">Enroll in course first</span>
              );
            }
          }
        ]}
      />

      <div className="space-y-2">
        <h3 className="text-sm font-bold flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-blue-600" /> Gradebook</h3>
        <DataTable
          data={gradebookQ.data?.data || []}
          searchPlaceholder="Search gradebook..."
          columns={[
            { key: 'learner_name', label: 'Learner' },
            { key: 'course_title', label: 'Course' },
            { key: 'assessment_title', label: 'Assessment' },
            { key: 'percentage', label: 'Score', render: (r) => `${r.percentage}% (${r.total_score}/${r.max_score})` },
            { key: 'passed', label: 'Result', render: (r) => <StatusBadge status={r.passed ? 'approved' : 'suspended'} /> }
          ]}
        />
      </div>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Create Assessment">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-3">
          <select className="input-field" required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
            <option value="">Select course...</option>
            {(coursesQ.data?.data || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <input className="input-field" required placeholder="Assessment Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <input type="number" className="input-field" placeholder="Pass %" value={form.passingScorePercent} onChange={(e) => setForm({ ...form, passingScorePercent: e.target.value })} />
            <input type="number" className="input-field" placeholder="Max Attempts" value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })} />
            <input type="number" className="input-field" placeholder="Time Limit (m)" value={form.timeLimitMinutes} onChange={(e) => setForm({ ...form, timeLimitMinutes: e.target.value })} />
          </div>
          <button className="btn-primary w-full">Create Assessment</button>
        </form>
      </Modal>
    </div>
  );
}
