const axios = require("axios");

exports.createNewContractEmployee = async (req, res) => {
  try {
    // メンバー一覧を取得して最後に登録したメンバーのメンバーIDを参照する
    const members = await axios
      .get(process.env.REACT_APP_REMOTE_SALES_MANAGEMENT_ENDPOINT)
      .then((r) => r.data);

    const lastMemberId = members.at(-1).memberId;
    const newMemberId = lastMemberId.replace(/RS-/, "");
    const newMemberIdNumber = parseInt(newMemberId) + 1;
    const newMemberIdWithPrefix = `RS-${newMemberIdNumber}`;

    const params = req.body.newHomeWorkerValue;

    const fieldMapping = {
      type: "newContractEmployee", // typeでメソッドを分岐させる
      memberId: newMemberIdWithPrefix,
      name: params.name,
      nameKana: params.nameKana,
      personalAddress: params.personalAddress,
      phoneNumber: params.phoneNumber,
      bankName: params.bankName,
      branchName: params.branchName,
      accountType: params.accountType,
      accountNumber: params.accountNumber,
      accountHolder: params.accountHolder,
      birthday: params.birthday,
      address: params.address,
      home: params.home,
      earliestStartDate: params.earliestStartDate,
      estimatedWorkingHoursPerMonth: params.estimatedWorkingHoursPerMonth,
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
      message: "従業員登録が完了しました。",
    });
  } catch (error) {
    console.error("従業員登録処理エラー:", error);
    res.status(500).json({
      message: "システムエラーが発生しました。",
      error: error.message,
    });
  }
};
