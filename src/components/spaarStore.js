const KEY = 'spaardoelen'
 
const lees = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}
const schrijf = (v) => localStorage.setItem(KEY, JSON.stringify(v))
 
export function getDoelen() {
  let d = lees()
  if (!d) {
    d = [
      { id: 1, naam: 'Rijbewijs', doel: 1500, gespaard: 600, streef: '2027-04-01', mutaties: [] },
      { id: 2, naam: 'Vakantie', doel: 500, gespaard: 300, streef: '2027-07-01', mutaties: [] },
      { id: 3, naam: 'Nieuwe fiets', doel: 250, gespaard: 250, streef: '2026-09-01', mutaties: [] },
    ]
    schrijf(d)
  }
  return d
}
 
export function addDoel({ naam, doel, gespaard, streef }) {
  const d = getDoelen()
  d.push({ id: Date.now(), naam, doel, gespaard, streef, mutaties: [] })
  schrijf(d)
}
 
// bedrag positief = storten, negatief = opnemen
export function wijzigDoel(id, bedrag, datum, omschrijving) {
  const d = getDoelen().map((x) =>
    x.id === id
      ? {
          ...x,
          gespaard: Math.round((x.gespaard + bedrag) * 100) / 100,
          mutaties: [...x.mutaties, { bedrag, datum, omschrijving }],
        }
      : x
  )
  schrijf(d)
}
 
// ---- helpers ----
export const parseBedrag = (s) => Number(String(s).replace(/\./g, '').replace(',', '.')) || 0
export const filterBedrag = (s) => s.replace(/[^0-9,.]/g, '')
 
export const euro = (n) => `€ ${n.toLocaleString('nl-NL', { maximumFractionDigits: 2 })}`
export const euro2 = (n) =>
  `€ ${n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
 
export const procent = (g, d) => (d > 0 ? Math.min(100, Math.round((g / d) * 100)) : 0)
 
export const datumLabel = (iso) => {
  const [j, m, d] = iso.split('-').map(Number)
  return new Date(j, m - 1, d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}
export const isoDatum = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
 
export function maandenTot(streefIso) {
  const nu = new Date()
  const [j, m] = streefIso.split('-').map(Number)
  return Math.max(1, (j - nu.getFullYear()) * 12 + (m - 1 - nu.getMonth()))
}
export const perMaand = (doel, gespaard, streefIso) =>
  Math.max(0, Math.ceil(((doel - gespaard) / maandenTot(streefIso)) * 100) / 100)