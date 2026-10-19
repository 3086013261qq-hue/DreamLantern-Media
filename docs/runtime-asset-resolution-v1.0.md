# DreamLantern 运行时资源解析契约 v1.0

## 目标
让《梦灯笼》同时支持：
- 官方站点绝对URL（官方海报/宣传视觉）
- DreamLantern-Media仓库相对路径（FX / fallback / 原创UI）

## URL解析规则
伪代码：

```js
function resolveAsset(ref, assetBase) {
  if (!ref) return null;
  if (/^https?:\/\//i.test(ref)) return ref;
  return assetBase.replace(/\/$/, '') + '/' + String(ref).replace(/^\//, '');
}
```

严禁：
```js
assetBase + officialAssetUrl
```
否则会把官方绝对URL拼坏。

## 每卷加载顺序
1. `officialVideo/embed`（只有已核稳定且允许运行时接入时）
2. `officialAssetUrl`
3. `fallbackGeneratedLandscape / fallbackGeneratedPortrait`
4. `fallbackSvg`

官方图片加载失败只能降级视觉，不得改变：
- MVU字段
- 当前时代
- 当前缘卷
- 世界书开关
- 缘忆收藏状态
- 缘音

## 手机端
- 正式视觉容器：`object-fit: cover`
- `object-position` 必须逐卷读取Manifest，不得统一写死50% 50%。
- 禁止`contain`导致上下/左右黑块。
- 标题区应使用渐变遮罩而不是给图片硬留黑色空白。

## 外部官方资源失败
`img.onerror`：
- 第一次切 `fallbackGeneratedPortrait/Landscape`
- 第二次切 `fallbackSvg`
- 不循环重试
- 不弹阻塞式报错

## 动态资源
官方播放页URL（微博视频页、腾讯视频节目页、制作团队PV页）只是 `sourcePage`，不能直接写入 `<video src>`。
只有 `stableDirectMp4` / 明确可嵌入官方媒体存在时，才进入 `official_video` 模式。

## CDN版本
- `v1.0.1` 已冻结旧版。
- 当前资源返工以 `main` 为开发源。
- 最终验收后再由装配阶段创建新固定Tag（建议 `v1.2.0` 或更高）。
