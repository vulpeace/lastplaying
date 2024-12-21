import express from 'express';
import 'dotenv/config.js';
const app = express();

async function fetchSpotifyToken() {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_ID + ':' + process.env.SPOTIFY_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams({
            grant_type: 'client_credentials'
        }),
    };

    try {
        const response = await fetch(authOptions.url, {
            method: 'POST',
            headers: authOptions.headers,
            body: authOptions.data
        });

        if (response.ok) {
            const responseData = await response.json();
            const token = responseData.access_token;
            return token;
        } else {
            console.error('Error fetching token:', response.status, await response.text());
        }
    } catch (error) {
        console.error('Error fetching token:', err);
        throw error;
    }
}

async function main() {
    var token = null;
    var timestamp = Date.now();

    app.get('/api/recent-track', async(req, res) => {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json&extended=true&api_key=${process.env.LASTFM_API_KEY}&limit=1&user=${process.env.LASTFM_USERNAME}`;

        try {
            const lastfmResponse = await fetch(url);
            const lastfmData = await lastfmResponse.json();

            const lastTrack = lastfmData.recenttracks.track[0];

            if (!token || Date.now() - timestamp > 3600000) {
                timestamp = Date.now();
                token = await fetchSpotifyToken();
            }

            var query = encodeURIComponent(`track:${lastTrack.name} artist:${lastTrack.artist.name}`);
            query = encodeURIComponent(query);
            const spotifyResponse = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&market=US&locale=en-US&limit=10`, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });

            const spotifyData = await spotifyResponse.json();
            var spotifyImage = null;
            var spotifyExtUrl = null;
            if (Object.keys(spotifyData.tracks.items).length) {
                for (let i = 0; i < Object.keys(spotifyData.tracks.items).length; i++) {
                    if ((spotifyData.tracks.items[i].name.localeCompare(lastTrack.name, undefined, { sensitivity: 'accent' }) === 0)
                        && (spotifyData.tracks.items[i].artists.find(x => x.name.localeCompare(lastTrack.artist.name, undefined,
                        { sensitivity: 'accent' }) === 0))) {
                        spotifyImage = spotifyData.tracks.items[i].album.images?.find(x => x.height === 300)?.url;
                        spotifyExtUrl = spotifyData.tracks.items[i].external_urls.spotify;
                        break;
                    }
                }
            }

            res.json({
                track: lastTrack.name,
                trackLink: lastTrack.url,
                artist: lastTrack.artist.name,
                artistLink: lastTrack.artist.url,
                albumCover: spotifyImage ? spotifyImage : lastTrack.image?.find(x => x.size === "large")?.["#text"],
                date: lastTrack.date ? lastTrack.date.uts : null,
                spotifyLink: spotifyExtUrl
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Failed to fetch recent track."
            });
        }
    });

    app.listen(process.env.PORT, () => {
        console.log(`Backend running on http://localhost:${process.env.PORT}`);
    });
}

main();
