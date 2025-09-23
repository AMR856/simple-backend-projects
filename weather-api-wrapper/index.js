require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;
const weatherLimiter = require('./middlewares/rate-limiter');
const redisUtils = require("./utils/redis-utils");
let redisClient;
(async () => {redisClient = await redisUtils.connect()})();
app.use(weatherLimiter);

app.get("/get-weather/:city", async (req, res) => {
  try {
    const { city } = req.params;
    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    const cacheData = await redisClient.get(`${city}:data`);

    if (cacheData) {
      return res.json({
        message: `Weather fetched successfully for ${city} (from cache)`,
        data: JSON.parse(cacheData),
      });
    }

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
      city
    )}?unitGroup=us&key=${process.env.API_KEY}&contentType=json`;

    const response = await axios.get(url);
    await redisClient.setEx(
      `${city}:data`,
      3600,
      JSON.stringify(response.data)
    );

    res.json({
      message: `Weather fetched successfully for ${city} (from API)`,
      data: response.data,
    });

  } catch (err) {
    console.error("Error fetching the weather:", err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        err: err.response.data || "Weather API error",
      });
    }

    res.status(500).json({ err: "Internal server error" });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


const shutdown = async () => {
    console.log("\nShutting down gracefully...");
    await redisUtils.closeConnection(redisClient);
    try {
      server.close(() => {
        console.log("Express server closed");
        process.exit(0);
      });
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
