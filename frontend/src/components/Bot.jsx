import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  where 
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../lib/firebase";
import robotWave from "/assets/bot.gif";

const FloatingVoiceWidget = () => {
  const [user] = useAuthState(auth);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [lang, setLang] = useState("en");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const timeoutRef = useRef(null);
  const conversationEndRef = useRef(null);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => console.log("🎤 Mic permission granted"))
      .catch((err) => {
        console.error("Mic access error:", err);
        setError("🎤 Mic access denied. Please allow mic permission.");
      });
  }, []);

  // Load conversation for signed-in users from Firestore; else from session storage
  useEffect(() => {
    if (user) {
      const unsub = loadConversationFromFirestore();
      return () => unsub && unsub();
    } else {
      const saved = sessionStorage.getItem("voice_conversation");
      if (saved) setConversation(JSON.parse(saved));
      else setConversation([]);
    }
  }, [user]);

  // Persist guest conversation
  useEffect(() => {
    if (!user && conversation.length > 0) {
      sessionStorage.setItem("voice_conversation", JSON.stringify(conversation));
    }
  }, [conversation, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const loadConversationFromFirestore = () => {
    if (!user) return;
    const qRef = query(
      collection(db, "voiceConversations"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const unsubscribe = onSnapshot(
      qRef,
      (snap) => {
        const msgs = [];
        snap.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
        // Sort ascending by timestamp (oldest first)
        msgs.sort((a, b) => {
          const ta = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
          const tb = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
          return ta - tb;
        });
        setConversation(msgs);
      },
      (err) => {
        console.error("onSnapshot error:", err);
        setError(err.message || "Realtime updates failed.");
      }
    );
    return unsubscribe;
  };

  // Defensive Firestore write
  const saveMessageToFirestore = async (role, text) => {
    if (!user) return;
    try {
      const cleanText = (text ?? "").toString().trim();
      if (!cleanText) return;
      const docData = {
        userId: user.uid,
        userEmail: user.email || null,
        role,
        text: cleanText,
        language: lang,
        timestamp: serverTimestamp(),
        sessionId: `${user.uid}_${new Date().toDateString()}`
      };
      Object.keys(docData).forEach((k) => docData[k] === undefined && delete docData[k]);
      await addDoc(collection(db, "voiceConversations"), docData);
    } catch (e) {
      console.error("Error saving message to Firestore:", e);
    }
  };

  const toggleWidget = () => setOpen((s) => !s);

  const startListening = () => {
    if (!SpeechRecognition) {
      setError("🎤 Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = `${lang}-IN`;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    setError("");
    setIsListening(true);
    recognition.start();

    recognition.onstart = () => console.log("🎙️ Mic activated. Speak now...");

    recognition.onresult = (event) => {
      const spokenText = (event.results?.[0]?.transcript ?? "").toString().trim();
      console.log("Speech detected:", spokenText);
      if (!spokenText) return;

      // Optimistic UI: show user's message immediately
      setConversation((prev) => [...prev, { role: "user", text: spokenText }]);

      // Firestore write in background
      if (user) saveMessageToFirestore("user", spokenText);

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        submitToVoiceAPI(spokenText);
      }, 400);
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        setError("🛑 No speech detected. Try again and speak clearly.");
      } else {
        setError(`⚠️ Speech error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const submitToVoiceAPI = async (userText) => {
    const cleanUserText = (userText ?? "").toString().trim();
    if (!cleanUserText) return;

    // Build a clean snapshot for API
    const base = [...conversation, { role: "user", text: cleanUserText }];
    const sanitized = base
      .map((m) => ({
        role: m.role,
        text: (m.text ?? "").toString().trim()
      }))
      .filter((m) => m.text.length > 0 && (m.role === "user" || m.role === "ai"));

    const MAX_MESSAGES = 20;
    const sliced = sanitized.slice(-MAX_MESSAGES);

    setIsLoading(true);
    try {
      const res = await axios.post(
        "https://agritech-hub-b8if.onrender.com/api/voice",
        {
          conversation: sliced,
          fromLang: lang,
          toLang: lang
        },
        {
          timeout: 30000,
          validateStatus: (s) => s >= 200 && s < 500
        }
      );

      if (res.status >= 400) {
        const serverMsg = res.data?.error || res.data?.message || "❌ Server error. Try again.";
        throw new Error(serverMsg);
      }

      const replyText = (res.data?.reply ?? "").toString().trim() || "❌ No reply from Bot";

      // Show AI reply immediately
      setConversation((prev) => [...prev, { role: "ai", text: replyText }]);

      // Save AI reply for authed user
      if (user) await saveMessageToFirestore("ai", replyText);

      // TTS
      if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(replyText);
        utter.lang = `${lang}-IN`;
        utter.rate = 0.9;
        utter.pitch = 1.0;
        utter.onerror = (ev) => console.error("Speech synthesis error:", ev);
        window.speechSynthesis.speak(utter);
      }
    } catch (err) {
      console.error("Voice API error:", err);
      let errorMessage = err?.message || "❌ Server error. Try again.";
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        errorMessage = "❌ API key error. Contact support.";
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        errorMessage = "❌ Too many requests. Please wait.";
      } else if (!navigator.onLine) {
        errorMessage = "❌ No internet connection.";
      }

      setError(errorMessage);
      // Show error as AI message
      setConversation((prev) => [...prev, { role: "ai", text: errorMessage }]);
      if (user) await saveMessageToFirestore("ai", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    const clean = (typedInput ?? "").toString().trim();
    if (!clean) return;

    // Optimistic UI: show user's typed message
    setConversation((prev) => [...prev, { role: "user", text: clean }]);

    // Save in background for authed users
    if (user) await saveMessageToFirestore("user", clean);

    await submitToVoiceAPI(clean);
    setTypedInput("");
  };

  const clearConversation = async () => {
    if (user) {
      setConversation([]);
      await saveMessageToFirestore("system", "Conversation cleared");
    } else {
      setConversation([]);
      sessionStorage.removeItem("voice_conversation");
    }
    setError("");
  };

  return (
    <>
      {/* Floating Mic Button */}
      <button
        onClick={toggleWidget}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 overflow-hidden shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 active:scale-95 z-50 group"
        aria-label="Open Voice Assistant"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        <img
          src={robotWave}
          alt="AI Assistant"
          className="w-full h-[70%] object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        {isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"></div>
        )}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg">AgriTech Hub</h2>
                {user && (
                  <p className="text-xs opacity-90">
                    {user.displayName || user.email}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <select
                  className="text-xs p-1 rounded bg-white/20 border-0 text-white cursor-pointer backdrop-blur"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                >
                  <option value="en" className="text-gray-800">English</option>
                  <option value="hi" className="text-gray-800">हिन्दी</option>
                  <option value="bn" className="text-gray-800">বাংলা</option>
                </select>
                <button
                  onClick={clearConversation}
                  className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                  title="Clear conversation"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Voice Button */}
            <button
              onClick={startListening}
              disabled={isListening || isLoading}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-200 mb-4 ${
                isListening 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                  : isLoading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-green-500 hover:bg-green-600 hover:shadow-lg active:scale-95"
              } text-white disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isListening ? "🎙️ Listening..." : isLoading ? "🤖 Thinking..." : "🎤 Speak Now"}
            </button>

            {/* Text input */}
            <form onSubmit={handleTextSubmit} className="flex items-center mb-3">
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder="💬 Type your question..."
                className="flex-1 p-2 rounded-l-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-r-xl disabled:opacity-50"
              >
                ➤
              </button>
            </form>

            {/* Error */}
            {error && (
              <div className="text-red-600 text-sm mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border-l-4 border-red-500">
                {error}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-center items-center mb-3 p-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent"></div>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Processing...</span>
              </div>
            )}

            {/* Conversation */}
            <div 
              className="conversation-container max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
              style={{ scrollBehavior: "smooth" }}
            >
              {conversation.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {user ? `Welcome back, ${user.displayName || 'Farmer'}!` : 'Welcome to CropWise AI'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Press the mic button or type your question below
                  </p>
                  {!user && (
                    <p className="text-xs mt-3 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                      💡 Sign in to save your conversations
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {conversation
                    .filter((msg) => msg.role !== "system")
                    .map((msg, i) => (
                      <div
                        key={msg.id || i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                            msg.role === "user" 
                              ? "bg-green-500 text-white rounded-br-md" 
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md"
                          }`}
                        >
                          <div className="text-sm leading-relaxed break-words">
                            {msg.text}
                          </div>
                          {user && msg.timestamp && (
                            <div className="text-xs opacity-70 mt-1">
                              {msg.timestamp.toDate?.()?.toLocaleTimeString() || ""}
                            </div>
                          )}
                        </div>
                      </div>
                  ))}
                  <div ref={conversationEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Powered by <span className="font-medium text-blue-600 dark:text-blue-400">Perplexity AI</span>
              {user ? " • Conversations saved" : " • Sign in to save"}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingVoiceWidget;
