const mongoose = require("mongoose");
const ROLES = require("../constants/roles");
const STATUSES = require("../constants/statuses");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
    },
    googleId: {
      type: Boolean,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: Object.values(ROLES),
    },
    serviceDetails: {
      type: new mongoose.Schema({
        _id: false,
        isAccepted: {
          type: String,
          enum: Object.values(STATUSES),
          default: STATUSES.PENDING,
        },
        description: {
          type: String,
          trim: true,
        },
        servicesOffered: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
          },
        ],
        logo: {
          type: String,
        },
        document:{
          type: String
        }
        ,
      }),
      default: null,
      required: function () {
        return this.role === ROLES.SERVICE;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const existingUser = await this.constructor.findOne({ _id: this._id });
    if (existingUser) {
      const samePass = await bcrypt.compare(
        this.password,
        existingUser?.password
      );

      if (samePass) {
        throw new Error("Password cannot be same as old password");
      }
    }
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add a method to validate the password
userSchema.methods.validatePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
