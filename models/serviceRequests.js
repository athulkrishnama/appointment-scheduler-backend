const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quotation",
        required: ()=>{
          if(this.status === "accepted"){
            return true;
          }
          return false;
        },
        
    }
    ,
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    RequestedAt: {
      type: Date,
      default: Date.now,
      
    },
    additionalNotes: {
      type: String,
      required: true,
    },
    additionalDetails: [
      {
        fieldName: {
          type: String,
          required: [true, "Field name is required"],
        },
        fieldType: {
          type: String,
          enum: ["number", "string"],
          required: [true, "Field type is required"],
        },
        value:{
            type: String,
            required: [true, "Value is required"],
        }
      },
    ],
    // recurringEndDate: {
    //   type: Date,
    // },
    // serviceFrequency: {
    //   type: String,
    //   enum: [
    //     'Once',
    //     'Weekly Twice',
    //     'Daily',
    //     'Weekly',
    //     'Fortnightly',
    //     'Monthly',
    //     'Quarterly',
    //     'Half Yearly',
    //     'Yearly'
    //   ],
    //   required: [true, "Service frequency is required"],
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
