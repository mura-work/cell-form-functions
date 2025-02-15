const axios = require("axios");

// 勤怠管理DBのデータを一覧で取得
exports.getWorkAttendances = async (req, res) => {
  const memberId = req.query.memberId;

  const body = {
    sorts: [
      {
        property: "登録日",
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
    const workAttendances = await axios.post(
      `https://api.notion.com/v1/databases/${process.env.REACT_APP_NOTION_HOME_WORK_ATTENDANCE_DB_ENDPOINT_ID}/query`,
      body,
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
        memberId: result.properties.メンバーID.rich_text[0].text.content, // メンバーID
        memberName:
          result.properties.名前.rollup.array[0].rich_text[0].text.content, // メンバー名
        workDate: result.properties.勤務日.title[0].text.content, // 勤務日
        workTimes: result.properties.勤務時刻.rich_text[0].text.content, // 勤務時刻
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
          property: "給与月",
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
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: workAttendance.memberId,
                  },
                },
              ],
            },
            "メンバーID（リレーション）": {
              relation: [{ id: workAttendance.memberRollupId }],
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

// 勤怠DBのレコードを更新するエンドポイント
exports.updateWorkAttendance = async (req, res) => {
  const { workAttendanceData } = req.body;

  // 更新する各プロパティを作成
  const properties = {
    勤務日: {
      title: [
        {
          text: {
            content: workAttendanceData.workDate,
          },
        },
      ],
    },
    勤務時刻: {
      rich_text: [
        {
          text: {
            content: workAttendanceData.workTimes,
          },
        },
      ],
    },
    // 数値のフィールド（null や undefined であれば更新対象から除外するなど、必要に応じた処理を行ってください）
    "勤務時間(m)": {
      number: workAttendanceData.workingTime,
    },
    "勤務時間(h)": {
      number: workAttendanceData.workingTimeHour,
    },
    "休憩時間(m)": {
      number: workAttendanceData.restTime,
    },
    "中抜け時間(m)": {
      number: workAttendanceData.absenceTime,
    },
    // 必要に応じて他のプロパティも追加
  };

  try {
    const updateResponse = await axios.patch(
      `https://api.notion.com/v1/pages/${workAttendanceData.id}`,
      { properties },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );
    console.log(updateResponse.data);
    res.json(updateResponse.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "勤怠情報の更新に失敗しました" });
  }
};

// 勤怠DBのレコードを削除（アーカイブ）するエンドポイント
exports.deleteWorkAttendance = async (req, res) => {
  // URLパラメータから Notion のページID を取得する想定です
  const id = req.params.id;

  // 必須パラメータのチェック
  if (!id) {
    return res.status(400).json({ error: "Missing required field: id" });
  }

  try {
    // 削除の代わりに、Notion の仕様に従い、ページをアーカイブします
    const deleteResponse = await axios.patch(
      `https://api.notion.com/v1/pages/${id}`,
      { archived: true },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      message: "勤怠情報を削除しました。",
      data: deleteResponse.data,
    });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "勤怠情報の削除に失敗しました" });
  }
};
