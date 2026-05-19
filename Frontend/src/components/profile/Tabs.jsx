import React from "react";

import { User, Mail, Lock, FileText, Brain, Trophy, Flame } from "lucide-react";

import CommonTabs from "../common/Tabs";
import Button from "../common/Button";

function Tabs({
  user,
  overview,
  recentActivity,
  activeTab,
  setActiveTab,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  handleUpdatePassword,
}) {
  const tabs = [
    {
      name: "Account",
      label: "Account",
      content: (
        <div className="space-y-8 p-3">
          {/* User Information */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">
              Personal Information
            </h3>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Username
                </label>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <User className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Username</p>

                    <p className="font-semibold text-slate-900">
                      {user?.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Email Address
                </label>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Mail className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Email</p>

                    <p className="font-semibold text-slate-900">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {/* Documents */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <FileText className="h-6 w-6" />
              </div>

              <h4 className="mt-5 text-3xl font-bold text-slate-900">
                {overview?.totalDocuments || 0}
              </h4>

              <p className="mt-1 text-sm text-slate-500">Documents Uploaded</p>
            </div>

            {/* Flashcards */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Brain className="h-6 w-6" />
              </div>

              <h4 className="mt-5 text-3xl font-bold text-slate-900">
                {overview?.totalFlashcards || 0}
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                Flashcards Generated
              </p>
            </div>

            {/* Quizzes */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Trophy className="h-6 w-6" />
              </div>

              <h4 className="mt-5 text-3xl font-bold text-slate-900">
                {overview?.completedQuizzes || 0}
              </h4>

              <p className="mt-1 text-sm text-slate-500">Completed Quizzes</p>
            </div>

            {/* Streak */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <Flame className="h-6 w-6" />
              </div>

              <h4 className="mt-5 text-3xl font-bold text-slate-900">
                {overview?.studyStreak || 0}
              </h4>

              <p className="mt-1 text-sm text-slate-500">Day Study Streak</p>
            </div>
          </div>
        </div>
      ),
    },

    {
      name: "Security",
      label: "Security",
      content: (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Lock className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Change Password
              </h3>

              <p className="text-sm text-slate-500">
                Update your account password securely.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {/* Current Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Enter current password"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Enter new password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Confirm new password"
              />
            </div>

            <div className="pt-2">
              <Button onClick={handleUpdatePassword}>
                <Lock className="h-4 w-4" />
                Update Password
              </Button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <CommonTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
  );
}

export default Tabs;
