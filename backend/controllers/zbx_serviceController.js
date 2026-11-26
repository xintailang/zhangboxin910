/**
 * 姓名：zhangboxin
 * 学号：24001010910
 * 时间：2026-11-26
 * 大模型：DeepSeek-V4.1-Flash
 *
 * 在线客服控制器：调用七牛云 AI 推理（OpenAI 兼容）接口
 * BaseURL：https://api.qnaigc.com/v1
 * 职责：接收前端 messages 数组 → 带上 Key 转发给七牛云 → 把模型回答原样返回给前端
 */
const https = require('https');

const ZBX_QINIU_DEFAULT_BASE_URL = 'https://api.qnaigc.com/v1';
const ZBX_QINIU_DEFAULT_MODEL = 'qiniu/conatus-free';

// 客服人设：让模型以校园二手交易平台客服的身份回复
const ZBX_SERVICE_SYSTEM_PROMPT =
  '你是“校园二手交易平台”的在线客服助手。请用简洁、礼貌、友好的中文回答用户关于商品发布、交易流程、账号使用等问题；遇到无法确认的信息时如实说明，不要编造。';

/**
 * 调用七牛云聊天补全接口
 * @param {Array} zbxMessages - 完整对话历史 [{ role, content }]
 * @param {string} zbxModel - 模型 ID
 * @returns {Promise<string>} AI 回复内容
 */
function zbxCallQiniu(zbxMessages, zbxModel) {
  return new Promise((zbxResolve, zbxReject) => {
    const zbxApiKey = process.env.QINIU_API_KEY;

    if (!zbxApiKey) {
      zbxReject(new Error('未配置 QINIU_API_KEY，请在 backend/.env 中设置'));
      return;
    }

    const zbxBaseUrl = process.env.QINIU_BASE_URL || ZBX_QINIU_DEFAULT_BASE_URL;
    const zbxEndpoint = zbxBaseUrl.replace(/\/+$/, '') + '/chat/completions';
    const zbxUrl = new URL(zbxEndpoint);

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
        try {
          const zbxJson = JSON.parse(zbxBody);
          if (zbxJson.choices && zbxJson.choices[0] && zbxJson.choices[0].message) {
            zbxResolve(zbxJson.choices[0].message.content || '');
          } else if (zbxJson.error) {
            zbxReject(new Error('七牛云接口错误：' + (zbxJson.error.message || JSON.stringify(zbxJson.error))));
          } else {
            zbxReject(new Error('七牛云返回格式异常：' + zbxBody.slice(0, 200)));
          }
        } catch (zbxParseError) {
          zbxReject(new Error('解析七牛云响应失败：' + zbxParseError.message + '；原始响应：' + zbxBody.slice(0, 200)));
        }
      });
    });

    zbxReq.on('error', (zbxError) => {
      zbxReject(new Error('请求七牛云失败：' + zbxError.message));
    });

    zbxReq.on('timeout', () => {
      zbxReq.destroy(new Error('请求七牛云超时（60s）'));
    });

    zbxReq.write(zbxPayload);
    zbxReq.end();
  });
}

/**
 * 处理在线客服消息
 * 请求体：{ "messages": [{ "role": "user", "content": "怎么发布商品？" }] }
 */
exports.zbxService = async (req, res) => {
  try {
    const zbxBody = req.body || {};

    if (!Array.isArray(zbxBody.messages) || zbxBody.messages.length === 0) {
      res.json({ code: 1, msg: '请传入非空的 messages 数组', data: {} });
      return;
    }

    const zbxMessages = zbxBody.messages.map(function (zbxMsg) {
      return {
        role: zbxMsg.role || 'user',
        content: String(zbxMsg.content || '')
      };
    });

    const zbxLastContent = zbxMessages[zbxMessages.length - 1].content.trim();
    if (!zbxLastContent) {
      res.json({ code: 1, msg: '消息内容不能为空', data: {} });
      return;
    }

    // 若前端未设置 system 人设，则补充客服人设
    if (zbxMessages[0].role !== 'system') {
      zbxMessages.unshift({ role: 'system', content: ZBX_SERVICE_SYSTEM_PROMPT });
    }

    const zbxModel = process.env.QINIU_MODEL || ZBX_QINIU_DEFAULT_MODEL;
    console.log('[Customer Service] 模型：' + zbxModel + '，消息数：' + zbxMessages.length);

    const zbxReply = await zbxCallQiniu(zbxMessages, zbxModel);

    res.json({
      code: 0,
      msg: '客服回复成功',
      data: {
        content: zbxReply,
        role: 'assistant',
        model: zbxModel
      }
    });
  } catch (zbxError) {
    console.error('[Customer Service] 失败：', zbxError.message);
    res.json({
      code: 1,
      msg: '客服回复失败：' + zbxError.message,
      data: {}
    });
  }
};
