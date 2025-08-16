import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      setStatus({ type: "error", message: "Please enter your email." });
      return;
    }
    setStatus({ type: "loading", message: "" });
    try {
      await sendPasswordResetEmail(getAuth(), value);
      // Neutral message to prevent user enumeration
      setStatus({
        type: "success",
        message:
          "If an account exists for this email, a reset link has been sent. Please check your inbox.",
      });
    } catch (err) {
      let message = "Failed to send reset email. Please try again.";
      const code = err?.code;
      if (code === "auth/invalid-email") message = "Invalid email address.";
      else if (code === "auth/too-many-requests")
        message = "Too many attempts. Please try again later.";
      // Note: Avoid showing 'user-not-found' to prevent user enumeration
      setStatus({ type: "error", message });
    }
  };

  const isLoading = status.type === "loading";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/60 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand / Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 text-sm">
            <span>🌿</span>
            <span className="font-medium">AgriTech-Hub</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-emerald-900">
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter the email associated with your account and we’ll send a reset link.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-emerald-200 bg-white shadow-lg overflow-hidden">
          {/* Decorative top band */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Email */}
            <label htmlFor="email" className="text-sm font-medium text-slate-800">
              Email address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                {/* Mail icon */}
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 6h16v12H4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 7l8 6 8-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 px-10 py-2.5 text-slate-900 placeholder-slate-400 outline-none ring-emerald-500 focus:ring-2"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* Status messages */}
            <div aria-live="polite">
              {status.type === "success" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {status.message}
                </div>
              )}
              {status.type === "error" && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {status.message}
                </div>
              )}
            </div>

            {/* Actions */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white shadow-md transition
                hover:bg-emerald-700 disabled:opacity-70`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </button>

            {/* Helper / Back to sign-in */}
            <div className="pt-2 text-center text-sm text-slate-600">
              Remembered your password?{" "}
              <a href="/" className="font-semibold text-emerald-700 hover:underline">
                Go to sign in
              </a>
            </div>
          </form>
        </div>

        {/* Footer microcopy */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Didn’t receive an email? Check your spam folder or try again in a few minutes.
        </p>
      </div>
    </div>
  );
}
