/*
  姓名：zhangboxin
  学号：24001010910
  时间：2026-11-23
  大模型：DeepSeek-V4.1-Flash

  AI 聊天页：
  1、维护一个 messages 数组保存全部对话，实现"多轮对话"（模型本身不记事，靠每次都把历史一起发过去）
  2、发送后先把用户消息显示出来，再等待接口返回追加 AI 回答
  3、等待期间显示"正在思考..."
*/
(function () {
  'use strict';

  var zbxForm = document.getElementById('zbx_chat_form');
  var zbxInput = document.getElementById('zbx_chat_input');
  var zbxSendBtn = document.getElementById('zbx_chat_send');
  var zbxMessagesBox = document.getElementById('zbx_chat_messages');
  var zbxStatus = document.getElementById('zbx_chat_status');
  var zbxProvider = document.getElementById('zbx_chat_provider');
  var zbxModelNote = document.getElementById('zbx_chat_model_note');

  if (!zbxForm || !zbxInput || !zbxMessagesBox) {
    return;
  }

  // 全部对话历史：[{ role: 'user'|'assistant', content: '...' }]
  // 每轮把用户消息与 AI 回复都 push 进来，下次请求整体发给后端
  var zbxMessages = [];
  var zbxLoading = false;

  function zbxAutoResize() {
    zbxInput.style.height = 'auto';
    zbxInput.style.height = Math.min(zbxInput.scrollHeight, 160) + 'px';
  }

  function zbxScrollToBottom() {
    zbxMessagesBox.scrollTop = zbxMessagesBox.scrollHeight;
  }

  /**
   * 渲染一条消息气泡
   * @param {string} zbxRole - 'user' | 'assistant'
   * @param {string} zbxContent - 消息内容
   * @returns {HTMLElement} 气泡容器
   */
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

  function zbxSend() {
    var zbxText = zbxInput.value.trim();
    if (!zbxText || zbxLoading) return;

    // 1. 先把"用户的话"显示出来
    zbxAppendMessage('user', zbxText);
    zbxInput.value = '';
    zbxAutoResize();

    // 2. 把用户消息 push 进 messages 数组
    zbxMessages.push({ role: 'user', content: zbxText });

    // 3. 显示"正在思考..."
    zbxSetLoading(true);
    zbxSetStatus('客服正在思考...');

    var zbxThinkingWrap = zbxAppendMessage('assistant', '正在思考...');
    var zbxThinkingBubble = zbxThinkingWrap.querySelector('.zbx_chat-bubble');
    zbxThinkingBubble.classList.add('zbx_chat-thinking');

    // 4. 把完整对话历史与当前选择的平台发给后端
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: zbxMessages,
        provider: zbxProvider ? zbxProvider.value : 'siliconflow'
      })
    })
      .then(function (zbxResponse) {
        return zbxResponse.json();
      })
      .then(function (zbxData) {
        console.log('AI 聊天接口返回：', zbxData);

        zbxThinkingWrap.remove();

        if (zbxData.code !== 0) {
          var zbxErrMsg = '抱歉，出现了错误：' + (zbxData.msg || '未知错误');
          zbxSetStatus(zbxData.msg || 'AI 回复失败', true);
          zbxAppendMessage('assistant', zbxErrMsg);
          // 失败时回滚本轮用户消息，避免下次重发重复上下文
          zbxMessages.pop();
          return;
        }

        // 5. 接口返回后追加"AI 的回答"
        var zbxReply = (zbxData.data && zbxData.data.content) || '';
        zbxSetStatus('');
        zbxAppendMessage('assistant', zbxReply);

        // 6. 把 AI 回复也 push 进 messages 数组，供下一轮使用
        zbxMessages.push({ role: 'assistant', content: zbxReply });
      })
      .catch(function (zbxError) {
        console.error('请求 /api/chat 失败：', zbxError);
        zbxThinkingWrap.remove();
        zbxSetStatus('请求后端失败，请确认后台服务已启动', true);
        zbxAppendMessage('assistant', '网络错误，无法连接到后端服务。');
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

  // 平台切换：仅提示，不中断当前对话（messages 为通用格式，两个平台都能用）
  if (zbxProvider) {
    zbxProvider.addEventListener('change', function () {
      var zbxLabel = zbxProvider.options[zbxProvider.selectedIndex].text;
      if (zbxModelNote) {
        zbxModelNote.textContent = '当前平台：' + zbxLabel;
      }
      zbxSetStatus('已切换到「' + zbxLabel + '」，继续提问即可');
    });
  }

  zbxInput.focus();
})();
