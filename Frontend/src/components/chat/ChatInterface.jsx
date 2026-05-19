import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../common/Spinner";
import MarkdownRenderer from "../common/MarkdownRenderer";

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);

      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date(),
        relevantChunks: response.data.relevantChunks,
      };

      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";
    return (
      <div
        key={index}
        className={`flex items-start gap-3 my-4 ${isUser ? "justify-end" : ""}`}
      >
        {!isUser && (
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
        )}
        <div
          className={`max-w-lg p-4 rounded-2xl shadow-sm ${
            isUser
              ? "bg-linear-to-br from-emerald-500 to-teal-500 text-white rounded-br-md"
              : "bg-white border border-slate-200/60 text-slate-800 rounded-bl-md"
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{msg.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-slate">
              <MarkdownRenderer content={msg.content} />
            </div>
          )}
        </div>
        {isUser && (
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-semibold text-sm shrink-0 shadow-sm">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl items-center justify-center shadow-xl shadow-slate-200/50">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-40">
          <MessageSquare className="w-7 h-7 text-emerald-600" strokeWidth={2} />
        </div>
        <Spinner />
        <p className="text-sm text-slate-500 mt-3 font-medium">
          Loading chat history...
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-[75vh] flex-col overflow-hidden rounded-[32px] border border-white/40 bg-white/70 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="absolute bottom-[-120px] left-[-120px] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-200/60 bg-white/60 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              AI Study Assistant
            </h2>

            <p className="text-sm text-slate-500">
              Ask questions about your document
            </p>
          </div>
        </div>

        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Online
        </div>
      </div>

      {/* Message Area */}
      <div className="relative flex-1 overflow-y-auto bg-gradient-to-br from-slate-50/70 via-white/50 to-emerald-50/30 px-6 py-6">
        {history.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-emerald-400/20 blur-xl" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/20">
                <MessageSquare className="h-9 w-9 text-white" strokeWidth={2} />
              </div>
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              Start a conversation
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
              Ask questions, summarize concepts, explain code, or get AI-powered
              insights from your document.
            </p>

            {/* Suggestion Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                "Summarize this document",
                "Explain key concepts",
                "Generate interview questions",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setMessage(item)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : (
          history.map(renderMessage)
        )}

        {/* Loading */}
        {loading && (
          <div className="my-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
            </div>

            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex gap-1">
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: "0ms" }}
                />

                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: "150ms" }}
                />

                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: "300ms" }}
                />
              </div>

              <span className="ml-2 text-sm text-slate-500">
                AI is thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative border-t border-slate-200/60 bg-white/70 p-5 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a follow-up question..."
              disabled={loading}
              className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50/70 px-5 pr-14 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />

            {/* Input Glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-teal-500/0 opacity-0 transition-opacity duration-300 focus-within:opacity-100" />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          >
            <Send
              className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.5}
            />
          </button>
        </form>
      </div>
    </div>
  );
};
export default ChatInterface;
