/*
  姓名：zhangboxin
  学号：24001010910
  时间：2026-11-19
  大模型：DeepSeek-V4.1-Flash

  数据库连接页：提交用户名/密码到后端，展示成功或失败提示
*/
(function () {
  'use strict';

  var zbxForm = document.getElementById('zbx_db_form');
  var zbxUserInput = document.getElementById('zbx_db_user');
  var zbxPasswordInput = document.getElementById('zbx_db_password');
  var zbxSubmitButton = document.getElementById('zbx_db_submit');
  var zbxResultBox = document.getElementById('zbx_db_result');

  if (!zbxForm || !zbxUserInput || !zbxPasswordInput || !zbxSubmitButton || !zbxResultBox) {
    return;
  }

  function zbxShowResult(zbxIsOk, zbxMessage, zbxDetails) {
    var zbxHtml = '<p class="zbx_result-title">' + (zbxIsOk ? '连接成功' : '连接失败') + '：' + zbxMessage + '</p>';

    if (zbxDetails && zbxDetails.length) {
      zbxHtml += '<div class="zbx_result-list">';
      for (var zbxI = 0; zbxI < zbxDetails.length; zbxI++) {
        zbxHtml += '<span>' + zbxDetails[zbxI] + '</span>';
      }
      zbxHtml += '</div>';
    }

    zbxResultBox.innerHTML = zbxHtml;
    zbxResultBox.className = 'zbx_result ' + (zbxIsOk ? 'zbx_result-ok' : 'zbx_result-error');
    zbxResultBox.hidden = false;
  }

  function zbxBuildDetails(zbxData) {
    var zbxDetails = [];

    if (zbxData.zbxHost) {
      zbxDetails.push('主机：' + zbxData.zbxHost + ':3306');
    }
    if (zbxData.zbxVersion) {
      zbxDetails.push('MySQL 版本：' + zbxData.zbxVersion);
    }
    if (zbxData.zbxCurrentUser) {
      zbxDetails.push('当前用户：' + zbxData.zbxCurrentUser);
    }
    if (typeof zbxData.zbxDatabaseCount === 'number') {
      zbxDetails.push('可见数据库数量：' + zbxData.zbxDatabaseCount);
    }

    return zbxDetails;
  }

  zbxForm.addEventListener('submit', function (zbxEvent) {
    zbxEvent.preventDefault();

    var zbxUser = zbxUserInput.value.trim();
    var zbxPassword = zbxPasswordInput.value;

    zbxResultBox.hidden = true;

    if (!zbxUser) {
      zbxShowResult(false, '请输入数据库用户名', []);
      zbxUserInput.focus();
      return;
    }

    zbxSubmitButton.disabled = true;
    zbxSubmitButton.textContent = '连接中...';

    fetch('/api/database/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zbx_user: zbxUser, zbx_password: zbxPassword })
    })
      .then(function (zbxResponse) {
        return zbxResponse.json();
      })
      .then(function (zbxData) {
        console.log('数据库连接接口返回：', zbxData);

        if (zbxData.code === 0) {
          zbxShowResult(true, zbxData.msg, zbxBuildDetails(zbxData.data || {}));
        } else {
          zbxShowResult(false, zbxData.msg || '未知错误', []);
        }
      })
      .catch(function (zbxError) {
        console.error('请求 /api/database/connect 失败：', zbxError);
        zbxShowResult(false, '请求后端失败，请确认后台服务已启动', []);
      })
      .finally(function () {
        zbxSubmitButton.disabled = false;
        zbxSubmitButton.textContent = '连接数据库';
      });
  });
})();
