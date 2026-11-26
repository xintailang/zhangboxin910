/**
 * 姓名：zhangboxin
 * 学号：24001010910
 * 时间：2026-11-19
 * 大模型：DeepSeek-V4.1-Flash
 *
 * 图文列表控制器：从 MySQL 读取图文数据
 */
const { zbxPool } = require('../models/zbx_db');

exports.zbxGetGalleryList = async (req, res) => {
  try {
    const [zbxRows] = await zbxPool.query(
      `SELECT
         id,
         title,
         description,
         img_url,
         category,
         DATE_FORMAT(create_time, '%Y-%m-%d %H:%i') AS create_time
       FROM zbx_gallery
       ORDER BY create_time DESC, id DESC`
    );

    res.json({
      code: 0,
      msg: '获取图文列表成功',
      data: {
        zbxTotal: zbxRows.length,
        zbxList: zbxRows
      }
    });
  } catch (zbxError) {
    console.error('查询图文列表失败：', zbxError.code, zbxError.message);
    res.json({
      code: 1,
      msg: '查询图文列表失败：' + zbxError.message,
      data: { zbxTotal: 0, zbxList: [] }
    });
  }
};
