"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { LanguagesIcon, MoonIcon, SunIcon } from "lucide-react";
import {
  LocaleProvider,
  locales,
  matchLocale,
  useUiMessages,
  type Locale,
} from "../lib/i18n";
import { Button } from "../components/ui/button";
import { Toaster } from "../components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

type Theme = "light" | "dark";
const PreferencesContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);
const PreferencesReadyContext = createContext(true);

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); preferences just won't persist.
  }
}

/**
 * Mirrors matchLocale; keep both in sync.
 * Inline this in `<head>` (e.g. `<script dangerouslySetInnerHTML>`) so the
 * stored theme applies before paint.
 */
export const preferencesScript = `try{var d=document.documentElement;if(localStorage.getItem("theme")==="dark")d.classList.add("dark");var l=localStorage.getItem("locale");if(l!=="en"&&l!=="pt-BR"){l="en";var a=navigator.languages||[];for(var i=0;i<a.length;i++){if(/^pt/i.test(a[i])){l="pt-BR";break}if(/^en/i.test(a[i]))break}}if(l!==d.lang){d.lang=l;d.setAttribute("data-locale-pending",l)}}catch(e){}`;

/**
 * Locale + theme for the whole app. Renders `defaultLocale` first (matches
 * static/server HTML), then applies the stored or browser locale on mount.
 */
export function Preferences({
  defaultLocale = "en",
  children,
}: {
  defaultLocale?: Locale;
  children: ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const stored = read("locale");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from browser-only storage after hydration
    setLocale(
      locales.includes(stored as Locale)
        ? (stored as Locale)
        : matchLocale(navigator.languages),
    );
    setTheme(read("theme") === "dark" ? "dark" : "light");
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.lang = locale;
    // The pre-paint script hides the page until the saved locale is rendered.
    if (root.dataset.localePending === locale)
      delete root.dataset.localePending;
  }, [locale, ready]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return (
    <PreferencesContext.Provider
      value={{
        locale,
        setLocale: (next) => {
          setLocale(next);
          write("locale", next);
        },
        theme,
        setTheme: (next) => {
          setTheme(next);
          write("theme", next);
        },
      }}
    >
      <PreferencesReadyContext.Provider value={ready}>
        <LocaleProvider locale={locale}>
          {children}
          <Toaster theme={theme} />
        </LocaleProvider>
      </PreferencesReadyContext.Provider>
    </PreferencesContext.Provider>
  );
}

/**
 * Owns `document.title` so it follows the active language. Leave `title` out
 * of Next.js metadata, or Next will overwrite it after hydration.
 */
export function useDocumentTitle(title: string) {
  const ready = useContext(PreferencesReadyContext);
  useEffect(() => {
    if (!ready) return;
    document.title = title;
  }, [title, ready]);
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context)
    throw new Error("usePreferences must be used within Preferences.");
  return context;
}

const localeNames: Record<Locale, string> = {
  en: "English",
  "pt-BR": "Português",
};

/** Language menu and theme toggle, e.g. for `AppShell` actions. */
export function PreferenceControls() {
  const { locale, setLocale, theme, setTheme } = usePreferences();
  const t = useUiMessages();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="sm" aria-label={t.language} />}
        >
          <LanguagesIcon />
          {locale === "en" ? "EN" : "PT"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={(value) => setLocale(value as Locale)}
          >
            {locales.map((value) => (
              <DropdownMenuRadioItem key={value} value={value}>
                {localeNames[value]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t.toggleTheme}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </Button>
    </>
  );
}
