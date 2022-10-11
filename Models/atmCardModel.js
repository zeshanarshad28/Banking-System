const mongoose = require("mongoose");

const atmCardSchema = new mongoose.Schema(
  {
    atmCardNo: {
      type: String,

      unique: true,
    },
    type: {
      type: String,
      enum: {
        values: ["debit", "credit"],
        message: "Enter valid card type ",
      },
      required: true,
    },

    issued: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      required: [true, "please give user Id "],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const AtmCard = mongoose.model("AtmCard", atmCardSchema);

module.exports = AtmCard;
