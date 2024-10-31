import { useEffect, useState } from 'react';

const useTheme = (): [string, (theme: string) => void, boolean] => {
  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<string | undefined>('light');
  const [mounted, setMounted] = useState(false);

  const getStoredTheme = () => localStorage.getItem('theme');
  const setStoredTheme = (theme: string) => localStorage.setItem('theme', theme);

  const use = (value: string) => {
    setStoredTheme(value);
    setTheme(value);
  };

  const onColorSchemeChange = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme());
    }
  };

  useEffect(() => {
    if (!theme) {
      setTheme(getPreferredTheme());
    }
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', onColorSchemeChange);
    setMounted(true);

    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', onColorSchemeChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }
  }, [theme]);

  return [theme!, use, mounted]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
};

export { useTheme };
