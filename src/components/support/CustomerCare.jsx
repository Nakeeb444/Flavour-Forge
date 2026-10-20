"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckIcon,
  ChevronDown,
  HeadsetIcon,
} from "@/components/ui/icons";

const CATEGORIES = [
  ["order", "Order issue"],
  ["delivery", "Delivery"],
  ["payment", "Payment & refunds"],
  ["recipe", "Recipe question"],
  ["account", "Account & privacy"],
  ["general", "Something else"],
];

const ticketRef = (id) => `FF-${String(id).padStart(5, "0")}`;

export function CustomerCare({ user, onToast, onOpenTerms }) {
  const [contact, setContact] = useState({
    userId: user?.id ?? null,
    name: user?.fullName ?? "",
    email: user?.email ?? "",
  });
  const [category, setCategory] = useState("order");
  const [subject, setSubject] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [ticketState, setTicketState] = useState({
    userId: user?.id ?? null,
    tickets: [],
  });
  const currentUserId = user?.id ?? null;
  const currentContact =
    contact.userId === currentUserId
      ? contact
      : {
          userId: currentUserId,
          name: user?.fullName ?? "",
          email: user?.email ?? "",
        };
  const tickets =
    ticketState.userId === currentUserId ? ticketState.tickets : [];

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch("/api/support", { cache: "no-store" })
      .then((r) => r.json())
      .then((loadedTickets) => {
        if (active) {
          setTicketState({ userId: user.id, tickets: loadedTickets });
        }
      })
      .catch(() => {
        if (active) onToast("Could not load your support tickets.");
      });
    return () => {
      active = false;
    };
  }, [user, onToast]);

  const updateContact = (field, value) => {
    setContact((current) => ({
      ...(current.userId === currentUserId
        ? current
        : {
            userId: currentUserId,
            name: user?.fullName ?? "",
            email: user?.email ?? "",
          }),
      [field]: value,
    }));
  };

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSending(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentContact.name,
          email: currentContact.email,
          category,
          subject,
          orderRef,
          message,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ticket) {
        setError(data.error ?? "We couldn't send that. Please try again.");
        return;
      }
      setSubmitted(data.ticket);
      setTicketState((current) => ({
        userId: currentUserId,
        tickets: [
          data.ticket,
          ...(current.userId === currentUserId ? current.tickets : []),
        ],
      }));
      setSubject("");
      setOrderRef("");
      setMessage("");
      onToast(`Ticket ${ticketRef(data.ticket.id)} saved`);
    } catch {
      setError("Connection issue. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm outline-none transition duration-300 placeholder:text-stone-400 focus:border-brand-400 focus:ring-4 focus:ring-orange-100";

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h1 className="font-display flex items-center gap-2 text-[26px] font-bold">
          <HeadsetIcon /> Customer Care
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Submit a request for your records. This app does not currently route
          tickets to a support inbox or send replies.
        </p>
      </div>

      <div className="card flex items-start gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand-600">
          <HeadsetIcon width={20} height={20} />
        </span>
        <p className="text-sm leading-relaxed text-stone-600">
          Requests are stored in the app. A support contact channel and reply
          workflow must be configured separately.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        {/* ticket form */}
        <section id="support-form" className="card scroll-mt-4 p-5">
          <h2 className="text-[18px] font-bold">Send us a message</h2>
          <p className="mt-1 text-xs text-stone-500">
            {user
              ? `Signed in as ${user.email}. Your ticket record is saved to your account.`
              : "You can create a ticket record without an account."}
          </p>

          {submitted && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                <CheckIcon width={12} height={12} strokeWidth={3} />
              </span>
              <span>
                Your ticket record is saved. Reference:{" "}
                <b>{ticketRef(submitted.id)}</b>. It has not been sent to a
                support inbox.
              </span>
            </div>
          )}

          <form onSubmit={submit} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-stone-600">
                  Your name
                </span>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={currentContact.name}
                  onChange={(e) => updateContact("name", e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-stone-600">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={currentContact.email}
                  onChange={(e) => updateContact("email", e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-stone-600">
                  Topic
                </span>
                <span className="relative block">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${inputClass} appearance-none pr-9`}
                  >
                    {CATEGORIES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    width={16}
                    height={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-stone-600">
                  Order number (optional)
                </span>
                <input
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  maxLength={40}
                  className={inputClass}
                  placeholder="e.g. #12"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-stone-600">
                Subject
              </span>
              <input
                required
                minLength={3}
                maxLength={120}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
                placeholder="What's this about?"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-stone-600">
                Message
              </span>
              <textarea
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputClass} resize-y`}
                placeholder="Tell us what happened and how we can help."
              />
              <span className="mt-1 block text-right text-[11px] text-stone-400">
                {message.length}/2000
              </span>
            </label>
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </p>
            )}
            <button
              disabled={sending}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200/60 transition duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            >
              {sending ? "Saving…" : "Save ticket"}
              {!sending && (
                <ArrowRight
                  width={18}
                  height={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>
            <p className="text-center text-[11px] text-stone-400">
              By sending, you agree to our{" "}
              <button
                type="button"
                onClick={onOpenTerms}
                className="font-semibold text-brand-600 underline-offset-2 hover:underline"
              >
                Terms &amp; Conditions
              </button>
              .
            </p>
          </form>
        </section>

        <div className="space-y-5">
          {/* ticket history */}
          <section className="card p-5">
            <h2 className="text-[18px] font-bold">Your tickets</h2>
            {!user ? (
              <p className="mt-2 text-sm text-stone-500">
                Sign in to see the history of your support requests.
              </p>
            ) : tickets.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">
                No tickets yet. We hope you never need one!
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {tickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="rounded-xl border border-orange-100 px-3.5 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-brand-600">
                        {ticketRef(ticket.id)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          ticket.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ticket.status === "resolved" ? "Resolved" : "Open"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {ticket.subject}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">
                      {ticket.message}
                    </p>
                    <p className="mt-1.5 text-[11px] text-stone-400">
                      {CATEGORIES.find(
                        ([value]) => value === ticket.category,
                      )?.[1] ?? "General"}{" "}
                      · {new Date(ticket.createdAt).toLocaleString()}
                      {ticket.orderRef ? ` · Order ${ticket.orderRef}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
