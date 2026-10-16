import { useEffect, useState } from 'react'
import { siteContent } from './data/siteContent'
import projectsPortal from './assets/projects-portal.gif'
import './App.css'

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

// Music-room är medvetet en enkel väntsal i första lanseringen.
// Senare kan spellistor, Spotify-data och annan interaktivitet läggas här.
function MusicRoom() {
  return (
    <section className="portal-view portal-view--music" aria-labelledby="music-title">
      <div className="portal-view__header">
        <p className="eyebrow">Digital shrine</p>
        <h1 id="music-title">Digital shrine room under construction.</h1>
      </div>

      <div className="portal-view__content">
        <article className="portal-panel">
          <h2>A listening room in orbit</h2>
          <p>
            An evolving collection of sounds, artists, and little discoveries that shape my inner
            worlds. Drift through the music I return to and the moods that move my creative work. Explore what world I dream about and what truly inspires my soul. 
            Here is my collection of sacred inspiration and divine callings. 
          </p>
        </article>

        <article className="portal-panel">
          <h2>Gathered here</h2>
          <ul>
            <li>Playlists for different moods and moments</li>
            <li>A music wheel for wandering between sounds and public recommendations</li>
            <li>A list of people, places, ideas, creative work and things that have moved my heart. All things relatable where I have created my own meaning behind them and connected to my own life.</li>
            <li>Star Notes for souls passing by that want to leave a mark in my shrine</li>
          </ul>
        </article>
      </div>
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

// Fashion & spirituality-rummet har ett litet riktigt innehåll redan nu.
// Det gör portalen användbar vid lansering utan att vi behöver bygga hela moodboarden ännu.
function FashionRoom() {
  return (
    <section className="portal-view portal-view--fashion" aria-labelledby="fashion-title">
      <div className="portal-view__header">
        <p className="eyebrow">Fashion & content creation</p>
        <h1 id="fashion-title">A space for personal style and visual storytelling. *Under construction</h1>
      </div>

      <div className="portal-view__content">
        <article className="portal-panel">
          <h2>Style as self-expression</h2>
          <p>
            What we wear and what we choose to share both shape how we meet the world. This room
            gathers my fashion references, personal style, and experiments in making images and
            stories. It is a growing archive of moods and ideas, not a finished lookbook.
          </p>
        </article>

        <article className="portal-panel">
          <h2>Things taking shape</h2>
          <ul>
            <li>Outfits, styling experiments, and personal references</li>
            <li>Fashion images and visual moodboards</li>
            <li>Content ideas and glimpses behind the creative process</li>
            <li>Small stories about the feeling behind a look</li>
          </ul>
        </article>
      </div>
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
    route === 'fashion' ? <FashionRoom /> :
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
