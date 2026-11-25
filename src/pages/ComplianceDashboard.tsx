import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api.js';
import { useTenant } from '../context/TenantContext.js';
import { 
  ShieldCheck, 
  FileCheck, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  FileText, 
  ExternalLink,
  Award,
  Calendar
} from 'lucide-react';

export const ComplianceDashboard: React.FC = () => {
  const { organizationName, t } = useTenant();
  const [policies, setPolicies] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [policiesData, certsData] = await Promise.all([
        ApiClient.get('/communication/compliance/policies'),
        ApiClient.get('/certificates/my') // or tenant certs
      ]);
      setPolicies(policiesData);
      setCertificates(certsData);
    } catch (err) {
      console.error('Failed to load compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Certificate Number', 'Recipient', 'Program', 'Issue Date', 'Status'];
    const rows = certificates.map(c => [
      c.certificateNumber,
      `"${c.recipientName}"`,
      `"${c.courseTitle}"`,
      new Date(c.issueDate).toISOString().split('T')[0],
      c.status || 'ACTIVE'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Compliance_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAcknowledge = async (policyId: string) => {
    try {
      await ApiClient.post(`/communication/compliance/policies/${policyId}/acknowledge`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to acknowledge policy');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Regulatory & Evidence Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Compliance & Auditor Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track mandatory training mandates, verifiable evidence records, and policy sign-offs for {organizationName}.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-md transition self-start"
        >
          <Download className="w-4 h-4" />
          <span>Export Compliance Audit (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Statutory Compliance</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">94.8%</div>
          <span className="text-xs text-slate-400 mt-1 block">Active personnel meeting directives</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Active Policies</span>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{policies.length}</div>
          <span className="text-xs text-slate-400 mt-1 block">Regulatory sign-off documents</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Conferred Evidence</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{certificates.length}</div>
          <span className="text-xs text-slate-400 mt-1 block">Cryptographically verifiable credentials</span>
        </div>
      </div>

      {/* Section: Regulatory Policies */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-indigo-500" />
          <span>Statutory Policy Acknowledgements</span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {policies.map(p => (
            <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    v{p.version}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">{p.content}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span>Renewal Cycle: {p.renewalMonths} months</span>
                  <span>Total Sign-Offs: {p._count?.acknowledgements || 0}</span>
                </div>
              </div>

              <div>
                {p.isAcknowledged ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Signed on {new Date(p.acknowledgedAt).toLocaleDateString()}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(p.id)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    Acknowledge Policy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Verifiable Evidence Log */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Verifiable Credential Evidence Records</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Credential ID</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Certified Program</th>
                <th className="py-3 px-4">Conferral Date</th>
                <th className="py-3 px-4">Cryptographic Hash</th>
                <th className="py-3 px-4">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {certificates.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {c.certificateNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                    {c.recipientName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {c.courseTitle}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(c.issueDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {c.verificationCode.slice(0, 16)}...
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={`/verify/${c.verificationCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Audit Record</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
