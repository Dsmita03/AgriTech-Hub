import express from "express";
import axios from "axios";

const router = express.Router();

// Perplexity API configuration
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

// ✅ Voice chatbot endpoint with Perplexity integration
router.post("/", async (req, res) => {
  try {
    const { conversation, fromLang = "en", toLang = "en" } = req.body;

    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({
        error: "Invalid conversation format",
        reply: getErrorMessage("invalid_format", fromLang),
      });
    }

    const lastMessage = conversation[conversation.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return res.status(400).json({
        error: "No user message found",
        reply: getErrorMessage("no_message", fromLang),
      });
    }

    const userQuery = lastMessage.text.toLowerCase();

    // Generate response using Perplexity API
    const reply = await generatePerplexityResponse(
      userQuery,
      fromLang,
      conversation
    );

    res.json({
      reply,
      conversation: [...conversation, { role: "ai", text: reply }],
      timestamp: new Date().toISOString(),
      powered_by: "Perplexity AI",
    });
  } catch (error) {
    console.error("Voice API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Server error",
      reply: getErrorMessage("server_error", req.body.fromLang || "en"), // ✅ fallback to English
    });
  }
});

// ✅ Conversation history (future feature)
router.get("/history", (req, res) => {
  res.json({
    message: "Conversation history feature coming soon!",
    conversations: [],
  });
});

// ✅ Clear conversation
router.delete("/clear", (req, res) => {
  res.json({
    message: "Conversation cleared successfully",
    success: true,
  });
});

// ✅ Generate response using Perplexity API
async function generatePerplexityResponse(userQuery, language, conversation) {
  try {
    const systemPrompt = getAgricultureSystemPrompt(language);

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation.slice(-5).map((msg) => ({
        role: msg.role === "ai" ? "assistant" : msg.role,
        content: msg.text,
      })),
    ];

    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: "llama-3.1-sonar-small-128k-online",
        messages,
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        return_citations: true,
        search_domain_filter: ["agriculture", "farming", "crop", "soil"],
        search_recency_filter: "month",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      let reply = response.data.choices[0].message.content;

      if (response.data.citations?.length > 0) {
        const citations = response.data.citations.slice(0, 2);
        reply += `\n\n📚 Sources: ${citations.join(", ")}`;
      }

      return reply;
    } else {
      return getFallbackResponse(userQuery, language);
    }
  } catch (error) {
    console.error("Perplexity API Error:", error.response?.data || error.message);
    return getFallbackResponse(userQuery, language);
  }
}

// ✅ Agriculture system prompt
function getAgricultureSystemPrompt(language) {
  const prompts = {
    hi: `आप एक विशेषज्ञ कृषि सहायक हैं...`,
    en: `You are an expert agricultural assistant. 
- Provide practical advice
- Focus on Indian agricultural practices
- Use simple language
- Include weather/market info if possible
- Keep answers concise (2–3 sentences)`,
    bn: `আপনি একজন বিশেষজ্ঞ কৃষি সহায়ক...`,
  };

  return prompts[language] || prompts.en;
}

// ✅ Fallback responses
function getFallbackResponse(query, language) {
  if (query.includes("weather") || query.includes("मौसम") || query.includes("আবহাওয়া")) {
    return getWeatherFallback(language);
  }
  if (query.includes("crop") || query.includes("फसल") || query.includes("ফসল")) {
    return getCropFallback(language);
  }
  if (query.includes("disease") || query.includes("बीमारी") || query.includes("রোগ")) {
    return getDiseaseFallback(language);
  }
  return getDefaultResponse(language);
}

function getWeatherFallback(language) {
  const responses = {
    hi: "मौसम की जानकारी के लिए स्थानीय मौसम विभाग से संपर्क करें।",
    en: "Check with your local weather department. Protect crops before rainfall.",
    bn: "আবহাওয়ার তথ্যের জন্য স্থানীয় আবহাওয়া দপ্তরে যোগাযোগ করুন।",
  };
  return responses[language] || responses.en;
}

function getCropFallback(language) {
  const responses = {
    hi: "फसल चुनते समय मिट्टी, मौसम और बाजार की मांग देखें।",
    en: "Consider soil, weather, and market demand when choosing crops.",
    bn: "ফসল নির্বাচনের সময় মাটি, আবহাওয়া এবং বাজারের চাহিদা বিবেচনা করুন।",
  };
  return responses[language] || responses.en;
}

function getDiseaseFallback(language) {
  const responses = {
    hi: "रोग दिखने पर तुरंत कृषि अधिकारी से संपर्क करें।",
    en: "If disease symptoms appear, contact the local agriculture officer immediately.",
    bn: "রোগের লক্ষণ দেখা দিলে কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।",
  };
  return responses[language] || responses.en;
}

function getDefaultResponse(language) {
  const responses = {
    hi: "मैं आपकी खेती में मदद करने के लिए यहाँ हूँ।",
    en: "I am here to help with your farming needs. Ask about crops, weather, or fertilizers.",
    bn: "আমি আপনার কৃষিকাজে সাহায্য করতে এখানে আছি।",
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
      hi: "सर्वर में कोई समस्या है।",
      en: "There is a server issue. Please try again later.",
      bn: "সার্ভারে কোনো সমস্যা আছে।",
    },
  };
  return errorMessages[type]?.[language] || errorMessages[type]?.en || "An error occurred.";
}

export default router;
