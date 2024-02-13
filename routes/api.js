const express = require("express");
const router = express.Router();
// const checkAuth = require("../middleware/check-auth");
const ApiController = require("../controllers/api");

router.post("/addreading", ApiController.api_add_data);

router.post("/addboat", ApiController.api_add_boat);

router.get("/boats", ApiController.api_get_boats);

module.exports = router;
