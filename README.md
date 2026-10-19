# DreamLantern-Media

《狐妖小红娘·梦灯笼》公开资源库。

## 当前状态
- `v1.0.1`：已冻结旧版。该版本使用9组原创环境概念图覆盖21卷，保留仅用于回滚/对照，不再作为下一版正式视觉基线。
- `main`：当前视觉返工开发线，已进入 `v1.2` official-first 阶段。
- 下一正式Tag：待21卷官方视觉映射、音乐源与实机美化全部验收后再冻结。**静静不得继续把 `@v1.0.1` 当下一版卡体资源基线。**

## v1.2 视觉策略
正式优先级：
1. 官方公开宣传动态素材 / 官方PV（仅在有稳定可嵌入资源时运行）
2. 官方动画宣传海报 / 篇章视觉 / 官方宣传静帧
3. 官方视觉 + DreamLantern原创FX
4. 旧生成环境图（仅fallback-generated）
5. 轻量SVG fallback

禁止把AI幻想场景继续作为正式篇章主Poster。

## 目录
- `manifest/`：21卷Opening、官方视觉覆盖层、动态来源表、音乐源锁、资源索引。
- `poster/`：旧版21卷生成环境图；v1.2起统一降级为fallback-generated，不再代表正式篇章视觉。
- `thumb/`：旧版列表图；新正式版需跟随official-first视觉策略重做/覆盖。
- `ui/`：梦灯笼主题CSS与轻量UI素材。
- `fx/`：原创狐火、红线、花瓣、微尘与薄雾等表现层资源。
- `fallback/`：21卷轻量SVG，断网或外部资源不可达时兜底。
- `docs/`：媒体政策、视觉审计、官方来源映射。

## 关键Manifest
- `manifest/visual.override.v1.2.json`：当前21卷官方视觉优先映射，下一版装配应以此覆盖旧 `opening.manifest.json` 的生成图主视觉。
- `manifest/video-source-map.v1.0.json`：官方PV/动态宣传来源状态，明确“官方播放页≠稳定MP4”。
- `manifest/music.source.v1.0.json`：Lethe《狐妖小红娘》网易云专辑作为缘音唯一主源。

## CDN开发规则
当前返工期间以 `main` 为开发事实源，不要提前固定新Tag。
最终验收后再创建新Tag，例如：
`https://cdn.jsdelivr.net/gh/3086013261qq-hue/DreamLantern-Media@v1.2.0/`

在新Tag冻结前，静静施工时必须明确区分：
- 旧卡：仍可读取 `@v1.0.1`
- 新卡返工：读取/同步 `main` 最新Manifest后再生成最终固定版本

## 版权边界
本仓库只公开原创代码、原创UI/FX、原创fallback与来源登记；不上传动画正片、DRM绕过产物、临时签名MP4、音乐音频或账号凭证。官方宣传图片优先使用官方公开URL/来源页，不宣称版权归本项目所有。

音乐与视觉完全隔离；资源加载失败不得影响MVU、时代选择、缘卷、缘忆、缘音和世界书切换。
