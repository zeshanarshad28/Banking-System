
const express = require("express");
const router = express.Router();
const Accounts=require("../models/accountsModel")
const Deposite=require("../models/depositsModel")
const User=require("../models/userModel")
const AppError=require("../utils/appError")
const {message}=require("../utils/sms")
const bodyParser=require("body-parser")
const stripe = require("stripe")("sk_test_51LfeSFFPcxiOmlyFYfcrY9JsYZc17Xf0QtXyBlwR5ysean3uv4DrpmiOfRcpWShanIbnLcusRNTd9RvdV7MiMUY100PlL258F2");
router.post("/webhook",express.raw({ type: "application/json" }),
  (req, res) => {
    console.log("========WEB HOOK HITT========");
    // console.log(req.body)
    const sig = req.headers["stripe-signature"];

    let event;
    // let webSigningSecret =process.env.STRIPE_WEBHOOK_SECRET
    let webSigningSecret ="whsec_faddf36c52251d00f70e9226be139d5b03938905e35871f512060b9e4053efaa"


    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webSigningSecret);

    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      console.log("in catch blockkkkkkkk#############")
      console.log(`errrrrrrrrrrr msg :${err.message}`);
      console.log(err);

      return;
    }
    const paymentIntent = event.data.object;
    // console.log(event.type);
    // Handle the event
    switch (event.type) {
      case "charge.succeeded":
        // console.log(paymentIntent.metadata)

        console.log("in charge scceeded");
        // add money
        const newAmount=paymentIntent.metadata.newAmount;
        const totalAmount=paymentIntent.metadata.totalAmount;

        const accountNo=paymentIntent.metadata.accountNo;
        const phoneNo=paymentIntent.metadata.phoneNo; 
        addMoney()
        // console.log(paymentIntent.user);
        // console.log(paymentIntent);
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      case "payment_intent.created":
        console.log("payment intent created 1");
        break;
        case "payment_intent.succeeded":
        console.log("payment intent .succeeded");
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
);


// creating payment intent. 
router.post("/create-payment-intent/:id", async (req, res, next) => {
   
    const receiver = await Accounts.findOne({
        accountNo:req.body.accountNo,
      });
      if (!receiver) {
        return next(new AppError("No receiver account found", 401));
      }
      const { allowedToDeposite, phoneNo } = await User.findById(receiver.userId);
      if (allowedToDeposite == false) {
        return next(
          new AppError("Receiver is not allowed to recieve any amount !", 401)
        );
      }
      const newAmount = req.body.amount * 1;
      const totalAmount = (receiver.balance + newAmount) * 1;
  let paymentIntent = await stripe.paymentIntents.create({
    payment_method: req.params.id, // payment mehtod id
    amount: req.body.amount,
    currency: "usd",
    metadata: {
      accountNo:req.body.accountNo,
      webSigningSecret:req.body.webSigningSecret,
      newAmount,
      phoneNo,
      totalAmount

    },
  });
  res.status(200).json({
    status: "success",
    paymentIntent,
  });
});


module.exports = router;
//  async function addMoney(){
//     console.log(`in function ${accountNo}`)
//     // const newAmount=newAmount;
//     // const accountNo=accountNo;
//     // const phoneNo=phoneNo;
//     // const totalAmount=totalAmount;
//       //   add balance to receivers account
//      console.log(`innnn addMoney fun. ${phoneNo}`)
//       await Accounts.findOneAndUpdate(
//         { accountNo },
//         {
//           balance: totalAmount,
//         }
//       );
//       // create deposite
//       const deposite = await Deposite.create({
//         receiversAccountNo:accountNo,
//         amount: newAmount,
//         method: "card_payment",
//         // description: req.params.description,
//       });
//       message(`${req.params.amount} is added to your account.`, phoneNo)
// }

// module.exports={addMoney,router}