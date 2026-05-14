import React from "react";

function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="overflow-x-auto">
        <nav className="flex w-max min-w-full items-center gap-3 bg-white p-3 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`relative inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.name
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="relative z-10">
                {tab.label}
              </span>

              {/* Active Glow */}
              {activeTab === tab.name && (
                <div className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/20" />
              )}

              {/* Active Dot */}
              {activeTab === tab.name && (
                <div className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Tab Content */}
      <div className="rounded-3xl shadow-sm">
        {tabs.map((tab) => {
          if (tab.name === activeTab) {
            return (
              <div
                key={tab.name}
                className="transition-opacity duration-300"
              >
                {tab.content}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

export default Tabs;