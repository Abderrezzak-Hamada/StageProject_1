import { useState } from 'react'
import './spaar.css'
import './start.css'
import {
  getDoelen, addDoel, wijzigDoel, parseBedrag, filterBedrag, euro, euro2,
  procent, datumLabel, isoDatum, perMaand,
} from './spaarStore'

/* ---------- gedeelde onderdelen ---------- */
function Balk({ pct, klaar }) {
  return (
    <div className="b-balk">
      <div className={`b-balk-vul ${klaar ? 's-groen' : 'b-ok'}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function DoelKaart({ doel }) {
  return (
    <section className="b-kaart s-doelkaart">
      <div className="s-rij"><small>Spaardoel</small><span>{procent(doel.gespaard, doel.doel)}%</span></div>
      <h2 className="s-naam">{doel.naam}</h2>
      <p className="s-bedragen">{euro(doel.gespaard)} van {euro(doel.doel)}</p>
      <Balk pct={procent(doel.gespaard, doel.doel)} />
    </section>
  )
}

function BedragVeld({ waarde, setWaarde, licht, placeholder }) {
  return (
    <div className={`b-bedrag ${licht ? 's-licht' : ''}`}>
      <span>€</span>
      <input inputMode="decimal" value={waarde} placeholder={placeholder}
        onChange={(e) => setWaarde(filterBedrag(e.target.value))} />
    </div>
  )
}

function Kop({ titel, onTerug }) {
  return (
    <header className="b-header">
      <button className="b-icoon" onClick={onTerug}>&lt;</button>
      <h1>{titel}</h1>
    </header>
  )
}

/* ---------- schermen ---------- */
function Storten({ doel, onKlaar }) {
  const [bedrag, setBedrag] = useState('50,00')
  const [datum, setDatum] = useState(isoDatum(new Date()))
  const [omschr, setOmschr] = useState('')
  const [fout, setFout] = useState('')

  const dagen = Array.from({ length: 31 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return isoDatum(d)
  })
  const n = parseBedrag(bedrag)
  const nieuw = doel.gespaard + n

  const opslaan = () => {
    if (n <= 0) return setFout('Vul een geldig bedrag in.')
    wijzigDoel(doel.id, n, datum, omschr)
    onKlaar()
  }

  return (
    <div className="b-scherm">
      <Kop titel="Geld storten" onTerug={onKlaar} />
      <main className="b-main">
        <p className="b-intro">Kies hoeveel je aan je spaardoel wilt toevoegen.</p>
        <DoelKaart doel={doel} />
        <section className="b-kaart b-form">
          <label>Bedrag storten
            <BedragField {...{ bedrag, setBedrag, setFout }} />
          </label>
          <label>Datum
            <select value={datum} onChange={(e) => setDatum(e.target.value)}>
              {dagen.map((d) => <option key={d} value={d}>{datumLabel(d)}</option>)}
            </select>
          </label>
          <label>Omschrijving (optioneel)
            <input className="s-tekst" placeholder="Bijv. extra gespaard" value={omschr}
              onChange={(e) => setOmschr(e.target.value)} />
          </label>
          <div className="b-lijn" />
          <div className="s-rij s-totaal"><span>Na deze storting heb je gespaard</span><strong>{euro2(nieuw)}</strong></div>
          {fout && <p className="b-fout">{fout}</p>}
        </section>
        <section className="b-kaart">
          <div className="s-rij"><small>Nieuwe voortgang</small><strong>{procent(nieuw, doel.doel)}%</strong></div>
          <Balk pct={procent(nieuw, doel.doel)} />
        </section>
        <button className="b-knop b-knop--primair" onClick={opslaan}>{euro2(n)} storten</button>
        <button className="b-knop" onClick={onKlaar}>Annuleren</button>
      </main>
    </div>
  )
}

function Opnemen({ doel, onKlaar }) {
  const [bedrag, setBedrag] = useState('50,00')
  const [reden, setReden] = useState('')
  const [fout, setFout] = useState('')
  const n = parseBedrag(bedrag)
  const over = Math.max(0, doel.gespaard - n)

  const opslaan = () => {
    if (n <= 0) return setFout('Vul een geldig bedrag in.')
    if (n > doel.gespaard) return setFout(`Je kunt maximaal ${euro2(doel.gespaard)} opnemen.`)
    wijzigDoel(doel.id, -n, isoDatum(new Date()), reden)
    onKlaar()
  }

  return (
    <div className="b-scherm">
      <Kop titel="Geld opnemen" onTerug={onKlaar} />
      <main className="b-main">
        <p className="b-intro">Kies hoeveel je uit je spaardoel wilt opnemen.</p>
        <DoelKaart doel={doel} />
        <section className="b-kaart b-form">
          <label>Bedrag opnemen
            <BedragField {...{ bedrag, setBedrag, setFout }} />
          </label>
          <label>Reden (optioneel)
            <input className="s-tekst" placeholder="Bijv. onverwachte kosten" value={reden}
              onChange={(e) => setReden(e.target.value)} />
          </label>
          <div className="b-lijn" />
          <div className="s-rij s-totaal"><span>Na opname blijft er over</span><strong>{euro2(over)}</strong></div>
          {fout && <p className="b-fout">{fout}</p>}
        </section>
        <div className="b-melding b-melding--grijs">
          Door geld op te nemen duurt het mogelijk langer voordat je je spaardoel bereikt.
        </div>
        <button className="b-knop b-knop--primair" onClick={opslaan}>{euro2(n)} opnemen</button>
        <button className="b-knop" onClick={onKlaar}>Annuleren</button>
      </main>
    </div>
  )
}

function BedragField({ bedrag, setBedrag, setFout }) {
  return <BedragVeld waarde={bedrag} setWaarde={(v) => { setBedrag(v); setFout('') }} />
}

function Toevoegen({ onKlaar }) {
  const [naam, setNaam] = useState('')
  const [doel, setDoel] = useState('1.000,00')
  const [gespaard, setGespaard] = useState('')
  const [fout, setFout] = useState('')

  const maanden = Array.from({ length: 36 }, (_, i) => {
    const d = new Date(); return isoDatum(new Date(d.getFullYear(), d.getMonth() + 1 + i, 1))
  })
  const [streef, setStreef] = useState(maanden[11])

  const d = parseBedrag(doel)
  const g = parseBedrag(gespaard)

  const opslaan = () => {
    if (!naam.trim()) return setFout('Geef je spaardoel een naam.')
    if (d <= 0) return setFout('Vul een geldig doelbedrag in.')
    if (g > d) return setFout('Al gespaard kan niet hoger zijn dan het doelbedrag.')
    addDoel({ naam: naam.trim(), doel: d, gespaard: g, streef })
    onKlaar()
  }

  return (
    <div className="b-scherm">
      <Kop titel="Spaardoel toevoegen" onTerug={onKlaar} />
      <main className="b-main">
        <p className="b-intro">Maak een doel aan en zie hoeveel je iedere maand moet sparen.</p>
        <section className="b-kaart b-form">
          <label>Naam spaardoel
            <input className="s-tekst" placeholder="Bijv. nieuwe laptop" value={naam}
              onChange={(e) => { setNaam(e.target.value); setFout('') }} />
          </label>
          <label>Doelbedrag
            <BedragVeld waarde={doel} setWaarde={(v) => { setDoel(v); setFout('') }} />
          </label>
          <label>Al gespaard (optioneel)
            <BedragVeld licht placeholder="0,00" waarde={gespaard} setWaarde={(v) => { setGespaard(v); setFout('') }} />
          </label>
          <label>Streefdatum
            <select value={streef} onChange={(e) => setStreef(e.target.value)}>
              {maanden.map((m) => <option key={m} value={m}>{datumLabel(m)}</option>)}
            </select>
          </label>
          <div className="s-nodig">
            <small>Nodig om je doel te halen</small>
            <strong>{euro2(perMaand(d, g, streef))} per maand</strong>
          </div>
          {fout && <p className="b-fout">{fout}</p>}
        </section>
        <button className="b-knop b-knop--primair" onClick={opslaan}>Spaardoel opslaan</button>
        <button className="b-knop" onClick={onKlaar}>Annuleren</button>
      </main>
    </div>
  )
}

/* ---------- hoofdscherm ---------- */
export default function Sparen({ onNaarStart, onNaarUitloggen }) {
  const [scherm, setScherm] = useState({ naam: 'lijst' })
  const [doelen, setDoelen] = useState(getDoelen)

  const terug = () => { setDoelen(getDoelen()); setScherm({ naam: 'lijst' }) }
  const actief = (id) => doelen.find((d) => d.id === id)

  if (scherm.naam === 'storten') return <Storten doel={actief(scherm.id)} onKlaar={terug} />
  if (scherm.naam === 'opnemen') return <Opnemen doel={actief(scherm.id)} onKlaar={terug} />
  if (scherm.naam === 'toevoegen') return <Toevoegen onKlaar={terug} />

  const nav = (fn) => (e) => { e.preventDefault(); fn?.() }

  return (
    <div className="b-scherm s-met-nav">
      <header className="b-header"><h1>Spaardoelen</h1></header>
      <main className="b-main">
        {doelen.map((d) => {
          const klaar = d.gespaard >= d.doel
          return (
            <section className="b-kaart s-doelkaart" key={d.id}>
              <div className="s-rij">
                <h2 className="s-naam">{d.naam}</h2>
                <span>{klaar ? 'Afgerond' : `${procent(d.gespaard, d.doel)}%`}</span>
              </div>
              <p className="s-bedragen">{euro(d.gespaard)} van {euro(d.doel)}</p>
              <Balk pct={procent(d.gespaard, d.doel)} klaar={klaar} />
              {!klaar && (
                <>
                  <p className="s-sub">
                    Streefdatum {datumLabel(d.streef)} · nodig: {euro2(perMaand(d.doel, d.gespaard, d.streef))} per maand
                  </p>
                  <div className="s-knoppen">
                    <button className="b-knop s-klein" onClick={() => setScherm({ naam: 'storten', id: d.id })}>+ Storten</button>
                    <button className="b-knop s-klein" disabled={d.gespaard <= 0}
                      onClick={() => setScherm({ naam: 'opnemen', id: d.id })}>− Opnemen</button>
                  </div>
                </>
              )}
            </section>
          )
        })}
        <button className="b-knop b-knop--primair" onClick={() => setScherm({ naam: 'toevoegen' })}>+ Spaardoel</button>
      </main>

      <nav className="onderbalk">
        <a href="#start" onClick={nav(onNaarStart)}>Start</a>
        <a href="#transacties" onClick={(e) => e.preventDefault()}>Transacties</a>
        <a href="#sparen" className="actief" onClick={(e) => e.preventDefault()}>Sparen</a>
        <a href="#uitloggen" onClick={nav(onNaarUitloggen)}>Uitloggen</a>
      </nav>
    </div>
  )
}
