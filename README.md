# lastplaying
<h3>A node.js backend app for the widget on my personal page</h3>
<br>

<p>On request this app fetches the most recently played (or currently playing) track from one's last.fm account using last.fm API, then it forms a json response with the help of Spotify API</p>
<p>The request should be forwarded by a reverse proxy to <tt>http://localhost:PORT/api/recent-track</tt></p>
<p>docker compose:</p>

```
services:
  node:
    build:
      context: ./node
      args:
        PORT: $PORT
    container_name: node
    restart: unless-stopped
    env_file: ./node/.env
```

<p>If the track is currently playing and it is found in the Spotify catalog, the resulting json should look something like this</p>

```
{
    "track": "Homeworld",
    "trackLink": "https://www.last.fm/music/Chime/_/Homeworld",
    "artist": "Chime",
    "artistLink": "https://www.last.fm/music/Chime",
    "albumCover": "https://i.scdn.co/image/ab67616d00001e02ab5f74e011c662e4ce2cc799",
    "date": null,
    "spotifyLink": "https://open.spotify.com/track/1unMXVPDvXe2jYLOK5A1Wy"
}
```

<p>or like this, if one is not currently scrobbling anything and the last scrobbled track is not on Spotify</p>

```
{
    "track": "Behind The Walls",
    "trackLink": "https://www.last.fm/music/cYsmix/_/Behind+The+Walls",
    "artist": "cYsmix",
    "artistLink": "https://www.last.fm/music/cYsmix",
    "albumCover": "https://lastfm.freetls.fastly.net/i/u/174s/40fd7d9e84115722d596ae87278883af.png",
    "date": "1734559159",
    "spotifyLink": null
}
```
