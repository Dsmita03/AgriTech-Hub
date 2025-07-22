// routes/schemes.js
import express from "express";

const router = express.Router();

// Government Schemes Data
const schemesData = {
  en: [
    {
      name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
      description: "A scheme providing income support of ₹6,000 per year to all farmer families.",
      eligibility: "Small & marginal farmers",
      benefits: "₹6,000 per year in three installments",
      apply_link: "https://pmkisan.gov.in/",
    },
    {
      name: "PM Fasal Bima Yojana (PMFBY)",
      description: "Crop insurance scheme to provide financial support in case of crop loss due to natural calamities.",
      eligibility: "All farmers growing notified crops",
      benefits: "Insurance coverage for crop loss",
      apply_link: "https://pmfby.gov.in/",
    },
    {
      name: "Soil Health Card Scheme",
      description: "Provides soil health reports to farmers and recommends suitable fertilizers.",
      eligibility: "All farmers",
      benefits: "Improved soil fertility and better crop yield",
      apply_link: "https://www.soilhealth.dac.gov.in/",
    },
    {
      name: "Rashtriya Krishi Vikas Yojana (RKVY)",
      description: "Promotes agricultural growth through financial assistance to states.",
      eligibility: "State governments and farmers",
      benefits: "Funding for agricultural projects",
      apply_link: "https://rkvy.nic.in/",
    },
    {
      name: "National Agriculture Market (e-NAM)",
      description: "An online trading platform for agricultural commodities to help farmers get better prices.",
      eligibility: "Registered farmers & traders",
      benefits: "Transparent pricing and better market access",
      apply_link: "https://enam.gov.in/",
    },
    {
      name: "Kisan Credit Card (KCC)",
      description: "Provides short-term credit to farmers for crop cultivation expenses.",
      eligibility: "All farmers, including tenant farmers",
      benefits: "Low-interest loans for agricultural needs",
      apply_link: "https://pmkisan.gov.in/KisanCreditCard.aspx",
    },
    {
      name: "Paramparagat Krishi Vikas Yojana (PKVY)",
      description: "Promotes organic farming through cluster-based development.",
      eligibility: "Farmers in clusters of 50 acres",
      benefits: "Financial assistance for organic farming",
      apply_link: "https://pgsindia-ncof.gov.in/",
    },
    {
      name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
      description: "Ensures irrigation efficiency and water conservation.",
      eligibility: "Farmers and irrigation departments",
      benefits: "Funding for water-saving irrigation projects",
      apply_link: "https://pmksy.gov.in/",
    },
    {
      name: "Gramin Bhandaran Yojana",
      description: "Encourages construction of rural godowns for better storage of farm produce.",
      eligibility: "Farmers, entrepreneurs, and NGOs",
      benefits: "50% subsidy on storage infrastructure",
      apply_link: "https://agriinfra.dac.gov.in/",
    },
    {
      name: "Agricultural Technology Management Agency (ATMA)",
      description: "Strengthens agricultural extension services at the district level.",
      eligibility: "Farmers and extension workers",
      benefits: "Training and funding for technology adoption",
      apply_link: "https://atmaaims.com/",
    },
  ],


  hi: [
    {
      name: "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
      description: "₹6,000 प्रति वर्ष की आय सहायता सभी किसान परिवारों को प्रदान करने की योजना।",
      eligibility: "छोटे और सीमांत किसान",
      benefits: "₹6,000 प्रति वर्ष, तीन किस्तों में",
      apply_link: "https://pmkisan.gov.in/",
    },
    {
      name: "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
      description: "प्राकृतिक आपदाओं से फसल नुकसान की स्थिति में किसानों को वित्तीय सहायता प्रदान करने वाली बीमा योजना।",
      eligibility: "सभी अधिसूचित फसल उगाने वाले किसान",
      benefits: "फसल नुकसान के लिए बीमा कवरेज",
      apply_link: "https://pmfby.gov.in/",
    },
    {
      name: "मृदा स्वास्थ्य कार्ड योजना",
      description: "किसानों को मृदा स्वास्थ्य रिपोर्ट प्रदान करने और उपयुक्त उर्वरकों की सिफारिश करने की योजना।",
      eligibility: "सभी किसान",
      benefits: "बेहतर मृदा उर्वरता और बेहतर फसल उत्पादन",
      apply_link: "https://www.soilhealth.dac.gov.in/",
    },
    {
      name: "राष्ट्रीय कृषि विकास योजना (RKVY)",
      description: "राज्यों को वित्तीय सहायता प्रदान कर कृषि विकास को बढ़ावा देने वाली योजना।",
      eligibility: "राज्य सरकारें और किसान",
      benefits: "कृषि विकास परियोजनाओं के लिए वित्तीय सहायता",
      apply_link: "https://rkvy.nic.in/",

    },
    {
      name: "राष्ट्रीय कृषि बाजार (e-NAM)",
      description: "किसानों को बेहतर मूल्य दिलाने के लिए कृषि उत्पादों का एक ऑनलाइन व्यापार मंच।",
      eligibility: "पंजीकृत किसान और व्यापारी",
      benefits: "पारदर्शी मूल्य निर्धारण और बेहतर बाजार पहुंच",
      apply_link: "https://enam.gov.in/",
    },
    {
      name: "किसान क्रेडिट कार्ड (KCC)",
      description: "फसल उगाने के खर्चों के लिए किसानों को अल्पकालिक ऋण प्रदान करता है।",
      eligibility: "सभी किसान, किरायेदार किसान भी",
      benefits: "कृषि आवश्यकताओं के लिए कम ब्याज दर पर ऋण",
      apply_link: "https://pmkisan.gov.in/KisanCreditCard.aspx",
    },
    {
      name: "परंपरागत कृषि विकास योजना (PKVY)",
      description: "जैविक खेती को बढ़ावा देने के लिए क्लस्टर आधारित विकास।",
      eligibility: "50 एकड़ के समूहों में किसान",
      benefits: "जैविक खेती के लिए वित्तीय सहायता",
      apply_link: "https://pgsindia-ncof.gov.in/",
    },
    {
      name: "प्रधानमंत्री कृषि सिंचाई योजना (PMKSY)",
      description: "सिंचाई दक्षता में सुधार और जल संरक्षण सुनिश्चित करने के लिए योजना।",
      eligibility: "किसान और सिंचाई विभाग",
      benefits: "जल संरक्षण परियोजनाओं के लिए धन",
      apply_link: "https://pmksy.gov.in/",
    },
    {
      name: "ग्रामीण भंडारण योजना",
      description: "किसानों को बेहतर भंडारण के लिए ग्रामीण गोदाम बनाने के लिए प्रोत्साहित करता है।",
      eligibility: "किसान, उद्यमी और एनजीओ",
      benefits: "भंडारण संरचना पर 50% सब्सिडी",
      apply_link: "https://agriinfra.dac.gov.in/",
    },
    {
      name: "कृषि प्रौद्योगिकी प्रबंधन एजेंसी (ATMA)",
      description: "जिला स्तर पर कृषि विस्तार सेवाओं को मजबूत करता है।",
      eligibility: "किसान और कृषि अधिकारी",
      benefits: "प्रशिक्षण और तकनीकी अनुदान",
      apply_link: "https://atmaaims.com/",
    },
  ],
  bn: [
    {
      name: "প্রধানমন্ত্রী কিষান সম্মান নিধি (PM-KISAN)",
      description: "₹6,000 আয় সহায়তা প্রদান করার জন্য একটি কেন্দ্রীয় প্রকল্প।",
      eligibility: "ছোট ও প্রান্তিক কৃষক",
      benefits: "₹6,000 প্রতি বছর, তিনটি কিস্তিতে প্রদান করা হয়",
      apply_link: "https://pmkisan.gov.in/",
    },
    {
      name: "প্রধানমন্ত্রী ফসল বীমা যোজনা (PMFBY)",
      description: "প্রাকৃতিক দুর্যোগের কারণে ফসল ক্ষতির ক্ষেত্রে কৃষকদের আর্থিক সহায়তা প্রদানের জন্য ফসল বীমা প্রকল্প।",
      eligibility: "সমস্ত বিজ্ঞপ্তিযুক্ত ফসল চাষী",
      benefits: "ফসল ক্ষতির জন্য বীমা কভারেজ",
      apply_link: "https://pmfby.gov.in/",
    },
    {
      name: "মাটি স্বাস্থ্য কার্ড প্রকল্প",
      description: "কৃষকদের মাটির স্বাস্থ্য প্রতিবেদন সরবরাহ করতে এবং উপযুক্ত সার সুপারিশ করতে সরকারী উদ্যোগ।",
      eligibility: "সমস্ত কৃষক",
      benefits: "উন্নত মাটির উর্বরতা এবং উন্নত ফসল ফলন",
      apply_link: "https://www.soilhealth.dac.gov.in/",
    },
    {
      name: "জাতীয় কৃষি উন্নয়ন যোজনা (RKVY)",
      description: "রাজ্য সরকার এবং কৃষকদের কৃষি বৃদ্ধির জন্য আর্থিক সহায়তা প্রদান করে।",
      eligibility: "রাজ্য সরকার ও কৃষক",
      benefits: "কৃষি উন্নয়ন প্রকল্পের জন্য অর্থায়ন",
      apply_link: "https://rkvy.nic.in/",
    },
    {
      name: "জাতীয় কৃষি বাজার (e-NAM)",
      description: "কৃষকদের ভালো দাম পেতে সাহায্য করার জন্য কৃষি পণ্যের অনলাইন ট্রেডিং প্ল্যাটফর্ম।",
      eligibility: "নিবন্ধিত কৃষক ও ব্যবসায়ী",
      benefits: "স্বচ্ছ মূল্য নির্ধারণ এবং উন্নত বাজার সংযোগ",
      apply_link: "https://enam.gov.in/",
    },
    {
      name: "কিষান ক্রেডিট কার্ড (KCC)",
      description: "চাষাবাদের খরচের জন্য কৃষকদের স্বল্পমেয়াদী ঋণ প্রদান করে।",
      eligibility: "সমস্ত কৃষক, ভাড়াটিয়া কৃষকও অন্তর্ভুক্ত",
      benefits: "কৃষি চাহিদার জন্য কম সুদের ঋণ",
      apply_link: "https://pmkisan.gov.in/KisanCreditCard.aspx",
    },
    {
      name: "পরম্পরাগত কৃষি বিকাশ যোজনা (PKVY)",
      description: "জৈব চাষের প্রচারের জন্য ক্লাস্টার ভিত্তিক উন্নয়ন।",
      eligibility: "৫০ একর জমির কৃষক",
      benefits: "জৈব চাষের জন্য আর্থিক সহায়তা",
      apply_link: "https://pgsindia-ncof.gov.in/",
    },
    {
      name: "প্রধানমন্ত্রী কৃষি সিঞ্চাই যোজনা (PMKSY)",
      description: "সেচের দক্ষতা উন্নত করা এবং জল সংরক্ষণ নিশ্চিত করার জন্য একটি প্রকল্প।",
      eligibility: "কৃষক এবং সেচ বিভাগ",
      benefits: "জল সংরক্ষণ প্রকল্পের জন্য অর্থায়ন",
      apply_link: "https://pmksy.gov.in/",
    },
    {
      name: "গ্রামীণ ভান্ডারণ যোজনা",
      description: "চাষিদের ফসল সংরক্ষণের জন্য উন্নত গুদাম নির্মাণে উৎসাহিত করার প্রকল্প।",
      eligibility: "কৃষক, উদ্যোক্তা এবং এনজিও",
      benefits: "সংরক্ষণ পরিকাঠামোর জন্য ৫০% ভর্তুকি",
      apply_link: "https://agriinfra.dac.gov.in/",
    },
    {
      name: "কৃষি প্রযুক্তি ব্যবস্থাপনা সংস্থা (ATMA)",
      description: "জেলা স্তরের কৃষি সম্প্রসারণ পরিষেবা উন্নত করার প্রকল্প।",
      eligibility: "কৃষক এবং সম্প্রসারণ কর্মী",
      benefits: "প্রশিক্ষণ এবং প্রযুক্তি গ্রহণের জন্য অর্থায়ন",
      apply_link: "https://atmaaims.com/",
    },
  ],
};
// Endpoint
router.get("/", (req, res) => {
  const { language } = req.query;

  // Validate supported language
  if (!["en", "hi", "bn"].includes(language)) {
    return res.status(400).json({ error: "Unsupported language. Use ?language=en|hi|bn" });
  }

  // Optional: Add cache headers for performance
  res.set("Cache-Control", "public, max-age=86400"); // 1 day
  res.status(200).json(schemesData[language] || []);
});

export default router;
