export default function useModeToggle() {
  function disableTransitionsTemporarily() {
    document.documentElement.classList.add("**:transition-none!");
    window.setTimeout(() => {
      document.documentElement.classList.remove("**:transition-none!");
    }, 0);
  }

  function toggleMode() {
    disableTransitionsTemporarily();

    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    const isSystemDarkMode = darkModeMediaQuery.matches;
    const isDarkMode = document.documentElement.classList.toggle("dark");

    if (isDarkMode === isSystemDarkMode) {
      delete window.localStorage.isDarkMode;
    } else {
      window.localStorage.isDarkMode = isDarkMode;
    }
  }

  return toggleMode;
}
