import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const STARTING_LIFE = 3
const TYPE_LABELS = { logia: 'Logia', paramecia: 'Paramecia', zoan: 'Zoan' }
const TYPE_ICONS = { logia: '✦', paramecia: '◆', zoan: '◈' }

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

function Card({ card, faceDown = false, onClick, disabled = false }) {
  if (faceDown) return <div className="card card-back" aria-label="Carta boca abajo"><span>TCG</span><small>COMBATE</small></div>
  return (
    <button className={`card card-${card.card_type}`} onClick={onClick} disabled={disabled} type="button" aria-label={`Usar ${card.name}`}>
      <span className="card-topline"><span>{TYPE_ICONS[card.card_type]}</span><b>{TYPE_LABELS[card.card_type]}</b></span>
      <span className="card-art">{card.name.split(' ').map((word) => word[0]).join('')}</span>
      <strong>{card.name}</strong>
      <small>{card.description}</small>
      <span className="card-power"><span>PODER</span>{card.power}</span>
    </button>
  )
}

function Life({ value, label, rival = false }) {
  return (
    <div className="life-block">
      <div className="life-label"><span>{label}</span><strong>{value}/{STARTING_LIFE}</strong></div>
      <div className="life-bar"><span className={rival ? 'rival-life' : ''} style={{ width: `${(value / STARTING_LIFE) * 100}%` }} /></div>
    </div>
  )
}

export default function App() {
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

  if (!game) return <main className="app-shell loading-screen"><p>{error || 'Conectando con el servidor...'}</p>{error && <button className="primary-action" onClick={startGame} type="button">Reintentar</button>}</main>

  const fieldCard = (card, side) => {
    if (game.phase === 'ready') return <Card faceDown />
    if (!card) return <div className="empty-field"><span>+</span><small>{side === 'player' ? 'TU CARTA' : 'CARTA RIVAL'}</small></div>
    return game.phase === 'revealed' || game.phase === 'finished' ? <Card card={card} /> : <Card faceDown />
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><span>ARCANA <b>DUEL</b></span></div>
        <div className="match-status"><span className="live-dot" /> PARTIDA EN CURSO <span className="round-pill">RONDA {game.round}</span></div>
        <button className="restart-button" onClick={startGame} disabled={busy} type="button">↻ Reiniciar</button>
      </header>
      {error && <div className="error-banner">{error}</div>}
      <section className="battle-layout">
        <aside className="player-panel rival-panel">
          <div className="player-heading"><div className="avatar rival-avatar">R</div><div><span>OPONENTE</span><h2>Rival IA</h2></div></div>
          <Life value={game.rival.life} label="VIDA" rival />
          <div className="zone-summary"><div><span>MAZO</span><strong>{game.rival.deck_count}</strong></div><div><span>CEMENTERIO</span><strong>{game.rival.graveyard_count}</strong></div></div>
        </aside>
        <section className="arena">
          <div className="arena-header"><span>CAMPO DE BATALLA</span><span className="phase-label">{statusMessage}</span></div>
          <div className="field-row"><div className="field-slot">{fieldCard(game.fields.rival, 'rival')}</div><div className="versus">VS</div><div className="field-slot">{fieldCard(game.fields.player, 'player')}</div></div>
          <div className="action-row">
            {game.phase === 'ready' && <button className="primary-action" onClick={() => perform('reveal')} disabled={busy} type="button">Revelar cartas <span>→</span></button>}
            {game.phase === 'revealed' && <button className="primary-action" onClick={() => perform('resolve')} disabled={busy} type="button">Resolver ronda <span>→</span></button>}
            {game.phase === 'finished' && <button className="primary-action" onClick={startGame} disabled={busy} type="button">Nueva partida <span>↻</span></button>}
          </div>
        </section>
        <aside className="player-panel user-panel">
          <div className="player-heading"><div className="avatar user-avatar">TÚ</div><div><span>JUGADOR</span><h2>Duelo Uno</h2></div></div>
          <Life value={game.player.life} label="VIDA" />
          <div className="zone-summary"><div><span>MAZO</span><strong>{game.player.deck_count}</strong></div><div><span>CEMENTERIO</span><strong>{game.player.graveyard?.length || 0}</strong></div></div>
        </aside>
      </section>
      <section className="hand-section">
        <div className="hand-header"><div><span className="eyebrow">TU MANO</span><h2>Selecciona una carta</h2></div><span className="hand-count">{game.player.hand.length} CARTAS</span></div>
        <div className="hand">{game.player.hand.map((card) => <Card key={card.id} card={card} onClick={() => perform('choice', { card_id: card.id })} disabled={busy || game.phase !== 'selecting'} />)}</div>
        {game.phase === 'finished' && <div className="winner-banner">{game.winner === 'player' ? 'VICTORIA' : 'DERROTA'} <span>{game.winner === 'player' ? 'El campo es tuyo.' : 'Entrena y vuelve a intentarlo.'}</span></div>}
      </section>
    </main>
  )
}
