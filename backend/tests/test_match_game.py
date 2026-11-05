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

    chosen_card_id = state["player"]["hand"][0]["id"]
    choice = client.post(
        f"/api/combat/games/{state['game_id']}/choice",
        json={"card_id": chosen_card_id},
    )
    assert choice.status_code == 200
    chosen_state = choice.json()
    assert chosen_state["phase"] == "ready"
    assert chosen_state["fields"]["player"] is None
    assert len(chosen_state["player"]["hand"]) == 4
    assert chosen_card_id not in [card["id"] for card in chosen_state["player"]["hand"]]

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


def test_combat_recycles_graveyard_only_after_hand_is_empty(client) -> None:
    player = client.post(
        "/api/players",
        json={"username": "recycle-player", "email": "recycle-player@example.com"},
    ).json()
    rival = client.post(
        "/api/players",
        json={"username": "recycle-rival", "email": "recycle-rival@example.com"},
    ).json()
    cards = []
    for index in range(5):
        cards.append(
            client.post(
                "/api/cards",
                json={
                    "name": f"Recycle card {index}",
                    "card_type": "logia",
                    "power": 5,
                },
            ).json()
        )

    decks = []
    for owner in (player, rival):
        deck = client.post(
            "/api/decks",
            json={"name": f"Recycle deck {owner['id']}", "owner_id": owner["id"]},
        ).json()
        decks.append(deck)
        for card in cards:
            client.post(
                f"/api/decks/{deck['id']}/cards",
                json={"card_id": card["id"], "quantity": 1},
            )

    game = client.post(
        "/api/combat/games",
        json={"player_id": player["id"], "deck_id": decks[0]["id"]},
    ).json()

    for _ in range(5):
        state = game
        card_id = state["player"]["hand"][0]["id"]
        client.post(
            f"/api/combat/games/{state['game_id']}/choice",
            json={"card_id": card_id},
        )
        client.post(f"/api/combat/games/{state['game_id']}/reveal")
        game = client.post(f"/api/combat/games/{state['game_id']}/resolve").json()

    assert len(game["player"]["hand"]) == 1
    assert game["player"]["deck_count"] == 4
    assert game["player"]["graveyard"] == []
