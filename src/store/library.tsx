import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * L'état du lecteur : où il en est dans chaque livre, ses favoris, son temps de lecture.
 *
 * Tout est stocké sur l'appareil (AsyncStorage). Aucun compte, aucun serveur : l'app
 * fonctionne hors ligne dès la première ouverture. Le jour où un backend existe, seul ce
 * fichier change — les écrans ne connaissent que ce contexte.
 */
const STORAGE_KEY = "lumia:library:v1";

export type Progress = {
  /** Index du chapitre en cours. */
  chapter: number;
  /** Progression dans le chapitre, de 0 à 1. */
  offset: number;
  /** Vrai une fois le dernier chapitre atteint. */
  finished: boolean;
  updatedAt: string;
};

type LibraryState = {
  progress: Record<string, Progress>;
  favorites: string[];
  /** Minutes de lecture cumulées, toutes lectures confondues. */
  minutesRead: number;
  premium: boolean;
};

const EMPTY: LibraryState = { progress: {}, favorites: [], minutesRead: 0, premium: false };

type LibraryContextValue = LibraryState & {
  ready: boolean;
  saveProgress: (slug: string, chapter: number, offset: number, finished?: boolean) => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  addMinutes: (minutes: number) => void;
  setPremium: (value: boolean) => void;
  reset: () => void;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LibraryState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) setState({ ...EMPTY, ...(JSON.parse(raw) as LibraryState) });
      } catch {
        // Un stockage illisible ne doit pas empêcher l'app de démarrer : on repart à vide.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Écriture après coup plutôt que dans chaque action : une seule sauvegarde par changement.
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const saveProgress = useCallback(
    (slug: string, chapter: number, offset: number, finished = false) => {
      setState((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          [slug]: { chapter, offset, finished, updatedAt: new Date().toISOString() },
        },
      }));
    },
    []
  );

  const toggleFavorite = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(slug)
        ? prev.favorites.filter((s) => s !== slug)
        : [slug, ...prev.favorites],
    }));
  }, []);

  const addMinutes = useCallback((minutes: number) => {
    setState((prev) => ({ ...prev, minutesRead: prev.minutesRead + minutes }));
  }, []);

  const setPremium = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, premium: value }));
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const value = useMemo<LibraryContextValue>(
    () => ({
      ...state,
      ready,
      saveProgress,
      toggleFavorite,
      isFavorite: (slug: string) => state.favorites.includes(slug),
      addMinutes,
      setPremium,
      reset,
    }),
    [state, ready, saveProgress, toggleFavorite, addMinutes, setPremium, reset]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary doit être utilisé à l'intérieur de <LibraryProvider>.");
  return ctx;
}
