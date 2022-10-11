const mongoose = require("mongoose");

const checkBookSchema = new mongoose.Schema(
  {
    accountNo: {
      type: String,
      //   ref: "accounts",
      required: [true, "please give receiver's account number "],
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "completed"],
        message: "Enter valid account type ",
      },
      default: "pending",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const CheckBooks = mongoose.model("checkBooks", checkBookSchema);

module.exports = CheckBooks;
