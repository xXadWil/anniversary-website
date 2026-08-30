'use client'

import { useEffect, useMemo, useState } from 'react'
import { Camera, ChevronDown, Flower2, Heart, LockKeyhole, Upload, X, Trash2, Plus, Save } from 'lucide-react'


const PASSCODE = '083124'
const startDate = new Date('2024-08-31T20:45:00+08:00')
const defaultLetter = `Somehow, you make time feel both fleeting and infinite. I look at us and feel so lucky for every ordinary Tuesday, every quiet drive, every laugh that arrives before the punchline.\n\nThank you for being my favorite place to return to. I would choose you in every version of this life, in every season, in every little beginning.`
const defaultReasons = ['How you make a room feel like home.', 'Your laugh, especially when you try to hide it.', 'That you keep choosing tenderness.']
const icons = {
  letter: '/anniversary-website/icons/letter.png',
  music: '/anniversary-website/icons/record-player.png',
  gallery: '/anniversary-website/icons/camera.png',
  notes: '/anniversary-website/icons/flower.png',
}

type Modal = 'music' | 'letter' | 'gallery' | 'notes' | null
type Polaroid = { id: number; src: string; caption: string }

function durationSince(now: Date) {
  let seconds = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / 1000))
  const days = Math.floor(seconds / 86400); seconds %= 86400
  const hours = Math.floor(seconds / 3600); seconds %= 3600
  const minutes = Math.floor(seconds / 60); seconds %= 60
  return { days, hours, minutes, seconds }
}

function spotifyEmbed(value: string) {
  const match = value.match(/spotify\.com\/(?:embed\/)?(playlist|track|album|artist)\/([\w-]+)/)
  return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator` : ''
}

export default function Page() {
  const [unlocked, setUnlocked] = useState(false), [transitioning, setTransitioning] = useState(false)
  const [code, setCode] = useState(''), [error, setError] = useState(false), [background, setBackground] = useState<string | null>(null)
  const [now, setNow] = useState(new Date()), [modal, setModal] = useState<Modal>(null)
  const [spotify, setSpotify] = useState(''), [spotifyDraft, setSpotifyDraft] = useState('')
  const [letter, setLetter] = useState(defaultLetter), [letterDraft, setLetterDraft] = useState('')
  const [photos, setPhotos] = useState<Polaroid[]>([]), [reasons, setReasons] = useState(defaultReasons), [newReason, setNewReason] = useState('')

  useEffect(() => {
    setBackground(localStorage.getItem('anniversary-lock-photo'))
    setSpotify(localStorage.getItem('anniversary-spotify') || '')
    setLetter(localStorage.getItem('anniversary-letter') || defaultLetter)
    setPhotos(JSON.parse(localStorage.getItem('anniversary-photos') || '[]'))
    setReasons(JSON.parse(localStorage.getItem('anniversary-reasons') || JSON.stringify(defaultReasons)))
    if (sessionStorage.getItem('anniversary-unlocked') === 'true') setUnlocked(true)
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const time = useMemo(() => durationSince(now), [now])
  function unlock() { if (code !== PASSCODE) { setError(true); window.setTimeout(() => setError(false), 550); return }; sessionStorage.setItem('anniversary-unlocked', 'true'); setTransitioning(true); window.setTimeout(() => { setTransitioning(false); setUnlocked(true) }, 2800) }
  function readFile(file: File, callback: (value: string) => void) { const reader = new FileReader(); reader.onload = () => callback(String(reader.result)); reader.readAsDataURL(file) }
  function uploadBackground(e: React.ChangeEvent<HTMLInputElement>) { const file = e.target.files?.[0]; if (!file) return; readFile(file, value => { localStorage.setItem('anniversary-lock-photo', value); setBackground(value) }) }
  function uploadPhotos(e: React.ChangeEvent<HTMLInputElement>) { Array.from(e.target.files || []).forEach(file => readFile(file, src => setPhotos(current => { const next = [...current, { id: Date.now() + Math.random(), src, caption: '' }]; localStorage.setItem('anniversary-photos', JSON.stringify(next)); return next }))); e.target.value = '' }
  function saveSpotify() { localStorage.setItem('anniversary-spotify', spotifyDraft); setSpotify(spotifyDraft) }
  function saveLetter() { localStorage.setItem('anniversary-letter', letterDraft); setLetter(letterDraft) }
  function updatePhoto(id: number, caption: string) { setPhotos(current => { const next = current.map(photo => photo.id === id ? { ...photo, caption } : photo); localStorage.setItem('anniversary-photos', JSON.stringify(next)); return next }) }
  function removePhoto(id: number) { setPhotos(current => { const next = current.filter(photo => photo.id !== id); localStorage.setItem('anniversary-photos', JSON.stringify(next)); return next }) }
  function addReason() { if (!newReason.trim()) return; const next = [...reasons, newReason.trim()]; setReasons(next); setNewReason(''); localStorage.setItem('anniversary-reasons', JSON.stringify(next)) }
  function removeReason(index: number) { const next = reasons.filter((_, i) => i !== index); setReasons(next); localStorage.setItem('anniversary-reasons', JSON.stringify(next)) }

  return <main className="anniversary-app">
    {!unlocked && !transitioning && <section className="lock-screen" style={background ? { backgroundImage: `linear-gradient(135deg, rgba(40,18,28,.68), rgba(115,49,66,.55)), url(${background})` } : undefined}><div className="lock-glow" /><div className={`lock-card ${error ? 'shake' : ''}`}><div className="lock-mark"><Heart size={20} fill="currentColor" /></div><p className="eyebrow">A little place for us</p><h1>Our story,<br /><em>kept softly.</em></h1><p className="lock-copy">This space is just for you. Enter our special date to open it.</p><div className="code-row"><input autoFocus value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) unlock() }} inputMode="numeric" aria-label="Six digit passcode" placeholder="••••••" /><button type="button" onClick={unlock} aria-label="Unlock memory"><LockKeyhole size={18} /></button></div><p className={`error-copy ${error ? 'visible' : ''}`}>That date needs another try.</p><span className="lock-hint">six digits · one beautiful beginning</span></div><label className="photo-upload"><Upload size={15} /><span>Change background</span><input type="file" accept="image/*" onChange={uploadBackground} /></label></section>}
    {transitioning && <div className="flower-flood" aria-label="Opening our story">{Array.from({ length: 42 }).map((_, i) => <span key={i} style={{ '--i': i } as React.CSSProperties}>{i % 3 === 0 ? '✦' : i % 2 ? '✿' : '❀'}</span>)}</div>}
    {unlocked && <div className="dashboard"><header className="topbar"><div className="brand"><span className="brand-dot"><Heart size={13} fill="currentColor" /></span> our little archive</div><div className="topbar-date">august 31, 2024 <span>·</span> still here</div></header><section className="hero"><p className="eyebrow rose">For the one who makes ordinary feel golden</p><h1>Happy <em>anniversary,</em><br />my love.</h1><p className="hero-copy">Every second since we began has been worth keeping.</p><div className="counter"><div><strong>{time.days.toLocaleString()}</strong><span>days</span></div><i>:</i><div><strong>{String(time.hours).padStart(2, '0')}</strong><span>hours</span></div><i>:</i><div><strong>{String(time.minutes).padStart(2, '0')}</strong><span>minutes</span></div><i>:</i><div><strong>{String(time.seconds).padStart(2, '0')}</strong><span>seconds</span></div></div><a className="scroll-cue" href="#portals"><ChevronDown size={17} /> scroll down to explore</a></section><section id="portals" className="portal-grid"><Portal image={icons.music} title="Songs about how I feel" subtitle="a playlist made for you" className="music-portal" onClick={() => { setSpotifyDraft(spotify); setModal('music') }} /><Portal image={icons.letter} title="a love letter" subtitle="open when you need a reminder" className="letter-portal" onClick={() => { setLetterDraft(letter); setModal('letter') }} /><Portal image={icons.gallery} title="little moments" subtitle={`${photos.length} saved ${photos.length === 1 ? 'memory' : 'memories'}`} className="camera-portal" onClick={() => setModal('gallery')} /><Portal image={icons.notes} title="things i love" subtitle={`${reasons.length} little reasons`} className="flower-portal" onClick={() => setModal('notes')} /></section><footer><Heart size={13} fill="currentColor" /> made with all my love <Heart size={13} fill="currentColor" /></footer></div>}
    {modal && <ModalShell onClose={() => setModal(null)}>{modal === 'music' && <><p className="eyebrow rose">press play</p><h2>Our soundtrack</h2><p className="modal-intro">Paste a Spotify playlist, album, or track link below.</p><input className="wide-input" value={spotifyDraft} onChange={e => setSpotifyDraft(e.target.value)} placeholder="https://open.spotify.com/playlist/..." /><button className="save-button" onClick={saveSpotify}><Save size={15} /> Save playlist</button>{spotifyEmbed(spotify) && <iframe className="spotify-frame" src={spotifyEmbed(spotify)} title="Spotify player" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />}</>}{modal === 'letter' && <><p className="eyebrow rose">sealed with a kiss</p><h2>My dearest love,</h2><textarea className="letter-editor" value={letterDraft} onChange={e => setLetterDraft(e.target.value)} aria-label="Edit love letter" /><button className="save-button" onClick={saveLetter}><Save size={15} /> Save letter</button></>}{modal === 'gallery' && <><p className="eyebrow rose">the two of us</p><h2>Little moments</h2><label className="upload-button"><Upload size={15} /> Add photos<input type="file" accept="image/*" multiple onChange={uploadPhotos} /></label><div className="polaroid-grid">{photos.map(photo => <article className="polaroid" key={photo.id}><div className="polaroid-image"><img src={photo.src} alt="Uploaded memory" /><button type="button" onClick={() => removePhoto(photo.id)} aria-label="Delete photo"><Trash2 size={14} /></button></div><input value={photo.caption} onChange={e => updatePhoto(photo.id, e.target.value)} placeholder="write a little note..." aria-label="Photo caption" /></article>)}{!photos.length && <p className="empty-state"><Camera size={28} />Your saved moments will live here.</p>}</div></>}{modal === 'notes' && <><div className="notes-flower"><Flower2 size={44} /></div><p className="eyebrow rose">a growing list</p><h2>Things I love about you</h2><ul className="love-list">{reasons.map((reason, index) => <li key={`${reason}-${index}`}>{reason}<button type="button" onClick={() => removeReason(index)} aria-label={`Delete reason ${index + 1}`}><X size={14} /></button></li>)}</ul><div className="reason-add"><input value={newReason} onChange={e => setNewReason(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReason()} placeholder="add another reason..." /><button type="button" onClick={addReason} aria-label="Add reason"><Plus size={17} /></button></div></>}</ModalShell>}
  </main>
}

function Portal({ image, title, subtitle, className, onClick }: { image: string; title: string; subtitle: string; className: string; onClick: () => void }) { return <button type="button" className={`portal ${className}`} onClick={onClick}><div className="custom-portal-art"><img src={image} alt="" /></div><div className="portal-meta"><span className="portal-icon"><Heart size={15} fill="currentColor" /></span><span><b>{title}</b><small>{subtitle}</small></span><span className="portal-action">→</span></div></button> }
function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) { return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}><button type="button" className="close-button" onClick={onClose} aria-label="Close"><X size={18} /></button>{children}</div></div> }
