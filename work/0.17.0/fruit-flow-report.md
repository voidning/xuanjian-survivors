# 果位自然流程证据

新旧各 40 局：两路线 × 五器物 × 种子 42/907 × route/balanced。所有死亡保留；标准模式逐帧 0.05s，上限 800s。80 局均自然结束，无时间上限截断。

这是输入驱动 simulation smoke，不是浏览器真人端到端，也不是胜率统计。没有注入经验、血量、神通、机缘完成状态或跳时。移动照 encounters-smoke；route 缺项优先，五道后新版本精修优先；balanced 每三次普通升级优先训练，其余 route。受箓重海长鲸，拥有时正常 API 主修 gate/rain，无路线目标候选时每屏最多正常重抽两次，balanced 训练轮不重抽。旧版五道成型后 targets 为空，继续使用同一兜底评分；这是规则感知的同策略，不是锁死同选牌序列。

|版本/策略|成型|胜利|成型中位秒（仅成型局）|
|---|---:|---:|---:|
|new/all|29/40|10|226.5|
|new/mingyang_route|8/10|5|163.825|
|new/mingyang_balanced|6/10|4|260.075|
|new/lushui_route|9/10|0|211.3|
|new/lushui_balanced|6/10|1|252.05|
|baseline/all|33/40|8|126.35|
|baseline/mingyang_route|9/10|2|125.75|
|baseline/mingyang_balanced|6/10|2|130.425|
|baseline/lushui_route|9/10|3|105.65|
|baseline/lushui_balanced|9/10|1|226.8|

新版本 11 局未成型而死，其中 4 局已齐五道，仅缺路线任一道三重。其余未成型的具体缺项见 JSON missing；needsMastery 独立记录。训练优先主动放过路线机会共 27 次（明阳 15、渌水 12），route 策略为 0 次。最长连续普通升级初始候选无目标机会为 6；计数仅在 targets 尚存在时，包括路线尚未入门，重抽屏不计新升级。它不能直接证明三次保底失效，因为保障可能选择另一条已学习路线。

29 对均成型局中，成型时刻差中位 81.2 秒，范围 0–239.1 秒。这不是三重门槛独立效应：候选、选择、随机数消耗、伤害/存活、经验获取、机缘和重抽都可能随路径改变。渌水 route 本次新版本 0/10 胜、旧版 3/10 胜也仅作为当前操作策略和种子的现象，不推断总体强弱。

## 五道齐备仍未成型样本

- mingyang / spear / 907 / route：104.7s 齐五道，164.7s 身死道消；最终技能 {'gate': 1, 'muddle': 1, 'body': 2, 'edict': 1, 'dew': 3, 'dusk': 1, 'light': 1, 'rain': 1}。
- lushui / sword / 42 / balanced：226.8s 齐五道，232.25s 身死道消；最终技能 {'rain': 2, 'gold': 1, 'conceal': 2, 'muddle': 1, 'light': 2, 'spring': 1, 'dew': 1}。
- lushui / bow / 907 / balanced：306.7s 齐五道，309.9s 身死道消；最终技能 {'rain': 2, 'dew': 2, 'conceal': 2, 'thunder': 1, 'fragrance': 1, 'gold': 1, 'armor': 1, 'light': 1, 'muddle': 1, 'spring': 1}。
- lushui / thunderseal / 907 / balanced：252.75s 齐五道，291.7s 身死道消；最终技能 {'rain': 2, 'flame': 1, 'gold': 2, 'conceal': 2, 'dew': 1, 'spring': 2, 'gate': 1, 'muddle': 1}。

原始 JSON 包含每局机缘 fieldHistory、奖励选牌数、重抽使用与剩余、所有选牌初始/最终候选、路线目标、主动训练选择、最后伤害记录、结束原因、五道齐备与 fruits false→true 时刻。

运行命令：`node tests/fruit-smoke.cjs`；旧版加 `XJ_GAME_ROOT=/Users/ningnarigele/Desktop/玄鉴仙族-几笔长生` 环境变量。测试脚本仅新增一个文件，无产品修改。新旧模块已各自在启动时完整加载；结果未剔除死亡或筛选成功样本。
