// ==UserScript==
// @name         还原B站活动视频页布局
// @namespace    bili-no-festival
// @version      2.2.0
// @description  把活动专题页（festival）还原成接近普通视频页
// @author       Regened
// @license      AGPL-3.0-or-later
// @match        https://www.bilibili.com/festival/*
// @run-at       document-start
// @icon         https://i0.hdslb.com/bfs/static/jinkela/long/images/512.png
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // 参数来自普通视频页多视口实测（1600 / 1680 / 1700 / 1920 / 2200 / 2552）：
  //   右列在 1680 视口是 350、1700 视口是 411，断点取两者之间
  //   内容总宽（左列 + 间距 + 右列）封顶 2057px，超过后整体居中
  //   未封顶时两侧边距 41，列间距 30
  var SIDE = 41;          // 两侧边距
  var GAP = 30;           // 两列间距
  var RIGHT = 350;        // 窄屏右列宽度
  var RIGHT_WIDE = 411;   // 宽屏右列宽度
  var BREAK = 1690;       // 右列宽度切换断点
  var MAX_TOTAL = 2057;   // 内容总宽上限

  var CSS = [
    /* ---- 布局：主容器不再固定 1220 居中 ---- */
    '.page-main-content {',
    '  width: 100% !important; max-width: none !important;',
    '  margin: 0 !important; padding: 0 0 20px 0 !important;',
    '}',
    '.grid-box {',
    '  width: min(calc(100% - ' + (SIDE * 2) + 'px), ' + MAX_TOTAL + 'px) !important;',
    '  margin: 0 auto !important;',
    '  display: flex !important;',
    '  align-items: flex-start !important;',
    '  gap: ' + GAP + 'px !important;',
    '}',
    '.grid-left {',
    '  flex: 1 1 auto !important; width: auto !important;',
    '  min-width: 0 !important; max-width: none !important;',
    '  margin-right: 0 !important;',   /* 原样式自带 12px 右 margin，会和 gap 叠加 */
    '}',
    '.grid-right {',
    '  flex: 0 0 ' + RIGHT + 'px !important;',
    '  width: ' + RIGHT + 'px !important;',
    '  max-width: ' + RIGHT + 'px !important;',
    '}',
    '@media (min-width: ' + BREAK + 'px) {',
    '  .grid-right {',
    '    flex: 0 0 ' + RIGHT_WIDE + 'px !important;',
    '    width: ' + RIGHT_WIDE + 'px !important;',
    '    max-width: ' + RIGHT_WIDE + 'px !important;',
    '  }',
    '}',
    /* ---- 播放器跟随左列宽度 ---- */
    '.video-player-box, .video-player-box.grid-left, .festival-video-player {',
    '  width: 100% !important; height: auto !important; max-width: none !important;',
    '}',
    '#bilibili-player {',
    '  width: 100% !important;',
    '  aspect-ratio: 1123 / 678 !important;',   /* 普通页播放器的实际宽高比 */
    '  height: auto !important;',
    '}',
    /* ---- 去掉活动背景图和活动专属面板 ---- */
    '.page-festival-bg, .page-bg-2233, .page-bg-logo-box, .page-bg-logo,',
    '[class*="page-bg"], [class*="festival-bg"] { display: none !important; }',
    '.festival-main-panel, .acitivity-panel { display: none !important; }',
    '#app, body { background: #fff !important; }',
    /* ---- 深色主题改浅色 ---- */
    /* 白底容器 */
    '.video-toolbar, .video-staffs, .bui-collapse-header, .recommend-list,',
    '.video-pod, .comment-wrapper {',
    '  background: #fff !important; color: #18191c !important;',
    '}',
    /* 灰底容器（底色在下方「圆角灰底」统一处理，这里只保证文字是深色） */
    '.video-danmuku, .video-sections { color: #18191c !important; }',
    '.video-toolbar *, .video-staffs *, .video-sections *, .video-danmuku *,',
    '.bui-collapse-header *, .recommend-list * {',
    '  color: #18191c !important; border-color: #e3e5e7 !important;',
    '}',
    /* 选集内部条目本身不要底色，灰底由 .video-sections 整体承担 */
    '.video-episode-group, .video-sections .video-episode-card,',
    '.video-sections-item { background: transparent !important; border-radius: 0 !important;',
    '  margin-bottom: 4px !important; }',
    /* ---- 尺寸对齐普通页 ---- */
    '.video-toobar_title { font-size: 20px !important; line-height: 28px !important; font-weight: 500 !important; }',
    '.video-desc-wrapper .view-count, .video-desc-wrapper .dm-count,',
    '.video-desc-wrapper .pubdate-count, .video-desc-wrapper .rank-count,',
    '.video-desc-wrapper .forbid-tip { font-size: 13px !important; color: #9499a0 !important; }',
    '.video-toolbar-content_item { min-width: 92px !important; height: 28px !important;',
    '  display: flex !important; align-items: center !important;',
    '  font-size: 13px !important; font-weight: 500 !important; color: #61666d !important; }',
    /* 图标盒子对齐普通页的 28x28；字形收到 24px（普通页 SVG 图形实际约 24px，iconfont 28px 会显得偏大） */
    '.video-toolbar-content_item i, .video-toolbar-content_item .content-item_icon {',
    '  width: 28px !important; height: 28px !important; line-height: 28px !important; font-size: 24px !important; }',
    '.video-desc { font-size: 15px !important; line-height: 24px !important; color: #18191c !important;',
    '  width: 100% !important; max-width: none !important; }',
    /* ---- 工具栏：#arc_toolbar_report 规格（flex / space-between / padding 16px 0 12px） ---- */
    '.video-toolbar { padding: 0 !important; }',
    '.video-toolbar-content {',
    '  display: flex !important; justify-content: space-between !important;',
    '  align-items: center !important; padding: 16px 0 12px !important;',
    '  margin: 0 !important; height: auto !important;',
    '}',
    '.video-toolbar-content_left, .video-toolbar-content_right {',
    '  display: flex !important; align-items: center !important;',
    '}',
    /* ≥1700 视口：普通页的按钮变成 100x36、图标 36x36、字号 14px */
    '@media (min-width: 1700px) {',
    '  .video-toolbar-content_item { min-width: 100px !important; height: 36px !important; font-size: 14px !important; }',
    '  .video-toolbar-content_item i, .video-toolbar-content_item .content-item_icon {',
    '    width: 36px !important; height: 36px !important; line-height: 36px !important; font-size: 30px !important; }',
    '}',
    /* ---- UP 信息卡：挪到右列顶部，对齐普通页 .up-info-container（350x104 / 头像 48 圆形 / 名字 15px） ---- */
    '.grid-right > .video-staffs { height: 104px !important; padding: 0 !important;',
    '  box-sizing: border-box !important; display: flex !important;',
    '  align-items: center !important; background: #fff !important; }',
    /* 内部条目原本写死 759px，挪到 350/411 宽的右列后会把「关注」按钮挤出去 */
    '.grid-right > .video-staffs .staff-one, .grid-right > .video-staffs .video-staffs-list,',
    '.grid-right > .video-staffs .video-staffs-list-slide {',
    '  width: 100% !important; display: flex !important; align-items: center !important; }',
    '.grid-right > .video-staffs .video-staffs-item {',
    '  width: auto !important; flex: 1 1 auto !important; min-width: 0 !important; }',
    /* ---- 合作视频（≥2 个成员）：改用普通页 .membersinfo-upcard 的竖向小卡 ----
       普通页每个成员 87x102：头像 40 居中在上，名字 13px + 角色 12px 灰在下，多个横排 */
    '.grid-right > .video-staffs:has(.staff-less + .staff-less) {',
    '  height: 176px !important; padding: 18px 0 0 !important; display: block !important;',
    '  align-items: initial !important; }',
    '.grid-right > .video-staffs:has(.staff-less + .staff-less) .video-staffs-header {',
    '  display: flex !important; align-items: center !important;',
    '  height: 44px !important; padding: 0 16px !important; margin: 0 !important;',
    '  background: #f1f2f3 !important; border-radius: 6px !important; }',
    '.grid-right > .video-staffs:has(.staff-less + .staff-less) .staffs-title {',
    '  font-size: 15px !important; font-weight: 500 !important; line-height: 44px !important; }',
    '.grid-right > .video-staffs:has(.staff-less + .staff-less) .video-staffs-list {',
    '  display: flex !important; flex-wrap: wrap !important; padding: 12px 0 0 !important;',
    '  justify-content: flex-start !important; width: 100% !important; }',
    '.grid-right > .video-staffs:has(.staff-less + .staff-less) .staff-less {',
    '  width: 87px !important; height: 102px !important; display: block !important;',
    '  padding: 0 0 18px 0 !important; }',
    '.grid-right > .video-staffs:has(.staff-less + .staff-less) .video-staffs-item {',
    '  width: 87px !important; height: 84px !important; display: flex !important;',
    '  flex-direction: column !important; align-items: center !important; }',
    '.grid-right > .video-staffs:has(.staff-less + .staff-less) .video-staffs-cover {',
    '  width: 40px !important; height: 40px !important; margin: 0 auto 4px !important; }',
    '.grid-right > .video-staffs:has(.staff-less + .staff-less) .staff-btn { display: none !important; }',
    '.grid-right > .video-staffs:has(.staff-less + .staff-less) .video-staffs-info {',
    '  width: 87px !important; height: 36px !important; text-align: center !important;',
    '  padding: 0 4px !important; margin-top: 8px !important; }',
    '.grid-right > .video-staffs:has(.staff-less + .staff-less) .info-name {',
    '  font-size: 13px !important; line-height: 18px !important;'
    ,'  font-weight: 400 !important; color: #18191c !important; }',
    '.grid-right > .video-staffs:has(.staff-less + .staff-less) .info-title {',
    '  font-size: 12px !important; line-height: 18px !important; color: #9499a0 !important; }',
    '.video-staffs-header { display: none !important; }',
    '.video-staffs-cover, .video-staffs-cover .activity-image-card,',
    '.video-staffs-cover .activity-image-card__image { width: 48px !important; height: 48px !important;',
    '  border-radius: 50% !important; overflow: hidden !important; }',
    '.video-staffs-info .info-name { font-size: 15px !important; font-weight: 500 !important; color: #18191c !important; }',
    /* ---- 播放器四周的淡灰光晕（普通页 .bpx-player-container: rgb(241,242,243) 0 0 8px） ---- */
    '#bilibili-player, .bpx-player-container { box-shadow: 0 0 8px #f1f2f3 !important; }',
    /* ---- 去掉活动页工具栏里的空占位条 ---- */
    '.video-toolbar_bottom { display: none !important; }',
    /* ---- 分割线：普通页 #arc_toolbar_report 用 border-bottom: 0.666667px solid rgb(227,229,231) ---- */
    '.video-toolbar-content { border-bottom: 0.666667px solid #e3e5e7 !important; }',
    '.video-desc.open { padding: 12px 0 !important;',
    '  border-bottom: 0.666667px solid #e3e5e7 !important; }',
    /* ---- 右列卡片：对齐普通页 .video-page-card-small（350x83 / 图 141x80） ---- */
    '.video-sections-item, .video-episode-group, .video-episode-card,',
    '.recommend-video-list, .recommend-video-card, .recommend-video-card .card-box {',
    '  width: 100% !important; max-width: none !important;',
    '  margin-left: 0 !important; margin-right: 0 !important;',
    '}',
    '.video-episode-card { min-height: 83px !important; align-items: flex-start !important; }',
    '.video-episode-card__cover { width: 141px !important; height: 80px !important;',
    '  flex: 0 0 141px !important; margin-right: 10px !important;',
    '  background-size: cover !important; background-position: center !important;',
    '  border-radius: 6px !important; overflow: hidden !important; }',
    '.video-episode-card__info { flex: 1 1 auto !important; width: auto !important; min-width: 0 !important; }',
    '.video-episode-card__info-title { font-size: 15px !important; line-height: 19px !important; color: #18191c !important; }',
    '.video-episode-card__info-up { font-size: 13px !important; line-height: 15px !important;',
    '  color: #18191c !important; margin-top: 2px !important; }',
    '.video-section-title { font-size: 15px !important; font-weight: 600 !important; }',
    '.recommend-video-card { padding: 0 !important; height: 83px !important; margin-bottom: 12px !important; }',
    '.recommend-video-card .card-box { height: 83px !important; display: flex !important; align-items: flex-start !important; }',
    '.recommend-video-card .card-cover, .recommend-video-card .cover,',
    '.recommend-video-card .activity-image-card { width: 141px !important; height: 80px !important;',
    '  flex: 0 0 141px !important; margin-right: 10px !important;',
    '  border-radius: 6px !important; overflow: hidden !important; }',
    '.recommend-video-card .card-info { flex: 1 1 auto !important; width: auto !important;',
    '  min-width: 0 !important; margin-left: 0 !important; }',
    /* 标题：普通页 <p class="title"> 是两行截断（line-clamp 2 / h 38） */
    '.recommend-card-info-title { font-size: 15px !important; line-height: 19px !important;',
    '  color: #18191c !important; display: -webkit-box !important;',
    '  -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important;',
    '  overflow: hidden !important; min-height: 38px !important; }',
    /* UP 名：普通页 .upname 是灰字 #9499a0，上下各 2px margin */
    '.recommend-video-card .count.up, .recommend-video-card .count.up a {',
    '  font-size: 13px !important; line-height: 15px !important; color: #9499a0 !important; }',
    '.recommend-video-card .count.up { margin: 2px 0 !important; }',
    '.recommend-video-card .count { font-size: 13px !important; line-height: 15px !important; color: #9499a0 !important; }',
    '.recommend-video-card .count .play, .recommend-video-card .count .danmaku {',
    '  font-size: 13px !important; color: #9499a0 !important; }',
    '.recommend-list { padding-left: 0 !important; padding-right: 0 !important; }',
    /* ---- 圆角灰底（普通页 #F1F2F3 / 6px） ---- */
    /* 弹幕列表 == 普通页 .danmaku-wrap（350x44） */
    '.video-danmuku, .video-danmuku .bui-collapse-header {',
    '  background: #f1f2f3 !important; border-radius: 6px !important; }',
    '.video-danmuku { overflow: visible !important; }',   /* 不能 hidden，弹幕列表的弹出菜单会被裁掉 */
    /* ---- 抬高层级：活动页这些浮层只有 z-index 1，会压在内容下面 ---- */
    '.bui-dropdown-items, .bui-dropdown-panel { z-index: 100 !important; }',
    '.v-popover, .van-popover, .van-popper { z-index: 10050 !important; }',
    /* 选集区整体一块 == 普通页 .video-pod。
       注意不能留 padding-top：滚动容器的 padding 区域是透明的，
       内容会从这条缝里透出来（sticky 标题只能吸到 padding 内沿）。 */
    '.video-sections {',
    '  background: #f1f2f3 !important; border-radius: 6px !important;',
    '  padding: 0 16px 8px !important; box-sizing: border-box !important;',
    '  margin: 0 0 12px 0 !important;',
    '}',
    /* 分组标题 sticky 吸顶时要有同色底，否则压在卡片上看不清 */
    '.video-section-title { background: #f1f2f3 !important; z-index: 2 !important; }',
    /* ---- hover 主色
       活动页自带的 activityHoverStyle 用 !important 把 hover 设成米色 #FFDFC0，
       必须用 #app 前缀抬高选择器优先级才压得过 ---- */
    '#app .recommend-card-info-title:hover, #app .recommend-card-info-title:hover * { color: #00aeec !important; }',
    '#app .video-episode-card__info-title:hover, #app .video-episode-card__info-title:hover * { color: #00aeec !important; }',
    '#app .video-toolbar-content_item:hover, #app .video-toolbar-content_item:hover * { color: #00aeec !important; }',
    /* ---- 标题区：对齐普通页 #viewbox_report（22 + 28 + 6 + 24 + 24 = 104） ---- */
    '.bn-title-area { padding: 22px 0 24px 0 !important; margin: 0 !important; }',
    '.bn-title-area .video-toobar_title { color: #18191c !important; margin: 0 !important; }',
    '.bn-stats-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px;',
    '  font-size: 13px; color: #9499a0; margin: 6px 0 0 0 !important; min-height: 24px; align-content: center; }',
    '.bn-stats-row .forbid-tip { display: inline-flex; align-items: center; gap: 4px; }',
    /* ---- 顶部导航换普通页 mini 变体 ---- */
    '#biliMainHeader .left-entry, #biliMainHeader .right-entry,',
    '#biliMainHeader .left-entry a, #biliMainHeader .right-entry a { color: #18191c !important; }',
    '#biliMainHeader .bili-header--mini, #biliMainHeader .bili-header__bar { background: #fff !important; }',
    /* 外层固定 56px，内部 mini header 实际 64px，会把下方内容压住 8px */
    '#biliMainHeader { height: 64px !important; min-height: 64px !important; position: static !important; }',
    /* 普通页真正固定的是内层菜单条 .bili-header__bar（fixed + z-index 1002），外层只占位 */
    '#biliMainHeader .bili-header__bar { position: fixed !important; top: 0 !important;',
    '  left: 0 !important; right: 0 !important; z-index: 1002 !important; }'
  ].join('\n');

  // 活动页的导航是透明变体，换成普通页的 mini 变体（幂等，可重复调用）
  function swapHeader() {
    var h = document.querySelector('#biliMainHeader .bili-header');
    if (h && h.classList.contains('bili-header--transparent')) {
      h.classList.remove('bili-header--transparent');
      h.classList.add('bili-header--mini');
    }
  }

  // 把标题和播放量/弹幕/时间搬到播放器上方（普通页就是这个顺序）
  function moveTitleToTop() {
    var playerBox = document.querySelector('.video-player-box');
    var title = document.querySelector('.video-toobar_title');
    if (!playerBox || !title) return;

    var area = document.getElementById('bn-title-area');
    if (!area) {
      area = document.createElement('div');
      area.id = 'bn-title-area';
      area.className = 'bn-title-area';
      playerBox.parentNode.insertBefore(area, playerBox);
      var rowEl = document.createElement('div');
      rowEl.className = 'bn-stats-row';
      area.appendChild(rowEl);
    }

    // 被 Vue 重渲染抢回去时重新搬
    if (title.parentElement !== area) area.insertBefore(title, area.firstChild);

    var row = area.querySelector('.bn-stats-row');
    if (!row) return;
    ['.view-count', '.dm-count', '.pubdate-count', '.rank-count', '.forbid-tip'].forEach(function (sel) {
      var el = document.querySelector('.video-desc-wrapper ' + sel);
      if (el && el.parentElement !== row) row.appendChild(el);
    });
  }

  // UP 信息卡挪到右列顶部（普通页 .up-info-container 就在右列最上面，从导航下方开始）
  function moveUpInfo() {
    var staffs = document.querySelector('.video-staffs');
    var gridRight = document.querySelector('.grid-right');
    if (!staffs || !gridRight) return;
    if (gridRight.firstElementChild === staffs) return;
    gridRight.insertBefore(staffs, gridRight.firstChild);
    lastOffset = null;   // 结构变了，右列偏移要重算
  }

  // 右列顶部对齐播放器顶部（普通页右栏就是从播放器顶部开始的）
  var lastOffset = null;
  function alignRightColumn() {
    var gridBox = document.querySelector('.grid-box');
    var gridRight = document.querySelector('.grid-right');
    var player = document.querySelector('.video-player-box');
    if (!gridBox || !gridRight || !player) return;
    // UP 卡已占据右列顶部，把上方空间填满，不需要额外偏移
    var first = gridRight.firstElementChild;
    if (first && first.classList.contains('video-staffs')) {
      if (lastOffset !== 0) { lastOffset = 0; gridRight.style.removeProperty('margin-top'); }
      return;
    }
    var offset = Math.round(player.getBoundingClientRect().top - gridBox.getBoundingClientRect().top);
    // 值没变就不写 style，避免 MutationObserver 自己触发自己
    if (offset === lastOffset) return;
    lastOffset = offset;
    if (offset > 0) gridRight.style.setProperty('margin-top', offset + 'px', 'important');
    else gridRight.style.removeProperty('margin-top');
  }

  function inject() {
    swapHeader();
    moveTitleToTop();
    moveUpInfo();
    if (!document.head) return;
    // 每次都同步样式内容：避免旧的同名标签（比如旧版本脚本先建了）导致新规则不生效
    var st = document.getElementById('bn-width-style');
    if (!st) {
      st = document.createElement('style');
      st.id = 'bn-width-style';
      document.head.appendChild(st);
    }
    if (st.textContent !== CSS) {
      st.textContent = CSS;
      window.dispatchEvent(new Event('resize'));
    }
    alignRightColumn();
  }

  // 活动页是 Vue 渲染的，切分 P / 展开栏目 / 换集都会重渲染，用 observer 兜底；
  // debounce 200ms 避免频繁重排。
  var timer = 0;
  function scheduleInject() {
    if (timer) return;
    timer = setTimeout(function () { timer = 0; inject(); }, 200);
  }

  inject();
  document.addEventListener('DOMContentLoaded', inject);
  window.addEventListener('load', inject);
  window.addEventListener('resize', scheduleInject);   // 视口变化后右列偏移要重算
  setTimeout(inject, 800);

  function watch() {
    new MutationObserver(scheduleInject).observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) watch();
  else document.addEventListener('DOMContentLoaded', watch);
})();
