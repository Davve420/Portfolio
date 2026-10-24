import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { siteContent } from './data/siteContent'
import { shrineCategories } from './data/shrineCategories'
import { shrineTopTracks } from './data/shrineTopTracks'
import { expressionPhotos } from './data/expressionPhotos'
import shrineEntries from './data/shrineEntries.json'
import projectsPortal from './assets/projects-portal.gif'
import futureCity from './assets/expression/futurecity.png'
import './App.css'

const StarNotes = lazy(() => import('./components/StarNotes'))

function isVisibleShrineEntry(entry) {
  if (entry && typeof entry === 'object' && Object.values(entry).every((value) => value === '')) {
    return false
  }

  const isValid = entry &&
    typeof entry.id === 'string' &&
    entry.id.trim() &&
    typeof entry.title === 'string' &&
    entry.title.trim() &&
    shrineCategories.some((category) => category.id === entry.category)

  if (!isValid) {
    console.error('Skipping an incomplete Digital Shrine entry. Each entry needs an id, title, and valid category.', entry)
  }

  return Boolean(isValid)
}

const publishedShrineEntries = shrineEntries.filter(isVisibleShrineEntry)
const shrineCategoryOrder = new Map(shrineCategories.map((category, index) => [category.id, index]))
const seriesFormats = [
  'Live action',
  'Anime',
  'Western animation',
  'Documentary/Nature',
  'Reality/unscripted',
  'Stop motion',
  'Anthology',
]

// Den här hooken läser nuvarande hash i URL:en, exempelvis #music eller #portfolio.
// Det gör att vi kan navigera mellan olika "rum" i appen utan att ladda om sidan.
function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'home')

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash.slice(1) || 'home')
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return route
}

// Den gemensamma rymdbakgrunden ligger utanför varje enskilt rum.
// Därför får About, Music och Fashion samma "lilla solsystem" utan att
// varje sida behöver bygga sin egen stjärnhimmel.
function SpaceBackdrop() {
  return (
    <div className="universe-backdrop" aria-hidden="true">
      <div className="universe-nebula" />
      <div className="universe-stars">
        {Array.from({ length: 88 }, (_, index) => <span key={index} />)}
      </div>
    </div>
  )
}

// Den här knappen är appens fasta hemväg.
// Den visas på alla routes så att man alltid kan återvända till portalerna.
function HomePortalButton({ route }) {
  if (route === 'home') {
    return null
  }

  return (
    <a
      className="home-portal-button"
      href="#home"
      aria-label="Return to the portal map"
      title="Return to the portal map"
    >
      <img src="/assets/portals/portal.png" alt="" />
    </a>
  )
}

// En portal består främst av en bild. Texten hålls kort så att startsidan känns
// mer som en plats att upptäcka än som tre informationskort.
function PortalCard({ portal }) {
  return (
    <a
      href={`#${portal.id}`}
      className="portal-card"
      aria-label={portal.title}
    >
      <img className="portal-image" src={portal.image} alt="" />
      <span className="portal-card__content">
        <span className="portal-card__eyebrow">{portal.short}</span>
        <span className="portal-card__title">{portal.title}</span>
        <span className="portal-card__link">Enter</span>
      </span>
    </a>
  )
}

// Startsidan består medvetet av tre delar:
// 1. En centrerad introduktion.
// 2. En kort prompt som förklarar vad sidan är.
// 3. Tre portaler som skapas från datafilen.
//
// När du vill designa vidare börjar du främst i App.css under "LANDING PAGE".
function SpaceLandingPage() {
  return (
    <section className="space-landing" aria-labelledby="space-heading">
      <div className="space-intro">
        <p className="eyebrow">{siteContent.brand}</p>
        <h1 id="space-heading">Welcome to Davin3t</h1>
        <p className="space-prompt" role="status">{siteContent.space.intro}</p>
        <p className="space-subtext">{siteContent.space.subtext}</p>
      </div>

      <div className="portal-grid" aria-label="Portal navigation">
        {siteContent.space.portals.map((portal) => (
          <PortalCard key={portal.id} portal={portal} />
        ))}
      </div>
    </section>
  )
}

function spotifyEmbedUrl(link) {
  try {
    const url = new URL(link)
    if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com') {
      return ''
    }

    const match = url.pathname.match(/^\/(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)\/?$/)
    return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator` : ''
  } catch {
    return ''
  }
}

function spotifyEmbedHeight(link) {
  try {
    return /^\/(album|artist|playlist|show)\//.test(new URL(link).pathname) ? 352 : 152
  } catch {
    return 152
  }
}

function sourceLinkLabel(link) {
  try {
    const hostname = new URL(link).hostname
    if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) return 'YouTube'
    if (hostname === 'open.spotify.com') return 'Spotify'
  } catch {
    return 'Visit source'
  }

  return 'Visit source'
}

function StarburstIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m12 1.5 2.2 6.3 6.3-4.3-4.3 6.3 6.3 2.2-6.3 2.2 4.3 6.3-6.3-4.3-2.2 6.3-2.2-6.3-6.3 4.3 4.3-6.3L1.5 12l6.3-2.2-4.3-6.3 6.3 4.3L12 1.5Z" fill="currentColor" />
    </svg>
  )
}

function ShrineSymbol({ category, className }) {
  if (category.symbol === 'starburst') {
    return <StarburstIcon className={className} />
  }

  return <span className={className} aria-hidden="true">{category.symbol}</span>
}

function ExternalLinkIcon() {
  return (
    <svg className="external-link-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M5 3.5h7.5V11M12.25 3.75 4 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

function MusicRoom() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSeriesFormat, setActiveSeriesFormat] = useState('all')
  const [activeMusicId, setActiveMusicId] = useState('')
  const [activeTopTrackId, setActiveTopTrackId] = useState(shrineTopTracks[0]?.id || '')
  const [isStarNotesOpen, setIsStarNotesOpen] = useState(false)
  const starNotesTriggerRef = useRef(null)
  const starNotesCloseRef = useRef(null)
  const entries = publishedShrineEntries
  const categoryEntries = activeCategory === 'all'
    ? entries.slice().sort((left, right) => (
      shrineCategoryOrder.get(left.category) - shrineCategoryOrder.get(right.category)
    ))
    : entries.filter((entry) => entry.category === activeCategory)
  const filteredEntries = activeCategory === 'series' && activeSeriesFormat !== 'all'
    ? categoryEntries.filter((entry) => (
      activeSeriesFormat === 'favorites'
        ? entry.favorite === true
        : entry.formats?.includes(activeSeriesFormat)
    ))
    : categoryEntries
  const activeTopTrack = shrineTopTracks.find((track) => track.id === activeTopTrackId)
  const listeningEntry = entries.find((entry) => entry.id === activeMusicId && spotifyEmbedUrl(entry.link)) ||
    entries.find((entry) => entry.category === 'music' && spotifyEmbedUrl(entry.link))
  const listeningSelection = activeTopTrack || listeningEntry
  const activeCategoryDetails = shrineCategories.find((category) => category.id === activeCategory)
  const seriesEntries = entries.filter((entry) => entry.category === 'series')

  useEffect(() => {
    if (!isStarNotesOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const trigger = starNotesTriggerRef.current
    document.body.style.overflow = 'hidden'
    starNotesCloseRef.current?.focus()

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsStarNotesOpen(false)
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
      trigger?.focus()
    }
  }, [isStarNotesOpen])

  return (
    <section className="shrine-page" aria-labelledby="music-title">
      <header className="shrine-hero">
        <div className="shrine-hero__copy">
          <p className="eyebrow">A living archive</p>
          <h1 id="music-title">Things that keep the light on.</h1>
          <p>
            A growing collection of the stories, sounds, and souls that have shaped me.
            Not just what I love, but what each thing has helped me find in myself.
          </p>
          <a className="shrine-scroll-link" href="#shrine-collection">Wander through the collection <span aria-hidden="true">↓</span></a>
        </div>
        <div className="shrine-orbit" aria-hidden="true">
          <span className="shrine-orbit__ring" />
          <span className="shrine-orbit__moon"><StarburstIcon /></span>
          <span className="shrine-orbit__caption">a little altar<br />to what moves me</span>
        </div>
      </header>

      <section className="shrine-listening" aria-labelledby="listening-title">
        <div className="shrine-listening__intro">
          <p className="eyebrow">The listening nook</p>
          <h2 id="listening-title">Let something play.</h2>
          <p>
            Pick one of the five songs I have on repeat right now, or choose something from the music shelf.
          </p>
          {listeningSelection?.link && (
            <a className="text-link" href={listeningSelection.link} target="_blank" rel="noreferrer">
              Open {listeningSelection.title} on Spotify <ExternalLinkIcon />
            </a>
          )}
        </div>
        <div className="shrine-player">
          {listeningSelection ? (
            <iframe
              title={`Spotify player for ${listeningSelection.title}`}
              src={spotifyEmbedUrl(listeningSelection.link)}
              width="100%"
              height={spotifyEmbedHeight(listeningSelection.link)}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          ) : (
            <div className="shrine-player__empty">
              <span aria-hidden="true">♫</span>
              <p>Choose something from the music shelf to begin.</p>
            </div>
          )}
        </div>
        <div className="shrine-track-picker" role="group" aria-label="Choose one of my top five songs right now">
          {shrineTopTracks.map((track) => (
            <button
              className={`shrine-track-choice ${activeTopTrack?.id === track.id ? 'is-active' : ''}`}
              type="button"
              key={track.id}
              aria-pressed={activeTopTrack?.id === track.id}
              onClick={() => {
                setActiveTopTrackId(track.id)
                setActiveMusicId('')
              }}
            >
              <span className="shrine-track-choice__title">{track.title}</span>
              <span className="shrine-track-choice__symbol" aria-hidden="true">♫</span>
            </button>
          ))}
        </div>
      </section>

      <section className="shrine-star-notes" aria-labelledby="star-notes-title">
        <div className="shrine-star-notes__copy">
          <p className="eyebrow">A little offering</p>
          <h2 id="star-notes-title">Leave something kind in the cosmos.</h2>
          <p>
            Plant a star, leave a blessing, or send a small note into the constellation.
          </p>
        </div>
        <button
          className="shrine-star-portal"
          type="button"
          aria-haspopup="dialog"
          aria-label="Enter Star Notes"
          onClick={() => setIsStarNotesOpen(true)}
          ref={starNotesTriggerRef}
        >
          <span className="shrine-star-portal__orbit" aria-hidden="true" />
          <span className="shrine-star-portal__core" aria-hidden="true">✦</span>
          <span className="shrine-star-portal__label">Enter</span>
        </button>
      </section>

      <section className="shrine-collection" id="shrine-collection" aria-labelledby="collection-title">
        <div className="shrine-collection__heading">
          <div>
            <p className="eyebrow">Collected with care</p>
            <h2 id="collection-title">The shelves</h2>
          </div>
        </div>

        <div className="shrine-category-list" role="group" aria-label="Filter by inspiration category">
          <button
            className={`shrine-category ${activeCategory === 'all' ? 'is-active' : ''}`}
            type="button"
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          >
            All <span>{entries.length}</span>
          </button>
          {shrineCategories.map((category) => {
            const count = entries.filter((entry) => entry.category === category.id).length
            return (
              <button
                className={`shrine-category ${activeCategory === category.id ? 'is-active' : ''}`}
                type="button"
                aria-pressed={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
                key={category.id}
              >
                <ShrineSymbol category={category} className="shrine-category__symbol" /> {category.label} <span>{count}</span>
              </button>
            )
          })}
        </div>

        {activeCategory === 'series' && (
          <div className="shrine-series-filters">
            <p className="eyebrow">Browse series</p>
            <div className="shrine-category-list" role="group" aria-label="Filter series">
              <button
                className={`shrine-category ${activeSeriesFormat === 'all' ? 'is-active' : ''}`}
                type="button"
                aria-pressed={activeSeriesFormat === 'all'}
                onClick={() => setActiveSeriesFormat('all')}
              >
                All series <span>{seriesEntries.length}</span>
              </button>
              <button
                className={`shrine-category ${activeSeriesFormat === 'favorites' ? 'is-active' : ''}`}
                type="button"
                aria-pressed={activeSeriesFormat === 'favorites'}
                onClick={() => setActiveSeriesFormat('favorites')}
              >
                Favorites <span>{seriesEntries.filter((entry) => entry.favorite === true).length}</span>
              </button>
              {seriesFormats.map((format) => {
                const count = seriesEntries.filter((entry) => entry.formats?.includes(format)).length
                return (
                  <button
                    className={`shrine-category ${activeSeriesFormat === format ? 'is-active' : ''}`}
                    type="button"
                    aria-pressed={activeSeriesFormat === format}
                    onClick={() => setActiveSeriesFormat(format)}
                    key={format}
                  >
                    {format} <span>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {filteredEntries.length ? (
          <div className="shrine-entry-grid">
            {filteredEntries.map((entry) => {
              const category = shrineCategories.find((item) => item.id === entry.category)
              const hasSpotifyLink = Boolean(spotifyEmbedUrl(entry.link))
              return (
                <article className={`shrine-entry shrine-entry--${entry.category}`} key={entry.id}>
                  <div className="shrine-entry__topline">
                    <ShrineSymbol category={category} className="shrine-entry__symbol" />
                    <span>{category.label}</span>
                  </div>
                  {entry.image && (
                    <img className="shrine-entry__image" src={entry.image} alt={entry.imageAlt || ''} loading="lazy" />
                  )}
                  <h3>{entry.title}</h3>
                  {(entry.creator || entry.kind) && (
                    <p className="shrine-entry__meta">{[entry.kind, entry.creator].filter(Boolean).join(' · ')}</p>
                  )}
                  {entry.description && <p className="shrine-entry__description">{entry.description}</p>}
                  {entry.note && (
                    <p className="shrine-entry__note">
                      <span className="shrine-entry__note-label">Note</span>
                      {entry.note}
                    </p>
                  )}
                  {entry.category === 'series' && (
                    <p className="shrine-entry__availability">
                      <span>Watch in Sweden</span>
                      {entry.whereToWatch?.length
                        ? entry.whereToWatch.join(' · ')
                        : 'No current listing found'}
                    </p>
                  )}
                  {entry.why && (
                    <p className="shrine-entry__why">
                      <span className="shrine-entry__why-label">Personal note</span>
                      {entry.why}
                    </p>
                  )}
                  <div className="shrine-entry__links">
                    {hasSpotifyLink && (
                      <button className="shrine-entry__link" type="button" onClick={() => {
                        setActiveTopTrackId('')
                        setActiveMusicId(entry.id)
                        document.getElementById('listening-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }}>
                        Listen here <span aria-hidden="true">♫</span>
                      </button>
                    )}
                    {entry.link && (
                      <a className="shrine-entry__link" href={entry.link} target="_blank" rel="noreferrer">
                        {sourceLinkLabel(entry.link)} <ExternalLinkIcon />
                      </a>
                    )}
                    {entry.website && (
                      <a className="shrine-entry__link" href={entry.website} target="_blank" rel="noreferrer">
                        Website <ExternalLinkIcon />
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="shrine-empty">
            <div className="shrine-empty__constellation" aria-hidden="true">
              <span>✳</span><span>·</span><span>✧</span><span>·</span><span>☼</span>
            </div>
            <p className="eyebrow">{activeCategoryDetails?.label || 'The beginning'}</p>
            <h3>{activeCategoryDetails ? activeCategoryDetails.description : 'An archive with room to become.'}</h3>
            <p>
              {activeCategoryDetails
                ? 'This shelf is still taking shape.'
                : 'Choose a shelf to explore the collection.'}
            </p>
          </div>
        )}
      </section>
      {isStarNotesOpen && (
        <div className="shrine-star-overlay" role="dialog" aria-modal="true" aria-label="Star Notes">
          <button
            className="shrine-star-overlay__close"
            type="button"
            aria-label="Close Star Notes and return to the Shrine"
            onClick={() => setIsStarNotesOpen(false)}
            ref={starNotesCloseRef}
          >
            <span aria-hidden="true">×</span>
            <span>Return to Shrine</span>
          </button>
          <Suspense fallback={<p className="shrine-star-loading" role="status">Opening the star garden…</p>}>
            <StarNotes onClose={() => setIsStarNotesOpen(false)} />
          </Suspense>
        </div>
      )}
    </section>
  )
}

// Den gamla PortfolioView finns kvar för framtida projektinnehåll.
// Den centrala portalen går däremot till AboutPage, eftersom det är den professionella
// första sidan som ska vara redo för en tidig lansering.
function PortfolioView() {
  return (
    <section className="portal-view portal-view--portfolio" aria-labelledby="portfolio-title">
      <div className="portal-view__header">
        <p className="eyebrow">Davin3t</p>
        <h1 id="portfolio-title">The main portal for work, story, and creative direction.</h1>
      </div>

      <div className="portal-view__content">
        <article className="portal-panel">
          <h2>About me</h2>
          <p>{siteContent.about.intro}</p>
        </article>

        <article className="portal-panel">
          <h2>Selected work</h2>
          <div className="mini-project-list">
            {siteContent.projects.slice(0, 4).map((project) => (
              <a key={project.number} href={project.href} target={project.href.startsWith('http') ? '_blank' : undefined} rel={project.href.startsWith('http') ? 'noreferrer' : undefined}>
                <strong>{project.title}</strong>
              </a>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

const expressionPieces = [
  {
    id: 'self',
    number: '01',
    label: 'The self, in soft focus',
    medium: 'Self portrait · ongoing',
    image: '/assets/hero-davi.jpeg',
    alt: 'A creative portrait of Davi',
    note: 'Identity is not a finished image. It is something I get to keep becoming.',
    question: 'What do you see when you stop trying to name it?',
    color: 'rose',
  },
  {
    id: 'future',
    number: '02',
    label: 'Dressing for a possible future',
    medium: 'Solar punk · visual study',
    image: '/legacy/pictures/solarpunk/solarpunkfashion.jpg',
    alt: 'A solar punk fashion study',
    note: 'A little world where self-expression and care for the future can exist together.',
    question: 'What would you wear if the future felt kind?',
    color: 'green',
  },
  {
    id: 'worlds',
    number: '03',
    label: 'A city from another future',
    medium: 'Neo-baroque · imagined city',
    image: futureCity,
    alt: 'A glowing neo-baroque city of spires, gardens and ornate towers at dusk',
    note: 'A future with a little more ornament, drama and room for wonder.',
    question: 'What kind of future would you want to wander through?',
    color: 'blue',
  },
]

const cameraEffects = [
  { id: 'super-8', label: 'Super 8', filter: 'sepia(0.38) saturate(0.9) contrast(1.06)' },
  { id: 'after-hours', label: 'After hours', filter: 'saturate(0.62) brightness(0.82) hue-rotate(12deg)' },
  { id: 'dream-haze', label: 'Dream haze', filter: 'saturate(1.45) brightness(1.08) blur(0.55px)' },
  { id: 'signal-drift', label: 'Signal drift', filter: '' },
]

function ExpressionRoom() {
  const [activePieceId, setActivePieceId] = useState(expressionPieces[0].id)
  const [activePhotoId, setActivePhotoId] = useState(expressionPhotos[0].id)
  const [activeEffects, setActiveEffects] = useState([])
  const activePiece = expressionPieces.find((piece) => piece.id === activePieceId) || expressionPieces[0]
  const activePhoto = expressionPhotos.find((photo) => photo.id === activePhotoId) || expressionPhotos[0]
  const imageFilter = activeEffects
    .map((effectId) => cameraEffects.find((effect) => effect.id === effectId)?.filter)
    .filter(Boolean)
    .join(' ') || 'none'

  function toggleCameraEffect(effectId) {
    setActiveEffects((currentEffects) => (
      currentEffects.includes(effectId)
        ? currentEffects.filter((activeEffect) => activeEffect !== effectId)
        : [...currentEffects, effectId]
    ))
  }

  function moveExpressionField(event) {
    if (event.pointerType === 'touch') {
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    event.currentTarget.style.setProperty('--field-x', `${x * 100}%`)
    event.currentTarget.style.setProperty('--field-y', `${y * 100}%`)
    event.currentTarget.style.setProperty('--tilt-x', `${(0.5 - y) * 4}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${(x - 0.5) * 4}deg`)
  }

  function resetExpressionField(event) {
    event.currentTarget.style.setProperty('--field-x', '50%')
    event.currentTarget.style.setProperty('--field-y', '50%')
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <section className="expression-page" aria-labelledby="expression-title">
      <header className="expression-heading">
        <div className="expression-heading__index">
          <span className="expression-heading__symbol" aria-hidden="true">✳</span>
          <p className="eyebrow">A personal field journal</p>
          <span className="expression-heading__edition">VOL. 01 — STILL BECOMING</span>
        </div>
        <h1 id="expression-title">A life, <em>in</em><br />many forms.</h1>
        <p className="expression-heading__intro">
          Images, clothes, feelings, unfinished thoughts. Not a portfolio of answers —
          just little windows into what it feels like to be me.
        </p>
      </header>

      <div className={`expression-spread expression-spread--${activePiece.color}`}>
        <div className="expression-image">
          <img src={activePiece.image} alt={activePiece.alt} />
          <span className="expression-image__stamp" aria-hidden="true">D / N3T<br />∞</span>
          <span className="expression-image__caption">{activePiece.medium}</span>
          <span className="expression-image__number" aria-hidden="true">{activePiece.number}</span>
        </div>

        <div className="expression-note">
          <p className="expression-note__eyebrow">A fragment from the archive <span>✳</span></p>
          <h2>{activePiece.label}</h2>
          <p className="expression-note__body">{activePiece.note}</p>
          <p className="expression-note__question">{activePiece.question}</p>
          <div className="expression-index" aria-label="Choose a fragment">
            {expressionPieces.map((piece) => (
              <button
                className={`expression-index__item ${piece.id === activePiece.id ? 'is-active' : ''}`}
                type="button"
                key={piece.id}
                aria-pressed={piece.id === activePiece.id}
                onClick={() => setActivePieceId(piece.id)}
              >
                <span>{piece.number}</span>
                <span>{piece.label}</span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <p className="expression-note__footnote">A small collection. Open to interpretation.</p>
        </div>
      </div>

      <section className="expression-orbit" aria-labelledby="expression-orbit-title">
        <header className="expression-orbit__heading">
          <div>
            <p className="eyebrow">Follow a thread</p>
            <h2 id="expression-orbit-title">A map of becoming</h2>
          </div>
          <p>Move through the field, or choose a point to return to its fragment.</p>
        </header>
        <div
          className="expression-orbit__stage"
          onPointerMove={moveExpressionField}
          onPointerLeave={resetExpressionField}
        >
          <div className="expression-orbit__field" aria-hidden="true">
            <span className="expression-orbit__track expression-orbit__track--outer" />
            <span className="expression-orbit__track expression-orbit__track--inner" />
            <span className="expression-orbit__core">
              <span>still</span>
              <strong>becoming</strong>
              <span aria-hidden="true">✳</span>
            </span>
          </div>
          <div className="expression-orbit__points" role="group" aria-label="Explore the story fragments">
            {expressionPieces.map((piece) => (
              <button
                className={`expression-orbit__point ${piece.id === activePiece.id ? 'is-active' : ''}`}
                type="button"
                key={piece.id}
                aria-pressed={piece.id === activePiece.id}
                onClick={() => setActivePieceId(piece.id)}
              >
                <span className="expression-orbit__point-number">{piece.number}</span>
                <span>{piece.label}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="expression-orbit__caption" aria-live="polite">
          Current fragment <span>{activePiece.number}</span> / {activePiece.label}
        </p>
      </section>

      <section className="expression-camera" aria-labelledby="expression-camera-title">
        <header className="expression-camera__heading">
          <div>
            <p className="eyebrow">A little image playground</p>
            <h2 id="expression-camera-title">The camera roll</h2>
          </div>
          <p>A few moments, kept close. Choose a frame, then shift its mood with a filter.</p>
        </header>

        <div className="expression-camera__layout">
          <div className="expression-camera__viewer">
            <div className={`expression-camera__photo ${activeEffects.includes('signal-drift') ? 'has-signal-drift' : ''}`}>
              <img src={activePhoto.image} alt={activePhoto.alt} style={{ filter: imageFilter }} />
              {activeEffects.includes('signal-drift') && (
                <>
                  <span className="expression-camera__ghost expression-camera__ghost--cyan" aria-hidden="true">
                    <img src={activePhoto.image} alt="" />
                  </span>
                  <span className="expression-camera__ghost expression-camera__ghost--pink" aria-hidden="true">
                    <img src={activePhoto.image} alt="" />
                  </span>
                </>
              )}
              <span className="expression-camera__metadata">{activePhoto.mood} <i>·</i> {String(expressionPhotos.indexOf(activePhoto) + 1).padStart(2, '0')} / {String(expressionPhotos.length).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="expression-camera__controls">
            <div className="expression-camera__effects">
              <div className="expression-camera__effects-heading">
                <div>
                  <p className="eyebrow">Layer your effects</p>
                  <p className="expression-camera__hint">Tap more than one to mix them.</p>
                </div>
                {activeEffects.length > 0 && (
                  <button className="expression-camera__reset" type="button" onClick={() => setActiveEffects([])}>
                    Clear
                  </button>
                )}
              </div>
              <div className="expression-camera__effect-list">
                {cameraEffects.map((effect) => (
                  <button
                    className={`expression-camera__effect ${activeEffects.includes(effect.id) ? 'is-active' : ''}`}
                    type="button"
                    key={effect.id}
                    aria-pressed={activeEffects.includes(effect.id)}
                    onClick={() => toggleCameraEffect(effect.id)}
                  >
                    <span className={`expression-camera__effect-dot expression-camera__effect-dot--${effect.id}`} aria-hidden="true" />
                    <span>{effect.label}</span>
                    <span className="expression-camera__effect-state">{activeEffects.includes(effect.id) ? 'ON' : '+'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="expression-camera__roll" role="group" aria-label="Choose a photo from the camera roll">
              <p className="eyebrow">Frames <span>{String(expressionPhotos.length).padStart(2, '0')}</span></p>
              <p className="expression-camera__roll-hint">Scroll to wander through the roll.</p>
              <div className="expression-camera__filmstrip">
                {expressionPhotos.map((photo, index) => (
                  <button
                    className={`expression-camera__frame ${photo.id === activePhoto.id ? 'is-active' : ''}`}
                    type="button"
                    key={photo.id}
                    aria-label={`Frame ${index + 1}: ${photo.title}`}
                    aria-pressed={photo.id === activePhoto.id}
                    onClick={() => setActivePhotoId(photo.id)}
                  >
                    <img src={photo.image} alt="" loading="lazy" />
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="expression-colophon">
        <span>Some things are better felt than explained.</span>
        <span>Made of memory, instinct & becoming <b aria-hidden="true">✳</b></span>
      </footer>
    </section>
  )
}

function Soundtrack() {
  return (
    <section className="soundtrack-section" id="soundtrack" aria-labelledby="soundtrack-title">
      <div>
        <p className="eyebrow">{siteContent.soundtrack.label}</p>
        <h2 id="soundtrack-title">{siteContent.soundtrack.title}</h2>
        <p>{siteContent.soundtrack.description}</p>
      </div>
      <div className="soundtrack-card">
        <span>Listening mood</span>
        <strong>{siteContent.soundtrack.mood}</strong>
        <a className="button button-primary" href={siteContent.soundtrack.link} target="_blank" rel="noreferrer">Open Spotify</a>
      </div>
    </section>
  )
}

function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <img src={project.image} alt="" loading="lazy" />
      <span className="project-overlay" aria-hidden="true"></span>
      <div className="project-content">
        <div className="project-meta"><span>{project.title}</span></div>
        <h3>{project.description}</h3>
        <p className="project-type">{project.type}</p>
        <div className="project-actions">
          <a className="button button-primary" href={project.href} target={project.href.startsWith('http') ? '_blank' : undefined} rel={project.href.startsWith('http') ? 'noreferrer' : undefined}>Open site</a>
          {project.github && <a className="button button-quiet" href={project.github} target="_blank" rel="noreferrer">GitHub</a>}
        </div>
      </div>
    </article>
  )
}

function ContactForm() {
  const [showThanks, setShowThanks] = useState(() => new URLSearchParams(window.location.search).get('submitted') === '1')

  useEffect(() => {
    if (!showThanks) {
      return undefined
    }

    window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`)
    return undefined
  }, [showThanks])

  return (
    <section className="contact-section" id="contact-section" aria-labelledby="contact-title">
      <div className="contact-copy">
        <p className="eyebrow">Open to connection</p>
        <h2 id="contact-title">LIA, collaboration, or a good conversation.</h2>
        <p>Send a message and tell me what you are thinking about.</p>
      </div>
      <form
        className="contact-form"
        name="contact"
        method="POST"
        action="/?submitted=1#about"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
      >
        <input type="hidden" name="form-name" value="contact" />
        <p className="visually-hidden">
          <label>Do not fill this out if you are human: <input name="bot-field" /></label>
        </p>
        <div className="form-group">
          <label htmlFor="contact-name">Name *</label>
          <input id="contact-name" type="text" name="name" maxLength="100" required />
        </div>
        <div className="form-group">
          <label htmlFor="contact-email">Email *</label>
          <input id="contact-email" type="email" name="email" maxLength="100" required />
        </div>
        <div className="form-group">
          <label htmlFor="contact-subject">Subject *</label>
          <select id="contact-subject" name="subject" required defaultValue="">
            <option value="" disabled>Choose one</option>
            <option value="lia">LIA / Internship opportunity</option>
            <option value="collab">Creative collaboration</option>
            <option value="connect">Let&apos;s connect</option>
            <option value="feedback">Feedback / idea</option>
            <option value="other">Something else</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="contact-message">Message *</label>
          <textarea id="contact-message" name="message" maxLength="2000" rows="6" required />
        </div>
        <button className="button button-primary contact-submit" type="submit">Send message</button>
      </form>
      {showThanks && (
        <div className="thanks-modal" role="dialog" aria-modal="true" aria-labelledby="thanks-title">
          <div className="thanks-modal-card">
            <button className="thanks-close" type="button" aria-label="Close thank you message" onClick={() => setShowThanks(false)}>×</button>
            <h2 id="thanks-title">Message received</h2>
            <p>Thanks for reaching out. Your message is on its way.</p>
            <button className="button button-primary" type="button" onClick={() => setShowThanks(false)}>Back to the page</button>
          </div>
        </div>
      )}
    </section>
  )
}

// En liten väg till projektportalen.
// Själva projektbilderna och all projektinformation hör hemma på #projects.
function ProjectPreview() {
  return (
    <section className="project-preview" aria-label="Project portal link">
      <p className="eyebrow">A separate room for the work</p>
      <a className="project-preview__link" href="#projects" aria-label="Visit the project portal">
        <img src={projectsPortal} alt="" />
      </a>
    </section>
  )
}

function AboutPage() {
  return (
    <>
      <section className="about-hero" aria-labelledby="about-title">
        <div>
          <p className="eyebrow">Who I am</p>
          <h1 id="about-title">{siteContent.about.title}</h1>
          <p>{siteContent.about.intro}</p>
        </div>
        <img src="/assets/hero-davi.jpeg" alt="Davi in a creative portrait" />
      </section>
      <section className="quote-panel" aria-label="Personal quote"><span>“</span><p>{siteContent.about.quote}</p></section>
      <ProjectPreview />
      <section className="about-section" id="more-about-me" aria-labelledby="more-about-title">
        <div className="section-heading">
          <p className="eyebrow">More about me</p>
          <h2 id="more-about-title">Why I build, what drives me, and where spirituality meets code.</h2>
        </div>
        <div className="identity-grid">
          {siteContent.about.identity.map((item) => <article className="info-card" key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}
        </div>
      </section>
      <section className="about-section" aria-labelledby="build-title">
        <div className="section-heading"><p className="eyebrow">What I build</p><h2 id="build-title">Software, interactive experiences, and community spaces.</h2></div>
        <div className="identity-grid">
          {siteContent.about.buildAreas.map((item) => <article className="info-card" key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}
        </div>
      </section>
      <section className="about-section" id="lia-focus" aria-labelledby="looking-title">
        <div className="section-heading"><p className="eyebrow">What I am looking for</p><h2 id="looking-title">Collaborations, opportunities, and connections.</h2></div>
        <div className="identity-grid">
          {siteContent.about.opportunities.map((item) => <article className="info-card" key={item.title}><h3>{item.title}</h3><p>{item.text}</p><span className="card-tag">{item.tag}</span></article>)}
        </div>
      </section>
      <ContactForm />
    </>
  )
}

function HomePage() {
  return (
    <>
      <section className="hero-section" id="top" aria-labelledby="hero-title">
        <div className="hero-orbit" aria-hidden="true"></div>
        <img className="hero-image" src="/assets/hero-davi.jpeg" alt="Davi in a creative portrait" />
        <div className="hero-copy">
          <p className="eyebrow">{siteContent.hero.eyebrow}</p>
          <h1 id="hero-title">{siteContent.hero.title}</h1>
          <p className="hero-description">{siteContent.hero.description}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#about">Explore the work</a>
            <a className="button button-quiet" href="#about">About me</a>
          </div>
        </div>
        <p className="hero-note">{siteContent.brand} / 2026</p>
      </section>
      <section className="values-section" aria-label="Creative values">
        <p className="eyebrow">The frequency</p>
        <div className="value-list">{siteContent.values.map((value) => <span key={value}>{value}</span>)}</div>
      </section>
      <section className="work-section" aria-labelledby="work-title">
        <div className="section-heading">
          <p className="eyebrow">What I make</p>
          <h2 id="work-title">Digital experiments with a human pulse.</h2>
        </div>
        <div className="project-grid project-grid-featured">
          {siteContent.projects.slice(0, 4).map((project) => <ProjectCard project={project} key={project.number} />)}
        </div>
        <a className="text-link" href="#about">See the full build deck <span aria-hidden="true">→</span></a>
      </section>
      <Soundtrack />
    </>
  )
}

function ProjectsPage() {
  return (
    <>
      <section className="page-intro" aria-labelledby="projects-title">
        <p className="eyebrow">Build deck</p>
        <h1 id="projects-title">My contributions to the cybernet.</h1>
        <p>Websites, experiments, and small worlds I have built over the years.</p>
      </section>
      <section className="project-grid project-grid-all" aria-label="Project grid">
        {siteContent.projects.map((project) => <ProjectCard project={project} key={project.number} />)}
      </section>
      <section className="credentials-section" aria-labelledby="credentials-title">
        <p className="eyebrow">Credentials</p>
        <h2 id="credentials-title">A few things I have learned along the way.</h2>
        <div className="credentials-grid">
          {siteContent.credentials.map((credential) => <a className="credential-card" href={credential.href} target="_blank" rel="noreferrer" key={credential.title}><img src={credential.image} alt={credential.title} loading="lazy" /><span>{credential.title}</span></a>)}
        </div>
      </section>
    </>
  )
}

function App() {
  const route = useHashRoute()

  // Här avgör vi vilken "värld" som ska visas.
  // Det är det stora React-flödet: state från URL --> komponenten som renderas.
  const page =
    route === 'music' ? <MusicRoom /> :
    route === 'expression' || route === 'fashion' ? <ExpressionRoom /> :
    route === 'portfolio' ? <PortfolioView /> :
    route === 'about' ? <AboutPage /> :
    route === 'projects' ? <ProjectsPage /> :
    <SpaceLandingPage />

  return (
    <>
      <SpaceBackdrop />
      <HomePortalButton route={route} />
      <main className="site-shell">
      <div key={route} className="route-transition">
        {page}
      </div>
      <footer className="site-footer">
        <span className="footer-note">Made with curiosity and care.</span>
        <nav className="footer-links" aria-label="Social links">
          {siteContent.socials.map((social) => (
            <a className="social-link" href={social.href} key={social.label} target={social.href.startsWith('http') ? '_blank' : undefined} rel={social.href.startsWith('http') ? 'noreferrer' : undefined}>
              <span className="social-mark" aria-hidden="true">{social.mark}</span>
              <span>{social.label}</span>
            </a>
          ))}
        </nav>
      </footer>
      </main>
    </>
  )
}

export default App
