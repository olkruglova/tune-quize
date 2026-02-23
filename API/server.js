import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import cors from 'cors';
import querystring from 'querystring';
import crypto from 'crypto';
import session from 'express-session';

const app = express();
const PORT = 3007;

const CLIENT_ID = '65c5ab46f30248c5b2a6f8e3a55ceede';
const CLIENT_SECRET = 'a15977f721834c73a3b30875759b5794';
const REDIRECT_URI = 'http://127.0.0.1:3007/callback';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

const generateRandomString = (length) => {
    return crypto.randomBytes(length).toString('hex');
};

const POPULAR_QUERIES = [
    'year:2024 genre:pop',
    'year:2024 genre:hip-hop',
    'year:2023 genre:pop',
    'year:2024 genre:r-n-b',
    'year:2023 genre:hip-hop',
    'year:2024 genre:latin',
];

const RANDOM_CHARS = 'abcdefghijklmnopqrstuvwxyz';

async function enrichWithDeezerPreviews(tracks) {
    const enriched = await Promise.all(
        tracks.map(async (track) => {
            try {
                const artist = track.artists[0]?.name || '';
                const query = encodeURIComponent(`artist:"${artist}" track:"${track.name}"`);
                const deezerRes = await fetch(`https://api.deezer.com/search?q=${query}&limit=1`);
                const deezerData = await deezerRes.json();
                const preview = deezerData.data?.[0]?.preview || null;
                return { ...track, preview_url: preview };
            } catch {
                return track;
            }
        }),
    );
    return enriched.filter((t) => t.preview_url);
}

app.use(bodyParser.json());
app.use(
    cors({
        origin: 'http://localhost:4200',
        methods: 'GET,POST',
        allowedHeaders: 'Authorization,Content-Type',
    }),
    session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    }),
);

const scope =
    'user-read-private user-read-email user-read-recently-played user-top-read user-follow-read user-follow-modify playlist-read-private playlist-read-collaborative playlist-modify-public';

app.get('/login', (req, res) => {
    const state = generateRandomString(16);

    // Redirect the user to Spotify for authorization
    const queryParams = querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
        state: state,
    });
    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).send('Authorization code missing');
    }
    console.log('Exchanging code with Spotify...');

    const authOptions = {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
        }),
    };

    try {
        const tokenResponse = await fetch(TOKEN_URL, authOptions);
        console.log('Spotify response status:', tokenResponse.status);
        const tokenData = await tokenResponse.json();
        console.log('Spotify token data:', tokenData);

        if (tokenResponse.ok) {
            const accessToken = tokenData.access_token;
            const refreshToken = tokenData.refresh_token;

            const params = new URLSearchParams({ access_token: accessToken });
            if (refreshToken) params.set('refresh_token', refreshToken);

            res.redirect(`http://localhost:4200/quiz#${params.toString()}`);
        } else {
            console.log('Returning error status:', tokenResponse.status);
            res.status(tokenResponse.status).json({ error: 'Failed to get access token from Spotify' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/refresh_token', async (req, res) => {
    const refreshToken = req.query.refresh_token;

    if (!refreshToken) {
        return res.status(400).send('Refresh token missing');
    }

    // Request a new access token using the refresh token
    const authOptions = {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    };

    try {
        const tokenResponse = await fetch(TOKEN_URL, authOptions);
        const tokenData = await tokenResponse.json();

        if (tokenResponse.ok) {
            const newAccessToken = tokenData.access_token;
            res.json({ accessToken: newAccessToken });
        } else {
            res.status(tokenResponse.status).json({ error: 'Failed to refresh access token' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/profile', async (req, res) => {
    const access_token = req.headers.authorization?.split(' ')[1] || req.session.accessToken;

    if (!access_token) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const headers = {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
    };

    try {
        const profileResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: headers,
        });

        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            res.json(profileData);
        } else {
            res.status(profileResponse.status).json({ error: 'Failed to fetch user profile from Spotify' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/top-tracks', async (req, res) => {
    const access_token = req.headers.authorization?.split(' ')[1] || req.session.accessToken;

    if (!access_token) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const headers = {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
    };

    try {
        const timeRange = req.query.time_range || 'short_term';
        const topTracksResponse = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`, {
            headers: headers,
        });

        if (topTracksResponse.ok) {
            const topTracksData = await topTracksResponse.json();
            const enriched = await enrichWithDeezerPreviews(topTracksData.items);
            res.json({ items: enriched });
        } else {
            res.status(topTracksResponse.status).json({ error: 'Failed to fetch user top tracks from Spotify' });
        }
    } catch (error) {
        console.error('Error fetching user top tracks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/tracks/popular', async (req, res) => {
    const access_token = req.headers.authorization?.split(' ')[1];
    if (!access_token) return res.status(401).json({ error: 'User not authenticated' });

    const batch = parseInt(req.query.batch) || 0;
    const query = encodeURIComponent(POPULAR_QUERIES[batch % POPULAR_QUERIES.length]);
    const offset = Math.floor(Math.random() * 100);
    const headers = { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' };

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${query}&type=track&limit=50&offset=${offset}&market=from_token`,
            { headers },
        );
        if (!response.ok) return res.status(response.status).json({ error: 'Failed to fetch popular tracks' });

        const data = await response.json();
        const enriched = await enrichWithDeezerPreviews(data.tracks.items);
        res.json({ items: enriched });
    } catch (error) {
        console.error('Error fetching popular tracks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/tracks/random', async (req, res) => {
    const access_token = req.headers.authorization?.split(' ')[1];
    if (!access_token) return res.status(401).json({ error: 'User not authenticated' });

    const batch = parseInt(req.query.batch) || 0;
    const char = RANDOM_CHARS[batch % RANDOM_CHARS.length];
    const offset = Math.floor(Math.random() * 500);
    const headers = { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' };

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${char}&type=track&limit=50&offset=${offset}`,
            { headers },
        );
        if (!response.ok) return res.status(response.status).json({ error: 'Failed to fetch random tracks' });

        const data = await response.json();
        const enriched = await enrichWithDeezerPreviews(data.tracks.items);
        res.json({ items: enriched });
    } catch (error) {
        console.error('Error fetching random tracks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// app.get('/api/tracks/:id', async (req, res) => {
//     const access_token = req.headers.authorization?.split(' ')[1] || req.session.accessToken;

//     if (!access_token) {
//         return res.status(401).json({ error: 'User not authenticated' });
//     }

//     const headers = {
//         Authorization: `Bearer ${access_token}`,
//         'Content-Type': 'application/json',
//     };

//     try {
//         const trackId = req.params.id;
//         const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
//             headers: headers,
//         });

//         if (trackResponse.ok) {
//             const trackData = await trackResponse.json();
//             res.json(trackData);
//         } else {
//             res.status(trackResponse.status).json({ error: 'Failed to fetch track from Spotify' });
//         }
//     } catch (error) {
//         console.error('Error fetching track:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
