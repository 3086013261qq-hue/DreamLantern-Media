# DreamLantern 第三层资源去重审计 v1.0

## 结论
旧 `poster/` / `thumb/` 路径很多，但按 Git blob SHA 去重后，生成场景主母题只有 9 套。以后不得按文件路径数量判断素材丰富度。

## 9套旧生成场景母题
- portal：A01、M11
- desert：A02、M01、M08
- bamboo：A03、M03
- blossom：A04、A06、M04、M09
- golden：A05、M07
- purple：A07、M06、M12
- river：A08、M02、M05
- bay：M10
- snow：M13

以上全部只允许作为 `fallback`，不得重新升级为正式主视觉。

## 已核实的独立官方静态主源
当前 source-registry 中有 10 个不同的制作方官方宣传图：
`hy_jcx / hy_mtc / hy_ng / hy_qy / hy_wm / hy_wq / hy_ws / hy_xs / hy_yh / hy_zy`。

这些官方图采用 public-link，不在公开仓库重复上传原图。

## 第三层规则
1. 每卷按 `primary / secondary / memory / background / fallback` 分配。
2. 同一图允许因用途不同使用不同裁切，但必须在 manifest 中写清楚，不得伪装成“多张不同素材”。
3. 正式主图不足时保持槽位 pending，不得拿旧AI图填满。
4. 动态来源必须区分 `official page / official stream / stable direct mp4`。
5. `stableDirectMp4` 为空时，静静不得猜URL。
