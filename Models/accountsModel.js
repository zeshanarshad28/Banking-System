const mongoose = require("mongoose");

const accountsSchema = new mongoose.Schema(
  {
    accountNo: {
      type: String,

      unique: true,
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
    cheques: {
      type: Array,
      default: null,
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
