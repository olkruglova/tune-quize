const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;
const TOKEN_URL = "https://accounts.spotify.com/api/token";

exports.handler = async (event, context) => {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Authorization code missing" })
    };
  }

  const authOptions = {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code"
    })
  };

  try {
    const tokenResponse = await fetch(TOKEN_URL, authOptions);
    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok) {
      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;

      // Redirect to frontend with tokens in URL hash (not exposed to server logs)
      return {
        statusCode: 302,
        headers: {
          Location: `${FRONTEND_URL}/quiz#access_token=${accessToken}&refresh_token=${refreshToken}`
        }
      };
    } else {
      return {
        statusCode: tokenResponse.status,
        body: JSON.stringify({ error: "Failed to get access token from Spotify" })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
