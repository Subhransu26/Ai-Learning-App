import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Button from "../../components/common/Button";
import DocumentCard from "../../components/documents/DocumentCard";
import Spinner from "../../components/common/Spinner";
import { FileText, Plus, Trash2, Upload, X } from "lucide-react";

function DocumentListPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // state fot upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();

      setDocuments(
        Array.isArray(data) ? data : data?.documents || data?.data || [],
      );
    } catch (error) {
      toast.error("Failed to fetch documents");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle.trim()) {
      toast.error("Please provide a title and select a file");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle.trim());

    try {
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded successfully");

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);

      fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    setDeleting(true);

    try {
      await documentService.deleteDocument(selectedDoc._id);

      toast.success(`${selectedDoc.title} deleted successfully`);

      setIsDeleteModalOpen(false);
      setSelectedDoc(null);

      setDocuments(documents.filter((d) => d._id !== selectedDoc._id));
    } catch (error) {
      toast.error("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50 mb-6">
              <FileText
                className="w-10 h-10 text-slate-400"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="text-xl font-medium text-slate-900 tracking-tight mb-2">
              No Documents Yet
            </h3>

            <p className="text-sm text-slate-500 mb-6">
              Get started by uploading your first PDF document to begin
              learning.
            </p>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {documents?.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-6 py-8">
      {/* Subtitle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">
              My Documents
            </h1>

            <p className="text-slate-500 text-sm">
              Manage and organize your learning materials
            </p>
          </div>

          {documents.length > 0 && (
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </Button>
          )}
        </div>

        {renderContent()}
      </div>

      {/* Upload Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 transition-all duration-200 ${
          isUploadModalOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
          {/* Close button */}
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>

          {/* Modal Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Upload New Document
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add a PDF document to your library to start learning from it.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Title Input*/}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Document Title
              </label>

              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder="e.g., React Interview Prep"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                PDF File
              </label>

              <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-emerald-400 hover:bg-emerald-50/30">
                <input
                  id="file-upload"
                  type="file"
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  onChange={handleFileChange}
                  accept=".pdf"
                />

                <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <Upload className="h-6 w-6" strokeWidth={2} />
                  </div>

                  <p className="text-sm text-slate-600">
                    {uploadFile ? (
                      <span className="font-medium text-emerald-600">
                        {uploadFile.name}
                      </span>
                    ) : (
                      <>
                        <span className="font-semibold text-emerald-600">
                          Click to upload
                        </span>{" "}
                        or drag and drop your PDF file here.
                      </>
                    )}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">PDF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={uploading}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={uploading}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Uploading...
                  </span>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 transition-all duration-200 ${
          isDeleteModalOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
          {/* Close button */}
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>

          {/* Modal Header */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 className="h-7 w-7" strokeWidth={2} />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Confirm Deletion
            </h2>
          </div>

          {/* Content */}
          <p className="text-center text-sm leading-6 text-slate-500">
            Are you sure you want to delete the document{" "}
            <span className="font-semibold text-slate-800">
              {selectedDoc?.title}
            </span>
            ? This action cannot be undone.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:from-red-600 hover:to-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentListPage;
