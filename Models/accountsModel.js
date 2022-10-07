const mongoose = require("mongoose");

const accountsSchema = new mongoose.Schema(
  {
    accountNo: {
      type: String,
      default: () => {
        return (
          performance.now().toString(36) + Math.random().toString(36)
        ).replace(/\./g, "");
      },
      required: true,
    },
    type: {
      type: String,
      enum: {
        values: ["current", "saving"],
        message: "Enter valid account type ",
      },
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    remainingCheques: {
      type: Number,
      default: 0,
    },
    chequeBookActive: {
      type: Boolean,
      default: false,
    },
    cheques: {
      type: Array,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      required: [true, "please give user Id to create and account "],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Accounts = mongoose.model("Accounts", accountsSchema);

module.exports = Accounts;
