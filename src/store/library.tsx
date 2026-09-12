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
import { LOCALES, SOURCE_LOCALE, type LocaleCode } from "@/data/catalog";
import { FREE_BOOKS, hasPlan, isFreePick, LANGUAGES_PLAN, type PlanId } from "@/data/plans";

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
  /** Formule en cours, ou `null` sans abonnement. Réglage local : rien n'est facturé. */
  plan: PlanId | null;
  /** Langue de lecture choisie. Le français est la langue source et le repli. */
  locale: LocaleCode;
  /** Mode bilingue : le texte source sous chaque bloc traduit. */
  bilingual: boolean;
  /** Les livres pris avec l'offre de bienvenue. Définitif, et gardé sans abonnement. */
  freeBooks: string[];
  /** Les livres achetés à l'unité. Gardés eux aussi, abonnement ou pas. */
  purchased: string[];
};

const EMPTY: LibraryState = {
  progress: {},
  favorites: [],
  minutesRead: 0,
  plan: null,
  locale: SOURCE_LOCALE,
  bilingual: false,
  freeBooks: [],
  purchased: [],
};

/**
 * Relit un état stocké par une version antérieure. La première version ne connaissait
 * qu'un interrupteur `premium` : un lecteur qui l'avait activé se retrouve sur la formule
 * qui débloquait la même chose, plutôt que sans rien.
 */
function migrate(stored: Record<string, unknown>): LibraryState {
  const state = { ...EMPTY, ...(stored as Partial<LibraryState>) };
  if (state.plan == null && stored.premium === true) state.plan = "extra";
  if (!(state.locale in LOCALES)) state.locale = SOURCE_LOCALE;
  return state;
}

type LibraryContextValue = LibraryState & {
  ready: boolean;
  saveProgress: (slug: string, chapter: number, offset: number, finished?: boolean) => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  addMinutes: (minutes: number) => void;
  setPlan: (plan: PlanId | null) => void;
  setLocale: (locale: LocaleCode) => void;
  setBilingual: (value: boolean) => void;
  /**
   * Prend le livre offert. Sans effet si l'offre est déjà utilisée, ou si le livre ne fait
   * pas partie de la sélection offerte.
   */
  claimFreeBook: (slug: string) => void;
  /** Vrai si ce livre précis peut être pris gratuitement, ici et maintenant. */
  canClaimFree: (slug: string) => boolean;
  /** Achète un livre à l'unité. Aucun paiement réel n'est encore branché. */
  purchaseBook: (slug: string) => void;
  /** Vrai si le lecteur peut ouvrir ce livre : abonné, livre offert, ou livre acheté. */
  canRead: (slug: string) => boolean;
  /** Vrai tant que l'offre de bienvenue n'a pas été utilisée. */
  freeBookAvailable: boolean;
  /** Vrai quand la formule en cours donne accès aux langues. */
  canChangeLanguage: boolean;
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
        if (!cancelled && raw) setState(migrate(JSON.parse(raw) as Record<string, unknown>));
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

  const setPlan = useCallback((plan: PlanId | null) => {
    setState((prev) => ({
      ...prev,
      plan,
      // Quitter la formule qui donnait les langues ramène au français : mieux vaut ça
      // qu'un catalogue à moitié verrouillé dont on ne comprend pas l'état.
      locale: hasPlan(plan, LANGUAGES_PLAN) ? prev.locale : SOURCE_LOCALE,
      bilingual: hasPlan(plan, LANGUAGES_PLAN) ? prev.bilingual : false,
    }));
  }, []);

  const setLocale = useCallback((locale: LocaleCode) => {
    setState((prev) => (hasPlan(prev.plan, LANGUAGES_PLAN) ? { ...prev, locale } : prev));
  }, []);

  const setBilingual = useCallback((value: boolean) => {
    setState((prev) => (hasPlan(prev.plan, LANGUAGES_PLAN) ? { ...prev, bilingual: value } : prev));
  }, []);

  /* L'offre ne porte que sur la sélection de `FREE_PICKS`. Le refus est vérifié ici plutôt
     que dans les écrans : une seule porte, comme `canRead` pour le catalogue. */
  const claimFreeBook = useCallback((slug: string) => {
    if (!isFreePick(slug)) return;
    setState((prev) =>
      prev.freeBooks.length >= FREE_BOOKS || prev.freeBooks.includes(slug)
        ? prev
        : { ...prev, freeBooks: [...prev.freeBooks, slug] }
    );
  }, []);

  const purchaseBook = useCallback((slug: string) => {
    setState((prev) =>
      prev.purchased.includes(slug) ? prev : { ...prev, purchased: [...prev.purchased, slug] }
    );
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
      setPlan,
      setLocale,
      setBilingual,
      claimFreeBook,
      canClaimFree: (slug: string) =>
        state.freeBooks.length < FREE_BOOKS && isFreePick(slug) && !state.purchased.includes(slug),
      purchaseBook,
      // Un abonnement ouvre tout le catalogue ; sans lui, restent le livre offert et les
      // livres achetés, qui appartiennent au lecteur même s'il ne s'abonne jamais.
      canRead: (slug: string) =>
        hasPlan(state.plan, "plus") ||
        state.freeBooks.includes(slug) ||
        state.purchased.includes(slug),
      freeBookAvailable: state.freeBooks.length < FREE_BOOKS,
      canChangeLanguage: hasPlan(state.plan, LANGUAGES_PLAN),
      reset,
    }),
    [
      state,
      ready,
      saveProgress,
      toggleFavorite,
      addMinutes,
      setPlan,
      setLocale,
      setBilingual,
      claimFreeBook,
      purchaseBook,
      reset,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary doit être utilisé à l'intérieur de <LibraryProvider>.");
  return ctx;
}
