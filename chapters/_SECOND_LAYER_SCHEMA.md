# DreamLantern 第二层资源结构

每卷必须包含：`resource.json`、`images/manifest.json`、`video/manifest.json`。

`images/manifest.json` 决定 primary / secondary / memory / background / fallback 的允许素材；`video/manifest.json` 决定动态素材来源及是否存在可直接播放的MP4。

目录存在不等于允许使用。任何装配行为必须以 manifest 为准。
