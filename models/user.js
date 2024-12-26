const mongoose = require('mongoose');
import ROLES from '../constants/roles';

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: Object.values(ROLES),
    },
    serviceDetails: {
      type: new mongoose.Schema({
        isAccepted:{
            type: Boolean,
            default: false,
        },
        category: {
          type: String,
          required: [true, 'Service category is required'],
        },
        description: {
          type: String,
          trim: true,
        },
        servicesOffered: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service', 
            required: true,
          },
        ],
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
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add a method to validate the password
userSchema.methods.validatePassword = async function (inputPassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
