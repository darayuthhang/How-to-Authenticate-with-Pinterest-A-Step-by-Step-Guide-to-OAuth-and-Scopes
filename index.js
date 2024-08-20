const express = require("express");
const app = express();
const axios = require("axios");
const qs = require("querystring");

const clientId = ""; //app id 
const redirectUri = "http://localhost:3000/"; // URL-encoded
const scope = encodeURIComponent("boards:read,pins:read"); // URL-encoded
const state = encodeURIComponent("YOUR_OPTIONAL_STATE"); // URL-encoded
const clientSecret = ""; //client secret id 

app.get("/auth/pinterest", (req, res) => {
  const pinterestOAuthUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
  return res.redirect(pinterestOAuthUrl);
});

// Handle the callback from Pinterest
app.get("/", async (req, res) => {
  const { code } = req.query;
  console.log(code);

  if (!code) {
    return res.status(400).send("redirect from auth");
  }

  try {
    const base64Credentials = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");
    // Data to be sent in the request body
    const data = qs.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    });
    const response = await axios.post(
      "https://api.pinterest.com/v5/oauth/token",
      data,
      {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;
    console.log("Access Token:", accessToken);

    // You can now use the access token to make API requests
    res.send("Authorization successful! Access token obtained.");
  } catch (error) {
    console.error(
      "Error exchanging code for access token:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error exchanging code for access token.");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
