import { Component, createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import type { CaseDefinition } from "../domain/schema";
import { loadBuiltinCases } from "../content/cases";
import { validateCase } from "../content/validate";
import { bootStorage, DEFAULT_PREFS, type Prefs, type Profile, type SessionRecord, type StorageAdapter, type Mode } from "../storage";
import { SessionController } from "./session";
import { Home } from "../ui/screens/Home";
import { Library } from "../ui/screens/Library";
import { Briefing } from "../ui/screens/Briefing";
import { Encounter } from "../ui/screens/Encounter";
import { Debrief } from "../ui/screens/Debrief";
import { HistoryScreen } from "../ui/screens/History";
import { Settings } from "../ui/screens/Settings";
import { Editor } from "../ui/screens/Editor";
import { Variants } from "../ui/screens/Variants";
import { Inspector3D } from "../ui/screens/Inspector3D";
import { Onboarding } from "../ui/screens/Onboarding";

export type Route =
  | { name: "home" }
  | { name: "onboarding" }
  | { name: "library"; specialty?: string; oral?: boolean }
  | { name: "briefing"; caseId: string; mode?: Mode; seed?: number; tutorial?: boolean }
  | { name: "encounter"; tutorial?: boolean }
  | { name: "debrief"; sessionId: string }
  | { name: "history" }
  | { name: "settings" }
  | { name: "editor"; caseId?: string }
  | { name: "variants"; caseId?: string }
  | { name: "inspector" };

export interface AppCtx {
  storage: StorageAdapter;
  prefs: Prefs;
  setPrefs(p: Partial<Prefs>): void;
  profile: Profile | null;
  setProfile(p: Profile): void;
  cases: CaseDefinition[];
  rejectedCases: { id: string; errors: string[] }[];
  refreshCases(): Promise<void>;
  favorites: string[];
  toggleFavorite(id: string): void;
  sessions: SessionRecord[];
  refreshSessions(): Promise<void>;
  route: Route;
  go(r: Route): void;
  active: SessionController | null;
  setActive(c: SessionController | null): void;
  warnings: string[];
}

const Ctx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("Contexto do app ausente");
  return c;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    if (this.state.error) {
      return (
        <div className="screen" role="alert">
          <h1>Ocorreu um erro na interface</h1>
          <p className="notice danger">{this.state.error.message}</p>
          <p className="muted">Seus atendimentos são salvos a cada ação e podem ser retomados.</p>
          <button className="btn primary" onClick={() => location.reload()}>
            Recarregar o aplicativo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type Boot = { status: "loading" } | { status: "error"; message: string; details: string[] } | { status: "ready"; storage: StorageAdapter; warnings: string[] };

export function App() {
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    const timeout = setTimeout(() => alive && setBoot({ status: "error", message: "A inicialização demorou demais.", details: ["Verifique o armazenamento do aparelho e tente novamente."] }), 15000);
    bootStorage()
      .then((r) => {
        clearTimeout(timeout);
        if (alive) setBoot({ status: "ready", storage: r.adapter, warnings: r.warnings });
      })
      .catch((e) => {
        clearTimeout(timeout);
        if (alive) setBoot({ status: "error", message: "Falha ao iniciar o armazenamento local.", details: [e instanceof Error ? e.message : String(e)] });
      });
    return () => {
      alive = false;
      clearTimeout(timeout);
    };
  }, []);
  if (boot.status === "loading") return <div className="screen" aria-busy="true"><p>Carregando o Plantão 3D…</p></div>;
  if (boot.status === "error")
    return (
      <div className="screen" role="alert">
        <h1>Diagnóstico de inicialização</h1>
        <p className="notice danger">{boot.message}</p>
        <ul>{boot.details.map((d) => <li key={d}>{d}</li>)}</ul>
        <button className="btn primary" onClick={() => location.reload()}>Tentar novamente</button>
      </div>
    );
  return (
    <ErrorBoundary>
      <Shell storage={boot.storage} warnings={boot.warnings} />
    </ErrorBoundary>
  );
}

function Shell({ storage, warnings }: { storage: StorageAdapter; warnings: string[] }) {
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [cases, setCases] = useState<CaseDefinition[]>([]);
  const [rejected, setRejected] = useState<{ id: string; errors: string[] }[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [active, setActive] = useState<SessionController | null>(null);
  const [ready, setReady] = useState(false);

  const refreshCases = useCallback(async () => {
    const builtin = loadBuiltinCases();
    const custom = await storage.listCustomCases();
    const okCustom: CaseDefinition[] = [];
    const rej = [...builtin.rejected];
    for (const c of custom) {
      const v = validateCase(c);
      if (v.ok && v.caseDef) okCustom.push(v.caseDef);
      else rej.push({ id: c.id, errors: v.errors });
    }
    setCases([...builtin.cases.filter((c) => !c.technical), ...okCustom]);
    setRejected(rej);
  }, [storage]);
  const refreshSessions = useCallback(async () => setSessions(await storage.listSessions()), [storage]);

  useEffect(() => {
    void (async () => {
      const p = await storage.getPrefs();
      setPrefsState(p);
      setProfileState(await storage.getProfile());
      setFavorites(await storage.getFavorites());
      await refreshCases();
      await refreshSessions();
      if (!p.tutorialDone) setRoute({ name: "onboarding" });
      setReady(true);
    })();
  }, [storage, refreshCases, refreshSessions]);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = prefs.theme;
    el.dataset.contrast = prefs.highContrast ? "alto" : "normal";
    el.style.setProperty("--fs", String(prefs.fontScale));
  }, [prefs]);

  // botão "voltar" do Android: nunca fecha o app no meio de um atendimento
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let remove: (() => void) | undefined;
    void import("@capacitor/app").then(({ App: CapApp }) =>
      CapApp.addListener("backButton", () => {
        setRoute((r) => {
          if (r.name === "encounter") {
            active?.setPaused(true);
            return r;
          }
          return r.name === "home" ? r : { name: "home" };
        });
      }).then((h) => (remove = () => void h.remove()))
    );
    return () => remove?.();
  }, [active]);

  const ctx = useMemo<AppCtx>(
    () => ({
      storage,
      prefs,
      setPrefs: (p) => {
        setPrefsState((cur) => {
          const next = { ...cur, ...p };
          void storage.savePrefs(next);
          return next;
        });
      },
      profile,
      setProfile: (p) => {
        setProfileState(p);
        void storage.saveProfile(p);
      },
      cases,
      rejectedCases: rejected,
      refreshCases,
      favorites,
      toggleFavorite: (id) => {
        const on = !favorites.includes(id);
        setFavorites(on ? [...favorites, id] : favorites.filter((f) => f !== id));
        void storage.setFavorite(id, on);
      },
      sessions,
      refreshSessions,
      route,
      go: (r) => {
        setRoute(r);
        window.scrollTo(0, 0);
      },
      active,
      setActive,
      warnings
    }),
    [storage, prefs, profile, cases, rejected, refreshCases, favorites, sessions, refreshSessions, route, active, warnings]
  );

  if (!ready) return <div className="screen" aria-busy="true"><p>Carregando…</p></div>;
  return (
    <Ctx.Provider value={ctx}>
      <Router />
    </Ctx.Provider>
  );
}

function Router() {
  const { route } = useApp();
  switch (route.name) {
    case "onboarding":
      return <Onboarding />;
    case "library":
      return <Library specialty={route.specialty} oral={route.oral} />;
    case "briefing":
      return <Briefing caseId={route.caseId} mode={route.mode} seed={route.seed} tutorial={route.tutorial} />;
    case "encounter":
      return <Encounter tutorial={route.tutorial} />;
    case "debrief":
      return <Debrief sessionId={route.sessionId} />;
    case "history":
      return <HistoryScreen />;
    case "settings":
      return <Settings />;
    case "editor":
      return <Editor caseId={route.caseId} />;
    case "variants":
      return <Variants caseId={route.caseId} />;
    case "inspector":
      return <Inspector3D />;
    default:
      return <Home />;
  }
}
