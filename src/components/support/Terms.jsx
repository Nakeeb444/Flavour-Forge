"use client";

import { CloseIcon, DocumentIcon } from "@/components/ui/icons";

const SECTIONS = [
  {
    title: "1. Acceptance of these terms",
    body: [
      "By creating an account or using Flavour Forge you agree to these Terms & Conditions. If you do not agree, please do not use the service.",
      "We may update these terms from time to time. The date at the top of this page shows when they were last revised; continued use after a change means you accept the revised terms.",
    ],
  },
  {
    title: "2. Your account",
    body: [
      "Keep your password confidential — you are responsible for activity on your account. The app does not currently verify a user's age.",
      "Please make sure the name and email address on your account are accurate so your account records are correct.",
    ],
  },
  {
    title: "3. Recipes and nutrition information",
    body: [
      "Recipes, timings and nutrition figures are provided as a helpful guide and may vary with the ingredients and equipment you use. Always check packaging for allergens and follow safe food-handling practices.",
      "Flavour Forge is not a substitute for professional dietary or medical advice.",
    ],
  },
  {
    title: "4. Order requests and prices",
    body: [
      "Prices are shown in Indian Rupees (₹). A recipe-kit estimate uses the default product for each ingredient and may change if you choose alternatives.",
      "Submitting the cart records an order request in your account. This version does not process payments, accept fulfilment, or confirm a purchase. No payment is taken.",
    ],
  },
  {
    title: "5. Delivery and fulfilment",
    body: [
      "This version does not arrange delivery or fulfil orders. Do not rely on an order request as confirmation that ingredients will be supplied.",
    ],
  },
  {
    title: "6. Support requests",
    body: [
      "The Customer Care form stores a ticket record in the app. A support inbox and reply workflow are not configured in this version, so submitting a ticket does not guarantee a response.",
    ],
  },
  {
    title: "7. Acceptable use",
    body: [
      "You agree not to misuse the service — for example by attempting to access other users' accounts, scraping content, or submitting false support requests.",
    ],
  },
  {
    title: "8. Privacy",
    body: [
      "The app stores account details, order requests, favourites and support ticket records needed for its features. Passwords for accounts managed by this app are stored as salted hashes; Firebase-managed accounts are authenticated by Firebase.",
      "Account deletion is not currently available in the app. A database operator would need to process deletion requests.",
    ],
  },
  {
    title: "9. Liability",
    body: [
      "To the extent permitted by law, Flavour Forge is not liable for indirect or consequential loss arising from use of the service. Nothing in these terms limits liability for death or personal injury caused by negligence, or for fraud.",
    ],
  },
  {
    title: "10. Contact",
    body: [
      "The in-app Customer Care form records requests, but this version does not route them to a support team. Configure and publish a verified support contact before launch.",
    ],
  },
];

export function TermsContent({ compact = false }) {
  return (
    <div className={compact ? "space-y-5" : "space-y-7"}>
      <p className="text-sm text-stone-500">Last updated: 1 October 2026</p>
      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h3 className="text-[15px] font-bold text-ink">{section.title}</h3>
          {section.body.map((paragraph, index) => (
            <p
              key={index}
              className="mt-2 text-sm leading-relaxed text-stone-600"
            >
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}

export function TermsModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[95] grid place-items-center bg-stone-950/40 px-3 py-4 backdrop-blur-sm sm:px-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
        className="animate-sheet-in card relative flex max-h-[88vh] w-full max-w-[720px] flex-col"
      >
        <header className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
          <h2
            id="terms-title"
            className="font-display flex items-center gap-2 text-[22px] font-bold"
          >
            <DocumentIcon className="text-brand-500" /> Terms &amp; Conditions
          </h2>
          <button
            onClick={onClose}
            aria-label="Close terms"
            className="rounded-full p-2 text-stone-500 transition-colors duration-300 hover:bg-orange-50 hover:text-ink"
          >
            <CloseIcon width={20} height={20} />
          </button>
        </header>
        <div className="scrollbar-thin overflow-y-auto px-5 py-5">
          <TermsContent compact />
        </div>
        <footer className="border-t border-orange-100 px-5 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-600"
          >
            I understand
          </button>
        </footer>
      </section>
    </div>
  );
}
