import React from 'react';
import { Award, CheckCircle2, ShieldCheck, Printer, X, ExternalLink, Calendar, Hash } from 'lucide-react';
import { Certificate } from '../types/index.js';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const verifyUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">Official Verified Credential</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div className="p-8 md:p-12 bg-white relative">
          {/* Ornate Certificate Border */}
          <div className="border-4 border-double border-amber-600/60 p-8 rounded-xl bg-gradient-to-b from-amber-50/20 via-white to-amber-50/20 relative shadow-inner">
            {/* Corner Decorative Accents */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-700" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-700" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-700" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-700" />

            {/* Certificate Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-700 mb-2 ring-8 ring-amber-50">
                <Award className="w-9 h-9" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                {certificate.organizationName}
              </h4>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
                Certificate of Completion
              </h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest pt-1">
                This acknowledges that
              </p>
            </div>

            {/* Recipient */}
            <div className="text-center my-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-amber-950 font-serif border-b-2 border-amber-300 pb-2 inline-block px-8">
                {certificate.recipientName}
              </h2>
            </div>

            {/* Description */}
            <div className="text-center max-w-xl mx-auto text-sm text-slate-700 leading-relaxed">
              has successfully fulfilled all curriculum requirements, continuous assessments, and passing benchmarks for
              <p className="text-lg font-bold text-slate-900 mt-2">
                {certificate.courseTitle}
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-center">
              <div className="space-y-1">
                <div className="font-serif italic text-lg text-slate-800">Victoria Hastings</div>
                <div className="h-0.5 bg-slate-300 w-32 mx-auto" />
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  Academic Director
                </div>
              </div>

              {/* Official Seal */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600 flex items-center justify-center text-amber-700 bg-amber-50">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-amber-800 uppercase mt-1">
                  Verified Authentic
                </span>
              </div>

              <div className="space-y-1">
                <div className="font-serif text-slate-800 text-sm font-semibold">{formattedDate}</div>
                <div className="h-0.5 bg-slate-300 w-32 mx-auto" />
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  Date of Conferral
                </div>
              </div>
            </div>

            {/* Verification Metadata Footer */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
              <div className="flex items-center gap-1 font-mono">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Certificate ID: {certificate.certificateNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <span>Verify online: {certificate.verificationCode.slice(0, 12)}...</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
