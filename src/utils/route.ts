export function taxonomyRoute(base: "tags" | "categories", name: string) {
  return `/${base}/${routeSegment(name)}/`;
}

export function normalizeTaxonomyName(name: string) {
  return name.trim().toLocaleLowerCase("en-US");
}

export function formatTaxonomyName(name: string) {
  const normalized = normalizeTaxonomyName(name);
  return taxonomyDisplayOverrides[normalized] ?? normalized.replace(/\S+/g, formatTaxonomyWord);
}

export function routeSegment(name: string) {
  return normalizeTaxonomyName(name).replace(/\s+/g, "-");
}

const taxonomyDisplayOverrides: Record<string, string> = {
  aead: "AEAD",
  amd: "AMD",
  api: "API",
  bios: "BIOS",
  cidr: "CIDR",
  cri: "CRI",
  dh密钥交换: "DH密钥交换",
  dns: "DNS",
  dnssec: "DNSSEC",
  doh: "DoH",
  edns: "EDNS",
  efi: "EFI",
  gpg: "GPG",
  gvt: "GVT",
  http: "HTTP",
  https: "HTTPS",
  ip: "IP",
  nat: "NAT",
  rsa: "RSA",
  udp: "UDP",
  uefi: "UEFI",
  uwp: "UWP"
};

function formatTaxonomyWord(word: string) {
  const parts = word.split("-");
  return parts
    .map((part) => taxonomyDisplayOverrides[part] ?? part.charAt(0).toLocaleUpperCase("en-US") + part.slice(1))
    .join("-");
}
