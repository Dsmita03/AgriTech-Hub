import express from "express";
import axios from "axios";

const router = express.Router();

// Perplexity API configuration
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

// Optional: warn if key missing (won't crash)
if (!process.env.PERPLEXITY_API_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    "[Voice API] Warning: PERPLEXITY_API_KEY is missing. The endpoint will return fallbacks."
  );
}

// POST /api/voice
router.post("/", async (req, res) => {
  try {
    const { conversation, fromLang = "en", toLang = "en" } = req.body || {};

    // Validate input
    if (!Array.isArray(conversation)) {
      return res.status(400).json({
        error: "Invalid conversation format",
        reply: getErrorMessage("invalid_format", fromLang),
      });
    }

    // Require last user message
    const lastMessage = conversation[conversation.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return res.status(400).json({
        error: "No user message found",
        reply: getErrorMessage("no_message", fromLang),
      });
    }

    const userQuery = (lastMessage.text ?? "").toString().trim().toLowerCase();

    // Generate reply (gracefully falls back on failure)
    const reply = await generatePerplexityResponse(userQuery, fromLang, conversation);

    return res.status(200).json({
      reply,
      conversation: [...conversation, { role: "ai", text: reply }],
      timestamp: new Date().toISOString(),
      powered_by: "Perplexity AI",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Voice API Error:", error?.response?.data || error?.message || error);

    const language = (req.body && req.body.fromLang) || "en";
    // Still return 200 with a safe reply so client UX is consistent
    return res.status(200).json({
      error: "Server error",
      reply: getErrorMessage("server_error", language),
      timestamp: new Date().toISOString(),
      powered_by: "Perplexity AI",
    });
  }
});

// GET /api/voice/history (placeholder)
router.get("/history", (_req, res) => {
  res.json({
    message: "Conversation history feature coming soon!",
    conversations: [],
  });
});

// DELETE /api/voice/clear (stateless placeholder)
router.delete("/clear", (_req, res) => {
  res.json({
    message: "Conversation cleared successfully",
    success: true,
  });
});

// Core: call Perplexity with defensive logic
async function generatePerplexityResponse(userQuery, language, conversation) {
  try {
    const systemPrompt = getAgricultureSystemPrompt(language);

    // Build compact, clean messages: system + last 5 entries
    const recent = conversation
      .slice(-5)
      .map((msg) => ({
        role: msg.role === "ai" ? "assistant" : msg.role, // map "ai" -> "assistant"
        content: (msg.text ?? "").toString().trim(),
      }))
      .filter(
        (m) =>
          m.content.length > 0 &&
          (m.role === "user" || m.role === "assistant")
      );

    const messages = [{ role: "system", content: systemPrompt }, ...recent];

    // No key? Provide tailored fallback
    if (!process.env.PERPLEXITY_API_KEY) {
      return getFallbackResponse(userQuery, language);
    }

    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: "llama-3.1-sonar-small-128k-online",
        messages,
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        return_citations: true,
        // These filters can be restrictive. If responses are sparse, comment them out:
        // search_domain_filter: ["agriculture", "farming", "crop", "soil"],
        // search_recency_filter: "month",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
        validateStatus: (s) => s >= 200 && s < 500, // treat 4xx as handled
      }
    );

    if (response.status >= 400) {
      return getFallbackResponse(userQuery, language);
    }

    const content = response.data?.choices?.[0]?.message?.content;
    let reply = (content || "").toString().trim();

    if (!reply) {
      return getFallbackResponse(userQuery, language);
    }

    // Single, safe citations variable (no redeclaration)
    const cit =
      (Array.isArray(response.data?.citations) && response.data.citations) ||
      (Array.isArray(response.data?.choices?.messages?.citations) &&
        response.data.choices.message.citations) ||
      [];

    if (Array.isArray(cit) && cit.length > 0) {
      reply += `\n\n📚 Sources: ${cit.slice(0, 2).join(", ")}`;
    }

    return reply;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Perplexity API Error:", error?.response?.data || error?.message || error);
    return getFallbackResponse(userQuery, language);
  }
}

// Prompts
function getAgricultureSystemPrompt(language) {
  const prompts = {
    hi: `आप एक विशेषज्ञ कृषि सहायक हैं।
- व्यावहारिक सलाह दें
- भारतीय कृषि प्रथाओं पर ध्यान दें
- सरल भाषा का उपयोग करें
- यदि संभव हो तो मौसम/बाजार की जानकारी शामिल करें
- उत्तर संक्षिप्त रखें (2–3 वाक्य)`,
    en: `You are an expert agricultural assistant.
- Provide practical, actionable advice
- Focus on Indian agricultural practices when relevant
- Use simple, clear language
- Include weather/market info if helpful
- Keep answers concise (2–3 sentences)`,
    bn: `আপনি একজন বিশেষজ্ঞ কৃষি সহায়ক।
- ব্যবহারিক পরামর্শ দিন
- প্রয়োজন অনুযায়ী ভারতীয় কৃষি প্রথার উপর জোর দিন
- সহজ ভাষা ব্যবহার করুন
- সম্ভব হলে আবহাওয়া/বাজার তথ্য যোগ করুন
- উত্তর সংক্ষিপ্ত রাখুন (২–৩টি বাক্য)`,
  };
  return prompts[language] || prompts.en;
}

// Fallbacks
function getFallbackResponse(query, language) {
  const q = (query || "").toString().toLowerCase();

  if (q.includes("weather") || q.includes("मौसम") || q.includes("আবহাওয়া")) {
    return getWeatherFallback(language);
  }
  if (q.includes("crop") || q.includes("फसल") || q.includes("ফসল")) {
    return getCropFallback(language);
  }
  if (q.includes("disease") || q.includes("बीमारी") || q.includes("রোগ")) {
    return getDiseaseFallback(language);
  }
  return getDefaultResponse(language);
}

function getWeatherFallback(language) {
  const responses = {
    hi: "मौसम की जानकारी के लिए स्थानीय मौसम विभाग से संपर्क करें। बारिश से पहले फसल को सुरक्षा दें।",
    en: "Check your local weather service. Protect crops before rainfall.",
    bn: "স্থানীয় আবহাওয়া দপ্তর থেকে তথ্য নিন। বৃষ্টির আগে ফসলে সুরক্ষা দিন।",
  };
  return responses[language] || responses.en;
}

function getCropFallback(language) {
  const responses = {
    hi: "फसल चुनते समय मिट्टी, मौसम और बाजार की मांग देखें। सिंचाई और लागत भी ध्यान रखें।",
    en: "Choose crops based on soil, weather, and market demand. Consider irrigation and input costs.",
    bn: "মাটি, আবহাওয়া ও বাজার চাহিদা অনুযায়ী ফসল বাছুন। সেচ ও খরচ বিবেচনা করুন।",
  };
  return responses[language] || responses.en;
}

function getDiseaseFallback(language) {
  const responses = {
    hi: "रोग दिखने पर पत्तियों की फोटो लेकर कृषि अधिकारी/कृषि विज्ञान केंद्र से सलाह लें।",
    en: "If disease symptoms appear, consult the local agriculture officer with clear leaf photos.",
    bn: "রোগের লক্ষণ দেখা দিলে পরিষ্কার পাতার ছবি নিয়ে কৃষি কর্মকর্তার পরামর্শ নিন।",
  };
  return responses[language] || responses.en;
}

function getDefaultResponse(language) {
  const responses = {
    hi: "मैं आपकी खेती में मदद करने के लिए यहाँ हूँ। फसल, मौसम या उर्वरक के बारे में पूछें।",
    en: "I’m here to help with your farming needs. Ask about crops, weather, or fertilizers.",
    bn: "আমি আপনার কৃষিকাজে সাহায্য করার জন্য এখানে আছি। ফসল, আবহাওয়া বা সার সম্পর্কে জিজ্ঞাসা করুন।",
  };
  return responses[language] || responses.en;
}

function getErrorMessage(type, language) {
  const errorMessages = {
    invalid_format: {
      hi: "मुझे आपका सवाल समझ नहीं आया।",
      en: "I could not understand your question.",
      bn: "আমি আপনার প্রশ্ন বুঝতে পারিনি।",
    },
    no_message: {
      hi: "कोई संदेश नहीं मिला।",
      en: "No message received.",
      bn: "কোনো বার্তা পাওয়া যায়নি।",
    },
    server_error: {
      hi: "सर्वर में समस्या है। कृपया थोड़ी देर बाद फिर कोशिश करें।",
      en: "There is a server issue. Please try again later.",
      bn: "সার্ভারে সমস্যা রয়েছে। পরে আবার চেষ্টা করুন।",
    },
  };
  return (
    (errorMessages[type] && (errorMessages[type][language] || errorMessages[type].en)) ||
    "An error occurred."
  );
}

export default router;
