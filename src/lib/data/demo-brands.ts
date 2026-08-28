export const SAMPLE_BRANDS = [
  { name: "Atlantic Workshop", site: "https://example.com", color: "1d3b2a" },
  { name: "Laurel Field Co.", site: "https://example.com", color: "4a5d23" },
  { name: "Seixal Studio", site: "https://example.com", color: "2c4c5c" },
  { name: "Terraced Type", site: "https://example.com", color: "6b3f1d" },
  { name: "Fajã Goods", site: "https://example.com", color: "3d2b4f" },
  { name: "North Coast Press", site: "https://example.com", color: "1f2a44" },
  { name: "Levadas Ltd", site: "https://example.com", color: "245c4a" },
  { name: "Basalt & Co", site: "https://example.com", color: "3a3a3a" },
] as const;

export function demoLogoDataUri(name: string, color: string): string {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="96" viewBox="0 0 240 96"><rect width="240" height="96" rx="8" fill="#${color}"/><text x="120" y="56" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="28" fill="#F5F3EC">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
