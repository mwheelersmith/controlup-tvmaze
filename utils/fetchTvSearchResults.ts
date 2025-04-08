export default function fetchResults(term: string, page: number) {
  return fetch("/api/tvsearch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: term, page: page }),
  });
}
