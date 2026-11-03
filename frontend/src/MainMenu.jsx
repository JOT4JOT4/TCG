import { useState, useEffect } from 'react'
import mapBg from './assets/MapaOnePiecesTGC_Background.webp'
import soundManager from './soundManager'

/* ─── Constantes ─────────────────────────────────────────────── */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TYPE_LABELS = { logia: 'Logia', paramecia: 'Paramecia', zoan: 'Zoan' }
const TYPE_ICONS = { logia: '✦', paramecia: '◆', zoan: '◈' }

const NUM_IMAGES = {
  1: '/nums/uno.png',
  2: '/nums/dos.png',
  3: '/nums/tres.png',
  4: '/nums/cuatro.png',
  5: '/nums/cinco.png',
  6: '/nums/seis.png',
  7: '/nums/siete.png',
  8: '/nums/ocho.png',
  9: '/nums/nueve.png',
}

async function fetchCards() {
  const res = await fetch(`${API_URL}/api/cards`)
  if (!res.ok) throw new Error('No se pudieron cargar las cartas de la base de datos')
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
  const handleClose = () => {
    soundManager.playCardRemove()
    onClose()
  }

  const handleSfxPreview = (val) => {
    onSfxChange(val)
    soundManager.playCardPlace()
  }
  return (
    <div className="mm-overlay" role="dialog" aria-modal="true" aria-label="Opciones">
      <div className="wood-modal-container">
        <div className="wood-header-plaque">
          <WoodScrew position="tl" />
          <WoodScrew position="tr" />
          <WoodScrew position="bl" />
          <WoodScrew position="br" />
          <span className="wood-header-title">OPCIONES</span>
        </div>

        <div className="wood-modal-close-corner">
          <WoodRoundButton onClick={handleClose} title="Cerrar" ariaLabel="Cerrar opciones">
            ✕
          </WoodRoundButton>
        </div>

        <div className="wood-modal-body">
          <p className="wood-modal-section-title">Ajustes de Sonido</p>
          <VolumeSlider label="Música" icon="🎵" value={musicVol} onChange={onMusicChange} />
          <VolumeSlider label="Efectos" icon="🔊" value={sfxVol} onChange={handleSfxPreview} />
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
  const handleClose = () => {
    soundManager.playCardRemove()
    onClose()
  }
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
          <WoodRoundButton onClick={handleClose} title="Cerrar" ariaLabel="Cerrar créditos">
            ✕
          </WoodRoundButton>
        </div>

        <div className="wood-modal-body wood-credits-body">
          <div className="wood-credit-block">
            <span className="wood-credit-role">Diseño &amp; Desarrollo</span>
            <strong className="wood-credit-name">Diego Adaos - Juan Pablo Vargas - Cristóbal Luna</strong>
          </div>
          <div className="wood-credit-block">
            <span className="wood-credit-role">Arte Oficial</span>
            <strong className="wood-credit-name">One Piece Card Game &bull; Eiichiro Oda</strong>
          </div>
          <div className="wood-credit-block">
            <span className="wood-credit-role">Motor de Juego &amp; BD</span>
            <strong className="wood-credit-name">React + FastAPI + PostgreSQL</strong>
          </div>
          <p className="wood-credits-footer">ARCANA DUEL &bull; 2026</p>
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

/* ─── Componente: Card Visual (Diseño Oficial) ───────────────── */
function CardItem({ card, onClick, className = '' }) {
  const numSrc = NUM_IMAGES[card.power] || NUM_IMAGES[5]

  return (
    <div
      className={`card card-${card.card_type} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
      title={`${card.name} (Poder: ${card.power})`}
    >
      {/* Esquina superior derecha: Número de poder */}
      <div className="card-corner-power power-tr">
        <img src={numSrc} alt={`${card.power}`} className="card-num-img" />
      </div>

      {/* Ilustración */}
      <div className="card-frame-inner">
        {card.image_url ? (
          <img src={card.image_url} alt={card.name} className="card-illustration-img" loading="lazy" />
        ) : (
          <div className="card-art-fallback">{card.name ? card.name.split(' ').map((w) => w[0]).join('') : 'OP'}</div>
        )}

        {/* Nombre del personaje */}
        <div className="card-name-banner">
          <span className="card-name-text">{card.name}</span>
        </div>
      </div>

      {/* Esquina inferior izquierda: Número de poder */}
      <div className="card-corner-power power-bl">
        <img src={numSrc} alt={`${card.power}`} className="card-num-img" />
      </div>
    </div>
  )
}

/* ─── Componente: Modal de Detalle de Carta ─────────────────── */
function CardDetailModal({ card, onClose }) {
  const handleClose = () => {
    soundManager.playCardFlip()
    onClose()
  }
  if (!card) return null

  const ADVANTAGES = {
    zoan: {
      beats: 'Logia',
      losesTo: 'Paramecia',
      rule: '◈ Zoan (Verde) supera a Logia (+2 poder en duelo). Débil ante las habilidades Paramecia.',
    },
    paramecia: {
      beats: 'Zoan',
      losesTo: 'Logia',
      rule: '◆ Paramecia (Rojo) supera a Zoan (+2 poder en duelo). Débil ante la intangibilidad Logia.',
    },
    logia: {
      beats: 'Paramecia',
      losesTo: 'Zoan',
      rule: '✦ Logia (Morado) supera a Paramecia (+2 poder en duelo). Débil ante la fuerza física de Zoan.',
    },
  }
  const adv = ADVANTAGES[card.card_type] || {}

  return (
    <div className="card-detail-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="card-detail-box" onClick={(e) => e.stopPropagation()}>
        <button className="card-detail-close" onClick={handleClose} type="button" aria-label="Cerrar detalle">
          ✕
        </button>

        <div className="card-detail-grid">
          {/* Visual de carta ampliada */}
          <div className="card-detail-visual">
            <CardItem card={card} className="card-lg" />
          </div>

          {/* Ficha de datos */}
          <div className="card-detail-content">
            <span className="card-detail-chip">CARTA #{String(card.id).padStart(3, '0')}</span>
            <h2 className="card-detail-title">{card.name}</h2>

            <div className="card-detail-badges">
              <span className={`card-type-pill type-pill-${card.card_type}`}>
                {TYPE_ICONS[card.card_type]} {TYPE_LABELS[card.card_type].toUpperCase()}
              </span>
              <span className="card-power-pill">
                Poder Base: <strong>{card.power} / 9</strong>
              </span>
            </div>

            <div className="card-stat-bar-wrap">
              <div className="card-stat-bar-track">
                <span
                  className={`card-stat-bar-fill fill-${card.card_type}`}
                  style={{ width: `${(card.power / 9) * 100}%` }}
                />
              </div>
            </div>

            <div className="card-detail-section">
              <span className="card-detail-label">VENTAJA TÁCTICA EN DUELO</span>
              <p className="card-detail-text card-detail-rule">{adv.rule}</p>
            </div>

            <div className="card-detail-section">
              <span className="card-detail-label">DESCRIPCIÓN &amp; HABILIDAD</span>
              <p className="card-detail-text">{card.description || 'Sin descripción disponible.'}</p>
            </div>

            <button className="card-detail-action" onClick={handleClose} type="button">
              ← Volver a la Colección
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Componente: Panel de Galería (Colección de cartas) ──────── */
function GalleryPanel({ onClose }) {
  const handleClose = () => {
    soundManager.playCardRemove()
    onClose()
  }

  const handleFilterChange = (newFilter) => {
    soundManager.playCardTake()
    setFilter(newFilter)
  }

  const handleSelectCard = (card) => {
    soundManager.playCardFlip()
    setSelectedCard(card)
  }
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedCard, setSelectedCard] = useState(null)

  useEffect(() => {
    fetchCards()
      .then(setCards)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = cards.filter((c) => {
    const matchesFilter = filter === 'all' || c.card_type === filter
    const query = search.trim().toLowerCase()
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query)) ||
      String(c.power) === query
    return matchesFilter && matchesSearch
  })

  const counts = {
    all: cards.length,
    zoan: cards.filter((c) => c.card_type === 'zoan').length,
    paramecia: cards.filter((c) => c.card_type === 'paramecia').length,
    logia: cards.filter((c) => c.card_type === 'logia').length,
  }

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
          <WoodRoundButton onClick={handleClose} title="Cerrar" ariaLabel="Cerrar galería">
            ✕
          </WoodRoundButton>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="wood-gallery-toolbar">
          <div className="wood-gallery-filters">
            <button
              type="button"
              className={`wood-filter-btn${filter === 'all' ? ' active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              TODAS ({counts.all})
            </button>
            <button
              type="button"
              className={`wood-filter-btn filter-btn-zoan${filter === 'zoan' ? ' active' : ''}`}
              onClick={() => handleFilterChange('zoan')}
            >
              ZOAN ({counts.zoan})
            </button>
            <button
              type="button"
              className={`wood-filter-btn filter-btn-paramecia${filter === 'paramecia' ? ' active' : ''}`}
              onClick={() => handleFilterChange('paramecia')}
            >
              PARAMECIA ({counts.paramecia})
            </button>
            <button
              type="button"
              className={`wood-filter-btn filter-btn-logia${filter === 'logia' ? ' active' : ''}`}
              onClick={() => handleFilterChange('logia')}
            >
              LOGIA ({counts.logia})
            </button>
          </div>

          <div className="wood-gallery-search-wrap">
            <input
              type="text"
              className="wood-gallery-search"
              placeholder="🔍 Buscar personaje o poder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar carta"
            />
          </div>
        </div>

        {/* Grid de cartas */}
        <div className="wood-gallery-body">
          {loading && <p className="wood-gallery-msg">Cargando colección desde la base de datos...</p>}
          {error && <p className="wood-gallery-msg wood-gallery-error">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="wood-gallery-msg">No se encontraron cartas con esos criterios.</p>
          )}

          <div className="mm-gallery-grid">
            {filtered.map((card) => (
              <div
                key={card.id}
                className="gallery-card-item"
                onClick={() => handleSelectCard(card)}
              >
                <CardItem card={card} />
              </div>
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

      {/* Modal de Detalle de Carta seleccionada */}
      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  )
}

/* ─── Componente Principal: Main Menu ────────────────────────── */
export default function MainMenu({ onPlay, onProfile, musicVol, sfxVol, onMusicChange, onSfxChange }) {
  const [panel, setPanel] = useState(null) // null | 'options' | 'credits' | 'gallery'

  const closePanel = () => setPanel(null)

  const handlePlay = () => {
    soundManager.playCardPlace()
    onPlay()
  }

  const handleProfile = () => {
    soundManager.playButtonClick()
    onProfile()
  }

  const handleOpenPanel = (name) => {
    if (name === 'gallery') {
      soundManager.playCardFlip()
    } else {
      soundManager.playButtonClick()
    }
    setPanel(name)
  }

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
            <span className="wood-header-title">MENÚ</span>
          </div>

          {/* Lista de 4 botones de madera */}
          <nav className="wood-btn-list" aria-label="Menú principal">
            <WoodButton onClick={handlePlay}>JUGAR</WoodButton>
            <WoodButton onClick={handleProfile}>Mi Perfil</WoodButton>
            <WoodButton onClick={() => handleOpenPanel('gallery')}>CARTAS</WoodButton>
            <WoodButton onClick={() => handleOpenPanel('options')}>OPCIONES</WoodButton>
            <WoodButton onClick={() => handleOpenPanel('credits')}>CRÉDITOS</WoodButton>
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
