# zhangboxin 接口记录

格式：接口路径 | HTTP 方法 | 请求参数（含示例） | 响应格式（含 JSON 示例） | 修改时间

## 服务健康检查

- 接口路径：`/api/health`
- HTTP 方法：`GET`
- 请求参数：无

  ```http
  GET http://localhost:8910/api/health
  ```

- 响应格式：

  ```json
  {
    "code": 0,
    "msg": "服务运行正常",
    "data": {
      "zbxProjectName": "校园二手交易平台",
      "zbxStudentName": "zhangboxin",
      "zbxStudentId": "24001010910",
      "zbxPort": 8910,
      "zbxTime": "2026/11/19 13:53:33"
    }
  }
  ```

- 修改时间：2026-11-19 13:53

## 测试数据库连接

- 接口路径：`/api/database/connect`
- HTTP 方法：`POST`
- 请求参数（JSON）：

  ```json
  {
    "zbx_user": "root",
    "zbx_password": "zbx12345"
  }
  ```

- 响应格式（成功）：

  ```json
  {
    "code": 0,
    "msg": "数据库连接成功",
    "data": {
      "zbxHost": "localhost",
      "zbxVersion": "8.0.43",
      "zbxCurrentUser": "root@localhost",
      "zbxDatabaseCount": 5,
      "zbxDatabases": ["information_schema", "mysql", "performance_schema", "sys", "zbx_campus_trade"]
    }
  }
  ```

- 响应格式（失败）：

  ```json
  { "code": 1, "msg": "用户名或密码错误，连接被拒绝", "data": {} }
  ```

- 修改时间：2026-11-19 14:06

## 获取科技新闻列表

- 接口路径：`/api/news`
- HTTP 方法：`GET`
- 请求参数：无

  ```http
  GET http://localhost:8910/api/news
  ```

- 响应格式（成功）：

  ```json
  {
    "code": 0,
    "msg": "获取科技新闻列表成功",
    "data": {
      "zbxTotal": 2,
      "zbxList": [
        {
          "zbx_id": 1,
          "zbx_title": "国产大模型集中发布新版本，多模态能力成为竞争焦点",
          "zbx_summary": "多家国内厂商在同一周内更新大模型版本，视频理解与语音交互成为主要比拼方向。",
          "zbx_source": "新华科技",
          "zbx_category": "人工智能",
          "zbx_author": "李明",
          "zbx_publish_time": "2026-11-18 09:30",
          "zbx_views": 1820
        }
      ]
    }
  }
  ```

- 响应格式（失败）：

  ```json
  { "code": 1, "msg": "查询科技新闻失败：xxx", "data": { "zbxTotal": 0, "zbxList": [] } }
  ```

- 修改时间：2026-11-19 14:15

## 获取图文列表

- 接口路径：`/api/gallery`
- HTTP 方法：`GET`
- 请求参数：无

  ```http
  GET http://localhost:8910/api/gallery
  ```

- 响应格式（成功）：

  ```json
  {
    "code": 0,
    "msg": "获取图文列表成功",
    "data": {
      "zbxTotal": 1,
      "zbxList": [
        {
          "zbx_id": 1,
          "zbx_title": "九成新山地自行车",
          "zbx_description": "毕业出，骑行一年，刹车与变速正常，附赠车锁与打气筒，可在校门口自提。",
          "zbx_image_url": "/images/zbx_gallery_bike.jpg",
          "zbx_tag": "出行",
          "zbx_price": "320.00",
          "zbx_author": "林同学",
          "zbx_likes": 42,
          "zbx_create_time": "2026-11-18 10:20"
        }
      ]
    }
  }
  ```

- 响应格式（失败）：

  ```json
  { "code": 1, "msg": "查询图文列表失败：xxx", "data": { "zbxTotal": 0, "zbxList": [] } }
  ```

- 修改时间：2026-11-19 14:23

## 获取图文列表（字段调整版）

- 接口路径：`/api/gallery`
- HTTP 方法：`GET`
- 请求参数：无

  ```http
  GET http://localhost:8910/api/gallery
  ```

- 说明：表 `zbx_gallery` 字段调整为 `id`、`title`、`description`、`img_url`、`category`、`create_time`，接口按创建时间倒序返回全部图文数据。

- 响应格式（成功）：

  ```json
  {
    "code": 0,
    "msg": "获取图文列表成功",
    "data": {
      "zbxTotal": 8,
      "zbxList": [
        {
          "id": 1,
          "title": "九成新山地自行车",
          "description": "毕业出，骑行一年，刹车与变速正常，附赠车锁与打气筒，可在校门口自提。",
          "img_url": "/images/zbx_gallery_bike.jpg",
          "category": "出行",
          "create_time": "2026-11-18 10:20"
        }
      ]
    }
  }
  ```

- 响应格式（失败）：

  ```json
  { "code": 1, "msg": "查询图文列表失败：xxx", "data": { "zbxTotal": 0, "zbxList": [] } }
  ```

- 修改时间：2026-11-19 14:31

## AI 聊天（硅基流动）

- 接口路径：`/api/chat`
- HTTP 方法：`POST`
- 说明：调用硅基流动（SiliconFlow）OpenAI 兼容聊天补全接口，默认模型 `Qwen/Qwen2.5-7B-Instruct`。支持传入完整消息数组或单条消息 + 历史，实现多轮对话。API Key 存储在 `backend/.env` 的 `SILICONFLOW_API_KEY`。

- 请求参数（JSON，方式一：单条消息 + 历史）：

  ```json
  {
    "zbx_message": "你好，请介绍一下你自己",
    "zbx_history": [
      { "role": "user", "content": "你叫什么名字？" },
      { "role": "assistant", "content": "我是 AI 助手。" }
    ],
    "zbx_model": "Qwen/Qwen2.5-7B-Instruct"
  }
  ```

- 请求参数（JSON，方式二：完整消息数组）：

  ```json
  {
    "zbx_messages": [
      { "role": "system", "content": "你是一个乐于助人的助手。" },
      { "role": "user", "content": "用一句话介绍硅基流动" }
    ]
  }
  ```

- 响应格式（成功）：

  ```json
  {
    "code": 0,
    "msg": "AI 回复成功",
    "data": {
      "zbx_reply": "硅基流动是一个提供大模型推理服务的平台……",
      "zbx_model": "Qwen/Qwen2.5-7B-Instruct",
      "zbx_messages": [
        { "role": "user", "content": "用一句话介绍硅基流动" },
        { "role": "assistant", "content": "硅基流动是一个提供大模型推理服务的平台……" }
      ]
    }
  }
  ```

- 响应格式（失败）：

  ```json
  { "code": 1, "msg": "AI 回复失败：xxx", "data": {} }
  ```

- 修改时间：2026-11-23

## AI 聊天（messages 数组版）

- 接口路径：`/api/chat`
- HTTP 方法：`POST`
- 说明：按作业要求调整——接收前端 `messages` 数组 → 带上 `.env` 中的 Key 转发给硅基流动 → 把模型回答原样返回。模型统一读取 `backend/.env` 的 `SILICONFLOW_MODEL`（当前 `deepseek-ai/DeepSeek-V4-Flash`）。多轮对话由前端维护 `messages` 数组实现，每轮把用户消息与 AI 回复都 push 进去后整体发送。

- 请求参数（JSON）：

  ```json
  {
    "messages": [
      { "role": "user", "content": "我最喜欢的颜色是蓝色，请记住" },
      { "role": "assistant", "content": "好的，我记住了，你最喜欢的颜色是蓝色。" },
      { "role": "user", "content": "我最喜欢什么颜色？" }
    ]
  }
  ```

- 响应格式（成功）：

  ```json
  {
    "code": 0,
    "msg": "AI 回复成功",
    "data": {
      "content": "你最喜欢的颜色是**蓝色**。需要我为你推荐一些蓝色的搭配灵感或相关事物吗？ 😊",
      "role": "assistant",
      "model": "deepseek-ai/DeepSeek-V4-Flash"
    }
  }
  ```

- 响应格式（失败）：

  ```json
  { "code": 1, "msg": "AI 回复失败：xxx", "data": {} }
  ```

- 修改时间：2026-11-23

## 在线客服（七牛云）

- 接口路径：`/api/service`
- HTTP 方法：`POST`
- 说明：在线客服接口。接收前端 `messages` 数组 → 带上 `backend/.env` 的 `QINIU_API_KEY` 转发给七牛云 AI 推理（OpenAI 兼容，BaseURL `https://api.qnaigc.com/v1`）→ 把模型回答原样返回。模型读取 `QINIU_MODEL`（当前 `qiniu/conatus-free`）。后端会自动补充客服人设 system 提示词；多轮对话由前端维护 `messages` 数组实现。

- 请求参数（JSON）：

  ```json
  {
    "messages": [
      { "role": "user", "content": "怎么发布一件商品？" }
    ]
  }
  ```

- 响应格式（成功）：

  ```json
  {
    "code": 0,
    "msg": "客服回复成功",
    "data": {
      "content": "发布商品步骤如下：登录后点击“发布闲置”，填写标题、价格、描述并上传图片，提交即可。",
      "role": "assistant",
      "model": "qiniu/conatus-free"
    }
  }
  ```

- 响应格式（失败）：

  ```json
  { "code": 1, "msg": "客服回复失败：xxx", "data": {} }
  ```

- 备注：使用 `qiniu/conatus-free` 免费模型前，七牛云账号需先完成实名认证（https://portal.qiniu.com/developer/user/identity），否则返回 `Please complete identity verification before using this free model`。

- 修改时间：2026-11-26

## AI 聊天（多平台切换版）

- 接口路径：`/api/chat`
- HTTP 方法：`POST`
- 说明：按验收任务改造。`provider` 可选 `siliconflow`（硅基流动，默认）或 `qiniu`（七牛），各平台 Key/BaseURL/模型全部从 `backend/.env` 读取，换平台只改配置。后端自动注入“中华美食街在线客服”人设 system 提示词（只答营业时间、招牌菜、配送范围，其余礼貌引导留言）。鉴权失败统一返回 Key 无效友好提示。

- 请求参数（JSON）：

  ```json
  {
    "messages": [
      { "role": "user", "content": "你们几点开门？" }
    ],
    "provider": "siliconflow"
  }
  ```

- 响应格式（成功）：

  ```json
  {
    "code": 0,
    "msg": "AI 回复成功",
    "data": {
      "content": "您好，我们每天 10:00 开门营业，22:00 打烊，全年无休哦～ 欢迎光临！",
      "role": "assistant",
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "provider": "siliconflow",
      "providerLabel": "硅基流动"
    }
  }
  ```

- 响应格式（Key 无效）：

  ```json
  { "code": 1, "msg": "API Key 无效或已过期，请检查 backend/.env 中对应平台的 Key 配置", "data": {} }
  ```

- 响应格式（其他失败）：

  ```json
  { "code": 1, "msg": "AI 回复失败：xxx", "data": {} }
  ```

- 修改时间：2026-11-26

## LLM 实践：知识库上传

- 接口路径：`/api/llm/kb/upload`
- HTTP 方法：`POST`
- 说明：前端读取 txt/md 文本后以 JSON 提交，后端按 400 字切片（重叠 60）存入内存知识库。服务重启后知识库清空。

- 请求参数：

  ```json
  { "name": "中华美食街商家手册.txt", "content": "营业时间：每天上午 10:00 至晚上 22:00……" }
  ```

- 响应格式：

  ```json
  { "code": 0, "msg": "上传成功", "data": { "id": "doc_1795672673498", "name": "中华美食街商家手册.txt", "chunks": 1, "charCount": 135 } }
  ```

- 修改时间：2026-11-26

## LLM 实践：知识库文档列表

- 接口路径：`/api/llm/kb`
- HTTP 方法：`GET`
- 说明：返回当前内存知识库中的文档列表。

- 响应格式：

  ```json
  { "code": 0, "msg": "查询成功", "data": { "docs": [ { "id": "doc_1795672673498", "name": "中华美食街商家手册.txt", "chunks": 1, "charCount": 135, "time": "2026-11-26T05:57:53.498Z" } ] } }
  ```

- 修改时间：2026-11-26

## LLM 实践：知识库问答

- 接口路径：`/api/llm/kb/ask`
- HTTP 方法：`POST`
- 说明：按问题字词命中率检索 Top3 片段，拼入 system 提示词后调用大模型作答，返回回答与命中来源。

- 请求参数：

  ```json
  { "question": "营业时间是几点？" }
  ```

- 响应格式：

  ```json
  {
    "code": 0,
    "msg": "问答成功",
    "data": {
      "answer": "营业时间是每天上午10:00至晚上22:00，全年无休。",
      "sources": [ { "docName": "中华美食街商家手册.txt", "snippet": "中华美食街商家手册……", "score": 0.846 } ]
    }
  }
  ```

- 修改时间：2026-11-26

## LLM 实践：图像识别

- 接口路径：`/api/llm/vision`
- HTTP 方法：`POST`
- 说明：接收图片 dataURL，调用视觉模型 `Qwen/Qwen3-VL-8B-Instruct` 识别。

- 请求参数：

  ```json
  { "image": "data:image/jpeg;base64,...", "question": "请用一句中文描述图片内容" }
  ```

- 响应格式：

  ```json
  { "code": 0, "msg": "识别成功", "data": { "result": "一辆黑色山地自行车停放在红砖墙前的水泥地上……", "model": "Qwen/Qwen3-VL-8B-Instruct" } }
  ```

- 修改时间：2026-11-26

## LLM 实践：语音识别

- 接口路径：`/api/llm/asr`
- HTTP 方法：`POST`
- 说明：接收音频 dataURL（wav/mp3/m4a/ogg），后端转为 multipart 调用语音模型 `FunAudioLLM/SenseVoiceSmall` 转文字。

- 请求参数：

  ```json
  { "audio": "data:audio/wav;base64,..." }
  ```

- 响应格式：

  ```json
  { "code": 0, "msg": "识别成功", "data": { "text": "你好，欢迎光临中华美食街。", "language": "Chinese", "model": "FunAudioLLM/SenseVoiceSmall" } }
  ```

- 修改时间：2026-11-26
