const express = require("express");
const router = express.Router();
// const checkAuth = require("../middleware/check-auth");
const UserController = require("../controllers/user");
const checkAuth = require("../middleware/check-auth");

router.post("/signup", UserController.user_signup);

router.post("/login", UserController.user_login);

router.get("/profile", checkAuth, UserController.user_profile);

router.post("/data", checkAuth, UserController.user_get_data);

router.post("/alldata", checkAuth, UserController.user_getAll_data);

module.exports = router;
