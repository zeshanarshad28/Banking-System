const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appError");
const handlersFactory = require("./handlersFactory");
const ApiFeatures = require("../utils/apiFeatures");
const Accounts = require("../models/accountsModel");
let User = require("../models/userModel");
const { message } = require("../utils/sms");
// create account
exports.createAccount = catchAsync(async (req, res, next) => {
  //   console.log(req.user);/
  let seconds = Date.now();
  console.log(seconds);
  let randNumber =
    Math.floor(Math.random() * 1000000000000 + 9999999999999) + Date.now();
  let accountNumber = randNumber + seconds;
  console.log(randNumber);
  console.log(accountNumber);
  if (req.body.type == "current") {
    if (req.user.haveCurrentAccount == true) {
      return next(new AppErr("Account Already exist", 401));
    }
    var newAccount = await Accounts.create({
      type: req.body.type,
      userId: req.user.id,
      accountNo: accountNumber,
    });
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      haveCurrentAccount: true,
    });
    message(
      "Congratulations your current account has been created successfully",
      req.user.phoneNo
    );
  } else {
    if (req.user.haveSavingAccount == true) {
      return next(new AppErr("Account Already exist", 401));
    }
    var newAccount = await Accounts.create({
      type: req.body.type,
      userId: req.user.id,
      accountNo: accountNumber,
    });
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      haveSavingAccount: true,
    });
    message(
      "Congratulations your saving account has been created successfully",
      req.user.phoneNo
    );
  }

  res.status(201).json({
    status: "success",
    newAccount,
  });
});
// ..............
// Check balance
exports.checkBalance = catchAsync(async (req, res, next) => {
  const data = await Accounts.findOne({
    accountNo: req.params.num,
  });
  if (!data) {
    return next(new AppErr("Account not exist",401));
    ``;
  }
  //   console.log(data.userId, req.user._id);
  if (req.user._id != data.userId) {
    return next(new AppErr("invalid account number",401));
  }

  res.status(201).json({
    status: "success",
    Balace: data.balance,
  });
});
