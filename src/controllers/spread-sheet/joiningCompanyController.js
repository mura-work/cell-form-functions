const axios = require("axios");

exports.createJoiningCompany = async (req, res) => {
  try {
    const params = req.body;
    console.log({ params });
    const fieldMapping = {
      type: "joinedCompany", // typeでメソッドを分岐させる
      name: params.name,
      nameKana: params.nameKana,
      personalAddress: params.personalAddress,
      phoneNumber: params.phoneNumber,
      residenceAddress: params.residenceAddress,
      currentAddress: params.currentAddress,
      nearestStation: params.nearestStation,
      bankName: params.bankName,
      branchName: params.branchName,
      accountType: params.accountType,
      accountNumber: params.accountNumber,
      accountHolder: params.accountHolder,
      birthday: params.birthday,
      joinDate: params.joinDate,
      myNumber: params.myNumber,
      householdHead: params.householdHead,
      householdHeadRelationship: params.householdHeadRelationship,
      emergencyContact: params.emergencyContact,
      emergencyContactRelationship: params.emergencyContactRelationship,
      previousJobResignationDate: params.previousJobResignationDate,
      employmentInsuranceNumber: params.employmentInsuranceNumber,
    };
    console.log({ fieldMapping });
    const response = await axios.post(
      process.env.REACT_APP_MASTER_DATA_EMPLOYEE_ENDPOINT,
      {
        ...fieldMapping,
      }
    );

    if (response.data.error) {
      console.error("LarkBase保存エラー:", response.data);
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
