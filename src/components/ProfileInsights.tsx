import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Entry, Goal, Habit } from '../lib/model';

type Props = { entries: Entry[]; habits: Habit[]; goals: Goal[]; styles: Record<string, any> };
const themes: [string, string[]][] = [
  ['自我认识', ['自己', '自我', '理解']],
  ['时间与节奏', ['时间', '慢下来', '节奏', '专注']],
  ['关系与边界', ['拒绝', '边界', '关系']],
  ['学习与阅读', ['阅读', '读书', '学习', '经验']],
  ['目标与行动', ['目标', '计划', '习惯', '行动']],
];

export default function ProfileInsights({ entries, habits, goals, styles }: Props) {
  const summary = useMemo(() => {
    const types = ['感悟', '阅读笔记', '人生经历'].map((kind) => ({ kind, count: entries.filter((entry) => entry.kind === kind).length }));
    const keywords = themes.map(([name, words]) => ({ name, count: entries.filter((entry) => words.some((word) => `${entry.title}${entry.body}`.includes(word))).length })).filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
    return { types, keywords };
  }, [entries]);

  return <View style={styles.card}>
    <View style={styles.section}><Text style={styles.sectionTitle}>从记录中看见的你</Text><Text style={styles.mutedSmall}>持续更新</Text></View>
    <View style={styles.chips}>
      <Stat text={`${entries.length} 条记录`} styles={styles} />
      <Stat text={`${habits.filter((habit) => habit.done).length}/${habits.length} 项习惯今日完成`} styles={styles} />
      <Stat text={`${goals.filter((goal) => !goal.done).length} 项计划进行中`} styles={styles} />
    </View>
    <Text style={styles.label}>记录类型</Text>
    {summary.types.map((item) => <View key={item.kind} style={styles.kv}><Text style={styles.mutedSmall}>{item.kind}</Text><Text style={styles.kvValue}>{item.count} 条</Text></View>)}
    <Text style={styles.label}>常出现的主题 · 关键词匹配</Text>
    {summary.keywords.length ? <View style={styles.chips}>{summary.keywords.slice(0, 4).map((item) => <Stat key={item.name} text={`${item.name} · ${item.count}`} styles={styles} />)}</View> : <Text style={styles.mutedSmall}>记录多一些后，这里会逐渐形成你的主题线索。</Text>}
    <Text style={styles.meta}>基于此设备保存的标题和文字做简单归类，不会上传；这是记录统计，不是心理诊断。</Text>
  </View>;
}

function Stat({ text, styles }: { text: string; styles: Record<string, any> }) { return <View style={styles.chip}><Text style={styles.chipText}>{text}</Text></View>; }
