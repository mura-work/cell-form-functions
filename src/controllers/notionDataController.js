const axios = require("axios");

// 法人名（法人番号）の取得
exports.getClientCompanies = async (req, res) => {
  const databaseId = "13182b75468c80678161c6c6912b8d26"; // 本来であれば定数化するのが好ましい、、、

  try {
    const response = await axios({
      method: "post",
      url: `https://api.notion.com/v1/databases/${databaseId}/query`,
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error querying Notion database:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 担当者の取得
exports.getSalesEmployees = async (req, res) => {
  const databaseId = "13482b75468c80ec878aec03efd68241"; // 本来であれば定数化するのが好ましい、、、

  try {
    const response = await axios({
      method: "post",
      url: `https://api.notion.com/v1/databases/${databaseId}/query`,
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error querying Notion database:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 商品の取得
exports.getProducts = async (req, res) => {
  const databaseId = "13182b75468c80a9b766e570b5383762"; // 本来であれば定数化するのが好ましい、、、

  try {
    const response = await axios({
      method: "post",
      url: `https://api.notion.com/v1/databases/${databaseId}/query`,
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error querying Notion database:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// シフト管理DBに保存する
exports.postShiftManagement = async (req, res) => {
  const shiftRequestValues = req.body.shiftRequestValues;
  const homeWorkerName = req.body.homeWorkerName;
  const convertedShifts = shiftRequestValues.map(
    ({ date, startTime, endTime }) => {
      // "2025-01-01 09:00" などに結合して返す
      const startAt = `${date} ${startTime}`;
      const endAt = `${date} ${endTime}`;

      // 差分をミリ秒で計算
      const diffMilliseconds = Math.abs(
        new Date(`${date} ${endTime}`).getTime() -
          new Date(`${date} ${startTime}`).getTime()
      );

      // ミリ秒を時間に変換
      const workTime = diffMilliseconds / (1000 * 60 * 60);

      // Dateオブジェクトを受け取り、年と月を取得
      const year = new Date(date).getFullYear();
      const month = String(new Date(date).getMonth() + 1).padStart(2, "0");

      return {
        date,
        yearMonth: `${year}-${month}`,
        workTime,
        startDatetime: startAt,
        endDatetime: endAt,
      };
    }
  );

  const dateValues = convertedShifts.map((value) => {
    return {
      parent: {
        database_id:
          process.env.REACT_APP_NOTION_HOME_WORKER_SHIFT_DB_ENDPOINT_ID,
      },
      properties: {
        名前: {
          title: [
            {
              text: { content: homeWorkerName },
            },
          ],
        },
        勤務開始時間: {
          date: { start: value.startDatetime },
        },
        勤務終了時間: {
          date: { start: value.endDatetime },
        },
        勤務時間: {
          number: value.workTime,
        },
        勤務月: {
          rich_text: [
            {
              type: "text",
              text: {
                content: value.yearMonth,
              },
            },
          ],
        },
      },
    };
  });

  try {
    await Promise.all(
      dateValues.map(async (dateValue) => {
        await axios.post(process.env.REACT_APP_NOTION_API_URL, dateValue, {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28", // Notion APIバージョン
          },
        });
      })
    );
  } catch (e) {
    console.error(e);
  }

  res.json({ message: "Success" });
};

// 在宅ワーカーの取得
exports.getHomeWorkers = async (req, res) => {
  const databaseId =
    process.env.REACT_APP_NOTION_HOME_WORKER_MANAGEMENT_DB_ENDPOINT_ID;

  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {},
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
