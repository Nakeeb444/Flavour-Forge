"use client";

import { CloseIcon, DocumentIcon } from "@/components/ui/icons";

const SECTIONS = [
  {
    title: "1. Acceptance of these terms",
    body: [
      "By creating an account, browsing recipes or placing an order on Flavour Forge you agree to these Terms & Conditions and our Privacy Notice. If you do not agree, please do not use the service.",
      "We may update these terms from time to time. The date at the top of this page shows when they were last revised; continued use after a change means you accept the revised terms.",
    ],
  },
  {
    title: "2. Your account",
    body: [
      "You must be at least 18 years old to create an account and place orders. Keep your password confidential — you are responsible for all activity on your account.",
      "Please make sure the name and email address on your account are accurate so we can send order confirmations and reach you if there is a problem.",
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
    title: "4. Orders, pricing and payment",
    body: [
      "Prices are shown in Indian Rupees (₹) and include applicable taxes unless stated otherwise. The 'estimated' price on a recipe is calculated from the default product for each ingredient and may change once you choose alternatives.",
      "An order is accepted when you receive a confirmation and it appears under My Orders. We may cancel an order if a product is unavailable, in which case you will not be charged for that item.",
    ],
  },
  {
    title: "5. Delivery",
    body: [
      "Delivery slots and areas are shown at checkout. Fresh and frozen items are packed to stay cool in transit; please refrigerate or freeze them promptly on arrival.",
      "If nobody is available to receive the order, our delivery partner will attempt to contact you before leaving items in a safe place.",
    ],
  },
  {
    title: "6. Returns, refunds and problems with an order",
    body: [
      "If an item is missing, damaged or not as described, contact Customer Care within 24 hours of delivery with your order number. We will replace the item or refund it to your original payment method within 5–7 working days.",
      "Perishable goods cannot be returned once delivered unless they are faulty.",
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
      "We collect the information needed to run your account and fulfil orders: your name, email address, order history, favourites and support messages. Passwords are stored only as salted hashes.",
      "We never sell your personal data. You can ask us to delete your account and associated data at any time through Customer Care.",
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
      "Questions about these terms? Reach us via Customer Care in the app, email care@flavourforge.app, or call +91 80000 12345 (Mon–Sat, 9am–8pm IST).",
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
