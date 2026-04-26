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
    "AI Intelligence": "AI Intelligence"
  },
  hi: {
    // Sidebar Main
    "Overview": "अवलोकन",
    "Inventory": "इन्वेंटरी",
    "Orders": "ऑर्डर",
    "Suppliers": "आपूर्तिकर्ता",
    "Deliveries": "वितरण",
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
    "AI Intelligence": "कृत्रिम बुद्धिमत्ता (AI)"
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
