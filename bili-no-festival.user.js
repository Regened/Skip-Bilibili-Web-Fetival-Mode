// ==UserScript==
// @name         B站活动视频页强制常规布局
// @namespace    bili-no-festival
// @version      1.0.0
// @description  关闭b站网页版视频页面的活动模式布局
// @author       Regened
// @license      AGPL-3.0-or-later
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/festival/*
// @run-at       document-start
// @icon         https://i0.hdslb.com/bfs/static/jinkela/long/images/512.png
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // hook 清理festival_jump_url 还原成常规播放页
  if (location.pathname.indexOf('/festival/') === 0) {
    var bv = new URLSearchParams(location.search).get('bvid');
    if (bv && /^BV[0-9A-Za-z]{10}$/.test(bv)) {
      location.replace('https://www.bilibili.com/video/' + bv + '/');
    }
    return;
  }

  // 视频页view/detail响应里的festival_jump_url决定是否跳转，置空
  var RE = /("festival_jump_url"\s*:\s*)"(?:[^"\\]|\\.)*"/g;
  var strip = function (txt) {
    return typeof txt === 'string' && txt.indexOf('festival_jump_url') >= 0
      ? txt.replace(RE, '$1""')
      : txt;
  };
  var hit = function (u) {
    return typeof u === 'string' && (u.indexOf('/view/detail') >= 0 || u.indexOf('/wbi/view') >= 0);
  };
  var clear = function (d) {
    if (!d || typeof d !== 'object') return;
    if ('festival_jump_url' in d) d.festival_jump_url = '';
    for (var k in d) clear(d[k]);
  };

  if (window.fetch) {
    var of = window.fetch;
    window.fetch = async function (input, init) {
      var r = await of.call(this, input, init);
      var u = typeof input === 'string' ? input : (input && input.url) || '';
      if (!hit(u)) return r;
      try {
        var t = await r.clone().text();
        var nt = strip(t);
        if (nt !== t) {
          // 解压后的明文body，去掉长度/编码头
          var h = new Headers(r.headers);
          h.delete('content-length');
          h.delete('content-encoding');
          return new Response(nt, { status: r.status, statusText: r.statusText, headers: h });
        }
      } catch (e) {}
      return r;
    };
  }

  var xopen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) {
    this.__bili_url = u;
    return xopen.apply(this, arguments);
  };

  var rtD = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseText');
  if (rtD && rtD.get) {
    Object.defineProperty(XMLHttpRequest.prototype, 'responseText', {
      configurable: true,
      get: function () {
        var v = rtD.get.call(this);
        return hit(this.__bili_url) && this.readyState === 4 ? strip(v) : v;
      }
    });
  }

  var rD = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response');
  if (rD && rD.get) {
    Object.defineProperty(XMLHttpRequest.prototype, 'response', {
      configurable: true,
      get: function () {
        var v = rD.get.call(this);
        if (hit(this.__bili_url) && this.readyState === 4) {
          if (typeof v === 'string') return strip(v);
          clear(v);
        }
        return v;
      }
    });
  }
})();