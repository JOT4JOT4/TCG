import { useEffect, useMemo, useState } from 'react'
import MainMenu from './MainMenu'
import PLayerProfile from './PlayerProfile'
import gameBg from './assets/background-while-game.webp'
import arenaBg from './assets/escenario-juego.jpg'
import backCardImg from './assets/backcard.png'

/* ─── Constantes ─────────────────────────────────────────────── */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const STARTING_LIFE = 3
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

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}))
    throw new Error(detail.detail || 'No se pudo completar la solicitud')
  }
  return response.json()
}

/* ─── Componente: Carta con Diseño Oficial TCG ────────────────── */
function Card({ card, faceDown = false, onClick, disabled = false, className = '' }) {
  if (faceDown) {
    return (
      <div className={`card card-back ${className}`} aria-label="Carta boca abajo">
        <img src={backCardImg} alt="Reverso de carta" className="card-back-img" />
      </div>
    )
  }

  const numSrc = NUM_IMAGES[card.power] || NUM_IMAGES[5]

  return (
    <button
      className={`card card-${card.card_type} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
      aria-label={`Usar ${card.name}, tipo ${card.card_type}, poder ${card.power}`}
    >
      {/* Insignia de poder en esquina superior derecha */}
      <div className="card-corner-power power-tr" title={`Poder: ${card.power}`}>
        <img src={numSrc} alt={`${card.power}`} className="card-num-img" />
      </div>

      {/* Ilustración de la carta */}
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

      {/* Insignia de poder en esquina inferior izquierda */}
      <div className="card-corner-power power-bl" title={`Poder: ${card.power}`}>
        <img src={numSrc} alt={`${card.power}`} className="card-num-img" />
      </div>
    </button>
  )
}

/* ─── Componentes UI ────*/
function WoodScrew({ position = 'tl' }) {
  return <span className={`wood-screw wood-screw-${position}`} aria-hidden="true" />
}

function WoodGameButton({ children, onClick, disabled = false, className = '', type = 'button' }) {
  return (
    <button
      className={`wood-game-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      <WoodScrew position="tl" />
      <WoodScrew position="tr" />
      <WoodScrew position="bl" />
      <WoodScrew position="br" />
      <span className="wood-game-btn-inner">{children}</span>
    </button>
  )
}

/* ─── Componente: Barra de vida ──────────────────────────────── */
function Life({ value, label, rival = false }) {
  return (
    <div className="life-block">
      <div className="life-label"><span>{label}</span><strong>{value}/{STARTING_LIFE}</strong></div>
      <div className="life-bar"><span className={rival ? 'rival-life' : ''} style={{ width: `${(value / STARTING_LIFE) * 100}%` }} /></div>
    </div>
  )
}

/* ─── Componente: Pantalla de juego ──────────────────────────── */
function GameScreen({ onBackToMenu }) {
  const [game, setGame] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function startGame() {
    setError('')
    setBusy(true)
    try { setGame(await api('/combat/games', { method: 'POST' })) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }

  useEffect(() => { startGame() }, [])

  async function perform(path, body) {
    setError('')
    setBusy(true)
    try { setGame(await api(`/combat/games/${game.game_id}/${path}`, { method: 'POST', body: body ? JSON.stringify(body) : undefined })) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }

  const statusMessage = useMemo(() => {
    if (!game) return 'Conectando con el servidor...'
    if (game.phase === 'finished') return game.winner === 'player' ? '¡Has ganado el combate!' : 'El rival se lleva la victoria'
    if (game.phase === 'selecting') return 'Elige una carta para iniciar la ronda'
    if (game.phase === 'ready') return 'Ambas cartas están listas. Revela el campo.'
    if (game.result === 'draw') return 'Empate: nadie pierde vida.'
    return game.result === 'player_one' ? '¡Tu carta gana la ronda!' : 'El rival gana la ronda.'
  }, [game])

  if (!game) return (
    <main
      className="app-shell loading-screen"
      style={{ backgroundImage: `linear-gradient(rgba(10, 8, 20, 0.45), rgba(10, 8, 20, 0.65)), url(${gameBg})` }}
    >
      <div className="wood-loading-box">
        <WoodScrew position="tl" />
        <WoodScrew position="tr" />
        <WoodScrew position="bl" />
        <WoodScrew position="br" />
        <p>{error || 'Convocando las cartas del océano...'}</p>
        {error && <WoodGameButton onClick={startGame}>Reintentar</WoodGameButton>}
      </div>
    </main>
  )

  const fieldCard = (card, side) => {
    if (game.phase === 'ready') return <Card faceDown />
    if (!card) return <div className="empty-field"><span>⚔</span><small>{side === 'player' ? 'TU CARTA' : 'CARTA RIVAL'}</small></div>
    return game.phase === 'revealed' || game.phase === 'finished' ? <Card card={card} /> : <Card faceDown />
  }

  return (
    <main
      className="app-shell"
      style={{ backgroundImage: `linear-gradient(rgba(10, 8, 20, 0.45), rgba(10, 8, 20, 0.65)), url(${gameBg})` }}
    >
      <header className="topbar">
        <WoodScrew position="bl" />
        <WoodScrew position="br" />
        <div className="brand">
          <span className="brand-title">
            ONE PIECE <span className="brand-subtitle">ARCANA DUEL</span>
          </span>
        </div>
        <div className="match-status">
          <span className="match-status-text">DUELO EN ALTA MAR</span>
          <span className="round-pill">RONDA {game.round}</span>
        </div>
        <div className="topbar-actions">
          <WoodGameButton onClick={startGame} disabled={busy} className="wood-btn-sm-game">
            ↻ Reiniciar
          </WoodGameButton>
          <WoodGameButton onClick={onBackToMenu} className="wood-btn-sm-game">
            ← Menú
          </WoodGameButton>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <section className="battle-layout">
        <aside className="player-panel rival-panel">
          <WoodScrew position="tl" />
          <WoodScrew position="tr" />
          <WoodScrew position="bl" />
          <WoodScrew position="br" />
          <div className="player-heading">
            <div className="avatar rival-avatar">IA</div>
            <div>
              <span>OPONENTE</span>
              <h2>Rival IA</h2>
            </div>
          </div>
          <Life value={game.rival.life} label="VIDA" rival />
          <div className="zone-summary">
            <div>
              <span>MAZO</span>
              <strong>{game.rival.deck_count}</strong>
            </div>
            <div>
              <span>CEMENTERIO</span>
              <strong>{game.rival.graveyard_count}</strong>
            </div>
          </div>
        </aside>

        <section
          className="arena"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(16, 12, 28, 0.25) 0%, rgba(16, 12, 28, 0.1) 45%, rgba(16, 12, 28, 0.4) 100%), url(${arenaBg})` }}
        >
          <WoodScrew position="tl" />
          <WoodScrew position="tr" />
          <WoodScrew position="bl" />
          <WoodScrew position="br" />
          <div className="arena-header">
            <span>CAMPO DE BATALLA</span>
            <span className="phase-label">{statusMessage}</span>
          </div>
          <div className="field-row">
            <div className="field-slot">{fieldCard(game.fields.rival, 'rival')}</div>
            <div className="versus">VS</div>
            <div className="field-slot">{fieldCard(game.fields.player, 'player')}</div>
          </div>
          <div className="action-row">
            {game.phase === 'ready' && (
              <WoodGameButton onClick={() => perform('reveal')} disabled={busy} className="wood-action-hero">
                Revelar cartas <span>→</span>
              </WoodGameButton>
            )}
            {game.phase === 'revealed' && (
              <WoodGameButton onClick={() => perform('resolve')} disabled={busy} className="wood-action-hero">
                Resolver ronda <span>→</span>
              </WoodGameButton>
            )}
            {game.phase === 'finished' && (
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <WoodGameButton onClick={startGame} disabled={busy} className="wood-action-hero">
                  Nueva partida <span>↻</span>
                </WoodGameButton>
                <WoodGameButton onClick={onBackToMenu} className="wood-action-hero">
                  Volver al Menú <span>←</span>
                </WoodGameButton>
              </div>
            )}
          </div>
        </section>

        <aside className="player-panel user-panel">
          <WoodScrew position="tl" />
          <WoodScrew position="tr" />
          <WoodScrew position="bl" />
          <WoodScrew position="br" />
          <div className="player-heading">
            <div className="avatar user-avatar">TÚ</div>
            <div>
              <span>JUGADOR</span>
              <h2>Capitán</h2>
            </div>
          </div>
          <Life value={game.player.life} label="VIDA" />
          <div className="zone-summary">
            <div>
              <span>MAZO</span>
              <strong>{game.player.deck_count}</strong>
            </div>
            <div>
              <span>CEMENTERIO</span>
              <strong>{game.player.graveyard?.length || 0}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="hand-section">
        <WoodScrew position="tl" />
        <WoodScrew position="tr" />
        <WoodScrew position="bl" />
        <WoodScrew position="br" />
        <div className="hand-header">
          <div>
            <span className="eyebrow"> TU TRIPULACIÓN</span>
            <h2>Selecciona una carta de tu mano</h2>
          </div>
          <span className="hand-count">{game.player.hand.length} CARTAS EN MANO</span>
        </div>
        <div className="hand">
          {game.player.hand.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => perform('choice', { card_id: card.id })}
              disabled={busy || game.phase !== 'selecting'}
            />
          ))}
        </div>
        {game.phase === 'finished' && (
          <div className={`winner-banner ${game.winner === 'player' ? 'banner-victory' : 'banner-defeat'}`}>
            <span className="winner-skull">☠</span>
            <h3>{game.winner === 'player' ? '¡VICTORIA PIRATA!' : '¡DERROTA EN EL MAR!'}</h3>
            <p>{game.winner === 'player' ? 'El campo de batalla es tuyo, ¡has dominado el Grand Line!' : 'Tus cartas cayeron en combate. Entrena tu Haki y vuelve a zarpar.'}</p>
          </div>
        )}
      </section>
    </main>
  )
}

/* ─── App raíz ───────────────────────────────────────────────── */
export default function App() {
  const [screen, setScreen] = useState('menu') // 'menu' | 'game' | 'profile'
  const [musicVol, setMusicVol] = useState(70)
  const [sfxVol, setSfxVol] = useState(80)

  if (screen === 'menu') {
    return (
      <MainMenu
        onPlay={() => setScreen('game')}
        onProfile={() => setScreen('profile')}
        musicVol={musicVol}
        sfxVol={sfxVol}
        onMusicChange={setMusicVol}
        onSfxChange={setSfxVol}
      />
    )
  }

  if (screen === 'profile') {
    return (
      <PLayerProfile onBack={() => setScreen('menu')} />
    )
  }

  return <GameScreen onBackToMenu={() => setScreen('menu')} />
}
