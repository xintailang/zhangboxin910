/**
 * 姓名：zhangboxin
 * 学号：24001010910
 * 时间：2026-11-19
 * 大模型：DeepSeek-V4.1-Flash
 *
 * API 路由汇总
 */
const express = require('express');
const zbxSystemController = require('../controllers/zbx_systemController');

const zbxRouter = express.Router();

// 服务健康检查
zbxRouter.get('/health', zbxSystemController.zbxGetHealth);

module.exports = zbxRouter;
