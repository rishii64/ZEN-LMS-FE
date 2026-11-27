import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Award, Download, ExternalLink, Plus } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuthContext } from '../../hooks/useAuthContext.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Modal, StatusBadge, LoadingSkeleton } from '../../components/ui/Primitives.jsx';

export function CertificatesPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const { hasPermission } = useAuthContext();
  const [openIssue, setOpenIssue] = useState(false);
  const [issueForm, setIssueForm] = useState({ membershipId: '', courseId: '' });

  const certsQ = useQuery({ queryKey: ['certificates'], queryFn: () => api.get('/certificates') });
  const usersQ = useQuery({ queryKey: ['org', 'users'], queryFn: () => api.get('/users'), enabled: hasPermission('users', 'view') });
  const coursesQ = useQuery({ queryKey: ['courses'], queryFn: () => api.get('/courses') });

  const issueMut = useMutation({
    mutationFn: (p) => api.post('/certificates/issue', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
      setOpenIssue(false);
      addToast({ title: 'Certificate issued', message: 'PDF and QR verification ready.', type: 'success' });
    },
    onError: (err) => addToast({ title: 'Error', message: err.message, type: 'error' })
  });

  const downloadPdf = async (cert) => {
    try {
      const res = await api.download(`/certificates/${cert.id}/pdf`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert.certificate_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      addToast({ title: 'Download failed', message: err.message, type: 'error' });
    }
  };

  if (certsQ.isLoading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Certificates & Digital Credentials</h1>
          <p className="text-sm text-slate-500">Download verifiable PDF certificates with QR codes and track renewals.</p>
        </div>
        {hasPermission('certificates', 'create') && (
          <button className="btn-primary" onClick={() => setOpenIssue(true)}><Plus className="w-4 h-4" /> Issue Certificate</button>
        )}
      </div>

      <DataTable
        data={certsQ.data?.data || []}
        searchPlaceholder="Search certificates..."
        columns={[
          { key: 'certificate_number', label: 'Certificate ID', render: (r) => <span className="font-mono text-xs font-semibold">{r.certificate_number}</span> },
          { key: 'recipient_name', label: 'Recipient' },
          { key: 'course_title', label: 'Course' },
          { key: 'issued_at', label: 'Issued', render: (r) => new Date(r.issued_at).toLocaleDateString() },
          { key: 'revoked_at', label: 'Status', render: (r) => <StatusBadge status={r.revoked_at ? 'cancelled' : 'active'} /> },
          {
            key: 'actions',
            label: 'Credential',
            sortable: false,
            render: (r) => (
              <div className="flex gap-2">
                <button className="btn-secondary px-2.5 py-1 text-xs" onClick={() => downloadPdf(r)}>
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <Link to={`/verify/${r.verification_code}`} className="btn-secondary px-2.5 py-1 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" /> Verify
                </Link>
              </div>
            )
          }
        ]}
      />

      <Modal open={openIssue} onClose={() => setOpenIssue(false)} title="Issue Certificate">
        <form onSubmit={(e) => { e.preventDefault(); issueMut.mutate(issueForm); }} className="space-y-3">
          <select className="input-field" required value={issueForm.membershipId} onChange={(e) => setIssueForm({ ...issueForm, membershipId: e.target.value })}>
            <option value="">Select member...</option>
            {(usersQ.data?.data || []).map((u) => <option key={u.membership_id} value={u.membership_id}>{u.full_name}</option>)}
          </select>
          <select className="input-field" required value={issueForm.courseId} onChange={(e) => setIssueForm({ ...issueForm, courseId: e.target.value })}>
            <option value="">Select course...</option>
            {(coursesQ.data?.data || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <button className="btn-primary w-full"><Award className="w-4 h-4" /> Issue Credential</button>
        </form>
      </Modal>
    </div>
  );
}
