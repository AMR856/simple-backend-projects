const redis = require("redis");

const connect = async () => {
    const client = redis.createClient();
    client.on("error", (err) => console.error("Redis Client Error", err));

    await client.connect();
    
    console.log('Redis client connected sucessfully');

    return client;
}

const closeConnection = async (client) => {
    console.log(client);
    await client.quit();
    console.log("Redis connection closed");
}

module.exports = {
    connect,
    closeConnection
};