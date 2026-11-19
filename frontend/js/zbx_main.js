/*
  姓名：zhangboxin
  学号：24001010910
  时间：2026-11-19
  大模型：DeepSeek-V4.1-Flash

  首页交互：元素入场动画 + 服务端健康检查
*/
(function () {
  'use strict';

  var zbxRevealItems = document.querySelectorAll('.zbx_reveal');

  function zbxRevealAll() {
    for (var zbxI = 0; zbxI < zbxRevealItems.length; zbxI++) {
      zbxRevealItems[zbxI].classList.add('zbx_reveal-on');
    }
  }

  if ('IntersectionObserver' in window) {
    var zbxObserver = new IntersectionObserver(function (zbxEntries) {
      zbxEntries.forEach(function (zbxEntry) {
        if (zbxEntry.isIntersecting) {
          zbxEntry.target.classList.add('zbx_reveal-on');
          zbxObserver.unobserve(zbxEntry.target);
        }
      });
    }, { threshold: 0.12 });

    for (var zbxJ = 0; zbxJ < zbxRevealItems.length; zbxJ++) {
      zbxObserver.observe(zbxRevealItems[zbxJ]);
    }
  } else {
    zbxRevealAll();
  }

  // 请求后端健康检查接口，把服务端返回的数据输出到控制台
  fetch('/api/health')
    .then(function (zbxResponse) {
      return zbxResponse.json();
    })
    .then(function (zbxData) {
      console.log('服务端返回数据：', zbxData);
    })
    .catch(function (zbxError) {
      console.error('请求 /api/health 失败：', zbxError);
    });
})();
