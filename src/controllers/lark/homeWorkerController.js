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

// テーブルレコード一覧を取得
const getTableRecords = async (appAccessToken, includeRetired = false) => {
  const appToken = "EyI0b8tEea9PxQsFhiyjdoLbpV3";
  const tableId = "tbl8Zef1I5HocKbP";

  const endpoint = `https://open.larksuite.com/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}`;
  const filter = includeRetired
    ? `sort=["メンバーID ASC"]&page_size=20`
    : `filter=CurrentValue.[退職フラグ]="在職中"&sort=["メンバーID ASC"]&page_size=20`;
  const url = `${endpoint}/records?${filter}`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
    },
  });
  return res.data;
};

// 在職中のメンバー一覧を取得
exports.getHomeWorkers = async (_, res) => {
  const appAccessToken = await getAppAccessToken();
  const tableRecords = await getTableRecords(appAccessToken);

  // 必要な情報のみ取り出す
  const records = tableRecords.data.items.map((record) => ({
    id: record.fields["メンバーID"], // "RS-1"
    value: record.fields["メンバーID"], // "RS-1" 選択されたときの値 IDと同じものを入れる
    name: record.fields["名前"],
  }));

  res.json(records);
};

// 対象のメンバーを取得する
exports.getTargetHomeWorker = async (req, res) => {
  const appAccessToken = await getAppAccessToken();
  const appToken = "EyI0b8tEea9PxQsFhiyjdoLbpV3";
  const tableId = "tbl8Zef1I5HocKbP";
  const endpoint = `https://open.larksuite.com/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}`;

  const email = req.query.email;
  const filter = `filter=CurrentValue.[会社メールアドレス]="${email}"`;
  const url = `${endpoint}/records?${filter}`;
  const result = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
    },
  });

  if (
    result.data.error ||
    !result.data.data.items ||
    result.data.data.items?.length === 0
  ) {
    res.status(200).json(null);
    return;
  }

  const item = result.data.data.items[0];
  const memberData = {
    id: item.id,
    memberId: item.fields["メンバーID"],
    name: item.fields["名前"],
    nameKana: item.fields["名前（カナ）"],
    email: item.fields["会社メールアドレス"]["text"],
    isEmployee: false, // RemoteSalesなのでfalse固定
  };

  res.json(memberData);
};

// RemoteSalesのデータを新規作成
exports.createRemoteSalesData = async (req, res) => {
  const appAccessToken = await getAppAccessToken();

  // メンバー一覧を取得
  const homeWorkers = await getTableRecords(appAccessToken, true);

  // 最後に登録したメンバーのメンバーIDを取得
  const lastHomeWorkerId = homeWorkers.data.items.at(-1).fields["メンバーID"];

  // そのIDの数字の部分を+1する
  const newHomeWorkerId = lastHomeWorkerId.replace(/RS-/, "");
  const newHomeWorkerIdNumber = parseInt(newHomeWorkerId) + 1;
  const newHomeWorkerIdWithPrefix = `RS-${newHomeWorkerIdNumber}`;

  // そのID+リクエストパラメータを使用してレコードを作成
  const params = req.body.newHomeWorkerValue;
  const fields = {
    メンバーID: newHomeWorkerIdWithPrefix,
    名前: params.name,
    "名前（カナ）": params.nameKana,
    個人メールアドレス: params.personalAddress,
    個人電話番号: params.phoneNumber,
    振込先銀行名: params.bankName,
    振込先支店名: params.branchName,
    振込先口座種別: params.accountType,
    口座番号: params.accountNumber,
    口座名義人: params.accountHolder,
    生年月日: params.birthday,
    住民票所在地: params.address,
    住まい住所: params.home,
    最短勤務可能日: params.earliestStartDate,
    "稼働想定時間（月）": params.estimatedWorkingHoursPerMonth,
    退職フラグ: "在職中",
  };

  // 時給DBにレコードを追加する
  const appToken = "EyI0b8tEea9PxQsFhiyjdoLbpV3";
  const tableId = "tbl8Zef1I5HocKbP";

  const endpoint = `https://open.larksuite.com/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
  const response = await axios.post(
    endpoint,
    {
      fields,
    },
    {
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  // エラーが出たらそこで処理を止める
  if (response.data.error) {
    res.status(400).json({
      message: "エラーが発生しました。再度登録してください。",
      ...response.data,
    });
    return;
  }

  // 時給マスタにデータを保存する
  const result = await axios.post(
    `https://open.larksuite.com/open-apis/bitable/v1/apps/TsdJbCkPIa2N3osmoCVj2aYypDg/tables/tblEllg3rc0imqqG/records`,
    {
      fields: {
        名前: params.name,
        役職: "メンバー",
        時給: 1300, // いったん1300固定、変更があれば保存後にBaseから修正する
        開始期間: params.earliestStartDate,
        退職フラグ: "在職中",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (result.data.error) {
    res.status(400).json({
      message: "エラーが発生しました。再度登録してください。",
      ...result.data,
    });
    return;
  }

  res.json({
    message: "メンバーを追加しました。",
  });
};
