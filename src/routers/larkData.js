const express = require("express");
const router = express.Router();
const larkDataController = require("../controllers/lark/homeWorkerController");

// Larkから従業員データを取得
router.get("/home-workers", larkDataController.getHomeWorkers);
router.post(
  "/create-remote-sales-data",
  larkDataController.createRemoteSalesData
);

module.exports = router;
