import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200/60 bg-white/95 p-8 shadow-2xl shadow-slate-900/20 backdrop-blur-xl">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>

          <div className="mb-6 pr-8">
            <h3 className="text-xl font-medium tracking-tight text-slate-900">
              {title}
            </h3>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
