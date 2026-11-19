/**
 * 姓名：zhangboxin
 * 学号：24001010910
 * 时间：2026-11-19
 * 大模型：DeepSeek-V4.1-Flash
 *
 * 服务入口：启动 Express 服务
 */
const zbxApp = require('./app');

const zbxPort = Number(process.env.PORT) || 8910;

zbxApp.listen(zbxPort, () => {
  console.log(`校园二手交易平台服务已启动：http://localhost:${zbxPort}`);
});
