const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const handlersFactory = require("./handlersFactory");
const ApiFeatures = require("../utils/apiFeatures");
const Accounts = require("../models/accountsModel");
const Interest = require("../models/interestModel");
let User = require("./../models/userModel");
const AtmCard = require("../models/atmCardModel");
const { message } = require("../utils/sms");
const WithdrawModel = require("../models/withdrawModel");
const Deposite = require("../models/depositsModel");

// Withdraw Money by cheque
exports.withdrawMoneyByCheque = catchAsync(async (req, res, next) => {
  //   console.log(req.body);
  //   console.log(req.body.accountNo);
  const account = await Accounts.findOne({ accountNo: req.body.accountNo });
  if (!account) {
    return next(new AppError("Please enter valid account number", 401));
  }
  const { allowedToWithdraw } = await User.findById(account.userId);
  if (allowedToWithdraw == false) {
    next(new AppError("You're not allowed to withdraw", 401));
  }
  //   console.log(`---account-${account}`);

  //   console.log(`---cheques-${account.cheques}`);
  const index = account.cheques.indexOf(req.body.chequeNo);
  if (index == -1) {
    return next(new AppError("Wronge cheque no.!", 401));
  }
  if (account.balance < req.body.amount) {
    return next(
      new AppError("Your Balance in account is below the requested amount", 401)
    );
  }
  //   console.log("going in create");
  //   create withdrawl record
  const withdraw = await WithdrawModel.create({
    accountNo: req.body.accountNo,
    amount: req.body.amount,
    chequeNo: req.body.chequeNo,
    method: "cheque",
    description: req.body.description,
  });
  //  delete cheque from array
  let newArray = account.cheques.splice(index, 1);
  //   update balance in account & remove cheque
  await Accounts.findOneAndUpdate(
    { accountNo: req.body.accountNo },
    {
      balance: account.balance - req.body.amount,
      cheques: newArray,
    }
  );
  const { phoneNo } = await User.findById(account.userId);
  message(`${req.body.amount} amount is withdraw from your account!`, phoneNo);
  res.status(200).json({
    status: "success",
    data: {
      message: "Amount withdraw successfully",
    },
  });
});

// Withdraw Money by ATM Card.............................................
exports.withdrawMoneyByAtmCard = catchAsync(async (req, res, next) => {
  if (req.user.allowedToWithdraw == false) {
    return next(new AppError("You're not allowed to withdraw money !"));
  }
  const account = await Accounts.findOne({ accountNo: req.body.accountNo });
  if (!account) {
    return next(new AppError("Please enter valid account number", 401));
  }
  if (!account.userId.equals(req.user._id)) {
    return next(new AppError("You're trying wrong account number"));
  }
  //   console.log("account exist");
  if (account.balance < req.body.amount) {
    console.log("in if");
    return next(
      new AppError("Your Balance in account is below the requested amount", 401)
    );
  }
  console.log("amount greater");

  const atmCardd = await AtmCard.findOne({
    atmCardNo: req.body.atmCardNo,
    active: true,
    issued: true,
  });
  if (!atmCardd) {
    return next(new AppError("Invalid ATM card no."));
  }
  //   create withdrawl record
  const withdraw = await WithdrawModel.create({
    accountNo: req.body.accountNo,
    amount: req.body.amount,
    atmCardNo: req.body.atmCardNo,
    method: "atmCard",
    description: req.body.description,
  });

  //   update balance in account
  await Accounts.findOneAndUpdate(
    { accountNo: req.body.accountNo },
    {
      balance: account.balance - req.body.amount,
    }
  );
  const { phoneNo } = await User.findById(account.userId);
  message(`${req.body.amount} amount is withdraw from your account!`, phoneNo);
  res.status(200).json({
    status: "success",
    data: {
      message: "Amount withdraw successfully",
      Recipt: {
        Account_No: req.body.accountNo,
        Amount: req.body.amount,
        Date: Date.now(),
      },
    },
  });
});

// Transfer money from current account.............................................
exports.transferMoneyFromCurrentAccount = catchAsync(async (req, res, next) => {
  if (req.user.allowedToTransfer == false) {
    return next(new AppError("You're not allowed to transfer money !"));
  }
  const sender = await Accounts.findOne({
    userId: req.user._id,
    type: "current",
  });
  if (!sender) {
    return next(new AppError("You don't have current account", 401));
  }

  const receiver = await Accounts.findOne({
    accountNo: req.body.accountNo,
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
  if (sender.balance < req.body.amount) {
    return next(new AppError("You donot have much balance", 401));
  }
  //   add balance to receivers account
  await Accounts.findOneAndUpdate(
    { accountNo: req.body.accountNo },
    {
      balance: receiver.balance + req.body.amount,
    }
  );
  //   remove balance from sebders account
  await Accounts.findOneAndUpdate(
    {
      userId: req.user._id,
      type: "current",
    },
    {
      balance: sender.balance - req.body.amount,
    }
  );
  //   create withdrawl record
  const withdraw = await WithdrawModel.create({
    accountNo: sender.accountNo,
    amount: req.body.amount,
    receiversAccountNo: req.body.accountNo,
    method: "onlineTransfer",
    description: req.body.description,
  });
  // create deposite
  const deposite = await Deposite.create({
    receiversAccountNo: req.body.accountNo,
    amount: req.body.amount,
    senderAccountNo: sender.accountNo,
    method: "onlineTransfer",
    description: req.body.description,
  });

  message(`${req.body.amount} RS is deposite in your account`, phoneNo);
  message(
    `${req.body.amount} RS is sent to ${req.body.accountNo}`,
    req.user.phoneNo
  );

  res.status(200).json({
    status: "success",
    data: {
      message: "Amount deposite successfully",
    },
  });
});

// .........................................

// Transfer money from Saving account.............................................
exports.transferMoneyFromSavingAccount = catchAsync(async (req, res, next) => {
  if (req.user.allowedToTransfer == false) {
    return next(new AppError("You're not allowed to transfer money !"));
  }
  const sender = await Accounts.findOne({
    userId: req.user._id,
    type: "saving",
  });
  if (!sender) {
    return next(new AppError("You don't have current account", 401));
  }

  const receiver = await Accounts.findOne({
    accountNo: req.body.accountNo,
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
  if (sender.balance < req.body.amount) {
    return next(new AppError("You donot have much balance", 401));
  }
  //   add balance to receivers account
  await Accounts.findOneAndUpdate(
    { accountNo: req.body.accountNo },
    {
      balance: receiver.balance + req.body.amount,
    }
  );
  //   remove balance from senders account
  await Accounts.findOneAndUpdate(
    {
      userId: req.user._id,
      type: "saving",
    },
    {
      balance: sender.balance - req.body.amount,
    }
  );
  //   create withdrawl record
  const withdraw = await WithdrawModel.create({
    accountNo: sender.accountNo,
    amount: req.body.amount,
    receiversAccountNo: req.body.accountNo,
    method: "onlineTransfer",
    description: req.body.description,
  });
  // create deposite
  const deposite = await Deposite.create({
    receiversAccountNo: req.body.accountNo,
    amount: req.body.amount,
    senderAccountNo: sender.accountNo,
    method: "onlineTransfer",
    description: req.body.description,
  });

  message(`${req.body.amount} RS is deposite in your account`, phoneNo);
  message(
    `${req.body.amount} RS is sent to ${req.body.accountNo}`,
    req.user.phoneNo
  );

  res.status(200).json({
    status: "success",
    data: {
      message: "Amount deposite successfully",
    },
  });
});

// Transaction Report.
exports.transactionReport = catchAsync(async (req, res, next) => {
  // first verify if exact user or an admin is checking history
  const user = await Accounts.findOne({
    accountNo: req.params.accountNo,
  });
  if (!user) {
    return next(new AppError("Invalid account no,", 401));
  }
  let userId = user.userId;
  if (req.user.role != "admin") {
    if (!req.user._id.equals(userId)) {
      next(new AppError("Wrong account number", 401));
    }
  }
  if (!req.query.page) {
    req.query.page = 1;
  }
  if (!req.query.limit) {
    req.query.limit = 10;
  }
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  //   console.log(new Date(startDate));
  //   console.log(new Date(`${startDate}`));
  //   console.log(new Date(endDate));

  const page = req.query.page * 1;
  const limit = req.query.limit * 1;
  const skip = (page - 1) * limit;
  const withdraws = await WithdrawModel.aggregate([
    {
      $match: {
        $and: [
          { accountNo: req.params.accountNo },

          { date: { $gte: new Date(startDate) } },
          { date: { $lte: new Date(endDate) } },
        ],
      },
    },

    {
      $sort: { date: -1 },
    },

    {
      $limit: limit,
    },
    {
      $skip: skip,
    },
  ]);

  const deposites = await Deposite.aggregate([
    {
      $match: {
        $and: [
          {
            receiversAccountNo: req.params.accountNo,
          },

          { date: { $gte: new Date(startDate) } },
          { date: { $lte: new Date(endDate) } },
        ],
      },
    },

    {
      $sort: { date: -1 },
    },

    {
      $limit: limit,
    },
    {
      $skip: skip,
    },
  ]);
  let both = withdraws.concat(deposites);
  let history = both.sort((a, b) => b.date - a.date);

  res.status(200).json({
    status: "success",
    data: {
      message: "Report is ready",
      history,
      //   both,
    },
  });
});

// Deposite Money in account( by Stripe )
exports.addMoney = catchAsync(async (req, res, next) => {
  const receiver = await Accounts.findOne({
    accountNo: req.params.accountNo,
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
  //   add balance to receivers account
  console.log(req.params.amount);
  console.log(receiver.balance);
  const am = req.params.amount * 1;
  const newAmount = (receiver.balance + am) * 1;
  await Accounts.findOneAndUpdate(
    { accountNo: req.params.accountNo },
    {
      balance: newAmount,
    }
  );
  // create deposite
  const deposite = await Deposite.create({
    receiversAccountNo: req.params.accountNo,
    amount: req.params.amount,
    method: "card_payment",
    // description: req.params.description,
  });
  message(`${req.params.amount} is added to your account.`, phoneNo);

  res.status(200).json({
    status: "success",
    data: {
      message: "Amount Deposited",
    },
  });
});

// in case payment failed...................................
// Payment fail
exports.paymentFail = catchAsync(async (req, res, next) => {
  Console.log("payment is not paid . there is something went wrong");
  res.status(200).json({
    status: "fail",
  });
});

// <<<<<<<======================================================================>>>>>>
exports.interestUpdate = catchAsync(async (req, res, next) => {
  let allAccounts = await Accounts.find({ type: "saving" });
  let allAccountNumbers = [];
  allAccounts.forEach((el) => {
    // console.log(el);
    // console.log(el.accountNo);
    allAccountNumbers.push(el.accountNo);
  });

  // console.log(allAccountNumbers);
  let accountNo = req.params.accountNo; // later we'll get it from array of allAccountNumbers one by one
  // Getting total withdarw till now
  let allWithdraw = await WithdrawModel.aggregate([
    {
      $match: { accountNo: accountNo },
    },

    {
      $group: {
        _id: "",

        total: { $sum: "$amount" },
      },
    },
  ]);
  let totalWithdraw = allWithdraw[0].total;

  let allDepositesDocs = await Deposite.find({ receiversAccountNo: accountNo });
  let allAmounts = [];

  allDepositesDocs.forEach((el) => {
    // console.log(el);
    // console.log(el.amount);
    allAmounts.push(el.amount);
  });
  let profit = 0;
  let index;
  let difference;
  let length = allAmounts.length;
  for (let i = 0; i < length; i++) {
    index = i;
    if (totalWithdraw < allAmounts[i]) {
      index = i;
      difference = allAmounts[i] - totalWithdraw;
      break;
    }
    totalWithdraw = totalWithdraw - allAmounts[i];
    // allAmounts.shift();
  }
  let newDocs = [...allDepositesDocs];
  // console.log(newDocs)
  for (let i = 0; i <= index; i++) {
    newDocs.shift();
  }
  let profitPercentagePerDay = process.env.InterestPercentagePerMonth / 30;
  let monthOfLastRemovingDoc = allDepositesDocs[index].date.getMonth();
  let leftOverProfit = 0;
  if (monthOfLastRemovingDoc < Date.now().getMonth) {
    leftOverProfit =
      allDepositesDocs[index].date.getDay() * profitPercentagePerDay;
  }
  for (let i = 0; i < newDocs.length; i++) {
    let document = newDocs[i];
    let date = document.date;
    let month = date.getMonth();
    let day = date.getDay();
    let currentDate = new Date();
    console.log(currentDate);
    let currentMonth = currentDate.getMonth();

    if (month < currentMonth) {
      // later correct this logic
      profit = profit + day * profitPercentagePerDay + leftOverProfit;
    }
  }
  if (profit > 0) {
    let { balance } = await Accounts.findOne({
      accountNo: accountNo,
    });
    let interestCreate = await Interest.create({
      accountNo: accountNo,
      amount: profit,
    });
    if (interestCreate) {
      console.log("Interst created");
    }

    await Accounts.findOneAndUpdate(
      { accountNo: accountNo },
      {
        balance: balance + profit,
      }
    );
  }

  // console.log(newDocs)

  res.status(200).json({
    status: "success",
    message: "interest updated ! ",
    allAccounts,
    totalWithdraw,
    // allDepositesDocs,
    // allAmounts,
  });
});
