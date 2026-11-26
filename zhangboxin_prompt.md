# zhangboxin 提示词记录

格式：时间 | 提示词全文 | 大模型名称

2026-11-19 13:53 | 请初始化本项目：1、git init + .gitignore（排除 node_modules、.env）+ 首次提交 2、按 AGENTS.md 规则创建前后端目录骨架、安装依赖 3、创建前端首页 index.html，包括姓名zhangboxin、学号24001010910、项目名称、项目类别（自选、模仿），所有完成的 html 页面的超链接。有 canvas 背景动画。主体是页面链接导航。页面美观。 4、创建 readme.md，在根目录下，包括学号、姓名。 | DeepSeek-V4.1-Flash

2026-11-19 14:00 | 创建运行后台的bat文件，在根目录下。 | DeepSeek-V4.1-Flash

2026-11-19 14:06 | 创建 database.html 页面，输入用户名，密码，链接数据库，数据库使用 mysql，成功和错误都有提示，默认用户名 root，密码 zbx12345。 | DeepSeek-V4.1-Flash

2026-11-19 14:15 | 完成科技新闻列表页面，新闻的数据存在数据库表里。网页显示后端接口链接和数据内容。 | DeepSeek-V4.1-Flash

2026-11-19 14:23 | 完成图文列表，图片可以使用网络图片或创建图片，创建一个新的表，网页显示后端接口链接和数据内容。 | DeepSeek-V4.1-Flash

2026-11-19 14:31 | 完成图文列表页面：1、在 MySQL 中新建表 zbx_gallery，字段：id、title、description、img_url、category、create_time，插入至少 8 条测试数据；2、后端提供 GET /api/gallery 接口，返回全部图文数据；3、新建 frontend/gallery.html，页面顶部显示接口地址，下方用网格布局展示"上图下文"卡片：图片、标题、描述；4、图片加载失败时显示占位色块，不要出现破图图标；5、页面适配手机宽度；6、记录写入 backend/zbx_database.md、backend/zbx_interface.md 和 zhangboxin_prompt.md，并在首页加入口。 | DeepSeek-V4.1-Flash

2026-11-23 | 使用硅基流动 API key 创建基本 AI 应用：AI 聊天。Api-key：sk-nzhx****（已打码） | DeepSeek-V4.1-Flash

2026-11-23 | 帮我完成（按截图要求）：2、后端接口 /api/chat 要做三件事：收前端发来的 messages 数组 → 带上 Key 转发给硅基流动 → 把模型的回答原样返回给前端；3、写聊天页面：一个输入框 + 一个发送按钮 + 一块消息区，发送后先把"用户的话"显示出来，再等接口返回追加"AI 的回答"，等待期间显示"正在思考..."；4、多轮对话：模型本身不记事，每次请求都把之前的全部对话一起发过去，维护一个 messages 数组，每轮把用户消息和 AI 回复都 push 进去。模型使用 deepseek-ai/DeepSeek-V4-Flash。 | DeepSeek-V4.1-Flash

2026-11-26 | 先在页面上问"你好"，再问"我刚才问了什么"——能答上来，说明多轮对话通了。把这次用的提示词和遇到的问题记进 zhangboxin_prompt.md | DeepSeek-V4.1-Flash

## 问题记录（2026-11-26 AI 聊天调试）

1、后端服务未启动：页面请求 /api/chat 直接失败。已在 backend 目录用 node server.js 重新启动，先访问 /api/health 确认返回 code=0 再测页面。
2、PowerShell 直接发送中文 JSON 会乱码：Invoke-RestMethod 的 -Body 传字符串时中文变成"??"，导致模型答非所问。改为先把 JSON 转成 UTF-8 字节（[System.Text.Encoding]::UTF8.GetBytes）再发送后正常；前端 fetch 本身是 UTF-8，不受影响。
3、接口入参格式与作业要求不一致：初版用 zbx_message + zbx_history，作业要求统一传 messages 数组。已改为只接收 messages 数组，返回 data.content，多轮上下文由前端维护 messages 数组实现。
4、模型未从配置读取：初版把模型名写死在代码里（Qwen/Qwen2.5-7B-Instruct）。已在 backend/.env 增加 SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V4-Flash，代码改为读取该变量，并实测该模型在硅基流动可用。
5、改 .env 后不生效：dotenv 只在进程启动时加载一次，修改 .env 必须重启 Node 服务，否则仍读旧配置。
6、多轮对话重复上下文风险：请求失败时用户消息已 push 进数组，若不回滚下次重发会重复。已在失败分支 pop 掉本轮用户消息。

验证结果：页面先问"你好"，再问"我刚才问了什么"，AI 回答"你刚才问的是：'你好'"，多轮对话正常。

2026-11-26 | 使用七牛的 api key 完成在线客服页面：Model ID：qiniu/conatus-free；Api-key：sk-a8ec****（已打码）；OpenAI BaseURL：https://api.qnaigc.com/v1 | DeepSeek-V4.1-Flash

## 问题记录（2026-11-26 在线客服接入）

1、七牛云免费模型需要实名认证：调用 qiniu/conatus-free 返回 "Please complete identity verification before using this free model"，Key 本身有效（可正常调用 /v1/models 列出模型），需在 https://portal.qiniu.com/developer/user/identity 完成实名认证后才能使用。已与用户确认，保留该模型，待认证完成后即可正常对话。
2、免费模型限流：测试期间还出现过 "Too many requests for this free model"，属免费额度限流，稍后重试即可。
3、备用模型测试返回 502：改用 meituan/longcat-flash-lite 测试时返回 502 Bad Gateway，非代码问题，未采用。
4、接口地址需拼接：BaseURL 为 https://api.qnaigc.com/v1，实际请求地址要拼接为 /v1/chat/completions，代码用 URL 解析 hostname/path，避免手写拼接出错。
5、API Key 安全：Key 只写入 backend/.env（QINIU_API_KEY），代码通过 process.env 读取，未硬编码；.env 已在 .gitignore 中。
6、改 .env 后需重启：新增 QINIU_* 配置后必须重启 Node 服务才生效。

实现结果：新增 POST /api/service 接口与 frontend/service.html 客服页面，页面含客服状态栏、消息区、常见问题快捷提问、输入框与发送按钮；后端自动补充客服人设 system 提示词，多轮对话由前端 messages 数组维护；错误提示可优雅展示。当前模型受实名认证限制，完成后即可正常回复。

2026-11-26 | 帮我检查验收，帮我完成任务一，任务二，任务三：验收清单 6 项逐项核对；任务一 把 Key 藏好（检查 .env 是否在 .gitignore、前端是否残留 Key、列出 3 处可能泄露 Key 的地方、Key 打码）；任务二 客服人设改造（把 AI 聊天改成中华美食街在线客服，只答营业时间/招牌菜/配送范围，其余礼貌引导留言，写 system 提示词、测试 5 个问题 3 答 2 拒并解释为什么能管住模型）；任务三 多平台热切换（页面加下拉框在硅基流动/七牛间切换，后端读配置）并回答答辩三问 | DeepSeek-V4.1-Flash

## 问题记录（2026-11-26 验收任务）

1、Key 明文泄露风险：zhangboxin_prompt.md 被 Git 跟踪且曾记录两处明文 Key。已改为 sk-nzhx****（已打码）、sk-a8ec****（已打码）；复核 git log -S 无 Key 历史提交，.env 从未提交。
2、人设与验收项冲突：严格限定“只答三类问题”后，追问“我刚才问了什么”被误拒。已在 system 提示词中增加一条例外：允许回答关于本次对话内容的问题。
3、改代码后未重启导致测试结果旧：修改 system 提示词后直接测试仍是旧回复，重启 Node 服务后正常。dotenv 与新代码都需重启生效。
4、bad key 测试不便改正式配置：采用独立端口 + 进程级环境变量（$env:SILICONFLOW_API_KEY + $env:PORT=8911）启动临时服务，避免污染 .env，验证友好提示后关闭。
5、七牛免费模型偶发限流：出现 Too many requests for this free model，重试即可；实测实名认证后 conatus-free 已可正常回答。
6、curl 中文乱码：PowerShell 下先把 JSON 以无 BOM UTF-8 写入临时文件，再用 curl.exe --data-binary @文件，避免中文变问号。

验收结果：6 项清单全部通过；3 个业务问题准确回答、2 个越界问题礼貌拒绝；两平台切换后照常对话。详见 zhangboxin_acceptance.md。

2026-11-26 | 在课程实践里面加一个LLM实践操作痕迹展示，里面包含：1、页面支持在"硅基流动 / 七牛"之间切换实现AI客服（后端读取配置即可，前端加一个下拉框），并现场演示切换后照常对话。2、完成知识库实现（自己上传文件、验证知识库功能）3、图像识别（上传图片，测试图片识别功能）4、语音识别（测试语音识别功能） | DeepSeek-V4.1-Flash

## 问题记录（2026-11-26 LLM 实践页）

1、先确认平台能力：查询硅基流动 /v1/models，确认有视觉模型 Qwen/Qwen3-VL-8B-Instruct 与语音模型 FunAudioLLM/SenseVoiceSmall，先单独实测两者可用，再写页面，避免做完才发现 Key 无权限。
2、base64 上传报 500：图片/音频以 dataURL 传入时超过 Express 默认 100kb 请求体上限，抛 PayloadTooLargeError。已在 app.js 把 express.json / urlencoded 的 limit 调到 30mb。
3、语音识别需 multipart：硅基流动 /v1/audio/transcriptions 只收 multipart/form-data，未引入 multer，改为后端手工拼接 boundary 与 Buffer 发送，前端仍传 base64 JSON，避免新增依赖。
4、语音测试素材：用 Windows SAPI（System.Speech）把“你好，欢迎光临中华美食街”合成 wav，再调 ASR 验证，识别结果与原文一致。
5、知识库实现取舍：不引入向量数据库，采用 400 字切片 + 问题字词命中率排序的简易检索（RAG），命中片段拼入 system 提示词；文档存内存，服务重启后清空，页面会提示需重新上传。
6、页面落地：新增 frontend/llm.html 与 js/zbx_llm.js，四个编号卡片分别对应客服切换、知识库、图像识别、语音识别；首页新增 07 入口。

验证结果：知识库上传/列表/问答正常（回答“10:00-22:00 全年无休”并返回命中片段）；图像识别返回“一辆黑色山地自行车停在红砖墙前…”；语音识别返回“你好，欢迎光临中华美食街。”；客服切换两平台照常对话。
