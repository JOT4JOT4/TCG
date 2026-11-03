
import { useEffect, useState } from 'react'
import DeckEditor from './DeckEditor.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function PlayerProfile({ onBack }) {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deckName, setDeckName] = useState('')
  const [decks, setDecks] = useState([])
  const [savingDeck, setSavingDeck] = useState(false)
  const [deckError, setDeckError] = useState('')
  const [selectedDeck, setSelectedDeck] = useState(null)

  useEffect(() => {
    async function loadPlayer() {
      try {
        const response = await fetch(`${API_URL}/api/players`)

        if (!response.ok) {
          throw new Error('No se pudo consultar los jugadores')
        }

        const players = await response.json()

        if (players.length === 0) {
          setError('No hay jugadores registrados')
          return
        }

        // Seleccionamos el usuario de prueba con ID 1
        const selectedPlayer = players.find(p => p.id === 1)

        if (!selectedPlayer) {
          throw new Error('No se encontró el jugador con ID 1')
        }

        setPlayer(selectedPlayer)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPlayer()
  }, [])

  useEffect(() => {
    if (!player) return

    async function loadDecks() {
      try {

        setDeckError('')

        const response = await fetch(`${API_URL}/api/decks`)

        if (!response.ok) {
          throw new Error('No se pudieron cargar los mazos')
        }

        const allDecks = await response.json()

        const playerDecks = allDecks.filter(
          deck => deck.owner_id === player.id
        )

        setDecks(playerDecks)
      } catch (err) {
        setDeckError(err.message)
      }
    }
    loadDecks()
  }, [player])

  async function createDeck(event) {
    event.preventDefault()

    if (!player || !deckName.trim() || savingDeck) return

    setSavingDeck(true)
    setDeckError('')

    try {
      const response = await fetch(`${API_URL}/api/decks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: deckName.trim(),
          owner_id: player.id
        })
      })

      if (!response.ok) {
        throw new Error('No se pudo crear el mazo')
      }

      const newDeck = await response.json()

      setDecks(previous => [...previous, newDeck])
      setDeckName('')

    } catch (err) {
      setDeckError(err.message)
    } finally {
      setSavingDeck(false)
    }
  }

  return (
    <main className="player-profile">
      <header className="profile-header">
        <h1>ONE PIECE - MI PERFIL</h1>

        <button onClick={onBack} type="button">
          ← Volver al menú
        </button>
      </header>

      <section className="profile-content">
        <h2>Mi perfil</h2>

        {loading && <p>Cargando jugador...</p>}

        {error && <p role="alert">{error}</p>}

        {player && (
          <>
            <div className="profile-info">
              <div className="profile-avatar">
                {player.username.charAt(0).toUpperCase()}
              </div>

              <div>
                <span>JUGADOR #{player.id}</span>
                <h3>{player.username}</h3>
                <p>{player.email}</p>
              </div>
            </div>
            
            <div className="profile-decks">
              <h2>Mis mazos</h2>

              <form onSubmit={createDeck} className="deck-form">
                <input
                  type="text"
                  placeholder="Nombre del nuevo mazo"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  maxLength={100}
                  required
                />

                <button
                  type="submit"
                  disabled={savingDeck || !deckName.trim()}
                >
                  {savingDeck ? 'Guardando...' : 'Crear mazo'}
                </button>
              </form>

              {deckError && <p role="alert">{deckError}</p>}
  
              <div className="deck-list">
                {decks.map(deck => (
                  <button
                    key={deck.id}
                    type="button"
                    className={`deck-item ${
                      selectedDeck?.id === deck.id ? 'deck-selected' : ''
                    }`}
                    onClick={() => setSelectedDeck(deck)}
                  >
                    <strong>{deck.name}</strong>
                    <span>Mazo #{deck.id} →</span>
                  </button>
                ))}
              </div>
              
              {selectedDeck && (
                <div className="deck-details">
                  <DeckEditor
                    key={selectedDeck.id}
                    deck={selectedDeck}
                  />

                  <button
                    type="button"
                    onClick={() => setSelectedDeck(null)}
                  >
                    Cerrar mazo
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
