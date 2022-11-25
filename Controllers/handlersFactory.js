const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appError");
const ApiFeatures = require("../utils/apiFeatures");
//  Factory function to delete a document
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // console.log(Model);
    // const id = req.params.id;
    console;
    const doc = await Model.findOneAndDelete({ _id: req.params.id });
    console.log(doc);
    if (!doc) {
      return next(new AppErr("No document find with that Id", 404));
    }

    res.status(204).json({
      status: "Sucess",
      data: null,
    });
  });

//   Factory function to Update a document
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppErr("No document found with that Id", 404));
    }
    res.status(200).json({
      status: "Sucess",
      data: {
        data: doc,
      },
    });
  });

// Factory function to create a document
exports.creatOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    // console.log("tourcontroller");
    res.status(201).json({
      status: "Sucess",
      data: {
        data: doc,
      },
    });
  });

// :::::::::::::::::::::::::::Factory function for getting/reading  data. ::::::::::::::::::::::::::::

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    console.log("get single user hittttttttttttttt;;;;;;;;;;;;;;");
    let query = await Model.findOne({ _id: req.params.id });
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppErr("No Document Found With Given Id ", 404));
    }

    res.json({
      status: "Success",

      data: {
        data: doc,
      },
    });
  });

// :::::::::::::::::::::::::::Factory function for getting/reading ALL data. ::::::::::::::::::::::::::::

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const features = new ApiFeatures(Model.find(), req.query)
      .filter()
      .limitFields()
      .paginate();

    // const doc = await features.query.explain(); // here explain method is just to check indexing
    const doc = await features.query;
    res.json({
      status: "Success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
