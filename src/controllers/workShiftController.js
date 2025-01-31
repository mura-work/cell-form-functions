const axios = require("axios");

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
