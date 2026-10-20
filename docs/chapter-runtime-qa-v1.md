# 梦灯笼 Chapter Runtime v2 · 第5层仓库QA

日期：2026-10-20

结论：**仓库结构与资源事实源 QA 通过。**

本报告只覆盖 DreamLantern-Media 仓库的资源结构、分卷映射、fallback边界与运行时目录规则。它不冒充 Android 真机测试，也不冒充当前执行环境无法完成的外部 CDN 实时网络验收。

## 1. 卷数与结构

- 古代 A01-A08：8卷。
- 现代 M01-M13：13卷。
- 总计：21卷。
- 新运行时唯一入口：`manifest/chapter-runtime.v2.json`。
- 每卷都由 `resource.json`、`images/manifest.json`、`video/manifest.json` 三类权威文件描述。

## 2. 静态视觉

- 已映射核实官方静态视觉：15卷。
- 明确 pending：A01、M09、M10、M11、M12、M13，共6卷。
- Pending 卷优先使用梦灯笼品牌背景 + 本卷 FX，不以错图填空。
- 旧生成图只能在官方/品牌资源真实加载失败后作为故障 fallback。

## 3. 旧生成资源去重

旧 `poster/` / `thumb/` 看起来存在大量文件，但 SHA 审计后仅9套独立生成母题：portal、desert、bamboo、blossom、golden、purple、river、bay、snow。

以后不得按路径数量计算“素材丰富度”；同一 blob 的重复路径、不同裁切均不计为新增独立素材。

## 4. 动态资源

已有官方PV/动态来源页面登记的卷：A02、A03、A05、A06、M02、M07、M08、M09。

当前 `stableDirectMp4` 总数：0。

这是正确状态，不是缺陷：页面存在不等于拥有可长期直接播放的MP4。禁止猜地址、抓取临时签名媒体、绕过DRM或使用第三方搬运。

M09 已登记3个官方PV页面，但仍保持无伪造直连。

## 5. 关键污染防护

- M08 真龙篇继续使用已确认的无暮对应关系。
- M09 不再允许旧 blossom/月红生成图冒充镜花缘主视觉。
- M12 不得将 M06 旧南国动画海报冒充再入南国主视觉。
- M13 严禁绑定黄风岭动画素材。
- 新运行时禁止跨卷借主视觉。
- 新运行时禁止生成图作为正常主视觉。

## 6. 兼容层

旧 `poster/`、`thumb/` 与 `manifest/visual.override.v1.2.json` 暂时保留，只为了现有 v1.2.0 等旧卡兼容与迁移审计。

新版本不得再从这些目录自由选图。

## 7. 外部网络QA说明

本轮尝试对 jsDelivr v2总表和 Garden Culture 官方静态资源执行HTTP头检查，但当前执行环境无法解析外部域名。因此：

- 不把它记为资源失败；
- 也不虚报为“CDN实测通过”；
- QA状态登记为 `blocked_by_execution_environment_dns`；
- 在最终 Android 实机QA / 正式tag冻结前必须补跑真实网络检查。

GitHub 主仓库中的运行时总表、21卷资源目录与权威清单已经正常落盘。

## 8. 下一阶段

仓库五层整理到此收口。

下一阶段正式进入：**官方 MP4 / 动态来源搜集与验证**。

优先顺序建议：M09 镜花缘 → M08 真龙/无暮 → M02 尾生 → A03 竹业 → A05/M07 沐天城/两生花 → 其余动画卷。

只有验证为稳定、适合公开版本直接引用的动态媒体，才允许进入 `stableDirectMp4` / `video/primary/`。

新正式 tag 暂不创建，等 MP4 阶段、资源接入与 Android 真机QA完成后再冻结。
