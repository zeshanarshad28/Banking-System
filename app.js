const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");

const userRoutes = require("./routes/userRoutes");
const checkbookRoutes = require("./routes/checkbookRoutes");
const accountsRoutes = require("./routes/accountsRoutes");
const moneyCirculationRoutes = require("./routes/moneyCirculationRoutes");
const paymentsByStripe=require("./controllers/depositeByPayementIntents")
const Deposite=require("./models/depositsModel")
const Accounts=require("./models/accountsModel")
const {message}=require("./utils/sms")
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorControllers");
const stripe = require("stripe")("sk_test_51LfeSFFPcxiOmlyFYfcrY9JsYZc17Xf0QtXyBlwR5ysean3uv4DrpmiOfRcpWShanIbnLcusRNTd9RvdV7MiMUY100PlL258F2");

const app = express();

app.post("/webhook",express.raw({ type: "application/json" }),
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
        async function addMoney(){
          console.log(`in function ${accountNo}`)
          // const newAmount=newAmount;
          // const accountNo=accountNo;
          // const phoneNo=phoneNo;
          // const totalAmount=totalAmount;
            //   add balance to receivers account
           console.log(`innnn addMoney fun. ${phoneNo}`)
            await Accounts.findOneAndUpdate(
              { accountNo },
              {
                balance: totalAmount,
              }
            );
            // create deposite
            const deposite = await Deposite.create({
              receiversAccountNo:accountNo,
              amount: newAmount,
              method: "card_payment",
              // description: req.params.description,
            });
            message(`${newAmount} is added to your account.`, phoneNo)
      }
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
// ===== Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// ======== Data sanitization against XSS (protection from malicious html) use pkg name exactly "xss-clean"
app.use(xssClean());
//  Set Security HTTP Headers======
app.use(helmet());

// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan("dev"));

app.use(express.json());
// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/accounts", accountsRoutes);
app.use("/api/v1/checkbook", checkbookRoutes);
app.use("/api/v1/moneyCirculation", moneyCirculationRoutes);
app.use("/api/v1/payments",paymentsByStripe)

// // Handling unhandled routes:
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// Error handler middlware
app.use(globalErrorHandler);

module.exports = app;
