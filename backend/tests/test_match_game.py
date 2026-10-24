def test_combat_game_is_resolved_by_backend(client) -> None:
    game = client.post("/api/combat/games")
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
