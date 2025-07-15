const axios = require("axios");

exports.findContractEmployees = async (req, res) => {
  try {
    const email = req.query.email;
    const suffix = email ? `&email=${email}` : "";
    const url = `${process.env.REACT_APP_REMOTE_SALES_MANAGEMENT_ENDPOINT}?type=members${suffix}`;
    const contractEmployees = await axios.get(url).then((r) => r.data);
    res.json(contractEmployees);
  } catch (error) {
    console.error("契約社員取得処理エラー:", error);
    res.status(500).json({
      message: "システムエラーが発生しました。",
      error: error.message,
    });
  }
};
