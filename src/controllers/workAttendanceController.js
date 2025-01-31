const axios = require("axios");

// シフト情報を登録する
exports.postWorkAttendance = async (req, res) => {
  const workAttendance = req.body.workAttendanceParams;

  try {
    // 給与管理DBと紐づけるので、その月の値を取得する
    const payManagementData = await axios.post(
      `https://api.notion.com/v1/databases/${process.env.REACT_APP_NOTION_HOME_WORK_PAY_MANAGEMENT_DB_ENDPOINT_ID}/query`,
      {
        filter: {
          property: "名前",
          title: {
            equals: workAttendance.relationMemberData,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    if (payManagementData.data.results.length === 0) {
      throw new Error("pay management data not found");
    }

    const requestParams = {
      parent: {
        database_id:
          process.env.REACT_APP_NOTION_HOME_WORK_ATTENDANCE_DB_ENDPOINT_ID,
      },
      properties: {
        勤務日: {
          title: [
            {
              text: { content: workAttendance.workDate },
            },
          ],
        },
        勤務時刻: {
          rich_text: workAttendance.workTimes.map((time) => ({
            type: "text",
            text: { content: time },
          })),
        },
        メンバーID: {
          relation: [{ id: workAttendance.memberId }],
        },
        "勤務時間(m)": {
          number: workAttendance.workingTime,
        },
        "勤務時間(h)": {
          number: workAttendance.workingTimeHour,
        },
        "休憩時間(m)": {
          number: workAttendance.sumRestTime,
        },
        給与管理DB: {
          relation: [{ id: payManagementData.data.results[0].id }],
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

    res.json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};
