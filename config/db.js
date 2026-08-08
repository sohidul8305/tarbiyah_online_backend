// backend/config/db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

// MongoDB Atlas Connection URI
const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.hz6ypdj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log("📡 Connecting with user:", process.env.BD_USER);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
});

let db = null;
let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected && db) {
      console.log("✅ Already connected to MongoDB");
      return db;
    }

    console.log("🔄 Connecting to MongoDB Atlas...");

    await client.connect();
    console.log("✅ MongoDB Client Connected");

    // Database Name
    const databaseName = "tarbiyah_online_madrasha";
    db = client.db(databaseName);

    // Ping to verify connection
    await db.command({ ping: 1 });
    console.log("✅ MongoDB Ping Successful");

    isConnected = true;

    console.log("✅ MongoDB Connected Successfully!");
    console.log(`📦 Database: ${databaseName}`);
    console.log(`📍 Host: MongoDB Atlas (Cluster0)`);

    return db;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("\n💡 Troubleshooting Tips:");
    console.error("1. Check MongoDB Atlas Network Access - Add IP 0.0.0.0/0");
    console.error("2. Verify username/password in .env file");
    console.error("3. Check if cluster is active in MongoDB Atlas");
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("❌ Database not initialized. Call connectDB() first.");
  }
  return db;
};

const closeDB = async () => {
  try {
    if (client) {
      await client.close();
      db = null;
      isConnected = false;
      console.log("✅ MongoDB connection closed");
    }
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error);
  }
};

const getCollection = (collectionName) => {
  const database = getDB();
  return database.collection(collectionName);
};

module.exports = {
  connectDB,
  getDB,
  closeDB,
  getCollection,
  client,
};
