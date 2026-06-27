export default function Footer() {
  return (
    <footer>
      <div>
        BulSU‑ALAS(01) · MALOLOS CITY, BULACAN · {new Date().getFullYear()}
      </div>
      <div style={{ marginTop: '.35rem', opacity: .7 }}>
        OPERATED BY BULACAN STATE UNIVERSITY RECONNAISSANCE CENTER
        &nbsp;·&nbsp; IN PARTNERSHIP WITH BULACAN DRRM OFFICE
      </div>
      <div style={{ marginTop: '.35rem', opacity: .5 }}>
        SENSOR: OTT netDL 1000 · PYRANOMETER: KIPP &amp; ZONEN SMP10‑A
        &nbsp;·&nbsp; FORECAST: OPEN‑METEO NWP · DATA: SUPABASE REAL‑TIME
      </div>
    </footer>
  )
}