const jwt = require("jsonwebtoken");
const User = require("../models/User");

// প্রোটেক্ট মিডলওয়্যার - লগইন চেক করে
exports.protect = async (req, res, next) => {
  let token;

  // হেডার থেকে টোকেন নিন
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // টোকেন না থাকলে
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "আপনি লগইন করেননি। অনুগ্রহ করে লগইন করুন।",
    });
  }

  try {
    // টোকেন ভেরিফাই করুন
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ইউজার খুঁজে বের করুন (পাসওয়ার্ড বাদ দিয়ে)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "এই টোকেনের জন্য ইউজার পাওয়া যায়নি।",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "টোকেন সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।",
    });
  }
};

// রোল বেসড অ্যাক্সেস কন্ট্রোল
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `আপনার রোল (${req.user.role}) এই কাজটি করতে পারবেন না।`,
      });
    }
    next();
  };
};
