export type EntryKind = '小感悟随记' | '大事件复盘分析' | '看书笔记' | '人物 Skill 分析' | '思维模型';
export type Entry = { id: string; title: string; body: string; kind: EntryKind; createdAt: number };
export type Habit = { id: string; title: string; detail: string; done: boolean };
export type Goal = { id: string; title: string; reason: string; done: boolean };

export const STORAGE_KEY = 'another-i-v1';
export const starterEntries: Entry[] = [
  { id: 'seed-1', title: '关于慢下来的练习', body: '当我不急着把每一分钟填满，反而更能听见自己真正想做什么。空白不是浪费，而是让重要的东西浮现出来的空间。', kind: '小感悟随记', createdAt: Date.now() - 2_400_000 },
  { id: 'seed-2', title: '《悉达多》：每个人都只能自己去寻找', body: '知识可以分享，经验却不能被直接移交。真正改变我的，常常不是听到一个道理，而是亲自走过之后终于理解。', kind: '看书笔记', createdAt: Date.now() - 86_400_000 },
  { id: 'seed-3', title: '第一次拒绝一个不适合自己的机会', body: '拒绝之后没有想象中的轻松，但有一种安静的确定：我开始相信自己的感受也值得被认真对待。', kind: '大事件复盘分析', createdAt: Date.now() - 5 * 86_400_000 },
];
export const starterHabits: Habit[] = [
  { id: 'h1', title: '早晨散步', detail: '让一天从温柔的节奏开始', done: true },
  { id: 'h2', title: '睡前阅读', detail: '给注意力一个安静的落点', done: false },
  { id: 'h3', title: '写下今日感受', detail: '不用完整，只要诚实', done: true },
];
export const starterGoals: Goal[] = [
  { id: 'g1', title: '找回稳定的睡前节奏', reason: '每周至少 4 天在 23:30 前放下手机，让早晨不再匆忙。', done: false },
];
