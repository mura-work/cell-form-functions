const express = require("express");
const router = express.Router();
const notionDataController = require("../controllers/notionDataController");

// 法人名（法人番号）の取得
router.get("client-companies", notionDataController.getClientCompanies);

// 担当者の取得
router.get("/sales-employees", notionDataController.getSalesEmployees);

// 商品の取得
router.get("/products", notionDataController.getProducts);

// シフト管理DBに保存する
router.post("/shift-management", notionDataController.postShiftManagement);

// 在宅ワーカーの取得
router.get("/home-workers", notionDataController.getHomeWorkers);

// 在宅ワーカーをDBに登録する
router.post(
  "/register-new-home-worker",
  notionDataController.postRegisterNewHomeWorker
);

module.exports = router;
