const axios = require("axios");

// app_access_tokenを取得
const getAppAccessToken = async () => {
  const url =
    "https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal";
  const res = await axios.post(
    url,
    {
      app_id: process.env.REACT_APP_LARK_APP_ID,
      app_secret: process.env.REACT_APP_LARK_APP_SECRET,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data.app_access_token;
};

// 従業員登録処理
exports.createJoiningCompany = async (req, res) => {
  try {
    const appAccessToken = await getAppAccessToken();

    const params = req.body;
    console.log({ params });
    const fieldMapping = {
      名前: params.name,
      "名前（カナ）": params.nameKana,
      個人アドレス: params.personalAddress,
      電話番号: params.phoneNumber,
      住民票所在地: params.residenceAddress,
      現住所: params.currentAddress,
      最寄駅: params.nearestStation,
      振込先銀行名: params.bankName,
      振込先支店名: params.branchName,
      振込先口座種別: params.accountType,
      口座番号: params.accountNumber,
      口座名義人: params.accountHolder,
      生年月日: params.birthday,
      入社予定日: params.joinDate,
      マイナンバー: params.myNumber,
      世帯主: params.householdHead,
      世帯主の属性: params.householdHeadRelationship,
      緊急連絡先: params.emergencyContact,
      緊急連絡先の属性: params.emergencyContactRelationship,
      前職の退職日: params.previousJobResignationDate,
      雇用保険番号: params.employmentInsuranceNumber,
    };
    console.log({ fieldMapping });
    const appToken = "WsgSbVf0ea0xwnsY3VrjSLTNpph";
    const tableId = "tblm2M2Dlm0O6u6J";
    const endpoint = `https://open.larksuite.com/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
    const response = await axios.post(
      endpoint,
      {
        fields: fieldMapping,
      },
      {
        headers: {
          Authorization: `Bearer ${appAccessToken}`,
          "Content-Type": "application/json",
        },
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
