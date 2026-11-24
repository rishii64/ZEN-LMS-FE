import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api.js';
import { useTenant } from '../context/TenantContext.js';
import { Certificate } from '../types/index.js';
import { CertificateModal } from '../components/CertificateModal.js';
import { Award, ShieldCheck, ExternalLink, Calendar, BookOpen, Printer } from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const { t, organizationName } = useTenant();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = async () => {
    try {
      const data = await ApiClient.get('/certificates/my');
      setCertificates(data);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
          Credential Repository
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          My Earned {t('credential', 'Certificates')} & Badges
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically verifiable certificates issued by {organizationName}.
        </p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>

                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  ID: {cert.certificateNumber}
                </span>

                <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                  {cert.courseTitle}
                </h3>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Conferred to {cert.recipientName}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveCert(cert)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View / Print</span>
                </button>

                <a
                  href={`/verify/${cert.verificationCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Certificates Earned Yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Complete all lessons and pass the final quiz in any course to receive your official credential.
          </p>
        </div>
      )}

      <CertificateModal
        certificate={activeCert}
        onClose={() => setActiveCert(null)}
      />
    </div>
  );
};
