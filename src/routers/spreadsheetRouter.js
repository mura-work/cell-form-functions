const express = require("express");
const router = express.Router();
const joiningCompanyController = require("../controllers/spread-sheet/joiningCompanyController");
const newContractEmployeeController = require("../controllers/spread-sheet/newContractEmployeeController");

router.post("/joining-company", joiningCompanyController.createJoiningCompany);
router.post(
  "/new-contract-employee",
  newContractEmployeeController.createNewContractEmployee
);

module.exports = router;
