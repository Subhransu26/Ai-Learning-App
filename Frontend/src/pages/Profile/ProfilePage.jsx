import React, { useEffect, useState } from "react";

import Spinner from "../../components/common/Spinner";
import PageHeader from "../../components/common/PageHeader";

import Tabs from "../../components/profile/Tabs";

import { useAuth } from "../../context/AuthContext";

import progressService from "../../services/progressService";

import toast from "react-hot-toast";

function ProfilePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("Account");

  const [dashboardData, setDashboardData] = useState(null);

  const [currentPassword, setgit Password] = useState("");

  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await progressService.getDashboardData();

        setDashboardData(response.data);
      } catch (error) {
        toast.error("Failed to load profile data");

        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  const overview = dashboardData?.overview;

  const recentActivity = dashboardData?.recentActivity;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          title="Profile Settings"
          subtitle="Manage your account information and learning activity."
        />

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white shadow-2xl">
          {/* Background Glow */}
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-4xl font-bold backdrop-blur-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-4xl font-bold tracking-tight">
                  {user?.username}
                </h2>

                <p className="mt-2 text-white/90">{user?.email}</p>

                <p className="mt-3 text-sm text-white/80">
                  Joined {new Date(user?.createdAt).toLocaleDateString()}
                </p>

                <div className="mt-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
                  Active Learner
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {/* Documents */}
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
                <h4 className="text-2xl font-bold">
                  {overview?.totalDocuments || 0}
                </h4>

                <p className="mt-1 text-xs text-white/80">Documents</p>
              </div>

              {/* Flashcards */}
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
                <h4 className="text-2xl font-bold">
                  {overview?.totalFlashcards || 0}
                </h4>

                <p className="mt-1 text-xs text-white/80">Flashcards</p>
              </div>

              {/* Quizzes */}
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
                <h4 className="text-2xl font-bold">
                  {overview?.completedQuizzes || 0}
                </h4>

                <p className="mt-1 text-xs text-white/80">Quizzes</p>
              </div>

              {/* Streak */}
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
                <h4 className="text-2xl font-bold">
                  {overview?.studyStreak || 0}
                </h4>

                <p className="mt-1 text-xs text-white/80">Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs
          user={user}
          overview={overview}
          recentActivity={recentActivity}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmNewPassword={confirmNewPassword}
          setConfirmNewPassword={setConfirmNewPassword}
        />
      </div>
    </div>
  );
}

export default ProfilePage;
