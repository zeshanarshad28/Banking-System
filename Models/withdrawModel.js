const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    accountNo: {
      type: mongoose.Schema.ObjectId,
      ref: "accounts",
      required: [true, "please give receiver's account number "],
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    receiversAccountNo: {
      type: mongoose.Schema.ObjectId,
      ref: "accounts",
    },
    method: {
      type: String,
      enum: {
        values: ["cash", "cheque", "onlineTransfer"],
        message: "Enter valid account type ",
      },
    },
    ChequeNo: {
      type: Number,
    },
    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Withdraws = mongoose.model("Withdraws", withdrawSchema);

module.exports = Withdraws;
