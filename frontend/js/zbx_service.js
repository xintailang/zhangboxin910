/*
  姓名：zhangboxin
  学号：24001010910
  时间：2026-11-26
  大模型：DeepSeek-V4.1-Flash

  在线客服页：
  1、维护 messages 数组保存全部对话，实现多轮咨询
  2、发送后先显示用户消息，等待期间显示"正在思考..."，返回后追加客服回复
  3、支持常见问题快捷提问
*/
(function () {
  'use strict';

  var zbxForm = document.getElementById('zbx_service_form');
  var zbxInput = document.getElementById('zbx_service_input');
  var zbxSendBtn = document.getElementById('zbx_service_send');
  var zbxMessagesBox = document.getElementById('zbx_service_messages');
  var zbxStatus = document.getElementById('zbx_service_status');
  var zbxQuick = document.getElementById('zbx_service_quick');

  if (!zbxForm || !zbxInput || !zbxMessagesBox) {
    return;
  }

  var zbxMessages = [];
  var zbxLoading = false;

  function zbxAutoResize() {
    zbxInput.style.height = 'auto';
    zbxInput.style.height = Math.min(zbxInput.scrollHeight, 160) + 'px';
  }

  function zbxScrollToBottom() {
    zbxMessagesBox.scrollTop = zbxMessagesBox.scrollHeight;
  }

  function zbxAppendMessage(zbxRole, zbxContent) {
    var zbxWrap = document.createElement('div');
    zbxWrap.className = 'zbx_chat-msg zbx_chat-msg-' + (zbxRole === 'user' ? 'user' : 'assistant');

    var zbxAvatar = document.createElement('div');
    zbxAvatar.className = 'zbx_chat-avatar';
    zbxAvatar.textContent = zbxRole === 'user' ? '我' : '客服';
    zbxWrap.appendChild(zbxAvatar);

    var zbxBubble = document.createElement('div');
    zbxBubble.className = 'zbx_chat-bubble';
    zbxBubble.textContent = zbxContent;
    zbxWrap.appendChild(zbxBubble);

    zbxMessagesBox.appendChild(zbxWrap);
    zbxScrollToBottom();
    return zbxWrap;
  }

  function zbxSetStatus(zbxText, zbxIsError) {
    if (!zbxStatus) return;
    zbxStatus.textContent = zbxText || '';
    zbxStatus.classList.toggle('zbx_error', !!zbxIsError);
  }

  function zbxSetLoading(zbxIsLoading) {
    zbxLoading = zbxIsLoading;
    zbxSendBtn.disabled = zbxIsLoading;
    zbxSendBtn.textContent = zbxIsLoading ? '思考中...' : '发送';
  }

  /**
   * 发送一条用户消息
   * @param {string} zbxText - 用户输入内容
   */
  function zbxSend(zbxText) {
    var zbxContent = (zbxText || zbxInput.value).trim();
    if (!zbxContent || zbxLoading) return;

    zbxAppendMessage('user', zbxContent);
    zbxInput.value = '';
    zbxAutoResize();

    zbxMessages.push({ role: 'user', content: zbxContent });

    zbxSetLoading(true);
    zbxSetStatus('客服正在回复...');

    var zbxThinkingWrap = zbxAppendMessage('assistant', '正在思考...');
    zbxThinkingWrap.querySelector('.zbx_chat-bubble').classList.add('zbx_chat-thinking');

    fetch('/api/service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: zbxMessages })
    })
      .then(function (zbxResponse) {
        return zbxResponse.json();
      })
      .then(function (zbxData) {
        console.log('在线客服接口返回：', zbxData);

        zbxThinkingWrap.remove();

        if (zbxData.code !== 0) {
          zbxSetStatus(zbxData.msg || '客服回复失败', true);
          zbxAppendMessage('assistant', '抱歉，客服暂时无法回复：' + (zbxData.msg || '未知错误'));
          zbxMessages.pop();
          return;
        }

        var zbxReply = (zbxData.data && zbxData.data.content) || '';
        zbxSetStatus('');
        zbxAppendMessage('assistant', zbxReply);
        zbxMessages.push({ role: 'assistant', content: zbxReply });
      })
      .catch(function (zbxError) {
        console.error('请求 /api/service 失败：', zbxError);
        zbxThinkingWrap.remove();
        zbxSetStatus('请求后端失败，请确认后台服务已启动', true);
        zbxAppendMessage('assistant', '网络错误，无法连接到客服服务。');
        zbxMessages.pop();
      })
      .finally(function () {
        zbxSetLoading(false);
        zbxInput.focus();
      });
  }

  zbxForm.addEventListener('submit', function (zbxEvent) {
    zbxEvent.preventDefault();
    zbxSend();
  });

  zbxInput.addEventListener('keydown', function (zbxEvent) {
    if (zbxEvent.key === 'Enter' && !zbxEvent.shiftKey) {
      zbxEvent.preventDefault();
      zbxSend();
    }
  });

  zbxInput.addEventListener('input', zbxAutoResize);

  // 常见问题快捷提问
  if (zbxQuick) {
    zbxQuick.addEventListener('click', function (zbxEvent) {
      var zbxBtn = zbxEvent.target.closest ? zbxEvent.target.closest('.zbx_service-chip') : null;
      if (!zbxBtn) return;
      zbxSend(zbxBtn.getAttribute('data-zbx-question') || zbxBtn.textContent);
    });
  }

  zbxInput.focus();
})();
