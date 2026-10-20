# DreamLantern-Media

《狐妖小红娘·梦灯笼》公开资源层，主题：夜漆 · 红线 · 灯金。

当前源：`main`。旧 `v1.0.1` 是冻结旧资源；新的正式 tag 必须等静静完成装配、Android 实机QA通过后再创建。

## 当前唯一装配入口

新版本装配器、静静与后续正式卡必须依次读取：

1. `manifest/chapter-runtime.v2.json`
   - 21卷资源目录唯一运行时入口。
2. `manifest/dynamic-runtime.v1.json`
   - 21卷 Opening 动态方式唯一事实源。
3. `manifest/fx-profiles.v1.json`
   - 伪动态参数唯一事实源。

再由 `chapter-runtime.v2.json` 进入目标卷：

- `chapters/<卷>/resource.json`
- `chapters/<卷>/images/manifest.json`
- `chapters/<卷>/video/manifest.json`

最终装配交接：

`docs/109_给静静的梦灯笼资源层最终装配交接_v1.0.md`

不得再浏览旧 `poster/`、`thumb/` 或 `manifest/visual.override.v1.2.json` 自行挑资源。

## Opening 正式解析链

`稳定官方MP4 -> 官方静态图+伪动态 -> 品牌背景+伪动态 -> 旧生成故障fallback -> SVG故障fallback`

YouTube / B站 / 微博等官方视频页不冒充MP4；它们只作为缘忆“查看官方动态”、来源证明与后续MP4搜集线索。Opening默认不塞多iframe。

## 目录职责

- `chapters/`：21卷权威资源分类、图片用途、PV/视频状态、fallback边界。
- `manifest/chapter-runtime.v2.json`：新装配唯一运行时资源目录。
- `manifest/dynamic-runtime.v1.json`：21卷MP4/伪动态选择与每卷FX profile映射。
- `manifest/fx-profiles.v1.json`：夜漆·红线·灯金伪动态参数；移动端动画节点上限14。
- `manifest/video-hunt-status.v1.json`：官方动态来源核验状态。
- `ui/`：统一主题、纸纹及梦灯笼品牌封面/背景；品牌图不冒充篇章官方海报。
- `fx/`：轻量红线、狐火、花瓣、微尘。
- `poster/`、`thumb/`：旧生成资源，仅为旧卡兼容与故障fallback；禁止正常选图。
- `fallback/`：21卷轻量SVG兼容兜底。

## 当前资源状态

- 共21卷。
- 15卷已有核实官方静态视觉映射。
- A01、M09、M10、M11、M12、M13 保持官方静态视觉 pending；空位优于错图。
- A03、M02、M03、M04、M05、M06、M07、M08、M09 已有可核实官方动态页/流媒体参考。
- 当前没有任何已核实适合公开长期runtime的裸MP4；`stableDirectMp4 = 0` 是正确状态，不是Bug。
- 没有MP4的卷已经全部分配伪动态profile，不允许继续等待视频导致Opening静止。
- 旧生成图经SHA去重实际只有9套母题，详见 `chapters/asset-dedupe-audit.v1.0.json`。

## 强制边界

- AI/旧生成图不得作为正式主视觉，只能故障fallback。
- 不跨卷借主视觉或动态素材。
- 不猜MP4、不固化临时签名媒体、不绕过DRM、不下载转码官方流媒体重新托管。
- 不使用第三方漫画站、搬运、解说截图作为正式资源。
- M13 新北山严禁绑定黄风岭素材。
- M12 再入南国不得直接拿 M06 旧南国动画海报冒充。
- 官方嵌入视频不用于Opening多iframe；只作缘忆/外部查看入口。
- `prefers-reduced-motion` 必须回退静态视觉。

音乐只登记 Lethe《狐妖小红娘》指定专辑14首正式曲目，排除标题为“补 /（补）”的重复项；仓库不存音乐文件、Cookie或账号凭证。

本资源层不修改 MVU / 世界书事实。LICENSE 仅覆盖项目原创代码与原创资源，不覆盖官方IP及外部素材。
