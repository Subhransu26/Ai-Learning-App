import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Badge */}
        <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
          Error 404
        </div>

        {/* Huge Text */}
        <h1 className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-8xl font-black tracking-tight text-transparent sm:text-9xl">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-500">
          Sorry, the page you are looking for doesn’t exist or may have been
          moved. Let’s get you back on track.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Go Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30"
          >
            <Home size={18} strokeWidth={2.5} />
            Go Home
          </Link>

          {/* Go Back */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-100"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Go Back
          </button>
        </div>

        {/* Decorative Glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
