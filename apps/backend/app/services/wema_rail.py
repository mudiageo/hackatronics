import secrets

def collect(amount: int, org_id: int, reference_hint: str = "") -> str:
    """Mock settlement. Swap for ALATPay — signature stays identical."""
    return f"WMA-{secrets.token_hex(4).upper()}"
