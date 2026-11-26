/**
 * Nebulae and image gallery — #/cosmic/nebulae?sel=<nebula id>
 * Licensed Hubble, Webb and EHT images with visible credit lines; nebula records with distances and
 * emission lines linked to the NIST spectra in the Spectral atlas. Gate 6.5.
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { SourceLinks } from '@/ui/SourcesView';
import { GALLERY, GALLERY_NOTE, NEBULAE, PUBLISHER_SOURCE, distanceText, imageById, type GalleryImage, type Nebula } from './nebulae';

/** An image with its mandatory, visible credit line and licence. */
export function CreditedImage({ img, size = 'card', onClick }: { img: GalleryImage; size?: 'card' | 'large'; onClick?: () => void }) {
  return (
    <figure className={`gallery-figure ${size}`} style={{ margin: 0 }}>
      <img src={img.path} alt={img.title} loading="lazy" onClick={onClick} style={{ width: '100%', aspectRatio: size === 'card' ? '1' : undefined, objectFit: 'cover', borderRadius: 6, cursor: onClick ? 'pointer' : undefined, display: 'block' }} />
      <figcaption className="note" style={{ fontSize: 10.5, marginTop: 4 }}>
        <strong style={{ color: 'var(--text)' }}>{img.title}</strong><br />
        Credit: {img.credit} · <a href={img.licence.url} target="_blank" rel="noreferrer">{img.licence.name}</a> · <a href={img.page} target="_blank" rel="noreferrer">{img.publisher} {img.id}</a>
      </figcaption>
    </figure>
  );
}

function NebulaPanel({ n }: { n: Nebula }) {
  const img = imageById(n.image)!;
  const d = n.distance;
  return (
    <>
      <h2 style={{ margin: '0 0 2px', fontWeight: 400 }}>{n.name}</h2>
      <div className="note">{n.aliases.join(' · ')}</div>
      <CreditedImage img={img} size="large" />
      <dl className="kv" aria-label="Nebula properties" style={{ marginTop: 8 }}>
        <KV k="Type" v={n.type} />
        <KV k="Distance" v={distanceText(n)} />
        <KV k="Telescope" v={img.telescope} />
      </dl>
      {d && <p className="note" style={{ fontSize: 10.5 }}>Distance: {d.method} <SourceLinks ids={[d.source]} />{d.approximate ? ' (approximate).' : '.'} Type: <SourceLinks ids={[n.typeSource]} /></p>}
      {n.lines.length > 0 && <>
        <div className="section-title">Emission lines</div>
        <ul className="note" style={{ paddingLeft: 16 }} aria-label="Emission lines">
          {n.lines.map((l) => <li key={l.spectrum}><button className="link-btn" onClick={() => navigate(`/spectral?tab=lines&spec=${encodeURIComponent(l.spectrum)}`)}>{l.label}</button>: {l.context} <SourceLinks ids={[l.source]} /></li>)}
        </ul>
        <p className="note" style={{ fontSize: 10.5 }}>Each link opens the NIST line list of that ion in the Spectral atlas <SourceLinks ids={['nist-asd']} />. [N II] and [O III] are forbidden (magnetic-dipole) transitions.</p>
      </>}
      {n.notes.map((x) => <p key={x.text} className="note">{x.text} <SourceLinks ids={[x.source]} /></p>)}
      <p className="note" style={{ fontSize: 10.5 }}>{GALLERY_NOTE}{img.colours ? ` ${img.colours}` : ''}</p>
      <RelatedLinks id={`nebula:${n.id}`} />
    </>
  );
}

export default function NebulaeView() {
  const { query } = useRoute();
  const sel = NEBULAE.find((n) => n.id === query.get('sel')) ?? null;
  const nebulaImages = GALLERY.filter((g) => NEBULAE.some((n) => n.image === g.id));
  const bhImages = GALLERY.filter((g) => !NEBULAE.some((n) => n.image === g.id));
  return (
    <>
      <div className="center-stage" style={{ left: 12 }}>
        <div className="stage-head"><h1>Nebulae &amp; image gallery <ProvenanceBadge cls="observed" title="processed observations; colours assigned by the publisher" /></h1>
          <p className="note">Clouds of gas and dust in our Galaxy, photographed by Hubble and Webb, and the first images of two black holes by the Event Horizon Telescope. Every image is shown with its publisher’s credit line and licence. Colours are assigned to filters by the image makers; they are not what the eye would see.</p></div>
        <div className="section-title">Nebulae</div>
        <div className="gallery-grid" role="list" aria-label="Nebula images" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
          {nebulaImages.map((img) => { const n = NEBULAE.find((x) => x.image === img.id)!; return (
            <div role="listitem" key={img.id} className={sel?.id === n.id ? 'gallery-sel' : ''} style={{ outline: sel?.id === n.id ? '2px solid var(--accent)' : 'none', borderRadius: 8, padding: 4 }}>
              <CreditedImage img={img} onClick={() => setQuery({ sel: n.id })} />
              <button className="chip" style={{ marginTop: 4 }} onClick={() => setQuery({ sel: n.id })}>{n.name} · {n.type}</button>
            </div>); })}
        </div>
        <div className="section-title" style={{ marginTop: 14 }}>Black holes (Event Horizon Telescope)</div>
        <div className="gallery-grid" role="list" aria-label="Black hole images" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
          {bhImages.map((img) => (
            <div role="listitem" key={img.id} style={{ padding: 4 }}>
              <CreditedImage img={img} onClick={() => navigate(`/cosmic/compact?sel=${img.object}`)} />
              <button className="chip" style={{ marginTop: 4 }} onClick={() => navigate(`/cosmic/compact?sel=${img.object}`)}>Measurements and shadow check →</button>
            </div>
          ))}
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>Image sources and licences: <SourceLinks ids={[...new Set(GALLERY.map((g) => PUBLISHER_SOURCE[g.publisher]))]} />. The 700-pixel renditions were downloaded once and stored with their SHA-256 checksums; nothing is generated or altered.</p>
      </div>
      <Panel id="neb-info" className="right-panel" title="Nebula">
        {sel ? <NebulaPanel n={sel} /> : <p className="note">Select an image to see the object’s type, distance and emission lines.</p>}
      </Panel>
    </>
  );
}
