/**
 * 姓名：zhangboxin
 * 学号：24001010910
 * 时间：2026-11-26
 * 大模型：DeepSeek-V4.1-Flash
 *
 * AI 聊天控制器（多平台可切换）：硅基流动 / 七牛
 * 1、接收前端 messages 数组 → 按 provider 选择平台配置 → 带上 Key 转发 → 原样返回模型回答
 * 2、平台差异（Key/BaseURL/模型）全部来自 backend/.env，换平台只改配置不改代码
 * 3、人设：中华美食街在线客服
 */
const https = require('https');

// 中华美食街客服人设：只回答营业时间、招牌菜、配送范围三类问题，其余礼貌引导留言
const ZBX_SYSTEM_PROMPT = [
  '你是“中华美食街”的在线客服小助手。',
  '你只回答以下三类问题：① 营业时间；② 招牌菜/特色菜品；③ 配送范围。',
  '已知信息：营业时间每天 10:00-22:00，全年无休；招牌菜有麻辣香锅、铁板鱿鱼、糖油粑粑、酸辣粉；配送范围为门店周边 5 公里内，满 20 元起送，约 30 分钟送达。',
  '回答要求：简洁礼貌，每次不超过 80 字，只讲已知信息，不要编造。',
  '例外：当用户询问“我刚才问了什么”等关于本次对话内容的问题时，可以根据上文如实复述，不受三类问题限制。',
  '遇到这三类以外的问题（如砍价、退款、加盟、写代码、闲聊等），不要回答具体内容，统一回复：“抱歉，这个问题我暂时无法直接回答～ 请留下您的联系方式或具体需求，我们会尽快安排专人回复您。”'
].join('');

// 平台配置表：切换平台只需改 .env，不需要改代码
const ZBX_PROVIDERS = {
  siliconflow: {
    label: '硅基流动',
    keyEnv: 'SILICONFLOW_API_KEY',
    baseUrlEnv: 'SILICONFLOW_BASE_URL',
    modelEnv: 'SILICONFLOW_MODEL',
    defaultBaseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V4-Flash'
  },
  qiniu: {
    label: '七牛',
    keyEnv: 'QINIU_API_KEY',
    baseUrlEnv: 'QINIU_BASE_URL',
    modelEnv: 'QINIU_MODEL',
    defaultBaseUrl: 'https://api.qnaigc.com/v1',
    defaultModel: 'qiniu/conatus-free'
  }
};

/**
 * 生成 Key 无效错误（便于上层转成友好提示，而不是白屏）
 */
function zbxKeyInvalidError(zbxMessage) {
  const zbxError = new Error(zbxMessage || 'API Key 无效或已过期');
  zbxError.zbxCode = 'KEY_INVALID';
  return zbxError;
}

/**
 * 调用 OpenAI 兼容的聊天补全接口（硅基流动 / 七牛均适用）
 * @param {Object} zbxProvider - 平台配置
 * @param {Array} zbxMessages - 完整对话历史
 * @returns {Promise<string>} AI 回复内容
 */
function zbxCallOpenAI(zbxProvider, zbxMessages) {
  return new Promise((zbxResolve, zbxReject) => {
    const zbxApiKey = process.env[zbxProvider.keyEnv];

    if (!zbxApiKey) {
      zbxReject(zbxKeyInvalidError('未配置 ' + zbxProvider.keyEnv + '，请在 backend/.env 中设置'));
      return;
    }

    const zbxBaseUrl = process.env[zbxProvider.baseUrlEnv] || zbxProvider.defaultBaseUrl;
    const zbxModel = process.env[zbxProvider.modelEnv] || zbxProvider.defaultModel;
    const zbxUrl = new URL(zbxBaseUrl.replace(/\/+$/, '') + '/chat/completions');

    const zbxPayload = JSON.stringify({
      model: zbxModel,
      messages: zbxMessages,
      stream: false,
      temperature: 0.7,
      max_tokens: 2048
    });

    const zbxOptions = {
      hostname: zbxUrl.hostname,
      port: zbxUrl.port || 443,
      path: zbxUrl.pathname + zbxUrl.search,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + zbxApiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(zbxPayload)
      },
      timeout: 60000
    };

    const zbxReq = https.request(zbxOptions, (zbxRes) => {
      let zbxBody = '';
      zbxRes.on('data', (zbxChunk) => { zbxBody += zbxChunk; });
      zbxRes.on('end', () => {
        // 鉴权失败统一转成 Key 无效，前端给出友好提示
        if (zbxRes.statusCode === 401 || zbxRes.statusCode === 403) {
          zbxReject(zbxKeyInvalidError());
          return;
        }

        try {
          const zbxJson = JSON.parse(zbxBody);
          if (zbxJson.choices && zbxJson.choices[0] && zbxJson.choices[0].message) {
            zbxResolve({
              zbxContent: zbxJson.choices[0].message.content || '',
              zbxModel: zbxJson.model || zbxModel
            });
          } else if (zbxJson.error) {
            zbxReject(new Error(zbxProvider.label + '接口错误：' + (zbxJson.error.message || JSON.stringify(zbxJson.error))));
          } else {
            zbxReject(new Error(zbxProvider.label + '返回格式异常：' + zbxBody.slice(0, 200)));
          }
        } catch (zbxParseError) {
          zbxReject(new Error('解析' + zbxProvider.label + '响应失败：' + zbxParseError.message));
        }
      });
    });

    zbxReq.on('error', (zbxError) => {
      zbxReject(new Error('请求' + zbxProvider.label + '失败：' + zbxError.message));
    });

    zbxReq.on('timeout', () => {
      zbxReq.destroy(new Error('请求' + zbxProvider.label + '超时（60s）'));
    });

    zbxReq.write(zbxPayload);
    zbxReq.end();
  });
}

/**
 * 处理 AI 聊天请求
 * 请求体：{ "messages": [{ "role": "user", "content": "你们几点开门？" }], "provider": "siliconflow" | "qiniu" }
 */
exports.zbxChat = async (req, res) => {
  try {
    const zbxBody = req.body || {};

    if (!Array.isArray(zbxBody.messages) || zbxBody.messages.length === 0) {
      res.json({ code: 1, msg: '请传入非空的 messages 数组', data: {} });
      return;
    }

    const zbxProviderName = ZBX_PROVIDERS[zbxBody.provider] ? zbxBody.provider : 'siliconflow';
    const zbxProvider = ZBX_PROVIDERS[zbxProviderName];

    const zbxMessages = zbxBody.messages.map(function (zbxMsg) {
      return {
        role: zbxMsg.role || 'user',
        content: String(zbxMsg.content || '')
      };
    });

    if (!zbxMessages[zbxMessages.length - 1].content.trim()) {
      res.json({ code: 1, msg: '消息内容不能为空', data: {} });
      return;
    }

    // 前端未设置 system 人设时，补充中华美食街客服人设
    if (zbxMessages[0].role !== 'system') {
      zbxMessages.unshift({ role: 'system', content: ZBX_SYSTEM_PROMPT });
    }

    console.log('[AI Chat] 平台：' + zbxProvider.label + '，消息数：' + zbxMessages.length);

    const zbxResult = await zbxCallOpenAI(zbxProvider, zbxMessages);

    res.json({
      code: 0,
      msg: 'AI 回复成功',
      data: {
        content: zbxResult.zbxContent,
        role: 'assistant',
        model: zbxResult.zbxModel,
        provider: zbxProviderName,
        providerLabel: zbxProvider.label
      }
    });
  } catch (zbxError) {
    console.error('[AI Chat] 失败：', zbxError.message);

    if (zbxError.zbxCode === 'KEY_INVALID') {
      res.json({
        code: 1,
        msg: 'API Key 无效或已过期，请检查 backend/.env 中对应平台的 Key 配置',
        data: {}
      });
      return;
    }

    res.json({ code: 1, msg: 'AI 回复失败：' + zbxError.message, data: {} });
  }
};
