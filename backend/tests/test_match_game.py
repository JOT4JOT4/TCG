def test_combat_game_is_resolved_by_backend(client) -> None:
    player = client.post(
        "/api/players",
        json={"username": "player-one", "email": "player-one@example.com"},
    ).json()
    rival = client.post(
        "/api/players",
        json={"username": "player-two", "email": "player-two@example.com"},
    ).json()
    cards = []
    for index in range(5):
        cards.append(
            client.post(
                "/api/cards",
                json={
                    "name": f"Combat card {index}",
                    "card_type": ["logia", "paramecia", "zoan"][index % 3],
                    "power": index + 1,
                },
            ).json()
        )

    decks = []
    for owner in (player, rival):
        deck = client.post(
            "/api/decks",
            json={"name": f"Deck {owner['id']}", "owner_id": owner["id"]},
        ).json()
        decks.append(deck)
        for card in cards:
            response = client.post(
                f"/api/decks/{deck['id']}/cards",
                json={"card_id": card["id"], "quantity": 1},
            )
            assert response.status_code == 201

    game = client.post(
        "/api/combat/games",
        json={"player_id": player["id"], "deck_id": decks[0]["id"]},
    )
    assert game.status_code == 201
    state = game.json()
    assert state["phase"] == "selecting"
    assert len(state["player"]["hand"]) == 5

    choice = client.post(
        f"/api/combat/games/{state['game_id']}/choice",
        json={"card_id": state["player"]["hand"][0]["id"]},
    )
    assert choice.status_code == 200
    assert choice.json()["phase"] == "ready"
    assert choice.json()["fields"]["player"] is None

    reveal = client.post(f"/api/combat/games/{state['game_id']}/reveal")
    assert reveal.status_code == 200
    revealed_state = reveal.json()
    assert revealed_state["phase"] == "revealed"
    assert revealed_state["result"] in {"player_one", "player_two", "draw"}
    assert revealed_state["fields"]["player"] is not None
    assert revealed_state["fields"]["rival"] is not None

    resolved = client.post(f"/api/combat/games/{state['game_id']}/resolve")
    assert resolved.status_code == 200
    assert resolved.json()["player"]["graveyard"]
