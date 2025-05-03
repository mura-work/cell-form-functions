const axios = require("axios");

// 1. app_access_tokenを取得
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

// 2. テーブルレコード一覧を取得
const getTableRecords = async (appAccessToken) => {
  const appToken = "TsdJbCkPIa2N3osmoCVj2aYypDg";
  const tableId = "tblGBaTJASX5soWr";
  const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?page_size=20`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
    },
  });
  return res.data;
};

exports.getHomeWorkers = async (_, res) => {
  const appAccessToken = await getAppAccessToken();
  const tableRecords = await getTableRecords(appAccessToken);

  res.json(tableRecords);
};
