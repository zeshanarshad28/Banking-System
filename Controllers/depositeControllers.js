// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripe = require("stripe")(
  "sk_test_51LfeSFFPcxiOmlyFYfcrY9JsYZc17Xf0QtXyBlwR5ysean3uv4DrpmiOfRcpWShanIbnLcusRNTd9RvdV7MiMUY100PlL258F2"
);

const User = require("../models/userModel");

const catchAsync = require("../utils/catchAsync");
const Accounts = require("../models/accountsModel");
exports.depositeBySession = catchAsync(async (req, res, next) => {
  console.log("In checkout session");
  const { userId } = await Accounts.findOne({ accountNo: req.body.accountNo });
  // get the user
  const userToDeposite = await User.findById(userId);
  //   console.log(userToBeMember);

  //  2) creat checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], // these five lines are information about session itself
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/api/v1/moneyCirculation/addMoney/${req.body.accountNo}/${
      req.body.amount
    }`,
    cancel_url: `${req.protocol}://${req.get(
      "host"
    )}/api/v1/moneyCirculation/paymentFail`,
    customer_email: userToDeposite.email,
    client_reference_id: userToDeposite.id,
    line_items: [
      // this is the information about product which user is going to purchase
      {
        price_data: {
          currency: "usd",
          unit_amount: req.body.amount * 100,
          product_data: {
            name: `Deposite`,
            description: "Bank Depositr ",
            // images: null,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });
  console.log(session);
  //   3) creat a seesion as a response
  res.status(200).json({
    status: "success",
    session,
  });
});
