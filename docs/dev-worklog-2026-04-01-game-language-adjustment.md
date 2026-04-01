# 开发记录（2026-04-01）Game 出题语言调整

## 需求

- 游戏作答保持英文选项
- 题目展示改为中文，并包含该词汇的英文意思信息

## 实现

### 1) 后端题目文案改为中文

- 文件：`backend/services/question.service.ts`
- 改动：
  - 单选题提示改为：`请选择符合释义的英文单词`
  - 多选题提示改为：`请选择语义偏积极或中性的英文单词`

### 2) 题目结构补充英文语境字段

- 文件：`backend/services/question.service.ts`
- 改动：
  - 单选题 `word` 对象增加 `example` 字段回传（来自词库例句）
  - 同步明确 `translation`、`pos` 的可选字段定义

- 文件：`frontend/src/types.ts`
- 改动：
  - `Question.word` 增加 `example?: string`

### 3) 前端 Game 展示改版

- 文件：`frontend/src/components/Game.tsx`
- 改动：
  - 题号区改中文：`第 X 题（单选/多选）`
  - 单选题不再突出展示单词本体，改为展示：
    - 中文释义（translation）
    - 英文释义/语境（example）
  - 多选提交按钮改中文：`提交答案`
  - 选项保持英文单词（不显示中文），满足“英文作答”

## 结果

- 答案输入层：英文  
- 题目信息层：中文 + 英文语境说明  
- 满足“回答用英文，问题用中文及英文意思”的交互目标。  
