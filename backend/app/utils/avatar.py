def default_avatar(seed: str | None = None) -> str:
    import urllib.parse
    s = seed or "user"
    return f"https://api.dicebear.com/6.x/adventurer/svg?seed={urllib.parse.quote_plus(s)}&backgroundType=gradientLinear&radius=50"
