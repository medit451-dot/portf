"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Chrome,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useLang } from "@/lib/i18n";

type Mode = "start" | "email" | "admin" | "account";

const EVENT = "medit:open-welcome";
const ADMIN_EVENT = "medit:open-admin";
const ADMIN_AUTH_EVENT = "medit:admin-auth";

export function openWelcome() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

export function openAdminWelcome() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_EVENT));
}

function firebaseErrorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code?: unknown }).code || "");
  }
  return "";
}

async function syncFirebaseAdminSession(user: User): Promise<boolean> {
  if (user.isAnonymous) return false;
  try {
    const idToken = await user.getIdToken();
    const response = await fetch("/api/auth/firebase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default function WelcomeGate() {
  const { t } = useLang();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("start");
  const [emailMode, setEmailMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("medit451@gmail.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [serverAdmin, setServerAdmin] = useState(false);

  const isAdminArea = pathname.startsWith("/admin");
  const canClose = Boolean(firebaseUser || serverAdmin);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};

    try {
      const auth = getFirebaseAuth();
      if (auth) {
        unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            if (cancelled) return;
            setFirebaseUser(user);
            setFirebaseReady(true);
            if (user && !user.isAnonymous) {
              void syncFirebaseAdminSession(user).then((ok) => {
                if (cancelled) return;
                if (ok) {
                  setServerAdmin(true);
                  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
                } else {
                  setError(t("auth_admin_sync_error"));
                }
              });
            }
          },
          () => {
            if (cancelled) return;
            setFirebaseReady(true);
            setError(t("auth_firebase_unavailable"));
          },
        );
      } else {
        setFirebaseReady(true);
      }
    } catch (error) {
      console.error("[firebase] initialization failed", error);
      if (!cancelled) {
        setFirebaseReady(true);
        setError(t("auth_firebase_unavailable"));
      }
    }

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setServerAdmin(Boolean(data.authenticated));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [t]);

  useEffect(() => {
    if (isAdminArea) {
      setOpen(false);
      return;
    }
    if (firebaseReady && !firebaseUser && !serverAdmin) setOpen(true);
    if (firebaseUser || serverAdmin) setOpen(false);
  }, [isAdminArea, firebaseReady, firebaseUser, serverAdmin]);

  useEffect(() => {
    const resetForm = () => {
      setEmailMode("signup");
      setError("");
      setPassword("");
      setConfirmPassword("");
      setAdminPassword("");
      setOpen(true);
    };
    const handler = () => {
      setMode(firebaseUser ? "account" : "start");
      resetForm();
    };
    const adminHandler = () => {
      setMode("admin");
      resetForm();
    };
    window.addEventListener(EVENT, handler);
    window.addEventListener(ADMIN_EVENT, adminHandler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener(ADMIN_EVENT, adminHandler);
    };
  }, [firebaseUser]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open && !isAdminArea ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, isAdminArea]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && canClose) setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, canClose]);

  const goBack = () => {
    setMode("start");
    setError("");
    setPassword("");
    setConfirmPassword("");
    setAdminPassword("");
  };

  const getAuthOrThrow = () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error(t("auth_firebase_unavailable"));
    return auth;
  };

  const firebaseError = (error: unknown) => {
    const code = firebaseErrorCode(error);
    const messages: Record<string, string> = {
      "auth/email-already-in-use": t("auth_email_exists"),
      "auth/invalid-email": t("auth_invalid_email"),
      "auth/weak-password": t("auth_weak_password"),
      "auth/invalid-credential": t("auth_invalid_credentials"),
      "auth/user-not-found": t("auth_invalid_credentials"),
      "auth/wrong-password": t("auth_invalid_credentials"),
      "auth/popup-closed-by-user": t("auth_popup_closed"),
      "auth/popup-blocked": t("auth_popup_blocked"),
      "auth/unauthorized-domain": t("auth_unauthorized_domain"),
      "auth/operation-not-allowed": t("auth_provider_disabled"),
      "auth/network-request-failed": t("auth_network_error"),
    };
    return messages[code] || t("auth_generic_error");
  };

  const completeFirebaseLogin = async (user: User) => {
    if (user.isAnonymous) {
      setOpen(false);
      return true;
    }
    const ok = await syncFirebaseAdminSession(user);
    if (!ok) {
      setError(t("auth_admin_sync_error"));
      return false;
    }
    setServerAdmin(true);
    window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
    setOpen(false);
    return true;
  };

  const useAnonymous = async () => {
    setError("");
    setBusy(true);
    try {
      await signInAnonymously(getAuthOrThrow());
      setOpen(false);
    } catch (error) {
      console.error("[firebase] anonymous sign-in failed", error);
      setError(firebaseError(error));
    } finally {
      setBusy(false);
    }
  };

  const useGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(getAuthOrThrow(), provider);
      await completeFirebaseLogin(credential.user);
    } catch (error) {
      console.error("[firebase] Google sign-in failed", error);
      setError(firebaseError(error));
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (emailMode === "signup" && password !== confirmPassword) {
      setError(t("auth_password_mismatch"));
      return;
    }
    setBusy(true);
    try {
      const auth = getAuthOrThrow();
      const credential = emailMode === "signup"
        ? await createUserWithEmailAndPassword(auth, email.trim(), password)
        : await signInWithEmailAndPassword(auth, email.trim(), password);
      await completeFirebaseLogin(credential.user);
    } catch (error) {
      console.error("[firebase] email auth failed", error);
      setError(firebaseError(error));
    } finally {
      setBusy(false);
    }
  };

  const submitAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword }),
      });
      await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(t("welcome_login_error"));
      setServerAdmin(true);
      setOpen(false);
      // Full navigation guarantees the new httpOnly cookie is sent to the
      // protected route in the preview proxy as well as in production.
      window.location.assign("/admin");
    } catch (error) {
      setError(error instanceof Error ? error.message : t("welcome_login_error"));
    } finally {
      setBusy(false);
    }
  };

  const logoutFirebase = async () => {
    setBusy(true);
    setError("");
    try {
      const auth = getFirebaseAuth();
      if (auth) await signOut(auth);
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      setServerAdmin(false);
      setOpen(false);
    } catch (error) {
      setError(firebaseError(error));
    } finally {
      setBusy(false);
    }
  };

  if (isAdminArea || !open || !firebaseReady) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#05060d]/80 backdrop-blur-md"
        onClick={() => canClose && setOpen(false)}
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-indigo-600/25 blur-[110px]" />
        <div className="absolute -bottom-40 -right-24 w-[34rem] h-[34rem] rounded-full bg-purple-600/25 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg modal-in">
        <div className="card !bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-6 sm:p-8 rounded-3xl max-h-[calc(100vh-2rem)] overflow-y-auto">
          {canClose && (
            <button
              onClick={() => setOpen(false)}
              aria-label={t("welcome_close")}
              className="absolute top-4 right-4 p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <X size={18} />
            </button>
          )}

          <div className="flex items-center gap-3 mb-5">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/30">m</span>
            <div>
              <div className="font-extrabold text-lg leading-tight">medit</div>
              <div className="text-xs text-[var(--muted)] flex items-center gap-1"><Sparkles size={12} /> portfolio</div>
            </div>
          </div>

          {mode === "start" && (
            <>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t("welcome_title")}</h2>
              <p className="text-sm text-[var(--muted)] mt-2 mb-6">{t("welcome_registration_subtitle")}</p>

              <div className="space-y-3">
                <button
                  onClick={useGoogle}
                  disabled={busy}
                  className="w-full text-left flex items-start gap-4 p-4 rounded-2xl border border-[var(--border)] hover:border-indigo-500/70 hover:bg-indigo-500/5 transition-colors group disabled:opacity-60"
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-white/10 text-[var(--text)] flex items-center justify-center"><Chrome size={20} /></span>
                  <span>
                    <span className="block font-semibold group-hover:text-indigo-400 transition-colors">{t("auth_google")}</span>
                    <span className="block text-xs text-[var(--muted)] mt-0.5">{t("auth_google_desc")}</span>
                  </span>
                </button>

                <button
                  onClick={() => { setMode("email"); setEmailMode("signup"); setError(""); }}
                  disabled={busy}
                  className="w-full text-left flex items-start gap-4 p-4 rounded-2xl border border-[var(--border)] hover:border-purple-500/70 hover:bg-purple-500/5 transition-colors group disabled:opacity-60"
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center"><UserPlus size={20} /></span>
                  <span>
                    <span className="block font-semibold group-hover:text-purple-400 transition-colors">{t("auth_register")}</span>
                    <span className="block text-xs text-[var(--muted)] mt-0.5">{t("auth_register_desc")}</span>
                  </span>
                </button>

                <button
                  onClick={useAnonymous}
                  disabled={busy}
                  className="w-full text-left flex items-start gap-4 p-4 rounded-2xl border border-[var(--border)] hover:border-emerald-500/70 hover:bg-emerald-500/5 transition-colors group disabled:opacity-60"
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center"><Eye size={20} /></span>
                  <span>
                    <span className="block font-semibold group-hover:text-emerald-400 transition-colors">{t("welcome_guest")}</span>
                    <span className="block text-xs text-[var(--muted)] mt-0.5">{t("welcome_guest_desc")}</span>
                  </span>
                </button>

                <button
                  onClick={() => { setMode("admin"); setError(""); }}
                  disabled={busy}
                  className="w-full text-left flex items-start gap-4 p-4 rounded-2xl border border-[var(--border)] hover:border-amber-500/70 hover:bg-amber-500/5 transition-colors group disabled:opacity-60"
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center"><ShieldCheck size={20} /></span>
                  <span>
                    <span className="block font-semibold group-hover:text-amber-400 transition-colors">{t("welcome_admin")}</span>
                    <span className="block text-xs text-[var(--muted)] mt-0.5">{t("welcome_admin_desc")}</span>
                  </span>
                </button>
              </div>

              {error && <p className="mt-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}

              <button
                onClick={() => { setMode("email"); setEmailMode("signin"); setError(""); }}
                className="mt-5 w-full text-center text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {t("auth_already_registered")}
              </button>
            </>
          )}

          {mode === "email" && (
            <>
              <button onClick={goBack} className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] mb-4 transition-colors">
                <ArrowLeft size={14} /> {t("welcome_back")}
              </button>
              <h2 className="text-2xl font-black tracking-tight">{emailMode === "signup" ? t("auth_signup_title") : t("auth_signin_title")}</h2>
              <p className="text-sm text-[var(--muted)] mt-2 mb-5">{emailMode === "signup" ? t("auth_signup_subtitle") : t("auth_signin_subtitle")}</p>

              <form onSubmit={submitEmail} className="space-y-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="input !pl-10"
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete={emailMode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="input !pl-10 !pr-11"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={t("auth_show_password")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {emailMode === "signup" && (
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder={t("auth_confirm_password")}
                      className="input !pl-10"
                    />
                  </div>
                )}

                {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}

                <button type="submit" disabled={busy} className="btn-primary w-full !py-3">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : emailMode === "signup" ? <UserPlus size={16} /> : <LogIn size={16} />}
                  {emailMode === "signup" ? t("auth_signup") : t("auth_signin")}
                </button>
              </form>

              <div className="mt-4 flex flex-col gap-2 text-center text-xs">
                <button onClick={() => { setEmailMode(emailMode === "signup" ? "signin" : "signup"); setError(""); }} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  {emailMode === "signup" ? t("auth_have_account") : t("auth_need_account")}
                </button>
                <button onClick={useAnonymous} disabled={busy} className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                  {t("welcome_guest_anonymous")}
                </button>
              </div>
            </>
          )}

          {mode === "admin" && (
            <>
              <button onClick={goBack} className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] mb-4 transition-colors">
                <ArrowLeft size={14} /> {t("welcome_back")}
              </button>
              <h2 className="text-2xl font-black tracking-tight">{t("welcome_login_title")}</h2>
              <p className="text-sm text-[var(--muted)] mt-2 mb-5">{t("welcome_login_subtitle")}</p>

              <form onSubmit={submitAdmin} className="space-y-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                    placeholder="medit451@gmail.com"
                    className="input !pl-10"
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    placeholder="••••••••"
                    className="input !pl-10 !pr-11"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={t("auth_show_password")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}

                <button type="submit" disabled={busy} className="btn-primary w-full !py-3">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} {t("welcome_enter")}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-[var(--muted)]">{t("auth_admin_hint")}</p>
            </>
          )}

          {mode === "account" && firebaseUser && (
            <>
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center"><UserRound size={22} /></span>
                <div className="min-w-0">
                  <h2 className="text-xl font-black tracking-tight">{t("auth_account_title")}</h2>
                  <p className="text-xs text-[var(--muted)] truncate max-w-[17rem]">
                    {firebaseUser.isAnonymous ? t("auth_anonymous_account") : firebaseUser.email || firebaseUser.displayName || t("auth_account")}
                  </p>
                </div>
              </div>
              <p className="text-sm text-[var(--muted)] mt-4">{t("auth_account_subtitle")}</p>
              <div className="mt-5 space-y-2">
                {serverAdmin ? (
                  <button onClick={() => window.location.assign("/admin")} className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
                    <ShieldCheck size={16} /> {t("nav_admin")}
                  </button>
                ) : (
                  <button onClick={() => { setMode("admin"); setError(""); }} className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold hover:border-indigo-500 transition-colors">
                    <ShieldCheck size={16} /> {t("welcome_admin")}
                  </button>
                )}
                <button onClick={logoutFirebase} disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />} {t("auth_logout")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
