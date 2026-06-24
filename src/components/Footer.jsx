/**
 * Site footer showing institutional partners and data attribution.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div>
        BulSU-ALAS(01) · Malolos City, Bulacan &nbsp;·&nbsp;
        Operated by <strong style={{ color: '#94a3b8' }}>Bulacan State University</strong>
        &nbsp;in partnership with&nbsp;
        <strong style={{ color: '#94a3b8' }}>Bulacan DRRM Office</strong>
      </div>
      <div style={{ marginTop: '.3rem' }}>
        Forecast data: Open-Meteo NWP Model &nbsp;·&nbsp;
        Station sensor: OTT netDL 1000 &nbsp;·&nbsp;
        Pyranometer: Kipp &amp; Zonen SMP10-A
      </div>
      <div style={{ marginTop: '.3rem' }}>
        © {year} BulSU Reconnaissance Center. All rights reserved.
      </div>
    </footer>
  )
}
