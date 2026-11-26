/**
 * 姓名：zhangboxin
 * 学号：24001010910
 * 时间：2026-11-19
 * 大模型：DeepSeek-V4.1-Flash
 *
 * Express 应用装配：跨域、请求体解析、API 路由、静态资源托管
 */
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const zbxRoutes = require('./routes/zbx_index');

const zbxApp = express();

// 课程作业：开放全部跨域访问
zbxApp.use(cors());
// LLM 实践需上传图片/音频（base64），放宽请求体上限到 30MB
zbxApp.use(express.json({ limit: '30mb' }));
zbxApp.use(express.urlencoded({ extended: true, limit: '30mb' }));

// 所有接口统一以 /api 为前缀
zbxApp.use('/api', zbxRoutes);

// 托管前端静态资源
zbxApp.use(express.static(path.join(__dirname, '..', 'frontend')));

// 未匹配到的接口统一返回 JSON
zbxApp.use((req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在', data: {} });
});

// 统一错误处理
zbxApp.use((err, req, res, next) => {
  console.error('服务器内部错误：', err);
  res.status(500).json({ code: 500, msg: '服务器内部错误', data: {} });
});

module.exports = zbxApp;
