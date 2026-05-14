import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import documentService from "../../services/documentService";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import PageHeader from "../../components/common/pageHeader";
import Tabs from "../../components/common/Tabs";
import ChatInterface from "../../components/chat/ChatInterface";

function DocumentDetailPage() {
  const { id } = useParams();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Content");

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);

        setDocument(data);
      } catch (error) {
        toast.error("Failed to fetch document details");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  // Helper function to get the full PDF URL
  const getPdfUrl = () => {
    if (!document?.data?.filePath) return null;

    const filePath = document.data.filePath;

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }

    const baseUrl =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    return `${baseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      );
    }

    if (!document || !document.data || !document.data.filePath) {
      return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
          <FileText
            className="mb-4 h-14 w-14 text-slate-300"
            strokeWidth={1.5}
          />

          <p className="text-sm font-medium text-slate-500">
            PDF not available.
          </p>
        </div>
      );
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <span className="text-sm font-semibold text-slate-700">
            Document Viewer
          </span>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>

        {/* PDF Viewer */}
        <div className="h-[80vh] w-full bg-slate-100">
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            className="h-full w-full"
            frameBorder="0"
            style={{
              colorScheme: "light",
            }}
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />;
  };

  const renderAIActions = () => {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">AI Actions</h3>

        <p className="mt-2 text-sm text-slate-500">
          AI-powered actions will appear here.
        </p>
      </div>
    );
  };

  const renderFlashCardsTab = () => {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Flashcards</h3>

        <p className="mt-2 text-sm text-slate-500">
          Flashcards will be generated here.
        </p>
      </div>
    );
  };

  const renderQuizzesTab = () => {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Quizzes</h3>

        <p className="mt-2 text-sm text-slate-500">
          Quiz generation coming soon.
        </p>
      </div>
    );
  };

  const tabs = [
    {
      name: "Content",
      label: "Content",
      content: renderContent(),
    },
    {
      name: "Chat",
      label: "Chat",
      content: renderChat(),
    },
    {
      name: "AI Actions",
      label: "AI Actions",
      content: renderAIActions(),
    },
    {
      name: "Flashcards",
      label: "Flashcards",
      content: renderFlashCardsTab(),
    },
    {
      name: "Quizzes",
      label: "Quizzes",
      content: renderQuizzesTab(),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-10 py-12 text-center shadow-sm">
          <FileText
            className="mx-auto mb-4 h-14 w-14 text-slate-300"
            strokeWidth={1.5}
          />

          <h2 className="text-xl font-semibold text-slate-900">
            Document not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            The requested document could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Documents
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <PageHeader title={document.data.title} />
        </div>

        {/* Tabs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  );
}

export default DocumentDetailPage;
