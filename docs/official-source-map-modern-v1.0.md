# DreamLantern 现代M01-M09官方视觉来源映射 v1.0

目标：为现代前九卷提供一手官方/制作方素材来源，替换现有AI生成主Poster。

## M01 下沙篇
- 一手来源：洛水花原/花原文化《狐妖小红娘》下沙篇作品页
- 页面：https://www.garden-culture.net/services.html
- 官方信息：2015-06-26首播，总第1-13集
- 正式视觉策略：优先使用该作品页对应下沙篇官方宣传图；如无法稳定直链，则保留来源页并采用官方宣传静态视觉 + 梦灯笼FX。
- 当前AI desert图：仅保留fallback-generated。

## M02 尾生篇
- 一手来源：洛水花原/花原文化《狐妖小红娘》尾生篇作品页
- 页面：https://www.garden-culture.net/services.html
- 官方信息：2019-11-22首播，总第102-111集；页面登记“尾生篇定档PV”
- 正式视觉策略：优先尾生篇定档PV/宣传海报；动态源若不稳定，则使用官方静态宣传视觉 + 花瓣/树影/水光FX。
- 当前AI river图：仅保留fallback-generated。

## M03 王权篇
- 一手来源：洛水花原/花原文化《狐妖小红娘》王权篇作品页
- 页面：https://www.garden-culture.net/services.html
- 官方信息：2016-01-08首播，总第14-27集
- 正式视觉策略：优先王权篇官方动画宣传视觉；FX可使用剑光、符箓、冷金线，但不能替代角色主视觉。
- 当前AI bamboo图：仅保留fallback-generated。

## M04 月红篇
- 一手来源：洛水花原/花原文化《狐妖小红娘》月红篇作品页
- 页面：https://www.garden-culture.net/services.html
- 官方信息：2016-06-24首播，总第28-48集
- 正式视觉策略：优先月红篇官方动画宣传视觉；可叠加红线、狐火、花瓣、暖尘FX。
- 当前AI blossom图：仅保留fallback-generated。

## M05 千颜篇
- 一手来源：洛水花原/花原文化《狐妖小红娘》千颜篇作品页
- 页面：https://www.garden-culture.net/services.html
- 官方信息：2017-02-24首播，总第49-63集
- 正式视觉策略：优先千颜篇官方动画宣传视觉；可叠加水波、镜面、纸片等轻FX。
- 当前AI river图：仅保留fallback-generated。

## M06 南国篇
- 一手来源：洛水花原/花原文化《狐妖小红娘》南国篇作品页
- 页面：https://www.garden-culture.net/services.html
- 官方信息：2017-11-24首播，总第64-89集
- 正式视觉策略：优先南国篇官方动画宣传视觉；FX围绕毒雾、暖紫、萤光，避免泛紫色幻想景观。
- 当前AI purple图：仅保留fallback-generated。

## M07 金晨曦篇
- 一手来源：洛水花原/花原文化《狐妖小红娘》金晨曦篇作品页
- 页面：https://www.garden-culture.net/services.html
- 官方信息：2020-06-19首播，总第112-121集；页面登记片头曲《落空》
- 正式视觉策略：优先金晨曦篇官方宣传视觉；FX可用金色液体、裂纹、封印线。
- 当前AI golden图：仅保留fallback-generated。

## M08 真龙篇
- 一手候选来源：洛水花原/花原文化《狐妖小红娘》无暮篇作品页
- 页面：https://www.garden-culture.net/services.html
- 官方信息：2023-06-24首播，总第146-157集；内容涉及王权无暮与梵云飞、厉雪扬前尘
- 注意：本卡M08标题为“真龙篇”，不是动画官方篇名“无暮篇”。正式绑定前必须继续核对M08卷内事件与无暮篇画面对应，不可只因“有龙/有无暮”就直接等同。
- 正式视觉策略：先核剧情对应，再选官方无暮/真龙相关宣传视觉；现有AI desert图仅fallback-generated。

## M09 镜花缘篇
- 一手来源：动画《狐妖小红娘》官方微博“镜花缘篇全新概念PV”
- 页面：https://weibo.com/5616549369/4961092583032595
- 发布时间：2023-10-26
- 正式视觉策略：优先镜花缘概念PV及同系列官方角色PV/宣传视觉；FX使用镜片、倒影、雾层、碎光，不得继续使用M04同一blossom图。
- 当前AI blossom图：仅保留fallback-generated。

## 动态资源规则
制作团队页面明确登记尾生、竹业、沐天城、两生花等篇章定档PV；镜花缘有动画官博概念PV。是否能作为运行时 `official_video`，必须另做“稳定可嵌入源”测试。

禁止：
- 把“有PV页面”直接等同于“有稳定MP4”；
- 抓带token的临时MP4；
- 从腾讯/哔哩哔哩/第三方下载正片再上传GitHub；
- 用AI生成环境图冒充官方篇章视觉。

运行时优先级：
`official_video/embed -> official_still -> official_still+fx -> fallback-generated -> fallback-svg`
