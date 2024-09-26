import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";
import querystring from "querystring";
import crypto from "crypto";
import session from 'express-session';

const app = express();
const PORT = 3000;

const CLIENT_ID = "65c5ab46f30248c5b2a6f8e3a55ceede";
const CLIENT_SECRET = "a15977f721834c73a3b30875759b5794";
const REDIRECT_URI = 'http://localhost:3000/callback';
const TOKEN_URL = "https://accounts.spotify.com/api/token";

const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString('hex');
};

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:4200',
    methods: 'GET,POST',
    allowedHeaders: 'Authorization,Content-Type'
  }),
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const scope =
      'user-read-private user-read-email user-read-recently-played user-top-read user-follow-read user-follow-modify playlist-read-private playlist-read-collaborative playlist-modify-public';

app.get("/login", (req, res) => {
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

app.get("/callback", async (req, res) => {
    const code = req.query.code || null;
  
    if (!code) {
      return res.status(400).send('Authorization code missing');
    }
  
    const authOptions = {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
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
      const tokenData = await tokenResponse.json();
  
      if (tokenResponse.ok) {
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;

        req.session.accessToken = accessToken;
  
        res.redirect(`http://localhost:4200/quiz`);
      } else {
        res.status(tokenResponse.status).json({ error: 'Failed to get access token from Spotify' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/refresh_token", async (req, res) => {
    const refreshToken = req.query.refresh_token;

    if (!refreshToken) {
        return res.status(400).send('Refresh token missing');
    }

    // Request a new access token using the refresh token
    const authOptions = {
        method: 'POST',
        headers: {
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
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
    const access_token = req.session.accessToken;
  
    if (!access_token) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
  
    const headers = {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    };
  
    try {
      const profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: headers
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
    const access_token = req.session.accessToken;
  
    if (!access_token) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
  
    const headers = {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    };
  
    try {
      const profileResponse = await fetch('https://api.spotify.com/v1/me/top/tracks', {
        headers: headers
      });
  
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        res.json(profileData);
      } else {
        res.status(profileResponse.status).json({ error: 'Failed to fetch user top tracks from Spotify' });
      }
    } catch (error) {
      console.error('Error fetching user top tracks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
