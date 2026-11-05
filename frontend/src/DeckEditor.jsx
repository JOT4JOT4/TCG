import { useEffect, useState } from 'react'
import soundManager from './soundManager'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'logia', label: 'Logia' },
  { value: 'zoan', label: 'Zoan' },
  { value: 'paramecia', label: 'Paramecia' }
]

export default function DeckEditor({ deck }) {
  const [cards, setCards] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deckCards, setDeckCards] = useState([])
  const [loadingDeck, setLoadingDeck] = useState(true)
  const [deckError, setDeckError] = useState('')
  const [savingCard, setSavingCard] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    async function loadCards() {
      try {
        const response = await fetch(`${API_URL}/api/cards`)

        if (!response.ok) {
          throw new Error('No se pudieron cargar las cartas')
        }

        const data = await response.json()
        setCards(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [])

  useEffect(() => {
    let active = true

    async function loadDeckCards() {
      setLoadingDeck(true)
      setDeckError('')
      setDeckCards([])

      try {
        const response = await fetch(
          `${API_URL}/api/decks/${deck.id}/cards`
        )

        if (!response.ok) {
          throw new Error(
            'No se pudieron cargar las cartas del mazo'
          )
        }

        const data = await response.json()

        if (active) {
          setDeckCards(data)
        }
      } catch (err) {
        if (active) {
          setDeckError(err.message)
        }
      } finally {
        if (active) {
          setLoadingDeck(false)
        }
      }
    }

    loadDeckCards()

    return () => {
      active = false
    }
  }, [deck.id])

  const cardsInDeck = deckCards.map(item => {
    const cardInfo = cards.find(
      card => card.id === item.card_id
    )

    return {
      ...item,
      card: cardInfo
    }
  })

  const totalDeckCards = deckCards.reduce(
    (total, item) => total + item.quantity,
    0
  )


  async function addCard(card) {
    if (savingCard || loadingDeck || deckError) return

    const existingCard = deckCards.find(
      item => item.card_id === card.id
    )

    const currentQuantity = existingCard?.quantity ?? 0


    setSavingCard(true)
    setSaveError('')

    try {
      const response = await fetch(
        `${API_URL}/api/decks/${deck.id}/cards`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            card_id: card.id,
            quantity: currentQuantity + 1
          })
        }
      )

      if (!response.ok) {
        throw new Error('No se pudo agregar la carta')
      }

      const savedCard = await response.json()
      soundManager.playCardPlace()

      setDeckCards(previous => {
        const exists = previous.some(
          item => item.card_id === card.id
        )

        if (exists) {
          return previous.map(item =>
            item.card_id === card.id ? savedCard : item
          )
        }

        return [...previous, savedCard]
      })

    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSavingCard(false)
    }
  }


  async function removeCard(cardId) {
    if (savingCard || loadingDeck || deckError) return

    const existingCard = deckCards.find(
      item => item.card_id === cardId
    )

    if (!existingCard) return

    setSavingCard(true)
    setSaveError('')

    try {
      let response



      if (existingCard.quantity > 1) {
        response = await fetch(
          `${API_URL}/api/decks/${deck.id}/cards`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              card_id: cardId,
              quantity: existingCard.quantity - 1
            })
          }
        )
      } else {
        response = await fetch(
          `${API_URL}/api/decks/${deck.id}/cards/${cardId}`,
          {
            method: 'DELETE'
          }
        )
      }

      if (!response.ok) {
        throw new Error('No se pudo quitar la carta')
      }

      soundManager.playCardRemove()



      if (existingCard.quantity > 1) {
        const updatedCard = await response.json()

        setDeckCards(previous =>
          previous.map(item =>
            item.card_id === cardId ? updatedCard : item
          )
        )
      } else {
        setDeckCards(previous =>
          previous.filter(item => item.card_id !== cardId)
        )
      }

    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSavingCard(false)
    }
  }

  const filteredCards = cards.filter(card => {
    const matchesType =
      filter === 'all' ||
      card.card_type?.toLowerCase() === filter

    const matchesSearch = card.name
      .toLowerCase()
      .includes(search.toLowerCase().trim())

    return matchesType && matchesSearch
  })

  return (
    <div className="deck-editor">
      <h2>Editar: {deck.name}</h2>


      <div className="deck-editor-current">
        <h3>Cartas de mi mazo</h3>

        <p>{totalDeckCards} / 12 cartas</p>

        <progress
          value={totalDeckCards}
          max={12}
          style={{ width: '100%' }}
        />

        {loadingDeck && <p>Cargando mazo...</p>}

        {deckError && (
          <p role="alert">{deckError}</p>
        )}

        {!loadingDeck && !deckError && deckCards.length === 0 && (
          <p>
            Este mazo todavía no tiene cartas.
            Selecciona cartas del catálogo inferior
            para comenzar a construirlo.
          </p>
        )}

        {!loadingDeck && !deckError && deckCards.length > 0 && (
          <div className="deck-editor-grid">
            {cardsInDeck.map(item => (
              <div className="deck-editor-card" key={item.card_id}>
                {item.card?.image_url ? (
                  <img
                    src={item.card.image_url}
                    alt={item.card.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="deck-editor-no-image">
                    Sin imagen
                  </div>
                )}
                <div className="deck-editor-card-info">
                  <strong>
                    {item.card?.name || `Carta #${item.card_id}`}
                  </strong>

                  <span>
                    {item.card?.card_type || 'Tipo desconocido'}
                    {item.card && ` · Poder ${item.card.power}`}
                  </span>

                  <span>Copias: {item.quantity}</span>

                  <button
                    type="button"
                    className="deck-remove-button"
                    onClick={() => removeCard(item.card_id)}
                    disabled={savingCard || loadingDeck || !!deckError}
                  >
                    - Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {saveError && (
        <p role="alert" className="deck-save-error">
          {saveError}
        </p>
      )}

      <h3>Catálogo de cartas</h3>

      <div className="deck-editor-filters">
        {FILTERS.map(option => (
          <button
            key={option.value}
            type="button"
            className={filter === option.value ? 'active' : ''}
            onClick={() => { soundManager.playCardTake(); setFilter(option.value); }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <input
        className="deck-editor-search"
        type="text"
        placeholder="Buscar personaje..."
        value={search}
        onChange={event => setSearch(event.target.value)}
      />

      {loading && <p>Cargando cartas...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <p>
            Mostrando {filteredCards.length} de {cards.length} cartas
          </p>

          <div className="deck-editor-grid">
            {filteredCards.map(card => (
              <div className="deck-editor-card" key={card.id}>
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="deck-editor-no-image">
                    Sin imagen
                  </div>
                )}

                <div className="deck-editor-card-info">
                  <strong>{card.name}</strong>

                  <span>
                    {card.card_type} · Poder {card.power}
                  </span>

                  <button
                    type="button"
                    className="deck-add-button"
                    onClick={() => addCard(card)}
                    disabled={
                      savingCard ||
                      loadingDeck ||
                      !!deckError
                    }
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
