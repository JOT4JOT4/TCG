import { useState, useRef, useEffect } from 'react'
import mapBg from './assets/MapaOnePiecesTGC_Background.webp'

/* ─── Constantes ─────────────────────────────────────────────── */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TYPE_LABELS = { logia: 'Logia', paramecia: 'Paramecia', zoan: 'Zoan' }
const TYPE_ICONS = { logia: '✦', paramecia: '◆', zoan: '◈' }

async function fetchCards() {
  const res = await fetch(`${API_URL}/api/cards`)
  if (!res.ok) throw new Error('No se pudieron cargar las cartas')
  return res.json()
}

/* ─── Componentes UI de Madera  ─────────────── */
function WoodScrew({ position = 'tl' }) {
  return <span className={`wood-screw wood-screw-${position}`} aria-hidden="true" />
}

function WoodButton({ children, onClick, disabled = false, className = '' }) {
  return (
    <button
      className={`wood-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <WoodScrew position="tl" />
      <WoodScrew position="tr" />
      <WoodScrew position="bl" />
      <WoodScrew position="br" />
      <div className="wood-btn-inner">
        <span className="wood-btn-text">{children}</span>
      </div>
    </button>
  )
}

function WoodRoundButton({ children, onClick, title = '', ariaLabel = '', className = '' }) {
  return (
    <button
      className={`wood-round-btn ${className}`}
      onClick={onClick}
      type="button"
      title={title}
      aria-label={ariaLabel || title}
    >
      <span className="wood-round-btn-inner">{children}</span>
    </button>
  )
}

/* ─── Componente: Slider de volumen con botones +/- ──────────── */
function VolumeSlider({ label, icon, value, onChange }) {
  const stepDown = () => onChange(Math.max(0, value - 10))
  const stepUp = () => onChange(Math.min(100, value + 10))

  return (
    <div className="wood-volume-row">
      <div className="wood-volume-header">
        <span className="wood-volume-label">
          <span className="wood-volume-icon">{icon}</span> {label}
        </span>
        <span className="wood-volume-value">{value}%</span>
      </div>
      <div className="wood-volume-controls">
        <WoodRoundButton onClick={stepDown} title="Bajar volumen" className="wood-round-btn-sm">
          −
        </WoodRoundButton>
        <div className="wood-slider-wrap">
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="wood-slider"
            aria-label={`Volumen de ${label}`}
          />
        </div>
        <WoodRoundButton onClick={stepUp} title="Subir volumen" className="wood-round-btn-sm">
          +
        </WoodRoundButton>
      </div>
    </div>
  )
}

/* ─── Componente: Panel de Opciones en formato madera ────────── */
function OptionsPanel({ musicVol, sfxVol, onMusicChange, onSfxChange, onClose }) {
  return (
    <div className="mm-overlay" role="dialog" aria-modal="true" aria-label="Opciones">
      <div className="wood-modal-container">
        {/* Placa superior */}
        <div className="wood-header-plaque">
          <WoodScrew position="tl" />
          <WoodScrew position="tr" />
          <WoodScrew position="bl" />
          <WoodScrew position="br" />
          <span className="wood-header-title">OPCIONES</span>
        </div>

        {/* Botón cerrar redondo en la esquina */}
        <div className="wood-modal-close-corner">
          <WoodRoundButton onClick={onClose} title="Cerrar" ariaLabel="Cerrar opciones">
            ✕
          </WoodRoundButton>
        </div>

        <div className="wood-modal-body">
          <p className="wood-modal-section-title">Ajustes de Sonido</p>
          <VolumeSlider label="Música" icon="🎵" value={musicVol} onChange={onMusicChange} />
          <VolumeSlider label="Efectos" icon="🔊" value={sfxVol} onChange={onSfxChange} />
        </div>

        <div className="wood-modal-actions">
          <WoodButton onClick={onClose}>CERRAR</WoodButton>
        </div>

        <div className="wood-footer-bar">
          <span className="wood-screw" style={{ position: 'static' }} />
          <span className="wood-screw" style={{ position: 'static' }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Componente: Panel de Créditos en formato madera ────────── */
function CreditsPanel({ onClose }) {
  return (
    <div className="mm-overlay" role="dialog" aria-modal="true" aria-label="Créditos">
      <div className="wood-modal-container wood-credits-modal">
        <div className="wood-header-plaque">
          <WoodScrew position="tl" />
          <WoodScrew position="tr" />
          <WoodScrew position="bl" />
          <WoodScrew position="br" />
          <span className="wood-header-title">CRÉDITOS</span>
        </div>

        <div className="wood-modal-close-corner">
          <WoodRoundButton onClick={onClose} title="Cerrar" ariaLabel="Cerrar créditos">
            ✕
          </WoodRoundButton>
        </div>

        <div className="wood-modal-body wood-credits-body">
          <div className="wood-credit-block">
            <span className="wood-credit-role">Diseño &amp; Desarrollo</span>
            <strong className="wood-credit-name">Diego Adaos - Juan Pablo Vargas - Cristobal Luna</strong>
          </div>
          <div className="wood-credit-block">
            <span className="wood-credit-role">Arte de Cartas</span>
            <strong className="wood-credit-name">Comunidad One Piece TCG</strong>
          </div>
          <div className="wood-credit-block">
            <span className="wood-credit-role">Motor de Juego</span>
            <strong className="wood-credit-name">React + FastAPI</strong>
          </div>
          <div className="wood-credit-block">
            <span className="wood-credit-role">Inspiración</span>
            <strong className="wood-credit-name">One Piece &mdash; Eiichiro Oda</strong>
          </div>
          <p className="wood-credits-footer">
            ARCANA DUEL &bull; 2026
          </p>
        </div>

        <div className="wood-modal-actions">
          <WoodButton onClick={onClose}>CERRAR</WoodButton>
        </div>

        <div className="wood-footer-bar">
          <span className="wood-screw" style={{ position: 'static' }} />
          <span className="wood-screw" style={{ position: 'static' }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Componente: Card preview (colección) ───────────────────── */
function CardPreview({ card }) {
  return (
    <div className={`mm-card-preview card-${card.card_type}`}>
      <span className="mm-card-topline">
        <span>{TYPE_ICONS[card.card_type]}</span>
        <b>{TYPE_LABELS[card.card_type]}</b>
      </span>
      <span className="mm-card-art">{card.name.split(' ').map((w) => w[0]).join('')}</span>
      <strong className="mm-card-name">{card.name}</strong>
      <small className="mm-card-desc">{card.description}</small>
      <span className="mm-card-power">
        <span>PODER</span>{card.power}
      </span>
    </div>
  )
}

/* ─── Componente: Panel de Galería en formato madera ─────────── */
function GalleryPanel({ onClose }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchCards()
      .then(setCards)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? cards : cards.filter((c) => c.card_type === filter)

  return (
    <div className="mm-overlay mm-overlay-gallery" role="dialog" aria-modal="true" aria-label="Galería de Cartas">
      <div className="wood-modal-container wood-gallery-modal">
        <div className="wood-header-plaque wood-header-plaque-lg">
          <WoodScrew position="tl" />
          <WoodScrew position="tr" />
          <WoodScrew position="bl" />
          <WoodScrew position="br" />
          <span className="wood-header-title">COLECCIÓN</span>
        </div>

        <div className="wood-modal-close-corner">
          <WoodRoundButton onClick={onClose} title="Cerrar" ariaLabel="Cerrar galería">
            ✕
          </WoodRoundButton>
        </div>

        {/* Filtros */}
        <div className="wood-gallery-filters">
          {['all', 'logia', 'paramecia', 'zoan'].map((t) => (
            <button
              key={t}
              type="button"
              className={`wood-filter-btn${filter === t ? ' active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {t === 'all' ? 'TODAS' : TYPE_LABELS[t].toUpperCase()}
            </button>
          ))}
          <span className="wood-gallery-count">{filtered.length} cartas</span>
        </div>

        <div className="wood-gallery-body">
          {loading && <p className="wood-gallery-msg">Cargando cartas...</p>}
          {error && <p className="wood-gallery-msg wood-gallery-error">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="wood-gallery-msg">No hay cartas disponibles.</p>
          )}
          <div className="mm-gallery-grid">
            {filtered.map((card) => (
              <CardPreview key={card.id} card={card} />
            ))}
          </div>
        </div>

        <div className="wood-modal-actions">
          <WoodButton onClick={onClose}>CERRAR</WoodButton>
        </div>

        <div className="wood-footer-bar">
          <span className="wood-screw" style={{ position: 'static' }} />
          <span className="wood-screw" style={{ position: 'static' }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Componente Principal: Main Menu ────────────────────────── */
export default function MainMenu({ onPlay, musicVol, sfxVol, onMusicChange, onSfxChange }) {
  const [panel, setPanel] = useState(null) // null | 'options' | 'credits' | 'gallery'

  const closePanel = () => setPanel(null)

  return (
    <div className="mm-root">
      {/* Fondo con mapa completamente visible */}
      <div
        className="mm-bg"
        aria-hidden="true"
        style={{ backgroundImage: `url(${mapBg})` }}
      />

      <div className="wood-menu-wrapper">
        {/* Encabezado con título del juego */}
        <header className="wood-game-header">
          <div className="wood-title-badge">ONE PIECE</div>
          <h1 className="wood-game-title">
            ARCANA <span>DUEL</span>
          </h1>
          <span className="wood-game-tag">Trading Card Game</span>
        </header>

        {/* Contenedor del Menú con formato idéntico a la referencia */}
        <div className="wood-panel-container">
          {/* Placa superior "MENU" con tornillos */}
          <div className="wood-header-plaque">
            <WoodScrew position="tl" />
            <WoodScrew position="tr" />
            <WoodScrew position="bl" />
            <WoodScrew position="br" />
            <span className="wood-header-title">MENU</span>
          </div>

          {/* Lista de 4 botones de madera */}
          <nav className="wood-btn-list" aria-label="Menú principal">
            <WoodButton onClick={onPlay}>JUGAR</WoodButton>
            <WoodButton onClick={() => setPanel('gallery')}>CARTAS</WoodButton>
            <WoodButton onClick={() => setPanel('options')}>OPCIONES</WoodButton>
            <WoodButton onClick={() => setPanel('credits')}>CRÉDITOS</WoodButton>
          </nav>

          {/* Base inferior de madera con tornillos */}
          <div className="wood-footer-bar">
            <span className="wood-screw wood-screw-left" />
            <span className="wood-screw wood-screw-right" />
          </div>
        </div>
      </div>

      {/* Paneles modales */}
      {panel === 'options' && (
        <OptionsPanel
          musicVol={musicVol}
          sfxVol={sfxVol}
          onMusicChange={onMusicChange}
          onSfxChange={onSfxChange}
          onClose={closePanel}
        />
      )}
      {panel === 'credits' && <CreditsPanel onClose={closePanel} />}
      {panel === 'gallery' && <GalleryPanel onClose={closePanel} />}
    </div>
  )
}
