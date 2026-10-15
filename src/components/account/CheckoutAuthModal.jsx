"use client";

import { useState } from "react";
import { ArrowRight, ChefHatIcon, CloseIcon } from "@/components/ui/icons";

export function CheckoutAuthModal({ onClose, onAuthenticated, onOpenTerms }) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [mode, setMode] = useState("register");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (mode === "register" && !acceptTerms) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, acceptTerms }),
      });
      const data = await response.json();
      if (!response.ok || !data.user) {
        setError(data.error ?? "We couldn’t verify those details. Please try again.");
        return;
      }
      onAuthenticated(data.user);
    } catch {
      setError("Connection issue. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-stone-950/35 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-auth-title"
        className="animate-sheet-in relative w-full max-w-[460px] rounded-[28px] border border-white/70 bg-[#fffdf9] p-6 shadow-[0_28px_100px_rgba(50,30,15,0.25)] sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close account form"
          className="absolute right-4 top-4 rounded-full p-2 text-stone-500 transition hover:bg-orange-50 hover:text-ink"
        >
          <CloseIcon width={19} height={19} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-brand-600">
          <ChefHatIcon width={26} height={26} />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Flavour Forge · checkout</p>
        <h2 id="checkout-auth-title" className="font-display mt-1 text-[30px] font-bold leading-tight text-ink">
          {mode === "register" ? "A little more flavour." : "Welcome back."}
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-600">
          {mode === "register"
            ? "Create your free account to place this order and keep your recipes and orders together."
            : "Sign in to continue to your order and see your saved recipes."}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-orange-50 p-1">
          {["register", "login"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setMode(item);
                setError("");
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                mode === item ? "bg-white text-brand-700 shadow-sm" : "text-stone-500 hover:text-ink"
              }`}
            >
              {item === "register" ? "Create account" : "Sign in"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-stone-700">Your name</span>
              <input
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ayesha Khan"
                className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition duration-300 placeholder:text-stone-400 focus:border-brand-400 focus:ring-4 focus:ring-orange-100"
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-stone-700">Email address</span>
            <input
              autoComplete="email"
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition duration-300 placeholder:text-stone-400 focus:border-brand-400 focus:ring-4 focus:ring-orange-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-stone-700">Password</span>
            <input
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              type="password"
              required
              minLength={mode === "register" ? 8 : 1}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
              className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition duration-300 placeholder:text-stone-400 focus:border-brand-400 focus:ring-4 focus:ring-orange-100"
            />
            {mode === "register" && <span className="mt-1 block text-xs text-stone-400">Use 8 or more characters.</span>}
          </label>

          {mode === "register" && (
            <label className="flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50/50 px-3.5 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#f97316]"
              />
              <span>
                I agree to the{" "}
                <button type="button" onClick={onOpenTerms} className="font-semibold text-brand-600 underline-offset-2 hover:underline">
                  Terms &amp; Conditions
                </button>{" "}
                and Privacy Notice.
              </span>
            </label>
          )}

          {error && (
            <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "One moment…" : mode === "register" ? "Create account & place order" : "Sign in & place order"}
            {!loading && <ArrowRight width={18} height={18} className="transition-transform duration-300 group-hover:translate-x-1" />}
          </button>
        </form>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-stone-400">
          Your account keeps your order history and favourites together. We never store your password in plain text.
        </p>
      </section>
    </div>
  );
}
