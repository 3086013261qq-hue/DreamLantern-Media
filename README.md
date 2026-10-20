# DreamLantern-Media

《狐妖小红娘·梦灯笼》公开资源层，主题：夜漆 · 红线 · 灯金。

当前源：`main`。旧 `v1.0.1` 是冻结旧资源；新的正式 tag 必须等资源QA、MP4阶段与 Android 实机QA完成后再创建。

## 当前唯一装配入口

新版本装配器、静静与后续正式卡 **必须先读取**：

`manifest/chapter-runtime.v2.json`

再由该文件进入目标卷：

- `chapters/<卷>/resource.json`
- `chapters/<卷>/images/manifest.json`
- `chapters/<卷>/video/manifest.json`

不得再浏览旧 `poster/`、`thumb/` 或 `manifest/visual.override.v1.2.json` 自行挑资源。

## 目录职责

- `chapters/`：21卷权威资源分类、图片用途、PV/视频状态、fallback边界。
- `manifest/chapter-runtime.v2.json`：新装配唯一运行时资源目录。
- `ui/`：统一主题、纸纹及梦灯笼品牌封面/背景；品牌图不冒充篇章官方海报。
- `fx/`：轻量红线、狐火、花瓣、微尘。
- `poster/`、`thumb/`：旧生成资源，保留只为旧卡兼容与故障fallback；禁止正常选图。
- `fallback/`：21卷轻量SVG兼容兜底。
- `manifest/` 旧版文件：保留供迁移/历史审计，不再作为新卡选图事实源。

## 当前资源状态

- 共21卷。
- 15卷已有核实官方静态视觉映射。
- A01、M09、M10、M11、M12、M13 保持官方静态视觉 pending；空位优于错图。
- A02、A03、A05、A06、M02、M07、M08、M09 已登记官方PV/动态来源页面。
- 当前没有任何已核实稳定直连 MP4；`stableDirectMp4` 保持空是正确状态。
- 旧生成图经SHA去重实际只有9套母题，详见 `chapters/asset-dedupe-audit.v1.0.json`。

## 强制边界

- AI/旧生成图不得作为正式主视觉，只能故障fallback。
- 不跨卷借主视觉或动态素材。
- 不猜MP4、不固化临时签名媒体、不绕过DRM。
- 不使用第三方漫画站、搬运、解说截图作为正式资源。
- M13 新北山严禁绑定黄风岭素材。
- M12 再入南国不得直接拿 M06 旧南国动画海报冒充。

音乐只登记 Lethe《狐妖小红娘》指定专辑14首正式曲目，排除标题为“补 /（补）”的重复项；仓库不存音乐文件、Cookie或账号凭证。

本资源层不修改 MVU / 世界书事实。LICENSE 仅覆盖项目原创代码与原创资源，不覆盖官方IP及外部素材。
