exports.handler = async (event, context) => {
  const authHeader = event.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "User not authenticated" })
    };
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      };
    } else {
      return {
        statusCode: profileResponse.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to fetch user profile from Spotify" })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
