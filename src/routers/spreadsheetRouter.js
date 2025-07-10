const express = require("express");
const router = express.Router();
const joiningCompanyController = require("../controllers/spread-sheet/joiningCompanyController");
const newContractEmployeeController = require("../controllers/spread-sheet/newContractEmployeeController");
const shiftController = require("../controllers/spread-sheet/shiftController");

router.post("/joining-company", joiningCompanyController.createJoiningCompany);
router.post(
  "/new-contract-employee",
  newContractEmployeeController.createNewContractEmployee
);
router.post("/shifts", shiftController.createShift);
router.get("/shifts", shiftController.getShifts);
router.get("/shift", shiftController.getShiftByEmail);

module.exports = router;
