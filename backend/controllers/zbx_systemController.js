/**
 * 姓名：zhangboxin
 * 学号：24001010910
 * 时间：2026-11-19
 * 大模型：DeepSeek-V4.1-Flash
 *
 * 系统控制器
 */
exports.zbxGetHealth = (req, res) => {
  res.json({
    code: 0,
    msg: '服务运行正常',
    data: {
      zbxProjectName: '校园二手交易平台',
      zbxStudentName: 'zhangboxin',
      zbxStudentId: '24001010910',
      zbxPort: Number(process.env.PORT) || 8910,
      zbxTime: new Date().toLocaleString('zh-CN')
    }
  });
};
