# Skip-Bilibili-Web-Fetival-Mode

关闭B站网页版视频页面的活动模式布局（油猴脚本）

## 原理

B 站在 `view/detail` 接口响应中返回 `festival_jump_url`，前端据此把常规视频页跳转到活动专题页。脚本在页面加载前接管请求，清空该字段，视频页保持常规布局。
链接本身是活动页（`/festival/xxx?bvid=BVxxxx`）时，会先切换到 `/video/BVxxxx/`。

- 若 B 站改为服务端渲染该字段，脚本将失效

## License

[AGPL-3.0-or-later](LICENSE)
