const axios = require("axios");

// 在宅ワーカーの取得
exports.getHomeWorkers = async (_, res) => {
  const databaseId =
    process.env.REACT_APP_NOTION_HOME_WORKER_MANAGEMENT_DB_ENDPOINT_ID;

  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        sorts: [
          {
            property: "メンバーID",
            direction: "ascending",
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error querying Notion database:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 在宅ワーカーをDBに登録する
exports.postRegisterNewHomeWorker = async (req, res) => {
  try {
    // 在宅ワーカーの人数を取得
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${process.env.REACT_APP_NOTION_HOME_WORKER_MANAGEMENT_DB_ENDPOINT_ID}/query`,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    const homeWorkerCount = response.data.results.length;

    const newHomeWorkerValue = req.body.newHomeWorkerValue;

    const requestParams = {
      parent: {
        database_id:
          process.env.REACT_APP_NOTION_HOME_WORKER_MANAGEMENT_DB_ENDPOINT_ID,
      },
      properties: {
        メンバーID: {
          title: [
            {
              text: { content: `ZW-${homeWorkerCount + 1}` },
            },
          ],
        },
        名前: {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.name },
            },
          ],
        },
        "名前（カナ）": {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.nameKana },
            },
          ],
        },
        個人メールアドレス: {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.personalAddress },
            },
          ],
        },
        個人電話番号: {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.phoneNumber },
            },
          ],
        },
        振込先銀行名: {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.bankName },
            },
          ],
        },
        振込先支店名: {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.branchName },
            },
          ],
        },
        振込先口座種別: {
          select: {
            name: newHomeWorkerValue.accountType,
          },
        },
        口座番号: {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.accountNumber },
            },
          ],
        },
        口座名義人: {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.accountHolder },
            },
          ],
        },
        生年月日: {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.birthday },
            },
          ],
        },
        住民票所在地: {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.address },
            },
          ],
        },
        住まい住所: {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.home },
            },
          ],
        },
        最短勤務可能日: {
          date: { start: newHomeWorkerValue.earliestStartDate },
        },
        "稼働想定時間（月）": {
          number: newHomeWorkerValue.estimatedWorkingHoursPerMonth,
        },
      },
    };

    // 在宅ワーカー管理DBに登録
    await axios.post(process.env.REACT_APP_NOTION_API_URL, requestParams, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28", // Notion APIバージョン
      },
    });

    // メンバー用DBに登録
    const memberRequestParams = {
      parent: {
        database_id:
          process.env.REACT_APP_NOTION_HOME_WORK_MEMBER_DB_ENDPOINT_ID,
      },
      properties: {
        メンバーID: {
          title: [
            {
              text: { content: `ZW-${homeWorkerCount + 1}` },
            },
          ],
        },
        名前: {
          rich_text: [
            {
              type: "text",
              text: { content: newHomeWorkerValue.name },
            },
          ],
        },
        入社日: {
          date: { start: newHomeWorkerValue.earliestStartDate },
        },
      },
    };

    await axios.post(
      process.env.REACT_APP_NOTION_API_URL,
      memberRequestParams,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28", // Notion APIバージョン
        },
      }
    );

    res.json({ message: "Success" });
  } catch (e) {
    console.error(e);

    // エラー時のレスポンス
    res.status(error.response?.status || 500).json({
      message: "Failed to send data to Notion.",
      error: error.response?.data || "An unexpected error occurred.",
    });
  }
};
