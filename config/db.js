// backend/config/db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

// ✅ MongoDB Atlas Connection URI
const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.hz6ypdj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log("========================================");
console.log("📡 MongoDB Connection Config:");
console.log(`👤 Username: ${process.env.BD_USER}`);
console.log(`🔗 URI: ${uri.replace(/\/\/[^@]+@/, "//****:****@")}`);
console.log("========================================");

// ✅ MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
});

let db = null;
let isConnected = false;

// ✅ Connect to MongoDB
const connectDB = async () => {
  try {
    // If already connected, return existing connection
    if (isConnected && db) {
      console.log("✅ Already connected to MongoDB");
      return db;
    }

    console.log("🔄 Connecting to MongoDB Atlas...");
    console.log("⏳ Please wait, this may take a few seconds...");

    // Connect to MongoDB
    await client.connect();
    console.log("✅ MongoDB Client Connected");

    // Get database
    const databaseName = "tarbiyah_online_madrasha";
    db = client.db(databaseName);
    console.log(`✅ Database Selected: ${databaseName}`);

    // Ping to verify connection
    await db.command({ ping: 1 });
    console.log("✅ MongoDB Ping Successful");

    isConnected = true;

    console.log("========================================");
    console.log("✅ MongoDB Connected Successfully!");
    console.log(`📦 Database: ${databaseName}`);
    console.log(`📍 Host: MongoDB Atlas (Cluster0)`);
    console.log(
      `🔗 Connection Pool: ${client.options.maxPoolSize} connections`,
    );
    console.log("========================================");

    // ✅ Create collections if they don't exist
    await ensureCollections(db);

    // ✅ Check if students collection has data
    try {
      const studentsCollection = db.collection("students");
      const count = await studentsCollection.countDocuments();
      console.log(`📊 Total students in collection: ${count}`);

      if (count === 0) {
        console.log("⚠️ No students found in database!");
        console.log(
          "💡 Please register a student first or insert data manually.",
        );
        console.log(
          "📝 Use: POST /api/students/add-test to add a test student",
        );
      } else {
        // Show sample students
        const sample = await studentsCollection.find({}).limit(3).toArray();
        console.log("📝 Sample students:");
        sample.forEach((s, i) => {
          console.log(
            `   ${i + 1}. ${s.name} - ${s.phone} - ${s.status || "Pending"}`,
          );
        });
      }
    } catch (err) {
      console.error("❌ Error checking students:", err.message);
    }

    return db;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("❌ Error Code:", error.code || "N/A");

    console.log("\n💡 Troubleshooting Tips:");
    console.log("1. ✅ Check MongoDB Atlas Network Access:");
    console.log("   - Go to MongoDB Atlas → Network Access → Add IP Address");
    console.log("   - Add 0.0.0.0/0 (Allow Access from Anywhere)");
    console.log("2. ✅ Verify credentials in .env file:");
    console.log(`   - BD_USER=${process.env.BD_USER || "NOT SET"}`);
    console.log(
      `   - BD_PASS=${process.env.BD_PASS ? "✅ SET" : "❌ NOT SET"}`,
    );
    console.log("3. ✅ Check if cluster is active in MongoDB Atlas");
    console.log("4. ✅ Check internet connection");
    console.log(
      "5. ✅ Make sure the database name is correct: tarbiyah_online_madrasha",
    );
    console.log("========================================");

    throw error;
  }
};

// ✅ Ensure collections exist
const ensureCollections = async (database) => {
  try {
    console.log("📚 Checking collections...");

    const collections = await database.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    console.log(
      `📋 Existing collections: ${collectionNames.join(", ") || "None"}`,
    );

    // ✅ Required collections
    const requiredCollections = [
      "users",
      "students",
      "courses",
      "assignments",
      "quizzes",
      "lessons",
      "submissions",
      "results",
      "fees",
      "attendances",
    ];

    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        console.log(`📚 Creating '${collectionName}' collection...`);
        await database.createCollection(collectionName);
        console.log(`✅ '${collectionName}' collection created!`);
      }
    }

    // ✅ Create indexes for students collection
    try {
      const studentsCollection = database.collection("students");

      // Check if students collection is empty
      const count = await studentsCollection.countDocuments();
      console.log(`📊 Students collection has ${count} documents`);

      // Index: phone (unique)
      try {
        await studentsCollection.createIndex({ phone: 1 }, { unique: true });
        console.log("✅ Index created: students.phone (unique)");
      } catch (err) {
        if (err.code === 85) {
          console.log("ℹ️ Index already exists: students.phone");
        } else {
          console.log(
            `⚠️ Index creation warning (students.phone): ${err.message}`,
          );
        }
      }

      // Index: username (unique, sparse)
      try {
        await studentsCollection.createIndex(
          { username: 1 },
          { unique: true, sparse: true },
        );
        console.log("✅ Index created: students.username (unique, sparse)");
      } catch (err) {
        if (err.code === 85) {
          console.log("ℹ️ Index already exists: students.username");
        } else {
          console.log(
            `⚠️ Index creation warning (students.username): ${err.message}`,
          );
        }
      }

      // Index: status
      try {
        await studentsCollection.createIndex({ status: 1 });
        console.log("✅ Index created: students.status");
      } catch (err) {
        if (err.code !== 85) {
          console.log(
            `⚠️ Index creation warning (students.status): ${err.message}`,
          );
        }
      }

      // Index: class
      try {
        await studentsCollection.createIndex({ class: 1 });
        console.log("✅ Index created: students.class");
      } catch (err) {
        if (err.code !== 85) {
          console.log(
            `⚠️ Index creation warning (students.class): ${err.message}`,
          );
        }
      }
    } catch (err) {
      console.log(`⚠️ Error setting up students indexes: ${err.message}`);
    }

    // ✅ Create indexes for users collection
    try {
      const usersCollection = database.collection("users");

      try {
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        console.log("✅ Index created: users.email (unique)");
      } catch (err) {
        if (err.code === 85) {
          console.log("ℹ️ Index already exists: users.email");
        } else {
          console.log(
            `⚠️ Index creation warning (users.email): ${err.message}`,
          );
        }
      }

      try {
        await usersCollection.createIndex({ role: 1 });
        console.log("✅ Index created: users.role");
      } catch (err) {
        if (err.code !== 85) {
          console.log(`⚠️ Index creation warning (users.role): ${err.message}`);
        }
      }
    } catch (err) {
      console.log(`⚠️ Error setting up users indexes: ${err.message}`);
    }

    // ✅ Create indexes for courses collection
    try {
      const coursesCollection = database.collection("courses");

      try {
        await coursesCollection.createIndex({ code: 1 }, { unique: true });
        console.log("✅ Index created: courses.code (unique)");
      } catch (err) {
        if (err.code === 85) {
          console.log("ℹ️ Index already exists: courses.code");
        } else {
          console.log(
            `⚠️ Index creation warning (courses.code): ${err.message}`,
          );
        }
      }
    } catch (err) {
      console.log(`⚠️ Error setting up courses indexes: ${err.message}`);
    }

    console.log("✅ All collections and indexes are ready!");
    console.log("========================================");
  } catch (error) {
    console.error("❌ Error ensuring collections:", error.message);
    // Don't throw, just log - collections will be created on first insert
  }
};

// ✅ Get database instance
const getDB = () => {
  if (!db) {
    throw new Error("❌ Database not initialized. Call connectDB() first.");
  }
  return db;
};

// ✅ Get collection
const getCollection = (collectionName) => {
  try {
    const database = getDB();
    return database.collection(collectionName);
  } catch (error) {
    console.error(
      `❌ Error getting collection '${collectionName}':`,
      error.message,
    );
    throw error;
  }
};

// ✅ Close database connection
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

// ✅ Check connection status
const isConnectedToDB = () => {
  return isConnected && db !== null;
};

// ✅ Get connection stats
const getConnectionStats = () => {
  return {
    isConnected: isConnected,
    databaseName: db ? db.databaseName : null,
    isClientConnected: client ? true : false,
    collections: db ? db.listCollections() : null,
  };
};

module.exports = {
  connectDB,
  getDB,
  closeDB,
  getCollection,
  isConnectedToDB,
  getConnectionStats,
  client,
};
