const express = require("express");
const router = express.Router();
const notionDataController = require("../controllers/notionDataController");
const workAttendanceController = require("../controllers/workAttendanceController");
const workShiftController = require("../controllers/workShiftController");
const homeWorkerController = require("../controllers/homeWorkerController");

/** シフト関連 */
// シフト管理DBのデータを一覧で取得
router.get("/work-shifts", workShiftController.getShiftManagements);

// シフト管理DBに保存する
router.post("/shift-management", workShiftController.postShiftManagement);

// シフトの更新
router.patch(
  "/shift-management/:id",
  workShiftController.updateShiftManagement
);

router.delete(
  "/shift-management/:id",
  workShiftController.deleteShiftManagement
);

/** 在宅ワーカー関連 */
// 在宅ワーカーの一覧取得
router.get("/home-workers", homeWorkerController.getHomeWorkers);

// 在宅ワーカーの詳細取得
router.get("/home-worker", homeWorkerController.getHomeWorkerDetail);

// 在宅ワーカーをDBに登録する
router.post(
  "/register-new-home-worker",
  homeWorkerController.postRegisterNewHomeWorker
);

/** 勤怠関連 */
// 勤怠管理DBのデータを一覧で取得
router.get("/work-attendances", workAttendanceController.getWorkAttendances);

// 勤務情報を登録する
router.post("/work-attendance", workAttendanceController.postWorkAttendance);

// 勤怠情報の更新
router.patch(
  "/work-attendance/:id",
  workAttendanceController.updateWorkAttendance
);

// 勤怠情報の削除
router.delete(
  "/work-attendance/:id",
  workAttendanceController.deleteWorkAttendance
);

/** 使ってないかも */
// 法人名（法人番号）の取得
router.get("client-companies", notionDataController.getClientCompanies);

// 担当者の取得
router.get("/sales-employees", notionDataController.getSalesEmployees);

// 商品の取得
router.get("/products", notionDataController.getProducts);

// 給与管理レコードの作成
router.get("/create-salary-records", homeWorkerController.createSalaryRecords);

module.exports = router;
