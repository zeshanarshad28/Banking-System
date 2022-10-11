const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const handlersFactory = require("./handlersFactory");
const ApiFeatures = require("../Utils/apiFeatures");
const Accounts = require("../Models/accountsModel");
let User = require("./../Models/userModel");
const atmCardModel = require("../Models/atmCardModel");
const { message } = require("../Utils/sms");
const WithdrawModel = require("../Models/withdrawModel");
const Deposite = require("../Models/depositsModel");
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

  const atmCard = await atmCardModel.findOne({
    atmCardNo: req.body.atmCardNo,
    active: true,
    issued: true,
  });
  if (!atmCard) {
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
  //   remove balance from sebders account
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
