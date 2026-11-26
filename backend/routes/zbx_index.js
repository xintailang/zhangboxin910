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
const zbxDatabaseController = require('../controllers/zbx_databaseController');
const zbxNewsController = require('../controllers/zbx_newsController');
const zbxGalleryController = require('../controllers/zbx_galleryController');
const zbxChatController = require('../controllers/zbx_chatController');
const zbxServiceController = require('../controllers/zbx_serviceController');
const zbxLlmController = require('../controllers/zbx_llmController');

const zbxRouter = express.Router();

// 服务健康检查
zbxRouter.get('/health', zbxSystemController.zbxGetHealth);

// 测试 MySQL 数据库连接
zbxRouter.post('/database/connect', zbxDatabaseController.zbxConnectDatabase);

// 科技新闻列表
zbxRouter.get('/news', zbxNewsController.zbxGetNewsList);

// 图文列表
zbxRouter.get('/gallery', zbxGalleryController.zbxGetGalleryList);

// AI 聊天（硅基流动）
zbxRouter.post('/chat', zbxChatController.zbxChat);

// 在线客服（七牛云）
zbxRouter.post('/service', zbxServiceController.zbxService);

// LLM 实践：知识库
zbxRouter.post('/llm/kb/upload', zbxLlmController.zbxKbUpload);
zbxRouter.get('/llm/kb', zbxLlmController.zbxKbList);
zbxRouter.post('/llm/kb/ask', zbxLlmController.zbxKbAsk);

// LLM 实践：图像识别
zbxRouter.post('/llm/vision', zbxLlmController.zbxVision);

// LLM 实践：语音识别
zbxRouter.post('/llm/asr', zbxLlmController.zbxAsr);

module.exports = zbxRouter;
