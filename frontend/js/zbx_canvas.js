/*
  姓名：zhangboxin
  学号：24001010910
  时间：2026-11-19
  大模型：DeepSeek-V4.1-Flash

  首页 canvas 背景动画：粒子星网 + 鼠标联动
*/
(function () {
  'use strict';

  var zbxCanvas = document.getElementById('zbx_canvas');

  if (!zbxCanvas) {
    return;
  }

  var zbxCtx = zbxCanvas.getContext('2d');
  var zbxParticles = [];
  var zbxWidth = 0;
  var zbxHeight = 0;
  var zbxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  var zbxPointer = { x: -9999, y: -9999 };
  var zbxReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var zbxLinkDistance = 132;
  var zbxPointerDistance = 176;

  function zbxResize() {
    zbxWidth = window.innerWidth;
    zbxHeight = window.innerHeight;
    zbxCanvas.width = Math.floor(zbxWidth * zbxPixelRatio);
    zbxCanvas.height = Math.floor(zbxHeight * zbxPixelRatio);
    zbxCtx.setTransform(zbxPixelRatio, 0, 0, zbxPixelRatio, 0, 0);
    zbxCreateParticles();
  }

  function zbxCreateParticles() {
    var zbxCount = Math.min(120, Math.max(36, Math.floor((zbxWidth * zbxHeight) / 15000)));
    zbxParticles = [];

    for (var zbxI = 0; zbxI < zbxCount; zbxI++) {
      zbxParticles.push({
        zbx_x: Math.random() * zbxWidth,
        zbx_y: Math.random() * zbxHeight,
        zbx_vx: (Math.random() - 0.5) * 0.32,
        zbx_vy: (Math.random() - 0.5) * 0.32,
        zbx_r: Math.random() * 1.6 + 0.7
      });
    }
  }

  function zbxDrawParticles() {
    zbxCtx.clearRect(0, 0, zbxWidth, zbxHeight);

    for (var zbxA = 0; zbxA < zbxParticles.length; zbxA++) {
      var zbxP = zbxParticles[zbxA];

      if (!zbxReducedMotion) {
        zbxP.zbx_x += zbxP.zbx_vx;
        zbxP.zbx_y += zbxP.zbx_vy;

        if (zbxP.zbx_x <= 0 || zbxP.zbx_x >= zbxWidth) {
          zbxP.zbx_vx = -zbxP.zbx_vx;
        }
        if (zbxP.zbx_y <= 0 || zbxP.zbx_y >= zbxHeight) {
          zbxP.zbx_vy = -zbxP.zbx_vy;
        }
      }

      // 粒子之间的连线
      for (var zbxB = zbxA + 1; zbxB < zbxParticles.length; zbxB++) {
        var zbxQ = zbxParticles[zbxB];
        var zbxDx = zbxP.zbx_x - zbxQ.zbx_x;
        var zbxDy = zbxP.zbx_y - zbxQ.zbx_y;
        var zbxDistance = Math.sqrt(zbxDx * zbxDx + zbxDy * zbxDy);

        if (zbxDistance < zbxLinkDistance) {
          var zbxAlpha = (1 - zbxDistance / zbxLinkDistance) * 0.22;
          zbxCtx.strokeStyle = 'rgba(109, 155, 255, ' + zbxAlpha.toFixed(3) + ')';
          zbxCtx.lineWidth = 1;
          zbxCtx.beginPath();
          zbxCtx.moveTo(zbxP.zbx_x, zbxP.zbx_y);
          zbxCtx.lineTo(zbxQ.zbx_x, zbxQ.zbx_y);
          zbxCtx.stroke();
        }
      }

      // 粒子与鼠标的连线
      var zbxMouseDx = zbxP.zbx_x - zbxPointer.x;
      var zbxMouseDy = zbxP.zbx_y - zbxPointer.y;
      var zbxMouseDistance = Math.sqrt(zbxMouseDx * zbxMouseDx + zbxMouseDy * zbxMouseDy);

      if (zbxMouseDistance < zbxPointerDistance) {
        var zbxMouseAlpha = (1 - zbxMouseDistance / zbxPointerDistance) * 0.38;
        zbxCtx.strokeStyle = 'rgba(94, 234, 212, ' + zbxMouseAlpha.toFixed(3) + ')';
        zbxCtx.lineWidth = 1;
        zbxCtx.beginPath();
        zbxCtx.moveTo(zbxP.zbx_x, zbxP.zbx_y);
        zbxCtx.lineTo(zbxPointer.x, zbxPointer.y);
        zbxCtx.stroke();
      }

      zbxCtx.beginPath();
      zbxCtx.arc(zbxP.zbx_x, zbxP.zbx_y, zbxP.zbx_r, 0, Math.PI * 2);
      zbxCtx.fillStyle = 'rgba(168, 205, 255, 0.72)';
      zbxCtx.fill();
    }
  }

  function zbxLoop() {
    if (!document.hidden) {
      zbxDrawParticles();
    }
    if (!zbxReducedMotion) {
      window.requestAnimationFrame(zbxLoop);
    }
  }

  var zbxResizeTimer = null;

  window.addEventListener('resize', function () {
    window.clearTimeout(zbxResizeTimer);
    zbxResizeTimer = window.setTimeout(zbxResize, 160);
  });

  window.addEventListener('mousemove', function (zbxEvent) {
    zbxPointer.x = zbxEvent.clientX;
    zbxPointer.y = zbxEvent.clientY;
  });

  window.addEventListener('mouseleave', function () {
    zbxPointer.x = -9999;
    zbxPointer.y = -9999;
  });

  zbxResize();
  zbxLoop();
})();
