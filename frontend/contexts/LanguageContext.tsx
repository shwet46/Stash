"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Sidebar Main
    "Overview": "Overview",
    "Inventory": "Inventory",
    "Orders": "Orders",
    "Suppliers": "Suppliers",
    "Deliveries": "Deliveries",
    // Sidebar Business
    "Billing": "Billing",
    "Analytics": "Analytics",
    "Customers": "Customers",
    // Sidebar AI
    "Bartering": "Bartering",
    "Forecasting": "Forecasting",
    "Recent Activities": "Recent Activities",
    // General
    "Sign Out": "Sign Out",
    "Collapse": "Collapse",
    "Admin": "Admin",
    "Worker": "Worker",
    "Profile Details": "Profile Details",
    "System Role": "System Role",
    "Phone": "Phone",
    "Account Status": "Account Status",
    "Active": "Active",
    "Main": "Main",
    "Business": "Business",
    "AI Intelligence": "AI Intelligence",
    "products across godowns": "products across godowns",
    "Export": "Export",
    "Add Product": "Add Product",
    "Refresh": "Refresh",
    "products are": "products are",
    "below stock threshold": "below stock threshold. Auto-reorder has been triggered for critical items.",
    "Worker threshold text": "below stock threshold. Please inform your supervisor.",
    "Search products...": "Search products...",
    "All": "All",
    "Product": "Product",
    "PRODUCT": "PRODUCT",
    "Category": "Category",
    "CATEGORY": "CATEGORY",
    "Stock": "Stock",
    "STOCK": "STOCK",
    "Threshold": "Threshold",
    "THRESHOLD": "THRESHOLD",
    "Godown": "Godown",
    "GODOWN": "GODOWN",
    "Last Updated": "Last Updated",
    "LAST UPDATED": "LAST UPDATED",
    "Status": "Status",
    "STATUS": "STATUS",
    "No products found matching your search.": "No products found matching your search.",
    "Add New Product": "Add New Product",
    "Cancel": "Cancel",
    "Healthy": "Healthy",
    "Low Stock": "Low Stock",
    "Critical": "Critical",
    "Grains": "Grains",
    "Pulses": "Pulses",
    "Oils": "Oils",
    "Spices": "Spices",
    "Essentials": "Essentials",
    "FMCG": "FMCG",
    "Beverages": "Beverages",
    "Snacks": "Snacks",
    "General": "General"
  },
  hi: {
    // Sidebar Main
    "Overview": "अवलोकन",
    "Inventory": "इन्वेंटरी",
    "Orders": "ऑर्डर",
    "Suppliers": "आपूर्तिकर्ता",
    "Deliveries": "वितरण (Deliveries)",
    // Sidebar Business
    "Billing": "बिल्लिंग",
    "Analytics": "एनालिटिक्स",
    "Customers": "ग्राहक",
    // Sidebar AI
    "Bartering": "वस्तु विनिमय (Bartering)",
    "Forecasting": "पूर्वानुमान (Forecasting)",
    "Recent Activities": "हाल की गतिविधियाँ",
    // General
    "Sign Out": "साइन आउट",
    "Collapse": "छोटा करें",
    "Admin": "एडमिन",
    "Worker": "कर्मचारी",
    "Profile Details": "प्रोफ़ाइल विवरण",
    "System Role": "सिस्टम भूमिका",
    "Phone": "फ़ोन",
    "Account Status": "खाता स्थिति",
    "Active": "सक्रिय",
    "Main": "मुख्य",
    "Business": "व्यापार",
    "AI Intelligence": "कृत्रिम बुद्धिमत्ता",
    "products across godowns": "गोदामों में उत्पाद",
    "Export": "निर्यात (Export)",
    "Add Product": "उत्पाद जोड़ें",
    "Refresh": "रिफ्रेश करें",
    "products are": "उत्पाद",
    "below stock threshold": "स्टॉक सीमा से कम हैं। महत्वपूर्ण वस्तुओं के लिए स्वतः रीऑर्डर ट्रिगर कर दिया गया है।",
    "Worker threshold text": "स्टॉक सीमा से कम हैं। कृपया अपने पर्यवेक्षक को सूचित करें।",
    "Search products...": "उत्पाद खोजें...",
    "All": "सभी",
    "Product": "उत्पाद",
    "PRODUCT": "उत्पाद",
    "Category": "श्रेणी",
    "CATEGORY": "श्रेणी",
    "Stock": "स्टॉक",
    "STOCK": "स्टॉक",
    "Threshold": "सीमा",
    "THRESHOLD": "सीमा",
    "Godown": "गोदाम",
    "GODOWN": "गोदाम",
    "Last Updated": "अंतिम अद्यतन",
    "LAST UPDATED": "अंतिम अद्यतन",
    "Status": "स्थिति",
    "STATUS": "स्थिति",
    "No products found matching your search.": "आपकी खोज से मेल खाने वाले कोई उत्पाद नहीं मिले।",
    "Add New Product": "नया उत्पाद जोड़ें",
    "Cancel": "रद्द करें",
    "Healthy": "स्वस्थ",
    "Low Stock": "कम स्टॉक",
    "Critical": "नाज़ुक",
    "Grains": "अनाज",
    "Pulses": "दालें",
    "Oils": "तेल",
    "Spices": "मसाले",
    "Essentials": "ज़रूरतें",
    "FMCG": "दैनिक वस्तुएं",
    "Beverages": "पेय पदार्थ",
    "Snacks": "स्नैक्स",
    "General": "सामान्य"
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("stash-lang") as Language;
    if (savedLang === "hi" || savedLang === "en") {
      setLang(savedLang);
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("stash-lang", newLang);
  };

  const t = (key: string) => {
    return (translations[lang] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
