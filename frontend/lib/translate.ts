/**
 * Google Translate helper utilities for Stash
 * Manages language switching and persistence
 */

export const STORAGE_KEY = "stash_lang";

export function getStoredLanguage(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(STORAGE_KEY) || "en";
}

export function setStoredLanguage(code: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, code);
}

export function triggerGoogleTranslate(langCode: string): void {
  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
  if (select) {
    select.value = langCode === "en" ? "" : langCode; // "" defaults to en
    select.dispatchEvent(new Event("change"));
  }
}

export function restoreLanguageOnLoad(): void {
  if (typeof window === "undefined") return;
  const saved = getStoredLanguage();
  if (saved && saved !== "en") {
    // Wait for Google Translate to initialize
    const interval = setInterval(() => {
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (select) {
        select.value = saved;
        select.dispatchEvent(new Event("change"));
        clearInterval(interval);
      }
    }, 500);

    // Stop trying after 10 seconds
    setTimeout(() => clearInterval(interval), 10000);
  } else {
    // Ensure default language remains english if it wasn't explicitly changed
    if (!localStorage.getItem(STORAGE_KEY)) {
      setStoredLanguage("en");
    }
  }
}
