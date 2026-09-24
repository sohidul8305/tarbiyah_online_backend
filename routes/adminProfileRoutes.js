// backend/routes/adminProfileRoutes.js
const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/db");
// const { protect, authorize } = require("../middleware/auth"); // ⚠️ দরকার হলে uncomment করুন

// =============================================
// ✅ GET ALL ADMIN PROFILES - Debug
// =============================================
router.get("/all/list", async (req, res) => {
  try {
    console.log("========================================");
    console.log("🔍 GET ALL ADMIN PROFILES REQUEST");

    const collection = getCollection("admin_profiles");
    console.log("✅ Connected to admin_profiles collection");

    const profiles = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`✅ Found ${profiles.length} admin profiles`);

    if (profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`📝 Profile ${index + 1}:`, {
          id: profile._id,
          name: profile.name,
          email: profile.email,
          designation: profile.designation,
        });
      });
    } else {
      console.log("⚠️ No admin profiles found!");
    }

    console.log("======================================");

    res.status(200).json({
      success: true,
      total: profiles.length,
      profiles: profiles,
    });
  } catch (error) {
    console.error("❌ Error fetching profiles:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack,
    });
  }
});

// =============================================
// ✅ GET SINGLE ADMIN PROFILE by Email
// =============================================
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log("========================================");
    console.log("🔍 GET ADMIN PROFILE REQUEST");
    console.log("📧 Email:", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required!",
      });
    }

    const collection = getCollection("admin_profiles");
    const profile = await collection.findOne({ email: email });

    if (!profile) {
      console.log("⚠️ Profile not found for:", email);
      return res.status(404).json({
        success: false,
        message: "Profile not found!",
        profile: null,
      });
    }

    console.log(`✅ Profile found: ${profile.name}`);
    console.log("========================================");

    res.status(200).json({
      success: true,
      profile: profile,
    });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =============================================
// ✅ CREATE ADMIN PROFILE
// =============================================
router.post("/create", async (req, res) => {
  try {
    console.log("========================================");
    console.log("✅ CREATE ADMIN PROFILE REQUEST");
    console.log("📝 Body:", req.body);

    const {
      email,
      name,
      phone,
      designation,
      department,
      joinDate,
      bio,
      address,
      website,
      profileImage,
    } = req.body;

    // Validation
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email and name are required!",
      });
    }

    const collection = getCollection("admin_profiles");

    // Check if already exists
    const existing = await collection.findOne({ email: email });
    if (existing) {
      console.log("❌ Profile already exists for:", email);
      return res.status(400).json({
        success: false,
        message: "এই ইমেইলের জন্য প্রোফাইল ইতিমধ্যে বিদ্যমান!",
      });
    }

    const newProfile = {
      email: email,
      name: name,
      phone: phone || "",
      designation: designation || "Administrator",
      department: department || "Administration",
      joinDate: joinDate || new Date().toISOString().split("T")[0],
      bio: bio || "",
      address: address || "",
      website: website || "",
      profileImage: profileImage || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newProfile);

    console.log("✅ Admin profile created:", result.insertedId);
    console.log("👤 Name:", name);
    console.log("========================================");

    res.status(201).json({
      success: true,
      message: "✅ অ্যাডমিন প্রোফাইল সফলভাবে তৈরি হয়েছে!",
      profileId: result.insertedId,
      profile: { ...newProfile, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Create Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =============================================
// ✅ UPDATE ADMIN PROFILE
// (যদি না থাকে → auto create করবে — upsert)
// =============================================
router.put("/update/:email", async (req, res) => {
  try {
    const { email } = req.params;

    console.log("========================================");
    console.log("✅ UPDATE ADMIN PROFILE REQUEST");
    console.log("📧 Email:", email);
    console.log("📝 Body:", req.body);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required!",
      });
    }

    const collection = getCollection("admin_profiles");

    // ✅ Check if profile exists
    const existing = await collection.findOne({ email: email });

    // Prepare update data (email change করা যাবে না)
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;
    delete updateData.email;

    // ============================================================
    // 📌 Case 1: Profile নেই → নতুন তৈরি হবে (Auto Create)
    // ============================================================
    if (!existing) {
      console.log("⚠️ Profile not found. Creating new...");

      const newProfile = {
        email: email,
        name: updateData.name || "Admin",
        phone: updateData.phone || "",
        designation: updateData.designation || "Administrator",
        department: updateData.department || "Administration",
        joinDate: updateData.joinDate || new Date().toISOString().split("T")[0],
        bio: updateData.bio || "",
        address: updateData.address || "",
        website: updateData.website || "",
        profileImage: updateData.profileImage || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const insertResult = await collection.insertOne(newProfile);

      console.log("✅ Profile auto-created:", insertResult.insertedId);
      console.log("========================================");

      return res.status(201).json({
        success: true,
        created: true,
        updated: false,
        message: "✅ অ্যাডমিন প্রোফাইল সফলভাবে তৈরি হয়েছে!",
        profileId: insertResult.insertedId,
        profile: { ...newProfile, _id: insertResult.insertedId },
      });
    }

    // ============================================================
    // 📌 Case 2: Profile আছে → Update হবে
    // ============================================================
    const result = await collection.updateOne(
      { email: email },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      console.log("❌ Update failed - profile not found");
      return res.status(404).json({
        success: false,
        message: "Profile not found!",
      });
    }

    const updatedProfile = await collection.findOne({ email: email });

    console.log("✅ Profile updated successfully");
    console.log("👤 Name:", updatedProfile.name);
    console.log("========================================");

    res.status(200).json({
      success: true,
      updated: true,
      created: false,
      message: "✅ অ্যাডমিন প্রোফাইল সফলভাবে আপডেট হয়েছে!",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =============================================
// ✅ DELETE ADMIN PROFILE
// =============================================
router.delete("/delete/:email", async (req, res) => {
  try {
    const { email } = req.params;

    console.log("========================================");
    console.log("🗑️ DELETE ADMIN PROFILE REQUEST");
    console.log("📧 Email:", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required!",
      });
    }

    const collection = getCollection("admin_profiles");

    // Check if exists
    const existing = await collection.findOne({ email: email });
    if (!existing) {
      console.log("❌ Profile not found for:", email);
      return res.status(404).json({
        success: false,
        message: "প্রোফাইল খুঁজে পাওয়া যায়নি!",
      });
    }

    const result = await collection.deleteOne({ email: email });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "প্রোফাইল ডিলিট করা যায়নি!",
      });
    }

    console.log(`✅ Profile deleted: ${existing.name}`);
    console.log("========================================");

    res.status(200).json({
      success: true,
      message: "✅ অ্যাডমিন প্রোফাইল সফলভাবে ডিলিট হয়েছে!",
    });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
