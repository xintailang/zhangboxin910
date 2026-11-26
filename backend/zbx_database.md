# zhangboxin 数据库记录

按执行顺序记录建库、建表与测试数据 SQL，仅凭本文件即可在新机器上完整重建数据库。

## 2026-11-19 建库与科技新闻表

```sql
CREATE DATABASE IF NOT EXISTS zbx_campus_trade
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE zbx_campus_trade;

CREATE TABLE IF NOT EXISTS zbx_news (
  zbx_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻ID',
  zbx_title VARCHAR(200) NOT NULL COMMENT '标题',
  zbx_summary VARCHAR(500) NOT NULL DEFAULT '' COMMENT '摘要',
  zbx_content TEXT COMMENT '正文内容',
  zbx_source VARCHAR(100) NOT NULL DEFAULT '' COMMENT '来源',
  zbx_category VARCHAR(50) NOT NULL DEFAULT '' COMMENT '分类',
  zbx_author VARCHAR(50) NOT NULL DEFAULT '' COMMENT '作者',
  zbx_publish_time DATETIME NOT NULL COMMENT '发布时间',
  zbx_views INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  zbx_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (zbx_id),
  KEY zbx_idx_category (zbx_category),
  KEY zbx_idx_publish_time (zbx_publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='科技新闻表';
```

## 2026-11-19 科技新闻测试数据

```sql
INSERT INTO zbx_news (zbx_title, zbx_summary, zbx_content, zbx_source, zbx_category, zbx_author, zbx_publish_time, zbx_views) VALUES
('国产大模型集中发布新版本，多模态能力成为竞争焦点', '多家国内厂商在同一周内更新大模型版本，视频理解与语音交互成为主要比拼方向。', '本周多家国内人工智能企业相继发布大模型新版本，重点提升视频理解、语音交互和长文本推理能力，并同步下调 API 调用价格，行业竞争进一步加剧。', '新华科技', '人工智能', '李明', '2026-11-18 09:30:00', 1820),
('我国首条 8 英寸硅光芯片生产线通线', '该产线覆盖设计、制造与封装环节，预计年产能达到 3 万片。', '国内首条 8 英寸硅光芯片生产线正式通线，主要面向数据中心光互连与高速通信场景，标志着硅光芯片从实验室走向规模化量产。', '科创日报', '芯片半导体', '王珂', '2026-11-17 14:10:00', 1432),
('量子计算原型机完成 512 比特纠错演示', '研究团队在超导量子体系上验证了表面码纠错方案，逻辑错误率显著下降。', '科研团队基于超导量子处理器完成 512 比特表面码纠错实验，逻辑量子比特寿命明显提升，为可容错量子计算提供了关键实验依据。', '科学网', '前沿研究', '陈晨', '2026-11-16 10:05:00', 986),
('AI 编程助手进入企业研发流程，代码评审效率提升 40%', '多家企业将 AI 助手接入代码托管与流水线，用于自动生成评审意见和单元测试。', '调研显示，将 AI 编程助手接入研发流水线后，代码评审平均耗时下降约四成，单元测试覆盖率同步提升，但人工复核仍是必要环节。', '36氪', '人工智能', '赵宇', '2026-11-15 18:40:00', 2210),
('卫星互联网低轨星座完成第 100 次组网发射', '本次发射将 18 颗组网卫星送入预定轨道，全球覆盖能力进一步增强。', '我国卫星互联网低轨星座完成第 100 次组网发射，18 颗卫星顺利入轨，星座在轨规模持续扩大，偏远地区宽带接入能力显著提升。', '中国航天报', '航天通信', '刘洋', '2026-11-14 07:55:00', 1655),
('固态电池中试线投产，能量密度达到 400Wh/kg', '中试线年产能 2GWh，产品将率先应用于高端电动车与储能场景。', '某动力电池企业固态电池中试线正式投产，单体能量密度达到 400Wh/kg，循环寿命超过 1200 次，量产时间表预计在两年内落地。', '电动汽车观察', '新能源', '孙琪', '2026-11-13 11:20:00', 1308),
('开源操作系统新版本全面支持 RISC-V 架构', '新版本完善了驱动生态与工具链，为国产芯片提供更完整的系统支持。', '开源操作系统发布年度新版本，首次在主线内核中全面支持 RISC-V 架构，并优化了容器运行时与图形栈，开发者迁移成本进一步降低。', '开源中国', '软件生态', '周楠', '2026-11-12 16:30:00', 875),
('高校团队发布脑机接口新成果，打字速度接近手写', '受试者通过植入式电极实现每分钟 60 字符的输入速度，准确率超过 95%。', '高校科研团队公布最新脑机接口研究成果，受试者借助植入式电极完成文本输入，速度接近自然手写，为运动功能障碍人群提供了新的沟通方案。', '中国青年报', '前沿研究', '何静', '2026-11-11 09:15:00', 1094),
('多云管理平台需求增长，企业上云进入精细化阶段', '企业更关注成本优化与跨云调度，混合云管理工具采购量同比上升。', '最新行业报告显示，企业对多云管理平台的需求持续增长，成本可视化、跨云资源调度和统一运维成为采购重点，上云策略从扩张转向精细化运营。', '云计算报', '云计算', '吴迪', '2026-11-10 13:45:00', 742),
('数据安全新规实施，企业合规改造加速', '新规对数据分类分级、跨境流动提出更明确要求，相关改造项目集中启动。', '数据安全新规正式实施，企业在数据分类分级、访问审计与跨境数据流动方面加快合规改造，安全服务市场规模预计迎来新一轮增长。', '法治日报', '网络安全', '郑凯', '2026-11-09 08:20:00', 1180);
```

## 2026-11-19 图文列表表

```sql
CREATE TABLE IF NOT EXISTS zbx_gallery (
  zbx_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文ID',
  zbx_title VARCHAR(120) NOT NULL COMMENT '标题',
  zbx_description VARCHAR(500) NOT NULL DEFAULT '' COMMENT '描述',
  zbx_image_url VARCHAR(1000) NOT NULL COMMENT '图片地址',
  zbx_tag VARCHAR(50) NOT NULL DEFAULT '' COMMENT '标签',
  zbx_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '价格（元）',
  zbx_author VARCHAR(50) NOT NULL DEFAULT '' COMMENT '发布者',
  zbx_likes INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
  zbx_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (zbx_id),
  KEY zbx_idx_tag (zbx_tag),
  KEY zbx_idx_create_time (zbx_create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='校园图文列表';
```

## 2026-11-19 图文列表测试数据

```sql
INSERT INTO zbx_gallery (zbx_title, zbx_description, zbx_image_url, zbx_tag, zbx_price, zbx_author, zbx_likes, zbx_create_time) VALUES
('九成新山地自行车', '毕业出，骑行一年，刹车与变速正常，附赠车锁与打气筒，可在校门口自提。', 'https://trae-api-cn.mchost.guru/api/ide/v1/tool_text_to_image?prompt=used%20mountain%20bike%20parked%20beside%20a%20campus%20building%2C%20daylight%20photo&image_size=landscape_4_3', '出行', 320.00, '林同学', 42, '2026-11-18 10:20:00'),
('宿舍护眼台灯', '三档调光，USB 供电，用了一个学期，灯管无损坏，适合晚自习在宿舍使用。', 'https://trae-api-cn.mchost.guru/api/ide/v1/tool_text_to_image?prompt=modern%20LED%20desk%20lamp%20on%20a%20dormitory%20desk%2C%20warm%20light%2C%20photo&image_size=landscape_4_3', '宿舍好物', 35.00, '陈同学', 18, '2026-11-17 19:05:00'),
('考研数学全套资料', '含教材、习题册与手写笔记，笔记完整、重点标注清晰，适合准备考研的同学。', 'https://trae-api-cn.mchost.guru/api/ide/v1/tool_text_to_image?prompt=stack%20of%20graduate%20exam%20math%20books%20and%20handwritten%20notes%20on%20a%20desk%2C%20photo&image_size=landscape_4_3', '学习', 60.00, '王同学', 65, '2026-11-16 15:40:00'),
('入耳式蓝牙耳机', '续航约 30 小时，双耳连接稳定，已消毒清洁，附原装充电盒与说明书。', 'https://trae-api-cn.mchost.guru/api/ide/v1/tool_text_to_image?prompt=wireless%20earbuds%20with%20charging%20case%20on%20a%20wooden%20table%2C%20product%20photo&image_size=landscape_4_3', '数码', 150.00, '赵同学', 27, '2026-11-15 21:10:00'),
('大功率速干电吹风', '宿舍可用低功率档，大风量速干，附风嘴两个，外壳无划痕。', 'https://trae-api-cn.mchost.guru/api/ide/v1/tool_text_to_image?prompt=white%20hair%20dryer%20on%20a%20bathroom%20counter%2C%20product%20photo&image_size=landscape_4_3', '生活电器', 80.00, '刘同学', 12, '2026-11-14 12:30:00'),
('可折叠床上书桌', '实木材质，桌面平整，可折叠收纳不占空间，适合宿舍床上学习。', 'https://trae-api-cn.mchost.guru/api/ide/v1/tool_text_to_image?prompt=foldable%20wooden%20lap%20desk%20on%20a%20dormitory%20bed%2C%20photo&image_size=landscape_4_3', '宿舍好物', 45.00, '孙同学', 33, '2026-11-13 09:50:00'),
('斯伯丁篮球 7 号', '室外耐磨款，使用次数不多，气足不鼓包，适合球场约球。', 'https://trae-api-cn.mchost.guru/api/ide/v1/tool_text_to_image?prompt=orange%20basketball%20on%20an%20outdoor%20court%2C%20photo&image_size=landscape_4_3', '运动', 70.00, '周同学', 21, '2026-11-12 17:25:00'),
('民谣吉他 41 寸', '入门款单板吉他，音色干净，附琴包、拨片与变调夹，可当面试弹。', 'https://trae-api-cn.mchost.guru/api/ide/v1/tool_text_to_image?prompt=acoustic%20guitar%20leaning%20against%20a%20bedroom%20wall%2C%20warm%20light%2C%20photo&image_size=landscape_4_3', '乐器', 260.00, '吴同学', 48, '2026-11-11 11:15:00');
```

## 2026-11-19 图文图片改为本地生成图片

外部图片地址会被浏览器 ORB 策略拦截，改为使用 frontend/images 下生成的本地图片。

```sql
UPDATE zbx_gallery SET zbx_image_url = '/images/zbx_gallery_bike.jpg' WHERE zbx_title = '九成新山地自行车';
UPDATE zbx_gallery SET zbx_image_url = '/images/zbx_gallery_lamp.jpg' WHERE zbx_title = '宿舍护眼台灯';
UPDATE zbx_gallery SET zbx_image_url = '/images/zbx_gallery_books.jpg' WHERE zbx_title = '考研数学全套资料';
UPDATE zbx_gallery SET zbx_image_url = '/images/zbx_gallery_earbuds.jpg' WHERE zbx_title = '入耳式蓝牙耳机';
UPDATE zbx_gallery SET zbx_image_url = '/images/zbx_gallery_dryer.jpg' WHERE zbx_title = '大功率速干电吹风';
UPDATE zbx_gallery SET zbx_image_url = '/images/zbx_gallery_desk.jpg' WHERE zbx_title = '可折叠床上书桌';
UPDATE zbx_gallery SET zbx_image_url = '/images/zbx_gallery_basketball.jpg' WHERE zbx_title = '斯伯丁篮球 7 号';
UPDATE zbx_gallery SET zbx_image_url = '/images/zbx_gallery_guitar.jpg' WHERE zbx_title = '民谣吉他 41 寸';
```

## 2026-11-19 图文列表表结构按要求调整为 id、title、description、img_url、category、create_time

```sql
DROP TABLE IF EXISTS zbx_gallery;

CREATE TABLE zbx_gallery (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文ID',
  title VARCHAR(120) NOT NULL COMMENT '标题',
  description VARCHAR(500) NOT NULL DEFAULT '' COMMENT '描述',
  img_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '图片地址',
  category VARCHAR(50) NOT NULL DEFAULT '' COMMENT '分类',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  KEY idx_category (category),
  KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='图文列表';
```

## 2026-11-19 图文列表重建后的测试数据

```sql
INSERT INTO zbx_gallery (title, description, img_url, category, create_time) VALUES
('九成新山地自行车', '毕业出，骑行一年，刹车与变速正常，附赠车锁与打气筒，可在校门口自提。', '/images/zbx_gallery_bike.jpg', '出行', '2026-11-18 10:20:00'),
('宿舍护眼台灯', '三档调光，USB 供电，用了一个学期，灯管完好，适合晚自习使用。', '/images/zbx_gallery_lamp.jpg', '宿舍好物', '2026-11-17 19:05:00'),
('考研数学全套资料', '含教材、习题册与手写笔记，笔记完整、重点标注清晰。', '/images/zbx_gallery_books.jpg', '学习', '2026-11-16 15:40:00'),
('入耳式蓝牙耳机', '续航约 30 小时，双耳连接稳定，附原装充电盒与说明书。', '/images/zbx_gallery_earbuds.jpg', '数码', '2026-11-15 21:10:00'),
('大功率速干电吹风', '宿舍可用低功率档，大风量速干，附风嘴两个，外壳无划痕。', '/images/zbx_gallery_dryer.jpg', '生活电器', '2026-11-14 12:30:00'),
('可折叠床上书桌', '实木材质，桌面平整，可折叠收纳不占空间，适合宿舍床上学习。', '/images/zbx_gallery_desk.jpg', '宿舍好物', '2026-11-13 09:50:00'),
('斯伯丁篮球 7 号', '室外耐磨款，使用次数不多，气足不鼓包，适合球场约球。', '/images/zbx_gallery_basketball.jpg', '运动', '2026-11-12 17:25:00'),
('民谣吉他 41 寸', '入门款单板吉他，音色干净，附琴包、拨片与变调夹，可当面试弹。', '/images/zbx_gallery_guitar.jpg', '乐器', '2026-11-11 11:15:00');
```
