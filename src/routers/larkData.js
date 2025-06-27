const express = require("express");
const router = express.Router();
const larkDataController = require("../controllers/lark/homeWorkerController");
const joiningCompanyController = require("../controllers/lark/joiningCompanyController");

// Larkから従業員データを取得
router.get("/home-workers", larkDataController.getHomeWorkers);
router.post(
  "/create-remote-sales-data",
  larkDataController.createRemoteSalesData
);
router.get("/target-home-worker", larkDataController.getTargetHomeWorker);

router.post("/joining-company", joiningCompanyController.createJoiningCompany);

module.exports = router;
