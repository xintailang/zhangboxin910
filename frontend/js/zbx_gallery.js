/*
  姓名：zhangboxin
  学号：24001010910
  时间：2026-11-19
  大模型：DeepSeek-V4.1-Flash

  图文列表页：请求 /api/gallery 并渲染图文卡片
*/
(function () {
  'use strict';

  var zbxGrid = document.getElementById('zbx_gallery_list');
  var zbxCount = document.getElementById('zbx_gallery_count');

  if (!zbxGrid || !zbxCount) {
    return;
  }

  function zbxShowState(zbxMessage) {
    zbxGrid.innerHTML = '';
    var zbxState = document.createElement('p');
    zbxState.className = 'zbx_news-state';
    zbxState.textContent = zbxMessage;
    zbxGrid.appendChild(zbxState);
  }

  function zbxCreateText(zbxTag, zbxClassName, zbxText) {
    var zbxElement = document.createElement(zbxTag);
    zbxElement.className = zbxClassName;
    zbxElement.textContent = zbxText;
    return zbxElement;
  }

  function zbxRenderItem(zbxItem) {
    var zbxCard = document.createElement('article');
    zbxCard.className = 'zbx_gallery-card';

    // 图片区域（加载失败时显示占位色块，不出现破图图标）
    var zbxMedia = document.createElement('div');
    zbxMedia.className = 'zbx_gallery-media';

    var zbxImage = document.createElement('img');
    zbxImage.className = 'zbx_gallery-img';
    zbxImage.src = zbxItem.img_url;
    zbxImage.alt = zbxItem.title;

    var zbxFallback = document.createElement('div');
    zbxFallback.className = 'zbx_gallery-fallback';
    zbxFallback.textContent = '暂无图片';

    zbxImage.addEventListener('error', function () {
      zbxImage.style.display = 'none';
      zbxFallback.classList.add('zbx_gallery-fallback-on');
    });

    zbxMedia.appendChild(zbxImage);
    zbxMedia.appendChild(zbxFallback);
    zbxCard.appendChild(zbxMedia);

    // 文字区域
    var zbxBody = document.createElement('div');
    zbxBody.className = 'zbx_gallery-body';

    var zbxTop = document.createElement('div');
    zbxTop.className = 'zbx_gallery-top';
    zbxTop.appendChild(zbxCreateText('span', 'zbx_gallery-tag', zbxItem.category));
    zbxTop.appendChild(zbxCreateText('span', 'zbx_gallery-time', zbxItem.create_time));
    zbxBody.appendChild(zbxTop);

    zbxBody.appendChild(zbxCreateText('h2', 'zbx_gallery-name', zbxItem.title));
    zbxBody.appendChild(zbxCreateText('p', 'zbx_gallery-desc', zbxItem.description));

    zbxCard.appendChild(zbxBody);

    return zbxCard;
  }

  fetch('/api/gallery')
    .then(function (zbxResponse) {
      return zbxResponse.json();
    })
    .then(function (zbxData) {
      console.log('图文列表接口返回：', zbxData);

      if (zbxData.code !== 0) {
        zbxCount.textContent = '图文数据加载失败';
        zbxShowState(zbxData.msg || '后端返回错误');
        return;
      }

      var zbxGalleryList = (zbxData.data && zbxData.data.zbxList) || [];

      zbxCount.textContent = '共 ' + ((zbxData.data && zbxData.data.zbxTotal) || 0) + ' 条图文内容';

      if (!zbxGalleryList.length) {
        zbxShowState('暂无图文数据');
        return;
      }

      zbxGrid.innerHTML = '';

      for (var zbxI = 0; zbxI < zbxGalleryList.length; zbxI++) {
        zbxGrid.appendChild(zbxRenderItem(zbxGalleryList[zbxI]));
      }
    })
    .catch(function (zbxError) {
      console.error('请求 /api/gallery 失败：', zbxError);
      zbxCount.textContent = '图文数据加载失败';
      zbxShowState('请求后端失败，请确认后台服务已启动');
    });
})();
