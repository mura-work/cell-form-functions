const express = require("express");
const router = express.Router();
const joiningCompanyController = require("../controllers/spread-sheet/joiningCompanyController");

router.post("/joining-company", joiningCompanyController.createJoiningCompany);

module.exports = router;
