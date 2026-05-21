/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../toast/ToastContext";

const AIContext = createContext(null);

const welcomeMessage = {
  role: "assistant",
  content:
    "Welcome to the AI Forge. Bring me your raw notes, tough concepts, or scattered plans, and I will help shape them into flashcards, quizzes, study plans, and clearer next steps.",
};

export function AIProvider({ children }) {
  // AI chat state is global so the assistant can follow users across protected pages.
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGlobalAi, setShowGlobalAiState] = useState(
    () => localStorage.getItem("focusforge_show_ai") !== "false",
  );
  const toast = useToast();

  const chatHistory = useMemo(
    // Exclude system-like messages before sending recent visible history to the backend.
    () => messages.filter((message) => message.role !== "system"),
    [messages],
  );

  function setShowGlobalAi(value) {
    setShowGlobalAiState(value);
    localStorage.setItem("focusforge_show_ai", String(value));
  }

  function fillQuickPrompt(prompt) {
    // Quick prompts populate the shared input without sending automatically.
    setInput(prompt);
  }

  async function sendMessage(customPrompt) {
    // Optimistic chat flow: show the user message before waiting for AI response.
    const message = (customPrompt ?? input).trim();
    if (!message || loading) return;

    const userMessage = { role: "user", content: message };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message,
        history: chatHistory,
      });
      setMessages([
        ...nextMessages,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (err) {
      const nextError =
        err.response?.data?.error || "Unable to reach the AI Forge right now.";
      setError(nextError);
      toast.error(nextError);
      setMessages(nextMessages);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    messages,
    input,
    loading,
    error,
    showGlobalAi,
    fillQuickPrompt,
    sendMessage,
    setInput,
    setShowGlobalAi,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used inside AIProvider");
  }
  return context;
}
