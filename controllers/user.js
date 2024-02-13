const mongoose = require("mongoose");
const Boat = require("../models/Boat");
const Reading = require("../models/Readings");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.user_signup = (req, res) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              name: req.body.name,
              mobile: req.body.mobile,
              email: req.body.email,
              password: hash,
              boatIds:req.body.boatIds,
            });
            user
              .save()
              .then((result) => {
                res.status(201).json({
                  message: "User created",
                });
              })
              .catch((err) => {
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
};

exports.user_login = async(req, res) => {
  User.find({ email: req.body.email })
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "User doest exists with given mail",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
            console.log(err);
          return res.status(402).json({
            message: "error in decryption",
          });
          
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
            },
            "password"
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token,
            name:user[0].name,
            id:user[0]._id,
            mobile:user[0].mobile,
            email:user[0].email,
            boatId:user[0].boatIds,
          });
        }
        res.status(403).json({
          message: "Auth failed",
        });
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};


exports.user_profile = async (req, res) => {
  const id = req.userData.userId;
  const user = await User.findOne({ _id: id });
  if (user) {
    res.status(200).json({
      name: user.fullName,
      Id: user._id,
      email: user.email,
      mobile: user.mobile,
      boatIds:user.boatIds,
    });
  } else {
    res.status(500).json({
      message: "user not found",
    });
  }
};

exports.user_get_data = async (req, res) => {
  console.log(req.body.boatId);
    try{
    Reading.findOne({boatId:req.body.boatId},{},{ sort: { createdAt: -1 } }, function (err, data) {
      res.status(200).json(data);
    });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
          message: "error",
          error:err,
        });
    }
}
exports.user_getAll_data = async (req, res) => {
  try {
    const data = await Reading.find(
      { boatId: req.body.boatId },{},{sort: { createdAt: -1 }}).limit(6);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "error",
      error: err,
    });
  }
};


