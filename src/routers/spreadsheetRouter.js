const express = require("express");
const router = express.Router();
const joiningCompanyController = require("../controllers/spread-sheet/joiningCompanyController");
const newContractEmployeeController = require("../controllers/spread-sheet/newContractEmployeeController");
const workShiftController = require("../controllers/spread-sheet/workShiftController");
const workReportController = require("../controllers/spread-sheet/workReportController");
const contractEmployeesController = require("../controllers/spread-sheet/contractEmployeesController");

// 契約開始時回答フォーム
router.post("/joining-company", joiningCompanyController.createJoiningCompany);
router.post(
  "/new-contract-employee",
  newContractEmployeeController.createNewContractEmployee
);

// シフト
router.post("/work-shifts", workShiftController.createWorkShift);
router.get("/work-shifts", workShiftController.getWorkShifts);
router.get("/work-shift", workShiftController.getWorkShiftByEmail);
router.delete("/work-shifts/:shiftId", workShiftController.deleteWorkShift);
router.put("/work-shifts/:shiftId", workShiftController.updateWorkShift);

// 稼働報告
router.post("/work-reports", workReportController.createWorkReport);
router.get("/work-reports", workReportController.getWorkReports);
router.get("/work-report", workReportController.getWorkReportByEmail);

// メンバーの取得
router.get(
  "/contract-employees",
  contractEmployeesController.findContractEmployees
);

module.exports = router;
