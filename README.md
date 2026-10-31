# Skip-Bilibili-Web-Fetival-Mode

关闭B站网页版视频页面的活动模式布局（油猴脚本）

LOL s16，b站网页端强行把相关视频定向到活动专题页（`/festival/...`），布局和普通视频页差别很大且无法设置关闭。本脚本把活动页还原成接近普通视频页的外观，不修改页面主要内容。

一开始b站是在前端实现定向跳转的，在 `view/detail` 接口响应中返回 `festival_jump_url`，后来改成服务端渲染字段之后上一版脚本就失效了，只好另辟蹊径强行改网页内布局。感谢Agent，感谢AI。

## License

[AGPL-3.0-or-later](LICENSE)
