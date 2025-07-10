const express = require("express");
const router = express.Router();
const joiningCompanyController = require("../controllers/spread-sheet/joiningCompanyController");
const newContractEmployeeController = require("../controllers/spread-sheet/newContractEmployeeController");
const shiftController = require("../controllers/spread-sheet/shiftController");
const workReportController = require("../controllers/spread-sheet/workReportController");

// 契約開始時回答フォーム
router.post("/joining-company", joiningCompanyController.createJoiningCompany);
router.post(
  "/new-contract-employee",
  newContractEmployeeController.createNewContractEmployee
);

// シフト
router.post("/shifts", shiftController.createShift);
router.get("/shifts", shiftController.getShifts);
router.get("/shift", shiftController.getShiftByEmail);

// 稼働報告
router.post("/work-reports", workReportController.createWorkReport);
router.get("/work-reports", workReportController.getWorkReports);
router.get("/work-report", workReportController.getWorkReportByEmail);

module.exports = router;
