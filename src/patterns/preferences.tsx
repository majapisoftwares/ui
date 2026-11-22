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
import { Toaster } from "../components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

type Theme = "light" | "dark";
/** `"system"` follows the device (`prefers-color-scheme`) and is not saved. */
export type ThemePreference = Theme | "system";
const PreferencesContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** The theme in effect (`system` already resolved). */
  theme: Theme;
  /** The user's choice; `"system"` when nothing is saved. */
  themePreference: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
} | null>(null);
const PreferencesReadyContext = createContext(true);

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function clear(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable (private mode).
  }
}
/** The page background of each theme (`--background`), for the browser's own UI. */
const THEME_COLORS: Record<Theme, string> = {
  light: "#ffffff",
  dark: "#0a0a0a",
};

/**
 * Keeps `<meta name="theme-color">` on the theme in effect, which may not be
 * the device's (so a `prefers-color-scheme` pair in the app's metadata would
 * be wrong). The tag is Preferences' own: created by `preferencesScript`.
 */
function themeColor(theme: Theme) {
  let meta = document.head.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"][data-preferences]',
  );
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.setAttribute("data-preferences", "");
    document.head.appendChild(meta);
  }
  meta.content = THEME_COLORS[theme];
}

function systemTheme(): Theme {
  return typeof matchMedia === "function" &&
    matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
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
export const preferencesScript = `try{var d=document.documentElement;var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches))d.classList.add("dark");var m=document.createElement("meta");m.name="theme-color";m.setAttribute("data-preferences","");m.content=d.classList.contains("dark")?"#0a0a0a":"#ffffff";document.head.appendChild(m);var l=localStorage.getItem("locale");if(l!=="en"&&l!=="pt-BR"){l="en";var a=navigator.languages||[];for(var i=0;i<a.length;i++){if(/^pt/i.test(a[i])){l="pt-BR";break}if(/^en/i.test(a[i]))break}}if(l!==d.lang){d.lang=l;d.setAttribute("data-locale-pending",l)}}catch(e){}`;

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
  const [themePreference, setThemePreference] =
    useState<ThemePreference>("system");
  const [systemDark, setSystemDark] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const stored = read("locale");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from browser-only storage after hydration
    setLocale(
      locales.includes(stored as Locale)
        ? (stored as Locale)
        : matchLocale(navigator.languages),
    );
    const savedTheme = read("theme");
    setThemePreference(
      savedTheme === "dark" || savedTheme === "light" ? savedTheme : "system",
    );
    setSystemDark(systemTheme() === "dark");
    setReady(true);
  }, []);
  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const query = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  const theme: Theme =
    themePreference === "system"
      ? systemDark
        ? "dark"
        : "light"
      : themePreference;
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.lang = locale;
    // The pre-paint script hides the page until the saved locale is rendered.
    if (root.dataset.localePending === locale)
      delete root.dataset.localePending;
  }, [locale, ready]);
  useEffect(() => {
    // iOS keeps reporting the bottom safe-area inset with the keyboard open,
    // although the keyboard already covers the home indicator. Safari only
    // shrinks the visual viewport (a pinch zoom does too, hence the scale);
    // the installed Home Screen app shrinks the whole web view, so there the
    // keyboard is told by a text field having focus on a touch device — but
    // only after a real pointer (focus restored on navigate/bfcache must not
    // zero the inset, or the composer sits too low until the keyboard cycles).
    const root = document.documentElement;
    const viewport = window.visualViewport;
    const coarse = window.matchMedia?.("(pointer: coarse)");
    const typeless = new Set([
      "checkbox",
      "radio",
      "button",
      "submit",
      "reset",
      "file",
      "range",
      "color",
      "image",
      "hidden",
    ]);
    const takesText = () => {
      const el = document.activeElement;
      if (!(el instanceof HTMLElement)) return false;
      if (el instanceof HTMLTextAreaElement) return true;
      if (el instanceof HTMLInputElement) return !typeless.has(el.type);
      return el.isContentEditable;
    };
    const shortened = () =>
      !!viewport &&
      window.innerHeight - viewport.height > 120 &&
      viewport.scale < 1.05;
    // Set by pointer/touch before focusin; cleared when the page is shown again
    // or the route changes, so a restored focus does not look like a keyboard.
    let pointed = false;
    const update = () => {
      if (shortened() || (coarse?.matches && takesText() && pointed))
        root.setAttribute("data-keyboard", "");
      else root.removeAttribute("data-keyboard");
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Moving between fields blurs one before focusing the next.
    const afterBlur = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!takesText()) pointed = false;
        update();
      }, 80);
    };
    const markPointer = () => {
      pointed = true;
      // Field may already be focused (restored); pointer alone must re-check.
      if (takesText()) update();
    };
    const onReturn = () => {
      pointed = false;
      // Drop restored focus without a real keyboard so safe-area and composers
      // recalculate (opening+closing the keyboard used to be the only fix).
      if (takesText() && !shortened()) {
        const el = document.activeElement;
        if (el instanceof HTMLElement) el.blur();
      }
      update();
    };
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      onReturn();
    };
    const hist = window.history;
    const pushState = hist.pushState.bind(hist);
    const replaceState = hist.replaceState.bind(hist);
    hist.pushState = (...args: Parameters<History["pushState"]>) => {
      const result = pushState(...args);
      queueMicrotask(onReturn);
      return result;
    };
    hist.replaceState = (...args: Parameters<History["replaceState"]>) => {
      const result = replaceState(...args);
      queueMicrotask(onReturn);
      return result;
    };
    update();
    viewport?.addEventListener("resize", update);
    document.addEventListener("pointerdown", markPointer, true);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", afterBlur);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onReturn);
    window.addEventListener("focus", update);
    window.addEventListener("popstate", onReturn);
    return () => {
      clearTimeout(timer);
      hist.pushState = pushState;
      hist.replaceState = replaceState;
      viewport?.removeEventListener("resize", update);
      document.removeEventListener("pointerdown", markPointer, true);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", afterBlur);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onReturn);
      window.removeEventListener("focus", update);
      window.removeEventListener("popstate", onReturn);
      root.removeAttribute("data-keyboard");
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    themeColor(theme);
  }, [theme, ready]);
  useEffect(() => {
    if (
      typeof location === "undefined" ||
      !location.hostname.endsWith(".localhost")
    )
      return;
    const link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');
    const href = link?.getAttribute("href");
    if (!link || !href || href.startsWith("data:")) return;
    void fetch(href)
      .then((res) => (res.ok ? res.text() : ""))
      .then((svg) => {
        if (!svg) return;
        const embeddedPng = svg.match(/data:image\/png;base64,[^"']+/);
        link.href = embeddedPng
          ? embeddedPng[0]
          : `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      })
      .catch(() => {});
  }, []);
  return (
    <PreferencesContext.Provider
      value={{
        locale,
        setLocale: (next) => {
          setLocale(next);
          write("locale", next);
        },
        theme,
        themePreference,
        setTheme: (next) => {
          setThemePreference(next);
          if (next === "system") clear("theme");
          else write("theme", next);
        },
      }}
    >
      <PreferencesReadyContext.Provider value={ready}>
        <LocaleProvider locale={locale}>
          {children}
          <Toaster />
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
