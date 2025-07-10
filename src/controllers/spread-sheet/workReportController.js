const axios = require("axios");

exports.createWorkReport = async (req, res) => {
  try {
    const params = req.body;

    const fieldMapping = {
      type: "workReport", // typeでメソッドを分岐させる
      ...params,
    };
    console.log({ fieldMapping });
    const response = await axios.post(
      process.env.REACT_APP_REMOTE_SALES_MANAGEMENT_ENDPOINT,
      {
        ...fieldMapping,
      }
    );

    if (response.data.error) {
      console.error("GAS保存エラー:", response.data);
      res.status(400).json({
        message: "エラーが発生しました。再度登録してください。",
        error: response.data,
      });
      return;
    }

    res.json({
      message: "稼働報告登録が完了しました。",
    });
  } catch (error) {
    console.error("稼働報告登録処理エラー:", error);
    res.status(500).json({
      message: "システムエラーが発生しました。",
      error: error.message,
    });
  }
};

exports.getWorkReportByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    const url = `${process.env.REACT_APP_REMOTE_SALES_MANAGEMENT_ENDPOINT}?type=workReport&email=${email}`;
    const workReports = await axios.get(url).then((r) => r.data);
    res.json(workReports);
  } catch (error) {
    console.error("稼働報告詳細取得処理エラー:", error);
    res.status(500).json({
      message: "システムエラーが発生しました。",
      error: error.message,
    });
  }
};

exports.getWorkReports = async (_, res) => {
  try {
    const url = `${process.env.REACT_APP_REMOTE_SALES_MANAGEMENT_ENDPOINT}?type=workReport`;
    const workReports = await axios.get(url).then((r) => r.data);
    res.json(workReports);
  } catch (error) {
    console.error("稼働報告一覧取得処理エラー:", error);
    res.status(500).json({
      message: "システムエラーが発生しました。",
      error: error.message,
    });
  }
};
