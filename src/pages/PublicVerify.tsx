import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { ShieldCheck, AlertCircle, Award, CheckCircle2, Search, ArrowLeft, Calendar, Building2, User } from 'lucide-react';

export const PublicVerify: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const [searchCode, setSearchCode] = useState(code || '');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = async (verifyTarget: string) => {
    if (!verifyTarget.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await ApiClient.get(`/certificates/verify/${encodeURIComponent(verifyTarget.trim())}`);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'No valid credential found for this code or number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      fetchVerification(code);
    }
  }, [code]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVerification(searchCode);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to LMS Home
          </Link>
        </div>

        {/* Verification Search Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Universal Credential Verification
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Verify the authenticity of any credential or academic certificate issued across the ZenLMS network.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-lg mx-auto">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Enter Certificate Number (ZEN-...) or Code"
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Verify'}</span>
            </button>
          </form>

          <div className="mt-3 text-xs text-slate-400">
            Try demo code: <button type="button" onClick={() => { setSearchCode('nexus-cert-demo-2026'); fetchVerification('nexus-cert-demo-2026'); }} className="text-emerald-700 font-mono underline">nexus-cert-demo-2026</button>
          </div>
        </div>

        {/* Verification Result Card */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Verification Unsuccessful</h4>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {data && data.isValid && (
          <div className="bg-white rounded-2xl shadow-md border-2 border-emerald-500/30 overflow-hidden animate-in fade-in duration-300">
            <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-bold text-base tracking-wide">Authentic Credential Verified</span>
              </div>
              <span className="text-xs font-mono bg-emerald-700/60 px-3 py-1 rounded-full">
                ID: {data.certificateNumber}
              </span>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Recipient
                </span>
                <div className="text-2xl font-bold text-slate-900 flex items-center gap-2 mt-1">
                  <User className="w-5 h-5 text-slate-400" />
                  {data.recipientName}
                </div>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Certified Program / Course
                </span>
                <div className="text-xl font-bold text-slate-800 flex items-center gap-2 mt-1">
                  <Award className="w-5 h-5 text-amber-500" />
                  {data.courseTitle}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Issuing Organization
                  </span>
                  <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {data.organizationName}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Sector: {data.sector}
                  </span>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Date of Issue
                  </span>
                  <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 font-mono break-all">
                Verification Hash: {data.verificationCode}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
