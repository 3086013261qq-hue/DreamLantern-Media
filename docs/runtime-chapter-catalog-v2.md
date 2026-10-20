# DreamLantern Chapter Runtime v2

本文件定义《狐妖小红娘·梦灯笼》资源层在正式装配时的唯一读取规则。

## 唯一入口

正式装配器/静静/后续运行时不得再遍历 `poster/`、`thumb/` 或根据文件名自行挑图。

第一步只读取：

`manifest/chapter-runtime.v2.json`

随后根据当前卷 ID（A01-A08 / M01-M13）读取该卷：

- `chapters/<卷>/resource.json`
- `chapters/<卷>/images/manifest.json`
- `chapters/<卷>/video/manifest.json`

## 资源优先级

1. `video.stableDirectMp4`：只有卷内 video manifest 明确登记了稳定直连时才能播放。
2. 官方静态 `images.primary`：直接使用其官方 https URL。
3. Pending 卷：使用 `ui/brand-background.webp` + 对应 FX；空位优于错图。
4. `images/fallback/generated/`：仅当上层资源发生实际加载故障时兜底。
5. `images/fallback/fallback.svg`：最终轻量兜底。

## 严格禁止

- 正常运行从旧 `poster/<ID>` 自行挑生成图。
- 因某卷素材少而跨卷借主视觉。
- 将 `videoCandidates` / 官方PV页面误当可播 MP4。
- 猜测、抓取或固化临时签名媒体 URL。
- M13 使用黄风岭视觉。
- M12 直接复用 M06 南国动画海报作为主视觉。
- M09 继续使用旧 blossom/月红生成图冒充镜花缘。

## 去重

`chapters/asset-dedupe-audit.v1.0.json` 是旧生成资源的 SHA 权威去重表。

旧目录中多个路径指向同一 blob 时只算一个独立画面。不同裁切不得增加“独立素材数”。

## 与现版本兼容

旧 `poster/`、`thumb/`、`manifest/visual.override.v1.2.json` 暂不删除，以保证 v1.2.0 等旧卡仍可运行；但从新资源层装配开始，它们不再是选图事实源。

## 后续 MP4 阶段

MP4 搜集阶段只更新每卷 `video/manifest.json` 和必要的 `video/primary/` 资源。发现真正稳定、允许公开引用的直接媒体后，再将其加入 `stableDirectMp4`。在此之前保持空数组是正确状态。
