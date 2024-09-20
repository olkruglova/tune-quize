import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/get-token", async (req, res) => {
  const client_id = "65c5ab46f30248c5b2a6f8e3a55ceede";
  const client_secret = "a15977f721834c73a3b30875759b5794"; // Keep this server-side

  const tokenUrl = "https://accounts.spotify.com/api/token";
  const authString = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authString}`
      },
      body: new URLSearchParams({
        grant_type: "client_credentials"
      })
    });

    if (response.ok) {
      const data = await response.json();
      res.json({ access_token: data.access_token });
    } else {
      res.status(response.status).json({ error: "Failed to fetch token from Spotify" });
    }
  } catch (error) {
    console.error("Error fetching token from Spotify:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
