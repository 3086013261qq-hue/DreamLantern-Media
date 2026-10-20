# 梦灯笼官方动态 / MP4 搜集日志 v1

开始日期：2026-10-20

## 目标

为 A01-A08 / M01-M13 建立可长期维护的官方动态资源池。

本阶段不以“必须塞满MP4”为目标；只把来源分清楚。真正写入 `stableDirectMp4` 的资源必须是已经核实、长期稳定、适合公开版本直接引用的直接媒体。

## 状态词

- `stable_direct_mp4`：已核实稳定直接媒体，可评估进入 `video/primary/`。
- `official_page_only`：官方PV/视频页面存在，但没有核实稳定裸MP4。
- `official_embed_only`：官方流媒体/嵌入页存在；只能引用/跳转/嵌入，不下载转码。
- `memory_only`：语义只适合缘忆，不适合作当前卷主Opening。
- `reject`：第三方搬运、解说、盗版、临时签名媒体、DRM、猜测URL。

## 第一批

### M09 镜花缘篇

已确认动画官博正式动态页：

1. 镜花缘篇概念PV
2. 东方月初个人PV
3. 涂山雅雅个人PV

状态：`official_page_only`

当前稳定裸MP4：0

正常运行：官方静态待补前，品牌背景 + 镜面FX。

### M08 真龙篇 / 无暮对应

已登记：

- Garden Culture 无暮篇官方动态入口
- 动画官博王权景行相关官方动态页
- Tencent Video-ANIMATION 官方 YouTube Season11 EP01 流媒体页

其中 Tencent YouTube 只标为 `official_embed_only`，不得下载转码或冒充短PV。

当前稳定裸MP4：0

### M02 尾生篇

Garden Culture 官方作品页确认“尾生篇定档PV”入口。

状态：`official_page_only`

当前稳定裸MP4：0

### A03 涂山道盟 / 竹业视觉

Garden Culture 官方作品页确认“竹业篇定档PV”入口。

状态：`official_page_only`

当前稳定裸MP4：0

### A05 道盟变局 / 沐天城

Garden Culture 官方作品页确认“沐天城篇定档PV”入口。

状态：`official_page_only`

当前稳定裸MP4：0

### M07 金晨曦篇

已登记沐天城篇、两生花篇官方PV页面，但二者只允许作缘忆/辅助候选，不冒充M07主Opening。

状态：`official_page_only / memory candidate`

当前稳定裸MP4：0

## 搜索污染处理

搜索过程中发现部分 Bilibili 视频由普通UP主转载、整理或二次发布。即便内容来源可能是官方PV，只要发布主体不能作为正式官方源确认，就不进入 DreamLantern 正式动态池。

不从这些页面抽取媒体地址，也不把它们当作公开版资源宿主。

## 下一批

继续优先核对：

1. M09 镜花缘更多动画官博正式PV（定档/终极PV）
2. M08 无暮官方PV与公开可嵌入来源
3. M02 尾生PV正式宿主
4. A03 竹业PV正式宿主
5. A05/M07 沐天城、两生花正式宿主
6. M01/M03/M04/M05/M06 旧动画篇官方动态源

M10-M13 后期漫画篇保持谨慎：没有准确动画/官方动态对应时，宁可为空，不跨卷冒充。
