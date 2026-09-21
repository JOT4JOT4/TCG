def test_create_domain_resources(client) -> None:
    player = client.post(
        "/api/players",
        json={"username": "duelist", "email": "duelist@example.com"},
    )
    assert player.status_code == 201
    opponent = client.post(
        "/api/players",
        json={"username": "opponent", "email": "opponent@example.com"},
    )
    assert opponent.status_code == 201

    card = client.post(
        "/api/cards",
        json={
            "name": "Solar Knight",
            "card_type": "logia",
            "description": "A basic creature.",
            "power": 3,
        },
    )
    assert card.status_code == 201

    deck = client.post(
        "/api/decks",
        json={"name": "Starter Deck", "owner_id": player.json()["id"]},
    )
    assert deck.status_code == 201
    opponent_deck = client.post(
        "/api/decks",
        json={"name": "Opponent Deck", "owner_id": opponent.json()["id"]},
    )
    assert opponent_deck.status_code == 201

    deck_card = client.post(
        f"/api/decks/{deck.json()['id']}/cards",
        json={"card_id": card.json()["id"], "quantity": 2},
    )
    assert deck_card.status_code == 201
    assert deck_card.json()["quantity"] == 2

    match = client.post(
        "/api/matches",
        json={
            "player_ids": [player.json()["id"], opponent.json()["id"]],
            "deck_ids": [deck.json()["id"], opponent_deck.json()["id"]],
        },
    )
    assert match.status_code == 201
    assert match.json()["status"] == "waiting"

    round_result = client.post(
        f"/api/matches/{match.json()['id']}/rounds",
        json={
            "player_one_id": player.json()["id"],
            "player_one_card_id": card.json()["id"],
            "player_two_id": opponent.json()["id"],
            "player_two_card_id": card.json()["id"],
        },
    )
    assert round_result.status_code == 201
    assert round_result.json()["result"] == "draw"


def test_rejects_deck_for_unknown_player(client) -> None:
    response = client.post("/api/decks", json={"name": "Invalid", "owner_id": 999})
    assert response.status_code == 404