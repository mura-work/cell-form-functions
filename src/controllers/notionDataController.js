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
