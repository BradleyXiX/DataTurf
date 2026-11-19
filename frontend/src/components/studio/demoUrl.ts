export function liveRoute(path: string) {
  const url = new URL(path, 'https://dataturf.invalid');
  url.searchParams.delete('demo');
  return url.pathname + url.search + url.hash;
}
