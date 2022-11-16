const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema(
  {
    accountNo: {
      type: String,
      //   ref: "accounts",
      required: [true, "please give receiver's account number "],
    },

   amount:{
    type:Number,
   },
   date:{
    type:Date,
    default:Date.now()
   }

  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Interest = mongoose.model("interest", interestSchema);

module.exports = Interest;