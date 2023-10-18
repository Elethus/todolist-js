export async function fetchJSON(url) {
  const headers = { Accept: "application/json" }
  const r = await fetch(url, { headers })
  if (r.ok) {
    return r.json()
  } else {
    throw new Error(`Unabled to fetch data : HTTP ${r.status}`, { cause: r })
  }
}