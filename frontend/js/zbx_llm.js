/*
  姓名：zhangboxin
  学号：24001010910
  时间：2026-11-26
  大模型：DeepSeek-V4.1-Flash

  LLM 实践页面脚本：
  1、多平台客服切换（/api/chat）
  2、知识库上传与问答（/api/llm/kb/upload、/api/llm/kb、/api/llm/kb/ask）
  3、图像识别（/api/llm/vision）
  4、语音识别（/api/llm/asr）
*/
(function () {
  'use strict';

  /* ---------- 公共工具 ---------- */

  function zbxRequest(zbxUrl, zbxOptions) {
    return fetch(zbxUrl, zbxOptions).then(function (zbxRes) {
      return zbxRes.json();
    });
  }

  function zbxReadAsDataUrl(zbxFile) {
    return new Promise(function (zbxResolve, zbxReject) {
      var zbxReader = new FileReader();
      zbxReader.onload = function () { zbxResolve(zbxReader.result); };
      zbxReader.onerror = function () { zbxReject(new Error('读取文件失败')); };
      zbxReader.readAsDataURL(zbxFile);
    });
  }

  function zbxReadAsText(zbxFile) {
    return new Promise(function (zbxResolve, zbxReject) {
      var zbxReader = new FileReader();
      zbxReader.onload = function () { zbxResolve(zbxReader.result); };
      zbxReader.onerror = function () { zbxReject(new Error('读取文件失败')); };
      zbxReader.readAsText(zbxFile, 'utf-8');
    });
  }

  function zbxSetHint(zbxEl, zbxText, zbxIsError) {
    if (!zbxEl) return;
    zbxEl.textContent = zbxText || '';
    zbxEl.classList.toggle('zbx_error', !!zbxIsError);
  }

  /* ---------- 1. 多平台客服 ---------- */

  (function zbxInitChat() {
    var zbxForm = document.getElementById('zbx_llm_chat_form');
    var zbxInput = document.getElementById('zbx_llm_chat_input');
    var zbxSend = document.getElementById('zbx_llm_chat_send');
    var zbxBox = document.getElementById('zbx_llm_chat_messages');
    var zbxStatus = document.getElementById('zbx_llm_chat_status');
    var zbxProvider = document.getElementById('zbx_llm_provider');
    var zbxProviderTip = document.getElementById('zbx_llm_provider_tip');

    if (!zbxForm || !zbxBox) return;

    var zbxMessages = [];
    var zbxLoading = false;

    function zbxAppend(zbxRole, zbxText) {
      var zbxWrap = document.createElement('div');
      zbxWrap.className = 'zbx_chat-msg zbx_chat-msg-' + (zbxRole === 'user' ? 'user' : 'assistant');

      var zbxAvatar = document.createElement('div');
      zbxAvatar.className = 'zbx_chat-avatar';
      zbxAvatar.textContent = zbxRole === 'user' ? '我' : '客服';
      zbxWrap.appendChild(zbxAvatar);

      var zbxBubble = document.createElement('div');
      zbxBubble.className = 'zbx_chat-bubble';
      zbxBubble.textContent = zbxText;
      zbxWrap.appendChild(zbxBubble);

      zbxBox.appendChild(zbxWrap);
      zbxBox.scrollTop = zbxBox.scrollHeight;
      return zbxWrap;
    }

    function zbxSendMessage() {
      var zbxText = zbxInput.value.trim();
      if (!zbxText || zbxLoading) return;

      zbxAppend('user', zbxText);
      zbxInput.value = '';
      zbxMessages.push({ role: 'user', content: zbxText });

      zbxLoading = true;
      zbxSend.disabled = true;
      zbxSend.textContent = '思考中...';
      zbxSetHint(zbxStatus, '客服正在思考...');

      var zbxThinking = zbxAppend('assistant', '正在思考...');
      zbxThinking.querySelector('.zbx_chat-bubble').classList.add('zbx_chat-thinking');

      zbxRequest('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: zbxMessages,
          provider: zbxProvider ? zbxProvider.value : 'siliconflow'
        })
      }).then(function (zbxData) {
        console.log('客服接口返回：', zbxData);
        zbxThinking.remove();

        if (zbxData.code !== 0) {
          zbxSetHint(zbxStatus, zbxData.msg, true);
          zbxAppend('assistant', '抱歉，客服暂时无法回复：' + (zbxData.msg || '未知错误'));
          zbxMessages.pop();
          return;
        }

        var zbxReply = (zbxData.data && zbxData.data.content) || '';
        zbxSetHint(zbxStatus, '');
        zbxAppend('assistant', zbxReply);
        zbxMessages.push({ role: 'assistant', content: zbxReply });
      }).catch(function (zbxError) {
        console.error('客服请求失败：', zbxError);
        zbxThinking.remove();
        zbxSetHint(zbxStatus, '请求失败，请确认后端已启动', true);
        zbxAppend('assistant', '网络错误，无法连接到客服服务。');
        zbxMessages.pop();
      }).finally(function () {
        zbxLoading = false;
        zbxSend.disabled = false;
        zbxSend.textContent = '发送';
        zbxInput.focus();
      });
    }

    zbxForm.addEventListener('submit', function (zbxEvent) {
      zbxEvent.preventDefault();
      zbxSendMessage();
    });

    zbxInput.addEventListener('keydown', function (zbxEvent) {
      if (zbxEvent.key === 'Enter' && !zbxEvent.shiftKey) {
        zbxEvent.preventDefault();
        zbxSendMessage();
      }
    });

    if (zbxProvider) {
      zbxProvider.addEventListener('change', function () {
        var zbxLabel = zbxProvider.options[zbxProvider.selectedIndex].text;
        if (zbxProviderTip) zbxProviderTip.textContent = '当前平台：' + zbxLabel;
        zbxSetHint(zbxStatus, '已切换到「' + zbxLabel + '」，继续提问即可');
      });
    }
  })();

  /* ---------- 2. 知识库 ---------- */

  (function zbxInitKb() {
    var zbxFileInput = document.getElementById('zbx_llm_kb_file');
    var zbxUploadBtn = document.getElementById('zbx_llm_kb_upload');
    var zbxUploadStatus = document.getElementById('zbx_llm_kb_upload_status');
    var zbxDocList = document.getElementById('zbx_llm_kb_docs');
    var zbxQuestion = document.getElementById('zbx_llm_kb_question');
    var zbxAskBtn = document.getElementById('zbx_llm_kb_ask');
    var zbxResult = document.getElementById('zbx_llm_kb_result');
    var zbxAnswer = document.getElementById('zbx_llm_kb_answer');
    var zbxSources = document.getElementById('zbx_llm_kb_sources');

    if (!zbxUploadBtn || !zbxDocList) return;

    function zbxRenderDocs(zbxDocs) {
      zbxDocList.innerHTML = '';
      if (!zbxDocs || zbxDocs.length === 0) {
        zbxDocList.innerHTML = '<span class="zbx_llm-empty">知识库暂无文档，请先上传</span>';
        return;
      }
      zbxDocs.forEach(function (zbxDoc) {
        var zbxItem = document.createElement('span');
        zbxItem.className = 'zbx_llm-doc';
        zbxItem.textContent = zbxDoc.name + '（' + zbxDoc.chunks + ' 个片段）';
        zbxDocList.appendChild(zbxItem);
      });
    }

    function zbxLoadDocs() {
      zbxRequest('/api/llm/kb', { method: 'GET' }).then(function (zbxData) {
        if (zbxData.code === 0) zbxRenderDocs(zbxData.data.docs);
      }).catch(function (zbxError) {
        console.error('加载知识库失败：', zbxError);
      });
    }

    zbxUploadBtn.addEventListener('click', function () {
      var zbxFile = zbxFileInput.files && zbxFileInput.files[0];
      if (!zbxFile) {
        zbxSetHint(zbxUploadStatus, '请先选择文件', true);
        return;
      }
      zbxUploadBtn.disabled = true;
      zbxSetHint(zbxUploadStatus, '正在上传...');

      zbxReadAsText(zbxFile).then(function (zbxContent) {
        return zbxRequest('/api/llm/kb/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: zbxFile.name, content: zbxContent })
        });
      }).then(function (zbxData) {
        console.log('知识库上传返回：', zbxData);
        if (zbxData.code !== 0) {
          zbxSetHint(zbxUploadStatus, zbxData.msg, true);
          return;
        }
        zbxSetHint(zbxUploadStatus, '上传成功：' + zbxData.data.name + '（' + zbxData.data.chunks + ' 个片段）');
        zbxLoadDocs();
      }).catch(function (zbxError) {
        console.error('上传失败：', zbxError);
        zbxSetHint(zbxUploadStatus, '上传失败：' + zbxError.message, true);
      }).finally(function () {
        zbxUploadBtn.disabled = false;
      });
    });

    zbxAskBtn.addEventListener('click', function () {
      var zbxQ = zbxQuestion.value.trim();
      if (!zbxQ) {
        zbxQuestion.focus();
        return;
      }
      zbxAskBtn.disabled = true;
      zbxAskBtn.textContent = '检索中...';

      zbxRequest('/api/llm/kb/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: zbxQ })
      }).then(function (zbxData) {
        console.log('知识库问答返回：', zbxData);
        zbxResult.hidden = false;
        if (zbxData.code !== 0) {
          zbxAnswer.textContent = zbxData.msg;
          zbxSources.innerHTML = '';
          return;
        }
        zbxAnswer.textContent = zbxData.data.answer || '（无回答）';
        zbxSources.innerHTML = '';
        (zbxData.data.sources || []).forEach(function (zbxSource) {
          var zbxEl = document.createElement('div');
          zbxEl.className = 'zbx_llm-source';
          zbxEl.innerHTML = '<strong></strong><span></span>';
          zbxEl.querySelector('strong').textContent = zbxSource.docName + '｜相关度 ' + zbxSource.score;
          zbxEl.querySelector('span').textContent = zbxSource.snippet;
          zbxSources.appendChild(zbxEl);
        });
      }).catch(function (zbxError) {
        console.error('知识库问答失败：', zbxError);
        zbxResult.hidden = false;
        zbxAnswer.textContent = '请求失败：' + zbxError.message;
        zbxSources.innerHTML = '';
      }).finally(function () {
        zbxAskBtn.disabled = false;
        zbxAskBtn.textContent = '提问';
      });
    });

    zbxQuestion.addEventListener('keydown', function (zbxEvent) {
      if (zbxEvent.key === 'Enter') {
        zbxEvent.preventDefault();
        zbxAskBtn.click();
      }
    });

    zbxLoadDocs();
  })();

  /* ---------- 3. 图像识别 ---------- */

  (function zbxInitVision() {
    var zbxFileInput = document.getElementById('zbx_llm_vision_file');
    var zbxQuestion = document.getElementById('zbx_llm_vision_question');
    var zbxBtn = document.getElementById('zbx_llm_vision_btn');
    var zbxPreview = document.getElementById('zbx_llm_vision_preview');
    var zbxResult = document.getElementById('zbx_llm_vision_result');
    var zbxText = document.getElementById('zbx_llm_vision_text');

    if (!zbxBtn) return;

    zbxFileInput.addEventListener('change', function () {
      var zbxFile = zbxFileInput.files && zbxFileInput.files[0];
      if (!zbxFile) return;
      zbxReadAsDataUrl(zbxFile).then(function (zbxDataUrl) {
        zbxPreview.src = zbxDataUrl;
        zbxPreview.hidden = false;
      });
    });

    zbxBtn.addEventListener('click', function () {
      var zbxFile = zbxFileInput.files && zbxFileInput.files[0];
      if (!zbxFile) {
        zbxResult.hidden = false;
        zbxText.textContent = '请先选择一张图片';
        return;
      }

      zbxBtn.disabled = true;
      zbxBtn.textContent = '识别中...';
      zbxResult.hidden = false;
      zbxText.textContent = '模型正在识别图片，请稍候...';

      zbxReadAsDataUrl(zbxFile).then(function (zbxDataUrl) {
        return zbxRequest('/api/llm/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: zbxDataUrl, question: zbxQuestion.value.trim() || '请描述这张图片的内容' })
        });
      }).then(function (zbxData) {
        console.log('图像识别返回：', zbxData);
        if (zbxData.code !== 0) {
          zbxText.textContent = zbxData.msg;
          return;
        }
        zbxText.textContent = zbxData.data.result || '（无结果）';
      }).catch(function (zbxError) {
        console.error('图像识别失败：', zbxError);
        zbxText.textContent = '识别失败：' + zbxError.message;
      }).finally(function () {
        zbxBtn.disabled = false;
        zbxBtn.textContent = '开始识别';
      });
    });
  })();

  /* ---------- 4. 语音识别 ---------- */

  (function zbxInitAsr() {
    var zbxFileInput = document.getElementById('zbx_llm_asr_file');
    var zbxBtn = document.getElementById('zbx_llm_asr_btn');
    var zbxStatus = document.getElementById('zbx_llm_asr_status');
    var zbxResult = document.getElementById('zbx_llm_asr_result');
    var zbxText = document.getElementById('zbx_llm_asr_text');

    if (!zbxBtn) return;

    zbxBtn.addEventListener('click', function () {
      var zbxFile = zbxFileInput.files && zbxFileInput.files[0];
      if (!zbxFile) {
        zbxSetHint(zbxStatus, '请先选择音频文件', true);
        return;
      }

      zbxBtn.disabled = true;
      zbxBtn.textContent = '识别中...';
      zbxSetHint(zbxStatus, '正在上传并识别...');
      zbxResult.hidden = true;

      zbxReadAsDataUrl(zbxFile).then(function (zbxDataUrl) {
        return zbxRequest('/api/llm/asr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: zbxDataUrl })
        });
      }).then(function (zbxData) {
        console.log('语音识别返回：', zbxData);
        if (zbxData.code !== 0) {
          zbxSetHint(zbxStatus, zbxData.msg, true);
          return;
        }
        zbxResult.hidden = false;
        zbxText.textContent = zbxData.data.text || '（未识别到文字）';
        zbxSetHint(zbxStatus, '识别完成，语言：' + (zbxData.data.language || '未知'));
      }).catch(function (zbxError) {
        console.error('语音识别失败：', zbxError);
        zbxSetHint(zbxStatus, '识别失败：' + zbxError.message, true);
      }).finally(function () {
        zbxBtn.disabled = false;
        zbxBtn.textContent = '开始识别';
      });
    });
  })();
})();
