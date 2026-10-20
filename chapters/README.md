# DreamLantern 分卷资源目录（第二层）

本目录是后续装配的唯一权威资源入口。

## 读取顺序
1. `chapters/index.json`：确认卷ID与标题。
2. `<卷>/resource.json`：确认该卷业务级素材边界。
3. `<卷>/images/manifest.json`：确认图片角色分工。
4. `<卷>/video/manifest.json`：确认PV/MP4状态。

## 图片目录
- `images/primary/`：正式缘卷主视觉 / Opening主视觉槽位。
- `images/secondary/`：辅助静态视觉。
- `images/memory/`：缘忆/回忆册专用槽位。
- `images/background/`：模糊背景、慢推镜、氛围层槽位。
- `images/fallback/`：旧生成图与SVG，仅故障兜底；不得冒充官方主视觉。

## 视频目录
- `video/primary/`：只有稳定、合法、可直接播放的正式媒体才允许进入。
- `video/memory/`：缘忆动态素材槽位。
- `video/manifest.json`：官方PV页面、稳定直链状态与用途。

## 铁律
- 静静/装配器不得跨卷自行挑图。
- 不得从旧 `poster/`、`thumb/` 目录自由选图。
- `stableDirectMp4=null` 时禁止猜MP4、抓临时token、搬运盗版。
- 未核到官方主图的卷，正常运行优先使用 `ui/brand-background.webp`，旧AI/生成图仅为fallback。
- M13新北山严禁使用黄风岭素材冒充。
- 旧路径继续保留，保证v1.2.0兼容。
