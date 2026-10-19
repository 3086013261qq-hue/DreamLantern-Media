# DreamLantern 媒体政策 v1.1.0

## 1. 总原则
DreamLantern 的正式主视觉必须遵循“官方视觉优先，原创表现层增强”的原则。

正式优先级：
1. 《狐妖小红娘》动画官方公开宣传动态素材 / 官方PV / 官方预告；
2. 官方动画宣传海报、篇章海报、周年视觉、官方宣传静帧；
3. 官方视觉 + DreamLantern 原创FX（红线、狐火、粒子、景深、遮罩、标题动画、转场）；
4. 原创fallback。

禁止把 AI 生成环境概念图、泛东方幻想城镇、与原作人物及篇章无直接关系的意象图继续作为正式篇章主Poster。

## 2. 当前生成海报的定位调整
仓库现有 `poster/A01~A08`、`poster/M01~M13` 中的原创生成环境图，统一降级为 `fallback-generated` 候选；它们可以在官方资源不可达、网络失败、低性能模式下兜底，但不应作为正式默认视觉。

现有21卷资源实际上大量重复复用少数场景母题，不能继续以“每卷独立主视觉”的身份使用。

## 3. 官方素材的公开版边界
本仓库不上传动画正片、受保护流媒体片段、临时签名MP4、DRM绕过产物，也不从第三方盗版源搬运视频。

对官方动态素材：
- 若官方提供稳定、公开、可直接嵌入/引用的资源，则运行时可直接使用；
- 若只有官方平台播放页而无稳定可嵌入媒体文件，则登记官方来源，并使用官方宣传静态视觉 + DreamLantern FX；
- 不为了“必须有MP4”而抓取带token的临时直链或重传正片。

对官方静态宣传视觉：优先保留官方源URL及来源页；未经明确授权不把原图重新上传进本仓库。

## 4. 运行时媒体层级
每卷运行时按以下层级选择：
`official_video/embed -> official_still -> official_still+fx -> fallback-generated -> fallback-svg`

Manifest必须区分：
- `mediaMode`: `official_video` / `official_still` / `official_still_fx` / `fallback_generated` / `fallback_svg`；
- `sourcePage`: 官方来源页；
- `officialAssetUrl`: 官方可直接引用资源（若有）；
- `poster`: 正式运行视觉；
- `fallbackGenerated`: 旧生成图；
- `fallback`: 轻量SVG；
- `video`: 仅在确有稳定合法媒体资源时填写，不得伪造。

## 5. 手机端
手机优先竖向安全构图；官方横图使用 `object-fit: cover` 并按人物主体设置逐卷 `object-position`，禁止再次出现顶部/底部大块黑边。

列表先载 `thumb`，进入篇章再载 `poster`，仅在用户实际播放Opening时加载动态媒体。

## 6. 音乐隔离
DreamLantern视觉媒体与网易云音乐完全解耦。Opening默认静音；音乐由缘音模块用户主动触发。任何音乐失败不得影响视觉、MVU或世界书。

## 7. 事实源
当前正式动画/宣传素材来源优先登记：
- 动画制作团队作品页：https://www.garden-culture.net/services.html
- 《狐妖小红娘》动画官方微博（来源页逐条登记）
- 腾讯视频等官方发行平台页面

第三方搬运、无来源转载、搜索结果缩略图不得进入正式源注册表。
