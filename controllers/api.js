const mongoose = require("mongoose");
const Boat = require("../models/Boat");
const Reading = require("../models/Readings");
// const moment = require("moment")
const moment = require("moment-timezone");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const text = "We are writing to report a smoke detection at VIT. Our smoke detectors were triggered, and we believe that there may be a fire on the premises.The safety of our occupants and property is our top priority, and we request your immediate assistance in addressing this situation."

exports.api_add_data = async (req, res) => {
  const { boatId, temp, tds, turbidity } = req.body;
  const Data = {
    Temp: temp,
    Tds: tds,
    Turb: turbidity,
  };
  
  const users1 = req.app.get("getUser")(boatId);

  await users1.map((user) => {
    req.app.get("io").to(user.socketId).emit("getData", Data);
    console.log("emited data to ", user.userId);
  });
  var now = new Date();
  // var startOfToday = new Date(
  //   now.getFullYear(),
  //   now.getMonth(),
  //   now.getDate(),
  // );
  // console.log(moment().format("MMM Do YY"));
  var moment = require("moment-timezone");
  console.log(moment().tz("Asia/Kolkata").format("MMM Do YY"));

  const data = await Reading.findOne(
    {
      boatId: req.body.boatId,
      created: moment().tz("Asia/Kolkata").format("MMM Do YY"),
    },
    {}
  );
  if (data !== null) {
    const ncount = +data.count + 1;
    const ntemp = String(+data.temp + (+req.body.temp - +data.temp) / ncount);
    const nturbidity = String(
      +data.turbidity + (+req.body.turbidity - +data.turbidity) / ncount
    );
    const ntds = String(+data.tds + (+req.body.tds - +data.tds) / ncount);
    const nData = {
      temp: ntemp,
      turbidity: nturbidity,
      tds: ntds,
      count: ncount,
    };
    let doc = await Reading.findOneAndUpdate(
      {
        boatId: req.body.boatId,
        created: moment().tz("Asia/Kolkata").format("MMM Do YY"),
      },
      nData,
      {
        new: true,
      }
    );
    res.status(201).json(doc);
  } else {
    const reading = new Reading({
      _id: new mongoose.Types.ObjectId(),
      boatId: req.body.boatId,
      temp: req.body.temp,
      turbidity: req.body.turbidity,
      tds: req.body.tds,
      count: 1,
      created: moment().tz("Asia/Kolkata").format("MMM Do YY"),
    });
    await reading
      .save()
      .then((result) => {
        res.status(201).json({ message: "Added Reading successfully" });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
};
exports.api_add_boat = (req, res) => {
  const boat = new Boat({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
  });
  boat
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({ message: "Created boat successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.api_get_boats = (req, res) => {
  try {
    Boat.findAll({}, function (docs) {
      res.status(201).json(docs);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
};
