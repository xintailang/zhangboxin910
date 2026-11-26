/**
 * 姓名：zhangboxin
 * 学号：24001010910
 * 时间：2026-11-26
 * 大模型：DeepSeek-V4.1-Flash
 *
 * LLM 实践控制器：知识库（简易 RAG）、图像识别、语音识别
 * 全部调用硅基流动 OpenAI 兼容接口，Key 仅从 backend/.env 读取
 */
const https = require('https');

const ZBX_SF_BASE_URL = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
const ZBX_TEXT_MODEL = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';
const ZBX_VISION_MODEL = process.env.SILICONFLOW_VISION_MODEL || 'Qwen/Qwen3-VL-8B-Instruct';
const ZBX_ASR_MODEL = process.env.SILICONFLOW_ASR_MODEL || 'FunAudioLLM/SenseVoiceSmall';

// 内存知识库：{ id, name, chunks: [string], time }
const zbxKbDocs = [];

/* ---------------- 通用请求 ---------------- */

function zbxKeyInvalid() {
  const zbxError = new Error('API Key 无效或已过期');
  zbxError.zbxCode = 'KEY_INVALID';
  return zbxError;
}

/**
 * 发送 JSON 请求到硅基流动
 */
function zbxPostJson(zbxPath, zbxPayload) {
  return new Promise((zbxResolve, zbxReject) => {
    const zbxKey = process.env.SILICONFLOW_API_KEY;
    if (!zbxKey) { zbxReject(zbxKeyInvalid()); return; }

    const zbxUrl = new URL(ZBX_SF_BASE_URL.replace(/\/+$/, '') + zbxPath);
    const zbxBody = JSON.stringify(zbxPayload);

    const zbxReq = https.request({
      hostname: zbxUrl.hostname,
      port: zbxUrl.port || 443,
      path: zbxUrl.pathname + zbxUrl.search,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + zbxKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(zbxBody)
      },
      timeout: 90000
    }, (zbxRes) => {
      let zbxData = '';
      zbxRes.on('data', (c) => { zbxData += c; });
      zbxRes.on('end', () => {
        if (zbxRes.statusCode === 401 || zbxRes.statusCode === 403) { zbxReject(zbxKeyInvalid()); return; }
        try {
          const zbxJson = JSON.parse(zbxData);
          if (zbxJson.error) { zbxReject(new Error(zbxJson.error.message || JSON.stringify(zbxJson.error))); return; }
          zbxResolve(zbxJson);
        } catch (e) {
          zbxReject(new Error('响应解析失败：' + zbxData.slice(0, 200)));
        }
      });
    });
    zbxReq.on('error', (e) => zbxReject(new Error('请求失败：' + e.message)));
    zbxReq.on('timeout', () => zbxReq.destroy(new Error('请求超时')));
    zbxReq.write(zbxBody);
    zbxReq.end();
  });
}

/**
 * 发送 multipart/form-data 请求（语音识别用）
 */
function zbxPostMultipart(zbxPath, zbxFields, zbxFile) {
  return new Promise((zbxResolve, zbxReject) => {
    const zbxKey = process.env.SILICONFLOW_API_KEY;
    if (!zbxKey) { zbxReject(zbxKeyInvalid()); return; }

    const zbxUrl = new URL(ZBX_SF_BASE_URL.replace(/\/+$/, '') + zbxPath);
    const zbxBoundary = '----zbxBboundary' + Date.now().toString(16);
    const zbxParts = [];

    Object.keys(zbxFields).forEach((zbxName) => {
      zbxParts.push(Buffer.from(
        '--' + zbxBoundary + '\r\n' +
        'Content-Disposition: form-data; name="' + zbxName + '"\r\n\r\n' +
        zbxFields[zbxName] + '\r\n'
      ));
    });

    zbxParts.push(Buffer.from(
      '--' + zbxBoundary + '\r\n' +
      'Content-Disposition: form-data; name="file"; filename="' + zbxFile.filename + '"\r\n' +
      'Content-Type: ' + zbxFile.contentType + '\r\n\r\n'
    ));
    zbxParts.push(zbxFile.buffer);
    zbxParts.push(Buffer.from('\r\n--' + zbxBoundary + '--\r\n'));

    const zbxBody = Buffer.concat(zbxParts);

    const zbxReq = https.request({
      hostname: zbxUrl.hostname,
      port: zbxUrl.port || 443,
      path: zbxUrl.pathname + zbxUrl.search,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + zbxKey,
        'Content-Type': 'multipart/form-data; boundary=' + zbxBoundary,
        'Content-Length': zbxBody.length
      },
      timeout: 90000
    }, (zbxRes) => {
      let zbxData = '';
      zbxRes.on('data', (c) => { zbxData += c; });
      zbxRes.on('end', () => {
        if (zbxRes.statusCode === 401 || zbxRes.statusCode === 403) { zbxReject(zbxKeyInvalid()); return; }
        try {
          const zbxJson = JSON.parse(zbxData);
          if (zbxJson.error) { zbxReject(new Error(zbxJson.error.message || JSON.stringify(zbxJson.error))); return; }
          zbxResolve(zbxJson);
        } catch (e) {
          zbxReject(new Error('响应解析失败：' + zbxData.slice(0, 200)));
        }
      });
    });
    zbxReq.on('error', (e) => zbxReject(new Error('请求失败：' + e.message)));
    zbxReq.on('timeout', () => zbxReq.destroy(new Error('请求超时')));
    zbxReq.write(zbxBody);
    zbxReq.end();
  });
}

function zbxErrorResponse(zbxRes, zbxError) {
  console.error('[LLM 实践] 失败：', zbxError.message);
  if (zbxError.zbxCode === 'KEY_INVALID') {
    zbxRes.json({ code: 1, msg: 'API Key 无效或已过期，请检查 backend/.env 配置', data: {} });
    return;
  }
  zbxRes.json({ code: 1, msg: '操作失败：' + zbxError.message, data: {} });
}

/* ---------------- 知识库 ---------------- */

function zbxSplitChunks(zbxText, zbxSize, zbxOverlap) {
  const zbxClean = String(zbxText).replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
  const zbxChunks = [];
  let zbxStart = 0;
  while (zbxStart < zbxClean.length) {
    let zbxEnd = Math.min(zbxStart + zbxSize, zbxClean.length);
    // 尽量在句末断开
    const zbxSlice = zbxClean.slice(zbxStart, zbxEnd);
    const zbxPunct = Math.max(zbxSlice.lastIndexOf('。'), zbxSlice.lastIndexOf('！'), zbxSlice.lastIndexOf('？'), zbxSlice.lastIndexOf('\n'));
    if (zbxEnd < zbxClean.length && zbxPunct > zbxSize * 0.4) {
      zbxEnd = zbxStart + zbxPunct + 1;
    }
    const zbxPart = zbxClean.slice(zbxStart, zbxEnd).trim();
    if (zbxPart) zbxChunks.push(zbxPart);
    zbxStart = zbxEnd - zbxOverlap;
    if (zbxStart < 0) zbxStart = 0;
    if (zbxEnd >= zbxClean.length) break;
  }
  return zbxChunks;
}

/**
 * 简易检索：按问题字词在片段中的命中比例打分
 */
function zbxRetrieve(zbxQuestion, zbxTopK) {
  const zbxQ = String(zbxQuestion).replace(/[\s，。！？、,.!?；;：:（）()【】\[\]"'“”‘’]/g, '');
  const zbxTerms = [];
  for (let i = 0; i < zbxQ.length; i++) {
    zbxTerms.push(zbxQ[i]);
    if (i < zbxQ.length - 1) zbxTerms.push(zbxQ.slice(i, i + 2));
  }

  const zbxScored = [];
  zbxKbDocs.forEach((zbxDoc) => {
    zbxDoc.chunks.forEach((zbxChunk, zbxIndex) => {
      const zbxPlain = zbxChunk.replace(/\s/g, '');
      let zbxHit = 0;
      zbxTerms.forEach((zbxTerm) => {
        if (zbxTerm && zbxPlain.indexOf(zbxTerm) !== -1) zbxHit += zbxTerm.length > 1 ? 2 : 1;
      });
      if (zbxHit > 0) {
        zbxScored.push({
          docName: zbxDoc.name,
          chunkIndex: zbxIndex,
          text: zbxChunk,
          score: zbxHit / Math.max(1, zbxTerms.length)
        });
      }
    });
  });

  zbxScored.sort((a, b) => b.score - a.score);
  return zbxScored.slice(0, zbxTopK || 3);
}

// 上传知识库文档（前端读取文本后以 JSON 传 content）
exports.zbxKbUpload = async (req, res) => {
  try {
    const zbxName = String((req.body && req.body.name) || '').trim();
    const zbxContent = String((req.body && req.body.content) || '').trim();

    if (!zbxName || !zbxContent) {
      res.json({ code: 1, msg: '请提供文件名与文本内容', data: {} });
      return;
    }
    if (zbxContent.length > 200000) {
      res.json({ code: 1, msg: '文件内容过大（上限 20 万字符）', data: {} });
      return;
    }

    const zbxChunks = zbxSplitChunks(zbxContent, 400, 60);
    const zbxDoc = {
      id: 'doc_' + Date.now(),
      name: zbxName,
      chunks: zbxChunks,
      charCount: zbxContent.length,
      time: new Date().toISOString()
    };
    zbxKbDocs.push(zbxDoc);

    console.log('[知识库] 上传：' + zbxName + '，分片：' + zbxChunks.length);

    res.json({
      code: 0,
      msg: '上传成功',
      data: { id: zbxDoc.id, name: zbxDoc.name, chunks: zbxChunks.length, charCount: zbxDoc.charCount }
    });
  } catch (zbxError) {
    zbxErrorResponse(res, zbxError);
  }
};

// 知识库文档列表
exports.zbxKbList = (req, res) => {
  res.json({
    code: 0,
    msg: '查询成功',
    data: {
      docs: zbxKbDocs.map((d) => ({ id: d.id, name: d.name, chunks: d.chunks.length, charCount: d.charCount, time: d.time }))
    }
  });
};

// 知识库问答：检索 + 大模型生成
exports.zbxKbAsk = async (req, res) => {
  try {
    const zbxQuestion = String((req.body && req.body.question) || '').trim();
    if (!zbxQuestion) {
      res.json({ code: 1, msg: '请输入问题', data: {} });
      return;
    }
    if (zbxKbDocs.length === 0) {
      res.json({ code: 1, msg: '知识库为空，请先上传文档', data: {} });
      return;
    }

    const zbxHits = zbxRetrieve(zbxQuestion, 3);
    if (zbxHits.length === 0) {
      res.json({
        code: 0,
        msg: '知识库中未检索到相关内容',
        data: { answer: '抱歉，知识库中没有找到与该问题相关的内容。', sources: [] }
      });
      return;
    }

    const zbxContext = zbxHits.map((h, i) => '【资料' + (i + 1) + '｜' + h.docName + '】\n' + h.text).join('\n\n');
    const zbxSystem = '你是知识库问答助手。只能依据下面提供的资料回答；资料中没有的信息就回答“资料中未提及”，不要编造。回答用中文，简洁准确。\n\n资料：\n' + zbxContext;

    const zbxResult = await zbxPostJson('/chat/completions', {
      model: ZBX_TEXT_MODEL,
      messages: [
        { role: 'system', content: zbxSystem },
        { role: 'user', content: zbxQuestion }
      ],
      stream: false,
      temperature: 0.2,
      max_tokens: 1024
    });

    const zbxAnswer = (zbxResult.choices && zbxResult.choices[0] && zbxResult.choices[0].message.content) || '';

    res.json({
      code: 0,
      msg: '问答成功',
      data: {
        answer: zbxAnswer,
        sources: zbxHits.map((h) => ({
          docName: h.docName,
          snippet: h.text.slice(0, 120),
          score: Number(h.score.toFixed(3))
        }))
      }
    });
  } catch (zbxError) {
    zbxErrorResponse(res, zbxError);
  }
};

/* ---------------- 图像识别 ---------------- */

exports.zbxVision = async (req, res) => {
  try {
    const zbxImage = String((req.body && req.body.image) || '');
    const zbxQuestion = String((req.body && req.body.question) || '请描述这张图片的内容').trim();

    if (!zbxImage || zbxImage.indexOf('data:image/') !== 0) {
      res.json({ code: 1, msg: '请上传图片（dataURL 格式）', data: {} });
      return;
    }

    const zbxResult = await zbxPostJson('/chat/completions', {
      model: ZBX_VISION_MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: zbxImage } },
          { type: 'text', text: zbxQuestion }
        ]
      }],
      stream: false,
      max_tokens: 1024
    });

    const zbxContent = (zbxResult.choices && zbxResult.choices[0] && zbxResult.choices[0].message.content) || '';
    res.json({ code: 0, msg: '识别成功', data: { result: zbxContent, model: ZBX_VISION_MODEL } });
  } catch (zbxError) {
    zbxErrorResponse(res, zbxError);
  }
};

/* ---------------- 语音识别 ---------------- */

function zbxParseAudio(zbxDataUrl) {
  const zbxMatch = /^data:(audio\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(zbxDataUrl);
  if (!zbxMatch) return null;
  const zbxMime = zbxMatch[1];
  const zbxExtMap = { 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/ogg': 'ogg', 'audio/webm': 'webm', 'audio/mp4': 'm4a' };
  return {
    contentType: zbxMime,
    filename: 'audio.' + (zbxExtMap[zbxMime] || 'wav'),
    buffer: Buffer.from(zbxMatch[2], 'base64')
  };
}

exports.zbxAsr = async (req, res) => {
  try {
    const zbxAudio = String((req.body && req.body.audio) || '');
    const zbxFile = zbxParseAudio(zbxAudio);

    if (!zbxFile) {
      res.json({ code: 1, msg: '请上传音频文件（dataURL 格式）', data: {} });
      return;
    }
    if (zbxFile.buffer.length > 20 * 1024 * 1024) {
      res.json({ code: 1, msg: '音频过大（上限 20MB）', data: {} });
      return;
    }

    const zbxResult = await zbxPostMultipart('/audio/transcriptions', { model: ZBX_ASR_MODEL }, zbxFile);

    res.json({
      code: 0,
      msg: '识别成功',
      data: { text: zbxResult.text || '', language: zbxResult.language || '', model: ZBX_ASR_MODEL }
    });
  } catch (zbxError) {
    zbxErrorResponse(res, zbxError);
  }
};
