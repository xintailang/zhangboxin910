/**
 * 姓名：zhangboxin
 * 学号：24001010910
 * 时间：2026-11-19
 * 大模型：DeepSeek-V4.1-Flash
 *
 * 科技新闻控制器：从 MySQL 读取新闻列表
 */
const { zbxPool } = require('../models/zbx_db');

exports.zbxGetNewsList = async (req, res) => {
  try {
    const [zbxRows] = await zbxPool.query(
      `SELECT
         zbx_id,
         zbx_title,
         zbx_summary,
         zbx_source,
         zbx_category,
         zbx_author,
         DATE_FORMAT(zbx_publish_time, '%Y-%m-%d %H:%i') AS zbx_publish_time,
         zbx_views
       FROM zbx_news
       ORDER BY zbx_publish_time DESC, zbx_id DESC`
    );

    res.json({
      code: 0,
      msg: '获取科技新闻列表成功',
      data: {
        zbxTotal: zbxRows.length,
        zbxList: zbxRows
      }
    });
  } catch (zbxError) {
    console.error('查询科技新闻失败：', zbxError.code, zbxError.message);
    res.json({
      code: 1,
      msg: '查询科技新闻失败：' + zbxError.message,
      data: { zbxTotal: 0, zbxList: [] }
    });
  }
};
