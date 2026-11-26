/*
  姓名：zhangboxin
  学号：24001010910
  时间：2026-11-19
  大模型：DeepSeek-V4.1-Flash

  科技新闻列表页：请求 /api/news 并渲染新闻卡片
*/
(function () {
  'use strict';

  var zbxList = document.getElementById('zbx_news_list');
  var zbxCount = document.getElementById('zbx_news_count');

  if (!zbxList || !zbxCount) {
    return;
  }

  function zbxShowState(zbxMessage) {
    zbxList.innerHTML = '';
    var zbxState = document.createElement('p');
    zbxState.className = 'zbx_news-state';
    zbxState.textContent = zbxMessage;
    zbxList.appendChild(zbxState);
  }

  function zbxCreateText(zbxTag, zbxClassName, zbxText) {
    var zbxElement = document.createElement(zbxTag);
    zbxElement.className = zbxClassName;
    zbxElement.textContent = zbxText;
    return zbxElement;
  }

  function zbxRenderNews(zbxItem) {
    var zbxCard = document.createElement('article');
    zbxCard.className = 'zbx_news-card';

    var zbxTop = document.createElement('div');
    zbxTop.className = 'zbx_news-top';
    zbxTop.appendChild(zbxCreateText('span', 'zbx_news-category', zbxItem.zbx_category));
    zbxTop.appendChild(zbxCreateText('span', 'zbx_news-time', zbxItem.zbx_publish_time));
    zbxCard.appendChild(zbxTop);

    zbxCard.appendChild(zbxCreateText('h2', 'zbx_news-title', zbxItem.zbx_title));
    zbxCard.appendChild(zbxCreateText('p', 'zbx_news-summary', zbxItem.zbx_summary));

    var zbxMeta = document.createElement('div');
    zbxMeta.className = 'zbx_news-meta';
    zbxMeta.appendChild(zbxCreateText('span', '', '来源：' + zbxItem.zbx_source));
    zbxMeta.appendChild(zbxCreateText('span', '', '作者：' + zbxItem.zbx_author));
    zbxMeta.appendChild(zbxCreateText('span', '', '浏览：' + zbxItem.zbx_views));
    zbxCard.appendChild(zbxMeta);

    return zbxCard;
  }

  fetch('/api/news')
    .then(function (zbxResponse) {
      return zbxResponse.json();
    })
    .then(function (zbxData) {
      console.log('科技新闻接口返回：', zbxData);

      if (zbxData.code !== 0) {
        zbxCount.textContent = '新闻数据加载失败';
        zbxShowState(zbxData.msg || '后端返回错误');
        return;
      }

      var zbxNewsList = (zbxData.data && zbxData.data.zbxList) || [];

      zbxCount.textContent = '共 ' + ((zbxData.data && zbxData.data.zbxTotal) || 0) + ' 条科技新闻';

      if (!zbxNewsList.length) {
        zbxShowState('暂无新闻数据');
        return;
      }

      zbxList.innerHTML = '';

      for (var zbxI = 0; zbxI < zbxNewsList.length; zbxI++) {
        zbxList.appendChild(zbxRenderNews(zbxNewsList[zbxI]));
      }
    })
    .catch(function (zbxError) {
      console.error('请求 /api/news 失败：', zbxError);
      zbxCount.textContent = '新闻数据加载失败';
      zbxShowState('请求后端失败，请确认后台服务已启动');
    });
})();
