const Checkbook = require("../models/checkBook");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlersFactory");
const Accounts = require("../models/accountsModel");
// const { findById } = require("../models/accountsModel");

// Request checkbook
exports.requestCheckbook = catchAsync(async (req, res, next) => {
  let account = await Accounts.findOne({ accountNo: req.params.accountNo });
  // console.log(account);
  // console.log(account.userId);
  // console.log(req.user._id);

  //   console.log(!account.userId.equals(req.user._id));
  if (!account.userId.equals(req.user._id)) {
    return next(new AppError("Enter valid account no."));
  }
  let record = await Checkbook.findOne({
    accountNo: req.params.accountNo,
    status: "pending",
  });
  // console.log(record);
  if (record) {
    if (record.status == "pending") {
      return next(new AppError("Checkbook already requested!"));
    }
  }
  await Checkbook.create({ accountNo: req.params.accountNo });

  res.status(200).json({
    status: "success",
    data: {
      message: "CheckBook requested",
    },
  });
});
//  Assign checkbook
exports.assignCheckbook = catchAsync(async (req, res, next) => {
  const checkbookRequest = await Checkbook.findById(req.params.requestId);
  //   console.log(checkbookRequest);
  if (checkbookRequest.status == "completed") {
    return next(new AppError("Checkbook already assigned"));
  }
  const accountNunber = checkbookRequest.accountNo;
  //   await Accounts.findOneAndUpdate({accountNo:accountNunber},{
  //     cheques:(id)=>{

  //     }
  //   })
  let account = await Accounts.findOne({ accountNo: accountNunber });
  const length = account.cheques.length;
  console.log(`length:${length}`);
  if (length > 3) {
    return next(
      new AppError(
        `User already have ${length} cheques , checkbook cannot assign for now`
      )
    );
  }
  const accountId = account._id;
  for (let i = 0; i <= 5; i++) {
    let chequeNumber =
      Math.floor(Math.random() * 1000000000000 + 9999999999999) + Date.now();

    console.log(chequeNumber);
    await Accounts.findByIdAndUpdate(accountId, {
      $push: { cheques: chequeNumber },
    });
  }

  await Checkbook.findByIdAndUpdate(req.params.requestId, {
    status: "completed",
  });
  res.status(200).json({
    status: "success",
    data: {
      message: "checkbook assigned successfully",
      //   checkbookRequest,
    },
  });
});
