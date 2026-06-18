export function taxonomyRoute(base: "tags" | "categories", name: string) {
  return `/${base}/${routeSegment(name)}/`;
}

export function routeSegment(name: string) {
  return name.trim().replace(/\s+/g, "-");
}
