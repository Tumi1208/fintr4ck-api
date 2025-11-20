// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Lưu mật khẩu đã băm
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "PARTNER", "ADMIN"],
      default: "USER",
      index: true,
    },
    partnerProfile: {
      storeName: { type: String, trim: true },
      description: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
  },
},
{ timestamps: true }
);

// Đảm bảo partner có tên cửa hàng
userSchema.pre("validate", function (next) {
  if (this.role === "PARTNER" && !this.partnerProfile?.storeName) {
    this.invalidate("partnerProfile.storeName", "Partner cần storeName");
  }
  next();
});

export default mongoose.model("User", userSchema);
