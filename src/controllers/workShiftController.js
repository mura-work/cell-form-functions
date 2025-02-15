const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const axios = require("axios");

// プラグインの初期化
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 入力形式 "YYYY-MM-DD HH:mm" の文字列に対して、Asia/Tokyo のタイムゾーンを付与して ISO8601 形式に変換
 * @param dateStr - "YYYY-MM-DD HH:mm" 形式の日時文字列
 * @returns タイムゾーン付き ISO8601 形式の文字列
 */
const addTimezoneWithDayjs = (dateStr) => {
  return dayjs.tz(dateStr, "YYYY-MM-DD HH:mm", "Asia/Tokyo").format();
};

// シフト管理DBのデータを一覧で取得
exports.getShiftManagements = async (req, res) => {
  const databaseId =
    process.env.REACT_APP_NOTION_HOME_WORKER_SHIFT_DB_ENDPOINT_ID;

  const memberId = req.query.memberId;

  const body = {
    sorts: [
      {
        property: "勤務開始時間",
        direction: "descending",
      },
    ],
  };

  if (memberId) {
    body.filter = {
      property: "メンバーID",
      rich_text: {
        equals: memberId,
      },
    };
  }

  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      body,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    const results = response.data.results.map((result) => {
      return {
        id: result.id,
        memberId: result.properties.メンバーID.rich_text[0].text.content, // メンバーID
        name: result.properties.名前.title[0].text.content, // 名前
        startTime: result.properties.勤務開始時間.date.start, // 勤務開始時間
        endTime: result.properties.勤務終了時間.date.start, // 勤務終了時間
        createdAt: result.properties.登録日.created_time, // 登録日
      };
    });

    res.json(results);
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
  const memberId = req.body.memberId;
  const convertedShifts = shiftRequestValues.map(
    ({ date, startTime, endTime }) => {
      // "2025-01-01 09:00" などに結合して返す
      const startAt = addTimezoneWithDayjs(`${date} ${startTime}`);
      const endAt = addTimezoneWithDayjs(`${date} ${endTime}`);

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
        メンバーID: {
          rich_text: [
            {
              type: "text",
              text: {
                content: memberId,
              },
            },
          ],
        },
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

// シフト管理DBのデータを編集する
exports.updateShiftManagement = async (req, res) => {
  const { id, date, startTime, endTime } = req.body;

  // 必須パラメータのチェック
  if (!id || !date || !startTime || !endTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 日時文字列にタイムゾーンを付与して ISO8601 形式に変換
    const startDatetime = addTimezoneWithDayjs(`${date} ${startTime}`);
    const endDatetime = addTimezoneWithDayjs(`${date} ${endTime}`);

    // ミリ秒単位の差分から勤務時間（時間単位）を算出
    const diffMilliseconds = Math.abs(
      new Date(`${date} ${endTime}`).getTime() -
        new Date(`${date} ${startTime}`).getTime()
    );
    const workTime = diffMilliseconds / (1000 * 60 * 60);

    // 更新用のデータを作成
    const updateData = {
      properties: {
        勤務開始時間: {
          date: { start: startDatetime },
        },
        勤務終了時間: {
          date: { start: endDatetime },
        },
        勤務時間: {
          number: workTime,
        },
      },
    };

    // Notion API のページ更新エンドポイントに PATCH リクエストを送信
    const response = await axios.patch(
      `https://api.notion.com/v1/pages/${id}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
      }
    );
    const result = response.data.properties;

    res.status(200).json({
      startTime: result.勤務開始時間.date.start,
      endTime: result.勤務終了時間.date.start,
    });
  } catch (error) {
    console.error(
      "Error updating Notion page:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// シフト管理DBのデータを削除（アーカイブ）する
exports.deleteShiftManagement = async (req, res) => {
  // URLパラメータからIDを取得
  const { id } = req.params;

  // 必須パラメータのチェック
  if (!id) {
    return res.status(400).json({ error: "Missing required field: id" });
  }

  try {
    // Notion API のページ更新エンドポイントを利用して、archived を true に設定することで削除状態にする
    await axios.patch(
      `https://api.notion.com/v1/pages/${id}`,
      { archived: true },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
      }
    );

    res.json({ message: "Shift deleted successfully" });
  } catch (error) {
    console.error(
      "Error deleting Notion page:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};
