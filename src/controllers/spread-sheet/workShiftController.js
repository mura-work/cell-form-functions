const axios = require("axios");

exports.createWorkShift = async (req, res) => {
  try {
    const params = req.body;

    const fieldMapping = {
      type: "createWorkShift", // typeでメソッドを分岐させる
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
      message: "シフト登録が完了しました。",
    });
  } catch (error) {
    console.error("シフト登録処理エラー:", error);
    res.status(500).json({
      message: "システムエラーが発生しました。",
      error: error.message,
    });
  }
};

exports.getWorkShiftByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    const url = `${process.env.REACT_APP_REMOTE_SALES_MANAGEMENT_ENDPOINT}?type=workShift&email=${email}`;
    const shifts = await axios.get(url).then((r) => r.data);
    res.json(shifts);
  } catch (error) {
    console.error("シフト詳細取得処理エラー:", error);
    res.status(500).json({
      message: "システムエラーが発生しました。",
      error: error.message,
    });
  }
};

exports.getWorkShifts = async (_, res) => {
  try {
    const url = `${process.env.REACT_APP_REMOTE_SALES_MANAGEMENT_ENDPOINT}?type=workShift`;
    const shifts = await axios.get(url).then((r) => r.data);
    res.json(shifts);
  } catch (error) {
    console.error("シフト一覧取得処理エラー:", error);
    res.status(500).json({
      message: "システムエラーが発生しました。",
      error: error.message,
    });
  }
};

exports.deleteWorkShift = async (req, res) => {
  try {
    console.log(req.params.shiftId);
    const response = await axios.post(
      process.env.REACT_APP_REMOTE_SALES_MANAGEMENT_ENDPOINT,
      {
        type: "deleteWorkShift", // typeでメソッドを分岐させる
        shiftId: req.params.shiftId,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("シフト削除処理エラー:", error);
    res.status(500).json({
      message: "システムエラーが発生しました。",
      error: error.message,
    });
  }
};
