import { useEffect, useMemo, useRef, useState } from 'react'
import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'
import { addDoc, collection, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'
import './StarNotes.css'

const firebaseConfig = {
  apiKey: 'AIzaSyB3alvPDXcZswkuRPsoSyC1ANE9yrStPAc',
  authDomain: 'davin3t.firebaseapp.com',
  projectId: 'davin3t',
  storageBucket: 'davin3t.firebasestorage.app',
  messagingSenderId: '658896745127',
  appId: '1:658896745127:web:29f1082849c034c1b86182',
}

const LOCAL_NOTES_KEY = 'davi_star_notes_local'
const RATE_KEY = 'davi_note_ts'
const AUDIO_MUTED_KEY = 'davi_star_notes_audio_muted'
const GIPHY_KEY = 'RHhtjkTyAhj23zDDN4N8ndWMLbTCfCy6'
const NOTE_LIMIT = 200

async function withTimeout(promise, ms) {
  let timeout
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = window.setTimeout(() => reject(new Error('Saving this star timed out.')), ms)
      }),
    ])
  } finally {
    window.clearTimeout(timeout)
  }
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const notesCollection = collection(getFirestore(app), 'notes')

function readLocalNotes() {
  try {
    const notes = JSON.parse(localStorage.getItem(LOCAL_NOTES_KEY) || '[]')
    return Array.isArray(notes) ? notes.filter(isValidNote) : []
  } catch (error) {
    console.error('Star Notes could not read locally saved notes.', error)
    return []
  }
}

function isValidNote(note) {
  return note &&
    typeof note === 'object' &&
    typeof note.message === 'string' &&
    typeof note.x === 'number' &&
    typeof note.y === 'number'
}

function getTimestamp(note) {
  if (typeof note.timestamp === 'number') return note.timestamp
  if (typeof note.timestamp?.toMillis === 'function') return note.timestamp.toMillis()
  return Date.now()
}

function relativeTime(timestamp) {
  const minutes = Math.floor((Date.now() - timestamp) / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function saveLocally(note) {
  try {
    const notes = [...readLocalNotes(), { id: `local-${Date.now()}`, ...note }]
    localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes.slice(-NOTE_LIMIT)))
    return notes.slice(-NOTE_LIMIT)
  } catch (error) {
    console.error('Star Notes could not save this note in this browser.', error)
    return null
  }
}

function canPost() {
  try {
    return Date.now() - Number(localStorage.getItem(RATE_KEY) || 0) > 60_000
  } catch (error) {
    console.error('Star Notes could not check the local posting limit.', error)
    return true
  }
}

function markPost() {
  try {
    localStorage.setItem(RATE_KEY, String(Date.now()))
  } catch (error) {
    console.error('Star Notes could not save the local posting limit.', error)
  }
}

function makeDecorativeStars() {
  const count = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 5000))
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.8 + 0.4,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 5,
  }))
}

function StarNotes({ onClose }) {
  const [notes, setNotes] = useState(readLocalNotes)
  const [placementMode, setPlacementMode] = useState(false)
  const [pendingPosition, setPendingPosition] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [activeNoteId, setActiveNoteId] = useState('')
  const [mobileNote, setMobileNote] = useState(null)
  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')
  const [selectedGif, setSelectedGif] = useState('')
  const [gifQuery, setGifQuery] = useState('')
  const [gifResults, setGifResults] = useState([])
  const [isSearchingGifs, setIsSearchingGifs] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hint, setHint] = useState('Every star holds a little message')
  const [syncStatus, setSyncStatus] = useState('Connecting to the constellation…')
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem(AUDIO_MUTED_KEY) === '1'
    } catch (error) {
      console.error('Star Notes could not read the audio preference.', error)
      return true
    }
  })
  const fieldRef = useRef(null)
  const audioRef = useRef(null)
  const messageRef = useRef(null)
  const decorativeStars = useMemo(() => makeDecorativeStars(), [])

  useEffect(() => {
    const notesQuery = query(notesCollection, orderBy('timestamp', 'desc'), limit(NOTE_LIMIT))
    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      setNotes(snapshot.docs.map((note) => ({ id: note.id, ...note.data() })).filter(isValidNote))
      setSyncStatus('Your star is part of the shared constellation.')
    }, (error) => {
      console.error('Star Notes could not load shared stars.', error)
      setNotes(readLocalNotes())
      setSyncStatus('Live sync is unavailable. Showing stars saved in this browser.')
      setHint('Cloud sync paused. New stars will still save locally.')
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (formOpen) messageRef.current?.focus()
  }, [formOpen])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = isMuted
    try {
      localStorage.setItem(AUDIO_MUTED_KEY, isMuted ? '1' : '0')
    } catch (error) {
      console.error('Star Notes could not save the audio preference.', error)
    }
    if (!isMuted) audio.play().catch(() => {})
    else audio.pause()
  }, [isMuted])

  function handleFieldClick(event) {
    if (!placementMode || formOpen || event.target.closest('.star-notes__star')) return
    const rect = fieldRef.current?.getBoundingClientRect()
    if (!rect) return

    setPendingPosition({
      x: Number(((event.clientX - rect.left) / rect.width * 100).toFixed(2)),
      y: Number(((event.clientY - rect.top) / rect.height * 100).toFixed(2)),
    })
    setFormOpen(true)
    setActiveNoteId('')
  }

  function closeForm() {
    setFormOpen(false)
    setPendingPosition(null)
    setAuthor('')
    setMessage('')
    setGifQuery('')
    setGifResults([])
    setSelectedGif('')
    setPlacementMode(false)
    setHint('Every star holds a little message')
  }

  async function handleGifSearch(event) {
    event.preventDefault()
    const search = gifQuery.trim()
    if (!search) return

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 9000)
    setIsSearchingGifs(true)
    setHint('Looking for a little image…')

    try {
      const url = new URL('https://api.giphy.com/v1/gifs/search')
      url.searchParams.set('api_key', GIPHY_KEY)
      url.searchParams.set('q', search)
      url.searchParams.set('limit', '9')
      url.searchParams.set('rating', 'pg-13')
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) throw new Error(`GIF search returned ${response.status}.`)
      const result = await response.json()
      setGifResults((result.data || []).map((gif) => ({
        id: gif.id,
        title: gif.title || 'Choose this image',
        preview: gif.images?.fixed_width_small?.url,
        url: gif.images?.downsized?.url,
      })).filter((gif) => gif.preview && gif.url))
      if (!result.data?.length) setHint('No images found. Try another search.')
    } catch (error) {
      console.error('Star Notes GIF search failed.', error)
      setHint(error.name === 'AbortError' ? 'GIF search took too long. Try again.' : 'GIF search is unavailable right now.')
    } finally {
      window.clearTimeout(timeout)
      setIsSearchingGifs(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedMessage = message.trim()
    if (trimmedMessage.length < 2) {
      setHint('Please leave a little more in your note.')
      messageRef.current?.focus()
      return
    }
    if (!canPost()) {
      setHint('Please wait a moment before creating another star.')
      return
    }

    const note = {
      author: author.trim().slice(0, 32) || 'Anonymous',
      message: trimmedMessage.slice(0, 280),
      gifUrl: selectedGif || null,
      x: pendingPosition?.x ?? Number((Math.random() * 75 + 10).toFixed(2)),
      y: pendingPosition?.y ?? Number((Math.random() * 70 + 10).toFixed(2)),
      timestamp: Date.now(),
    }
    setIsSaving(true)

    try {
      await withTimeout(addDoc(notesCollection, {
        ...note,
        createdAt: serverTimestamp(),
      }), 9000)
      setSyncStatus('Your star is part of the shared constellation.')
      markPost()
      closeForm()
    } catch (error) {
      console.error('Star Notes could not save to the shared constellation.', error)
      const localNotes = saveLocally(note)
      if (localNotes) {
        setNotes(localNotes)
        setSyncStatus('Saved in this browser. The shared constellation could not be reached.')
        markPost()
        closeForm()
      } else {
        setSyncStatus('This note could not be saved. Please check your browser storage and try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key !== 'Escape') return
    event.stopPropagation()
    if (formOpen) closeForm()
    else if (mobileNote) setMobileNote(null)
    else if (placementMode) setPlacementMode(false)
    else if (activeNoteId) setActiveNoteId('')
    else onClose()
  }

  function toggleNote(note) {
    if (window.matchMedia('(max-width: 899px)').matches) {
      setMobileNote(note)
      return
    }
    setActiveNoteId((currentId) => currentId === note.id ? '' : note.id)
  }

  return (
    <div className="star-notes-map" onKeyDown={handleKeyDown}>
      <div
        className={`star-notes__field ${placementMode ? 'is-placing' : ''}`}
        ref={fieldRef}
        onClick={handleFieldClick}
        role="region"
        aria-label="Star Notes constellation"
      >
        <div className="star-notes__background" aria-hidden="true">
          {decorativeStars.map((star) => (
            <span
              className="star-notes__background-star"
              key={star.id}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </div>
        <p className={`star-notes__hint ${notes.length && !placementMode ? 'is-hidden' : ''}`} aria-live="polite">{hint}</p>
        <div className="star-notes__stars" aria-label="Star notes on the map">
          {notes.map((note) => (
            <button
              className={`star-notes__star ${activeNoteId === note.id ? 'is-open' : ''} ${note.y < 22 ? 'popup-below' : ''} ${note.x > 84 ? 'popup-left' : ''} ${note.x < 16 ? 'popup-right' : ''}`}
              key={note.id}
              type="button"
              style={{ left: `${note.x}%`, top: `${note.y}%` }}
              aria-label={`Note from ${note.author || 'Anonymous'}: ${note.message}`}
              aria-expanded={activeNoteId === note.id}
              onClick={(event) => {
                event.stopPropagation()
                toggleNote(note)
              }}
            >
              <span className="star-notes__pulse" aria-hidden="true" />
              <span className="star-notes__dot" aria-hidden="true" />
              <span className="star-notes__popup" role="note">
                <span className="star-notes__author">{note.author || 'Anonymous'}</span>
                <span className="star-notes__message">{note.message}</span>
                {note.gifUrl && <img className="star-notes__gif" src={note.gifUrl} alt="" loading="lazy" />}
                <span className="star-notes__time">{relativeTime(getTimestamp(note))}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="star-notes__counter" aria-live="polite" aria-atomic="true">
          <span>{notes.length}</span>
          <small>{notes.length === 1 ? 'star' : 'stars'}</small>
          <button
            className={`star-notes__audio-toggle ${isMuted ? 'is-muted' : ''}`}
            type="button"
            aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
            aria-pressed={isMuted}
            onClick={() => setIsMuted((muted) => !muted)}
          >
            {isMuted ? '♫' : '♪'}
          </button>
        </div>
        <audio ref={audioRef} loop preload="none" playsInline src="/star-notes/sounds/spaceambient.mp3" />
      </div>

      <button
        className={`star-notes__create ${placementMode ? 'is-placing' : ''}`}
        type="button"
        aria-label={placementMode ? 'Cancel choosing a place' : 'Create your star on the map'}
        onClick={() => {
          if (placementMode) {
            setPlacementMode(false)
            setHint('Every star holds a little message')
          } else {
            setPlacementMode(true)
            setHint('Choose a place in the sky for your star')
            setActiveNoteId('')
          }
        }}
      >
        <span aria-hidden="true">✦</span>
        <span>{placementMode ? 'Cancel' : 'Create a star'}</span>
      </button>
      <p className="star-notes__sync-status" role="status">{syncStatus}</p>

      {formOpen && (
        <div className="star-notes__form-overlay" onClick={(event) => {
          if (event.target === event.currentTarget) closeForm()
        }}>
          <section className="star-notes__form-card" role="dialog" aria-modal="true" aria-labelledby="star-notes-form-title">
            <button className="star-notes__form-close" type="button" aria-label="Close note form" onClick={closeForm}>×</button>
            <h2 id="star-notes-form-title">✦ Create your star</h2>
            <form onSubmit={handleSubmit}>
              <label className="star-notes__sr-only" htmlFor="star-notes-author">Your name</label>
              <input
                id="star-notes-author"
                type="text"
                placeholder="Your name (optional)"
                maxLength={32}
                autoComplete="off"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
              />
              <label className="star-notes__sr-only" htmlFor="star-notes-message">Your note</label>
              <textarea
                id="star-notes-message"
                ref={messageRef}
                placeholder="Leave a blessing or a small note…"
                maxLength={280}
                required
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <small className="star-notes__char-count">{message.length}/280</small>
              <div className="star-notes__gif-tools">
                <div className="star-notes__gif-search">
                  <input
                    type="text"
                    placeholder="Find a little image (optional)"
                    aria-label="Search for a GIF"
                    value={gifQuery}
                    onChange={(event) => setGifQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleGifSearch(event)
                    }}
                  />
                  <button type="button" onClick={handleGifSearch} disabled={isSearchingGifs}>
                    {isSearchingGifs ? 'Searching…' : 'Search'}
                  </button>
                </div>
                {gifResults.length > 0 && (
                  <div className="star-notes__gif-results" aria-label="GIF search results">
                    {gifResults.map((gif) => (
                      <button type="button" key={gif.id} onClick={() => {
                        setSelectedGif(gif.url)
                        setGifResults([])
                        setGifQuery('')
                      }}>
                        <img src={gif.preview} alt={gif.title} loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
                {selectedGif && (
                  <div className="star-notes__gif-selected">
                    <img src={selectedGif} alt="Selected GIF" />
                    <button type="button" onClick={() => setSelectedGif('')}>Remove image</button>
                  </div>
                )}
              </div>
              <button className="star-notes__submit" type="submit" disabled={isSaving}>
                {isSaving ? 'Creating…' : '✦ Create this star'}
              </button>
            </form>
          </section>
        </div>
      )}

      {mobileNote && (
        <div className="star-notes__detail-overlay" onClick={() => setMobileNote(null)}>
          <section className="star-notes__detail" role="dialog" aria-modal="true" aria-label="Star note details" onClick={(event) => event.stopPropagation()}>
            <button className="star-notes__form-close" type="button" aria-label="Close note" onClick={() => setMobileNote(null)}>×</button>
            <p className="star-notes__author">{mobileNote.author || 'Anonymous'}</p>
            <p className="star-notes__message">{mobileNote.message}</p>
            {mobileNote.gifUrl && <img className="star-notes__gif" src={mobileNote.gifUrl} alt="" />}
            <small className="star-notes__time">{relativeTime(getTimestamp(mobileNote))}</small>
          </section>
        </div>
      )}
    </div>
  )
}

export default StarNotes
