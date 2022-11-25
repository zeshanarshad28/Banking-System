const multer = require("multer");
const sharp = require("sharp");
let User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlersFactory");
const Accounts = require("../models/accountsModel");
const AtmCard = require("../models/atmCardModel");
const { findById, aggregate } = require("../models/accountsModel");
const { message } = require("../utils/sms");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log("in start");

  await User.findByIdAndUpdate(req.user.id, { active: false });
  console.log("in end");
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
// ...................................................
// Enable two-way Authentication
exports.turnOnAuth = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("Invalid Id", 401));
  }
  await User.findByIdAndUpdate(req.user.id, {
    twoStepAuthOn: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      message: "Two step authentication turned On",
    },
  });
});
// Disable two-way Authentication
exports.turnOffAuth = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("Invalid Id", 401));
  }
  await User.findByIdAndUpdate(req.user.id, {
    twoStepAuthOn: false,
  });

  res.status(200).json({
    status: "success",
    data: {
      message: "Two step authentication turned Off !",
    },
  });
});
// Admin Change the role from user to admin
exports.makeAdmin = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("Invalid Id", 401));
  }
  await User.findByIdAndUpdate(req.params.id, { role: "admin" });

  res.status(200).json({
    status: "success",
    data: {
      message: "Role is changed. Now this user is an admin.",
    },
  });
});
// Admin Change the role from admin to user
exports.makeUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("Invalid Id", 401));
  }
  await User.findByIdAndUpdate(req.params.id, { role: "user" });

  res.status(200).json({
    status: "success",
    data: {
      message: "Role is changed. Now this user is an admin.",
    },
  });
});
// Restrict to transfer money
exports.restrictToTransferMoney = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("Invalid Id", 401));
  }
  await User.findByIdAndUpdate(req.params.id, { allowedToTransfer: false });

  res.status(200).json({
    status: "success",
    data: {
      message: "User restricted to transfer money",
    },
  });
});
// Allow to transfer money
exports.allowToTransferMoney = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("Invalid Id", 401));
  }
  await User.findByIdAndUpdate(req.params.id, { allowedToTransfer: true });

  res.status(200).json({
    status: "success",
    data: {
      message: "User allowed to transfer money",
    },
  });
});
// Restrict to Deposite money
exports.restrictToDepositeMoney = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("Invalid Id", 401));
  }
  await User.findByIdAndUpdate(req.params.id, { allowedToDeposite: false });

  res.status(200).json({
    status: "success",
    data: {
      message: "User restricted to deposite money",
    },
  });
});
// Allow to Deposite money
exports.allowToDepositeMoney = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("Invalid Id", 401));
  }
  await User.findByIdAndUpdate(req.params.id, { allowedToDeposite: true });

  res.status(200).json({
    status: "success",
    data: {
      message: "User allowed to deposite money",
    },
  });
});

// Restrict to withdraw money
exports.restrictToWithdrawMoney = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("Invalid Id", 401));
  }
  await User.findByIdAndUpdate(req.params.id, { allowedToWithdraw: false });

  res.status(200).json({
    status: "success",
    data: {
      message: "User restricted to withdraw money",
    },
  });
});
// Allow to withdraw money
exports.allowToWithdrawMoney = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("Invalid Id", 401));
  }
  await User.findByIdAndUpdate(req.params.id, { allowedToWithdraw: true });

  res.status(200).json({
    status: "success",
    data: {
      message: "User allowed to withdraw money",
    },
  });
});
// Block user
exports.blockUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { blocked: true });
  if (!user) {
    return next(new AppError("Enter valid id ", 401));
  }
  res.status(200).json({
    status: "success",
    data: {
      message: "User blocked successfully",
    },
  });
});

// Unblock user
exports.unblockUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { blocked: false });
  if (!user) {
    return next(new AppError("Enter valid id "));
  }
  res.status(200).json({
    status: "success",
    data: {
      message: "User is unblocked successfully",
    },
  });
});
//  Request ATM card
exports.requestAtmCard = catchAsync(async (req, res, next) => {
  console.log("In request ATM card");
  const oldCard = await AtmCard.findOne({
    userId: req.user._id,
    active: true,
    type: req.body.type,
  });
  console.log(oldCard);
  if (oldCard) {
    await AtmCard.findByIdAndUpdate(oldCard._id, {
      active: false,
    });
  }
  let seconds = Date.now();
  // console.log(seconds);
  let randNumber =
    Math.floor(Math.random() * 1000000000000 + 9999999999999) + Date.now();
  let cardNumber = randNumber + seconds;
  const card = await AtmCard.create({
    atmCardNo: cardNumber,
    type: req.body.type,
    userId: req.user._id,
  });

  res.status(200).json({
    status: "success",
    data: {
      message: "Atm card requested.",
    },
  });
});

// Admin issue Atm Card
exports.issueAtmCard = catchAsync(async (req, res, next) => {
  const card = await AtmCard.findOne({
    _id: req.params.reqId,
  });
  if (!card) {
    return new AppError("card not found!", 404);
  }
  await AtmCard.findByIdAndUpdate(req.params.reqId, {
    issued: true,
  });
  const { phoneNo } = await AtmCard.findById(card.userId);
  message("Your ATM card is isuued", phoneNo);
  res.status(200).json({
    status: "success",
    data: {
      message: "Atm card issued.",
    },
  });
});

// .................
// Add Recipient
exports.addRecipient = catchAsync(async (req, res, next) => {
  console.log(req.user.recipients);

  let getRecipient = await Accounts.aggregate([
    {
      $match: { accountNo: req.params.accountNo },
    },
    {
      $lookup: {
        from: "users",
        let: { userId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$userId"],
              },
            },
          },
        ],
        as: "userInfo",
      },
    },
    {
      $project: {
        accountNo: 1,
        "userInfo.name": 1,
        "userInfo.phoneNo": 1,
        "userInfo._id": 1,
      },
    },
    {
      $unwind: "$userInfo",
    },
  ]);
  // console.log(`docccc:${getRecipient}`);
  // console.log("element", getRecipient[0]);
  let obj = { ...getRecipient[0] };
  if (!obj) {
    return next(new AppError("Invalid Id", 401));
  }
  // checking wheather user adding himself as receipient
  // if (obj.userInfo._id.equals(req.user._id)) {
  //   return next(new AppError("You cannot add yourself as a receipient"));
  // }
  //  checking if receipient already exist
  let length = req.user.recipients.length;
  console.log(length);
  for (let i = 0; i < length; i++) {
    if (req.user.recipients[i].accountNo == req.params.accountNo) {
      return next(new AppError("Recipient alredy exist", 401));
    }
  }
  // console.log("obj:", obj);
  req.user.recipients.push({ ...obj });
  let updatedUser = await User.findByIdAndUpdate(req.user._id, {
    recipients: [...req.user.recipients],
  });
  // let a = {
  //   a: getRecipient[0].accountNo,
  //   b: getRecipient[0].userInfo.name,
  // };
  // console.log(`aaaaaaa${a}`);
  console.log(req.user.recipients);
  res.status(200).json({
    status: "success",
    data: {
      message: "Recipient added.",
      updatedUser,
      getRecipient,
    },
  });
});
// ...................................................................

// Transactions report with Date range

// exports.getMonthlyPlan = catchAsync(async (req, res) => {
//   console.log(req.query.year * 1);
//   const year = req.query.year * 1;
//   const page = req.query.page * 1;
//   const limit = req.query.limit * 1;
//   const skip = (page - 1) * limit;
//   const plan = await .aggregate([
//     {
//       $unwind: "$startDate",
//     },

//     {
//       $match: {
//         startDate: {
//           $gte: new Date(`${year}-01-01`),
//           $lte: new Date(`${year}-12-31`),
//         },
//       },
//     },

//     {
//       $group: {
//         _id: { $month: "$startDate" },
//         numTourStarts: { $sum: 1 },
//         tours: { $push: "$name" },
//       },
//     },
//     {
//       $addFields: { month: "$_id" },
//     },

//     // {
//     //   $project: {
//     //     numTourStarts: 0,
//     //     _id: 0,
//     //   },
//     // },

//     // {
//     //   $sort: {
//     //     numTourStarts: -1,
//     //   },
//     // },

//     // pagination in aggregation
//     // {
//     //   $limit: limit,
//     // },
//     // {
//     //   $skip: skip,
//     // },
//   ]);

//   res.status(200).json({
//     status: "Sucess",
//     data: {
//       plan,
//     },
//   });
// });
