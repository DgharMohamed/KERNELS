export default function AboutPage({ onExplore }) {
  return (
    <main className="content-page">
      <div className="content-page__inner">
        <p className="eyebrow">About the project</p>
        <h1>Mars &amp; Earth Explorer</h1>
        <p className="content-page__lead">
          A small educational atlas for exploring real Martian geography and
          comparing it responsibly with landscapes on Earth.
        </p>

        <div className="about-grid">
          <section className="about-card">
            <h2>Real planetary data</h2>
            <p>
              The Mars map uses the NASA/JPL Mars Trek basemap — MGS MOLA
              colorized hillshade tiles served through the Trek WMTS service.
              Tiles are served in an equirectangular Mars projection
              (IAU2000:104905), the projection used by Leaflet here.
            </p>
          </section>

          <section className="about-card">
            <h2>Verified coordinates</h2>
            <p>
              Locations and coordinates come from the IAU Working Group for
              Planetary System Nomenclature, maintained by the USGS Astrogeology
              Science Center. Descriptions and facts are cross-checked against
              NASA Science and mission pages.
            </p>
          </section>

          <section className="about-card">
            <h2>Comparisons with care</h2>
            <p>
              Earth analogues are chosen to illustrate a shared geological
              process, not to claim that the landscapes formed in the same way.
              Each comparison lists both similarities and important differences.
            </p>
          </section>

          <section className="about-card">
            <h2>Scope of this MVP</h2>
            <p>
              This is a front-end-only educational demo. It has no backend,
              no user accounts and no scientific modeling. Map imagery is
              streamed from NASA/JPL Mars Trek and Esri World Imagery.
            </p>
          </section>
        </div>

        <div className="content-page__actions">
          <button type="button" className="button button--primary" onClick={onExplore}>
            Explore Mars
          </button>
          <a
            className="button button--ghost"
            href="https://planetarynames.wr.usgs.gov/"
            target="_blank"
            rel="noreferrer noopener"
          >
            IAU Gazetteer ↗
          </a>
        </div>
      </div>
    </main>
  )
}
