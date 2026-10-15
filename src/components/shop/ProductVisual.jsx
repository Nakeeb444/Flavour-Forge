function productArtwork(emoji, name, productId) {
  const key = `${productId ?? name}:${name}`;
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
  }
  const hue = Math.abs(hash) % 360;
  const pattern = Math.abs(hash >>> 8) % 4;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 78% 94%)"/><stop offset="1" stop-color="hsl(${(hue + 36) % 360} 78% 82%)"/></linearGradient></defs><rect width="160" height="160" rx="28" fill="url(#g)"/><circle cx="${28 + (Math.abs(hash) % 105)}" cy="${24 + (Math.abs(hash >>> 4) % 110)}" r="${12 + (Math.abs(hash >>> 12) % 18)}" fill="white" fill-opacity=".32"/><path d="${pattern === 0 ? "M0 125 Q42 95 82 126 T160 120 V160 H0Z" : pattern === 1 ? "M0 30 Q55 62 90 28 T160 36 V0 H0Z" : pattern === 2 ? "M0 145 Q50 115 100 140 T160 130 V160 H0Z" : "M0 0 Q50 28 100 0 T160 25 V0Z"}" fill="hsl(${(hue + 20) % 360} 67% 62%)" fill-opacity=".42"/><text x="80" y="91" text-anchor="middle" dominant-baseline="middle" font-size="67">${emoji || "🥬"}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function ProductVisual({ emoji, name, productId, size = "md" }) {
  const dimensions = {
    sm: "h-11 w-11 rounded-xl text-[24px]",
    md: "h-16 w-16 rounded-2xl text-[34px]",
    lg: "h-24 w-24 rounded-2xl text-[52px]",
  };

  return (
    <span
      role="img"
      aria-label={name}
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-orange-100 bg-gradient-to-br from-orange-50 to-brand-100 shadow-inner ${dimensions[size] ?? dimensions.md}`}
    >
      {productId != null ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={productArtwork(emoji, name, productId)}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        emoji
      )}
    </span>
  );
}
