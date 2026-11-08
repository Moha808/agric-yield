import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, KeyRound, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
          <KeyRound className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Reset Password
        </h1>
        <p className="text-xs text-stone-500">
          Enter your registered email to receive a password reset link
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-md space-y-4">
        {submitted ? (
          <div className="text-center space-y-3 py-4">
            <p className="text-xs text-stone-600">
              A password reset link has been dispatched to <span className="font-bold text-stone-900">{email}</span>. Please check your inbox.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@agriyield.ng"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer touch-target"
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
