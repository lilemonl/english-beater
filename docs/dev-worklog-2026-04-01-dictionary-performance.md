# 开发记录（2026-04-01）Dictionary 性能优化

## 目标

- 给 `dictionary` 增加虚拟滚动，解决大词库渲染卡顿
- 在页面右侧加 A-Z 锚点，支持快速定位
- 按当前上下文要求，优化渲染逻辑，减少无效重渲染

## 实现内容

### 1) 虚拟滚动

- 文件：`frontend/src/components/Dictionary.tsx`
- 方案：
  - 引入 `react-window` + `react-virtualized-auto-sizer`
  - 将词典列表改造为 `VariableSizeList`
  - 列表行拆为两类：
    - 字母分组标题行（A-Z / #）
    - 单词卡片行
  - 只渲染可视区域 + overscan 区域，显著降低 DOM 数量

### 2) A-Z 锚点导航

- 文件：`frontend/src/components/Dictionary.tsx`
- 方案：
  - 先按首字母分组并生成虚拟列表数据
  - 预先计算每个字母首行在虚拟列表中的 index
  - 右侧渲染 A-Z 锚点按钮
  - 点击锚点后通过 `scrollToItem` 精确跳转
  - 无对应单词的字母置灰禁用

### 3) 渲染优化（结构与状态）

- 文件：`frontend/src/components/Dictionary.tsx`
- 关键优化：
  - 单词卡片提取为 `React.memo` 组件
  - `playWord`、收藏/加星/笔记等交互改为 `useCallback`
  - `filteredWords`、排序、分组、索引映射使用 `useMemo`
  - 搜索接口保留防抖（200ms）

### 4) 依赖

- 执行：`npm install react-window react-virtualized-auto-sizer`
- 影响文件：`frontend/package.json`、`frontend/package-lock.json`

## 兼容性与交互取舍

- 为配合虚拟列表固定行高，笔记编辑从原来的卡片内展开输入，改为 `prompt` 弹窗编辑
- 词典原有能力（搜索、发音、加星、收藏、笔记保存）都保留

## 验收建议

1. 打开词典页后滚动到底部，确认滚动流畅  
2. 点击右侧 `A / M / Z`，确认可快速跳转到对应字母区  
3. 搜索输入（如 `afrcn`）后观察列表变化与响应速度  
4. 随机对词条执行发音、收藏、加星、笔记编辑，确认功能正常  

---

## 补充修复（同日）

- 现象：接口有返回，但虚拟列表区域不出词条
- 处理：将 `react-window + 分组行` 方案调整为“手写固定行高虚拟滚动”
  - 保留 A-Z 锚点定位
  - 保留性能优化（只渲染可视区 + overscan）
  - 减少第三方版本差异引入的运行时不稳定
