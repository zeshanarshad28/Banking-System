const mongoose = require("mongoose");

const depositsSchema = new mongoose.Schema(
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
    senderAccountNo: {
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
    depositersChequeNo: {
      type: Number,
    },
    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Deposits = mongoose.model("Deposits", depositsSchema);

module.exports = Deposits;
