import "./globals.css";

export const metadata = {
  title: "Flavour Forge — From Cravings To Creations!",
  description: "Discover delicious recipes, shop ingredients and cook your favourite meals with ease.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

// Applies the persisted theme before React hydrates so there is no flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem("ff-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark"){document.documentElement.classList.add("dark")}document.documentElement.style.colorScheme=t}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
