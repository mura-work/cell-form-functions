const axios = require("axios");

// 勤怠管理DBのデータを一覧で取得
exports.getWorkAttendances = async (req, res) => {
  try {
    const workAttendances = await axios.post(
      `https://api.notion.com/v1/databases/${process.env.REACT_APP_NOTION_HOME_WORK_ATTENDANCE_DB_ENDPOINT_ID}/query`,
      {
        sorts: [
          {
            property: "登録日",
            direction: "descending",
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

    const results = workAttendances.data.results.map((result) => {
      return {
        id: result.id,
        workDate: result.properties.勤務日.title[0].text.content, // 勤務日
        workTimes: result.properties.勤務時刻.rich_text[0].text.content, // 勤務時刻
        memberId: result.properties.メンバーID.relation[0].id, // メンバーID
        workingTime: result.properties["勤務時間(m)"].number, // 勤務時間
        workingTimeHour: result.properties["勤務時間(h)"].number, // 勤務時間
        restTime: result.properties["休憩時間(m)"].number, // 休憩時間
        absenceTime: result.properties["中抜け時間(m)"].number, // 中抜け時間
        createdAt: result.properties["登録日"].created_time, // 登録日
      };
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// 勤怠管理情報を登録する
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

    const requestParamsValues = workAttendance.workAttendanceDataParams.map(
      (data) => {
        return {
          parent: {
            database_id:
              process.env.REACT_APP_NOTION_HOME_WORK_ATTENDANCE_DB_ENDPOINT_ID,
          },
          properties: {
            勤務日: {
              title: [
                {
                  text: { content: data.workDate },
                },
              ],
            },
            勤務時刻: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: data.workTimes,
                  },
                },
              ],
            },
            メンバーID: {
              relation: [{ id: workAttendance.memberId }],
            },
            "勤務時間(m)": {
              number: data.workingTime,
            },
            "勤務時間(h)": {
              number: data.workingTimeHour,
            },
            "休憩時間(m)": {
              number: data.restTime,
            },
            "中抜け時間(m)": {
              number: data.absenceTime,
            },
            給与管理DB: {
              relation: [{ id: payManagementData.data.results[0].id }],
            },
          },
        };
      }
    );

    // 在宅ワーカー管理DBに登録
    Promise.all(
      requestParamsValues.map(
        async (requestParams) =>
          await axios.post(
            process.env.REACT_APP_NOTION_API_URL,
            requestParams,
            {
              headers: {
                Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28", // Notion APIバージョン
              },
            }
          )
      )
    );

    res.json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};
