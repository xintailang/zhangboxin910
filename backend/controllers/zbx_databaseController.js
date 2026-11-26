/**
 * 姓名：zhangboxin
 * 学号：24001010910
 * 时间：2026-11-19
 * 大模型：DeepSeek-V4.1-Flash
 *
 * 数据库控制器：使用用户输入的用户名/密码测试 MySQL 连接
 */
const mysql = require('mysql2/promise');

exports.zbxConnectDatabase = async (req, res) => {
  const zbxUserName = String(req.body.zbx_user || '').trim();
  const zbxPassword = String(req.body.zbx_password || '');
  let zbxConnection = null;

  if (!zbxUserName) {
    return res.json({ code: 1, msg: '请输入数据库用户名', data: {} });
  }

  try {
    zbxConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: 3306,
      user: zbxUserName,
      password: zbxPassword,
      connectTimeout: 5000
    });

    const [zbxRows] = await zbxConnection.query(
      'SELECT VERSION() AS zbx_version, CURRENT_USER() AS zbx_current_user'
    );
    const [zbxDbRows] = await zbxConnection.query('SHOW DATABASES');

    const zbxDatabases = zbxDbRows.map((zbxRow) => zbxRow.Database);

    res.json({
      code: 0,
      msg: '数据库连接成功',
      data: {
        zbxHost: process.env.DB_HOST || 'localhost',
        zbxVersion: zbxRows[0].zbx_version,
        zbxCurrentUser: zbxRows[0].zbx_current_user,
        zbxDatabaseCount: zbxDatabases.length,
        zbxDatabases: zbxDatabases
      }
    });
  } catch (zbxError) {
    console.error('数据库连接失败：', zbxError.code, zbxError.message);

    let zbxErrorMessage = '数据库连接失败：' + zbxError.message;

    if (zbxError.code === 'ER_ACCESS_DENIED_ERROR') {
      zbxErrorMessage = '用户名或密码错误，连接被拒绝';
    } else if (zbxError.code === 'ECONNREFUSED') {
      zbxErrorMessage = '无法连接 MySQL 服务，请确认 MySQL 已启动且端口 3306 可用';
    } else if (zbxError.code === 'ENOTFOUND') {
      zbxErrorMessage = '找不到数据库主机地址，请检查配置';
    } else if (zbxError.code === 'ETIMEDOUT') {
      zbxErrorMessage = '连接 MySQL 超时，请检查网络或服务状态';
    }

    res.json({ code: 1, msg: zbxErrorMessage, data: {} });
  } finally {
    if (zbxConnection) {
      await zbxConnection.end();
    }
  }
};
