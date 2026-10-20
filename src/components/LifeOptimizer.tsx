import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, Text, TextInput, View } from 'react-native';

const palette = { ink: '#18332D', muted: '#74827A', card: '#FFFEFA', line: '#E5E5DC', orange: '#E87A4E', green: '#E8EEE5', white: '#FFFFFF' };
const SETTINGS_KEY = 'another-i-life-model-v1';
type Scenario = '充值' | '刷卡' | '出行';
type Priority = '省钱' | '省时' | '舒适';
type Props = { styles: Record<string, any> };

const modes = ['充值', '刷卡', '出行'] as const;
const levelOptions = ['低', '中', '高'] as const;
const parse = (value: string, fallback: number) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function LifeOptimizer({ styles }: Props) {
  const [scenario, setScenario] = useState<Scenario>('出行');
  const [weight, setWeight] = useState<Record<Priority, number>>({ 省钱: 2, 省时: 3, 舒适: 2 });
  const [weather, setWeather] = useState<'晴' | '雨'>('晴');
  const [urgency, setUrgency] = useState<'不赶' | '正常' | '紧急'>('正常');
  const [origin, setOrigin] = useState('家');
  const [destination, setDestination] = useState('公司');
  const [amount, setAmount] = useState('100');
  const [recharge, setRecharge] = useState([
    { name: '运营商官方', pay: '100', reward: '0', convenience: 3 },
    { name: '常用支付平台', pay: '98', reward: '0.2', convenience: 2 },
    { name: '积分商城', pay: '0', reward: '-5', convenience: 1 },
  ]);
  const [category, setCategory] = useState<'日常' | '餐饮' | '出行' | '网购'>('日常');
  const [cards, setCards] = useState([
    { name: '日常卡', rate: '1', categories: '日常、餐饮、出行、网购', convenience: 3 },
    { name: '餐饮卡', rate: '2', categories: '餐饮', convenience: 2 },
    { name: '网购卡', rate: '1.5', categories: '网购', convenience: 2 },
  ]);
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((raw) => {
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.scenario && modes.includes(saved.scenario)) setScenario(saved.scenario);
      if (saved.weight) setWeight((old) => ({ ...old, ...saved.weight }));
      if (saved.weather) setWeather(saved.weather);
      if (saved.urgency) setUrgency(saved.urgency);
      if (saved.origin) setOrigin(saved.origin);
      if (saved.destination) setDestination(saved.destination);
      if (saved.amount) setAmount(saved.amount);
      if (saved.recharge) setRecharge(saved.recharge);
      if (saved.category) setCategory(saved.category);
      if (saved.cards) setCards(saved.cards);
    }).catch(() => undefined).finally(() => setSettingsReady(true));
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ scenario, weight, weather, urgency, origin, destination, amount, recharge, category, cards })).catch(() => undefined);
  }, [settingsReady, scenario, weight, weather, urgency, origin, destination, amount, recharge, category, cards]);

  const weights = useMemo(() => ({ cost: weight['省钱'], time: weight['省时'], comfort: weight['舒适'] }), [weight]);
  const ranked = useMemo(() => {
    if (scenario === '充值') {
      const nominal = Math.max(1, parse(amount, 100));
      const options = recharge.map((x) => ({
        name: x.name,
        detail: `实付 ¥${parse(x.pay, nominal).toFixed(2)} · 返利/积分价值 ¥${parse(x.reward, 0).toFixed(2)}`,
        cost: clamp(100 - ((parse(x.pay, nominal) - parse(x.reward, 0)) / nominal) * 100, 0, 100),
        time: 68 + x.convenience * 9,
        comfort: 62 + x.convenience * 12,
        reason: `折算净成本约 ¥${(parse(x.pay, nominal) - parse(x.reward, 0)).toFixed(2)}`,
      }));
      return rank(options, weights);
    }
    if (scenario === '刷卡') {
      const spend = Math.max(1, parse(amount, 1000));
      return rank(cards.map((x) => {
        const matches = x.categories.split('、').includes(category);
        const rate = parse(x.rate, 1) * (matches ? 1 : 0.3);
        return { name: x.name, detail: `${matches ? '适用' : '非主要场景'} · ${rate.toFixed(2)}% 回报示例`, cost: rate * 10, time: 65 + x.convenience * 10, comfort: 60 + x.convenience * 12, reason: `¥${spend} 消费，按示例回报约 ¥${(spend * rate / 100).toFixed(2)}${matches ? '' : '（按基础倍率估算）'}` };
      }), weights);
    }
    const urgencyFactor = urgency === '紧急' ? 1.45 : urgency === '不赶' ? 0.7 : 1;
    const routes = [
      { name: '步行', minutes: 35, fare: 0, comfort: weather === '雨' ? 20 : 83, safe: 74 },
      { name: '骑行', minutes: 18, fare: 2, comfort: weather === '雨' ? 28 : 70, safe: weather === '雨' ? 43 : 62 },
      { name: '公交 / 地铁', minutes: 28, fare: 5, comfort: weather === '雨' ? 70 : 65, safe: 82 },
      { name: '网约车 / 出租车', minutes: 16, fare: 28, comfort: weather === '雨' ? 87 : 80, safe: 82 },
    ];
    return rank(routes.map((x) => ({ name: x.name, detail: `约 ${Math.round(x.minutes * urgencyFactor)} 分钟 · ¥${x.fare} · ${weather === '雨' ? '雨天' : '晴天'}`, cost: 100 - Math.min(x.fare, 30) / 30 * 100, time: 100 - Math.min(x.minutes * urgencyFactor, 55) / 55 * 100, comfort: x.comfort, reason: `${x.minutes} 分钟预估 · ${urgency === '紧急' ? '紧急程度提高了时间权重' : urgency === '不赶' ? '时间宽松，成本更重要' : '兼顾耗时与成本'}` })), weights);
  }, [scenario, recharge, cards, category, amount, urgency, weather, weights]);
  const recommendation = ranked[0];

  const setWeightLevel = (key: Priority, level: typeof levelOptions[number]) => setWeight((old) => ({ ...old, [key]: level === '低' ? 1 : level === '中' ? 2 : 3 }));
  const numberField = (label: string, value: string, onChangeText: (value: string) => void, unit = '¥') => <View style={{ flex: 1 }}><Text style={styles.mutedSmall}>{label}</Text><View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}><Text style={{ color: palette.muted, fontSize: 11 }}>{unit}</Text><TextInput keyboardType="decimal-pad" value={value} onChangeText={onChangeText} style={[styles.input, { flex: 1, marginTop: 0, marginLeft: 4, paddingVertical: 9 }]} /></View></View>;
  const pick = (options: readonly string[], value: string, onChange: (v: any) => void) => <View style={styles.selectRow}>{options.map((x) => <Pressable key={x} onPress={() => onChange(x)} style={[styles.choice, value === x && styles.choiceOn]}><Text style={[styles.choiceText, value === x && { color: palette.white }]}>{x}</Text></Pressable>)}</View>;

  return <View style={[styles.card, { marginTop: 8 }]}>
    <Text style={styles.eyebrow}>PERSONAL DECISION MODEL</Text>
    <Text style={[styles.sectionTitle, { fontSize: 19 }]}>把生活小规则变成选择</Text>
    <Text style={styles.body}>输入眼前条件，调整你在意的事。推荐会按权重排序，并解释取舍。</Text>
    {pick(modes, scenario, setScenario)}
    <Text style={styles.label}>这次更看重什么？（可同时设置）</Text>
    {(['省钱', '省时', '舒适'] as Priority[]).map((key) => <View key={key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}><Text style={styles.mutedSmall}>{key}</Text>{pick(levelOptions, weight[key] === 1 ? '低' : weight[key] === 2 ? '中' : '高', (v: string) => setWeightLevel(key, v as typeof levelOptions[number]))}</View>)}

    {scenario === '充值' && <>
      <Text style={styles.label}>充值金额</Text>{numberField('面额', amount, setAmount)}
      <Text style={styles.label}>不同渠道（可改成你看到的实时报价）</Text>
      {recharge.map((x, i) => <View key={x.name} style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: palette.line, marginTop: 10 }}><Text style={styles.moduleTitle}>{x.name}</Text><View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>{numberField('实际支付', x.pay, (v) => setRecharge((old) => old.map((o, j) => j === i ? { ...o, pay: v } : o)))}{numberField('返现/积分折值', x.reward, (v) => setRecharge((old) => old.map((o, j) => j === i ? { ...o, reward: v } : o)))}</View></View>)}
      <Text style={styles.meta}>示例渠道与价格仅用于演示。积分按你输入的折现金额估算；请以实际到账和活动规则为准。</Text>
    </>}

    {scenario === '刷卡' && <>
      <Text style={styles.label}>本次消费类型</Text>{pick(['日常', '餐饮', '出行', '网购'], category, setCategory)}
      <Text style={styles.label}>消费金额与卡片规则</Text>{numberField('消费金额', amount, setAmount)}
      <Text style={styles.meta}>为保护隐私，卡名只保存在当前页面状态，不需要输入卡号。</Text>
      {cards.map((x, i) => <View key={x.name} style={{ paddingTop: 9, borderTopWidth: 1, borderTopColor: palette.line, marginTop: 9 }}><Text style={styles.moduleTitle}>{x.name} · 示例规则</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>{numberField('回报率 %', x.rate, (v) => setCards((old) => old.map((o, j) => j === i ? { ...o, rate: v } : o)), '%')}<Text style={[styles.mutedSmall, { flex: 1 }]}>{x.categories}</Text></View></View>)}
      <Text style={styles.meta}>示例回报率需按你自己的卡片权益修改，未计入封顶、年费或活动门槛。</Text>
    </>}

    {scenario === '出行' && <>
      <Text style={styles.label}>从哪里到哪里</Text><View style={{ flexDirection: 'row', gap: 8 }}>{<TextInput value={origin} onChangeText={setOrigin} style={[styles.input, { flex: 1 }]} placeholder="出发地" />}<Text style={{ alignSelf: 'center', color: palette.muted }}>→</Text><TextInput value={destination} onChangeText={setDestination} style={[styles.input, { flex: 1 }]} placeholder="目的地" /></View>
      <Text style={styles.label}>当下情况</Text><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={styles.mutedSmall}>天气</Text>{pick(['晴', '雨'], weather, setWeather)}</View><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}><Text style={styles.mutedSmall}>紧急程度</Text>{pick(['不赶', '正常', '紧急'], urgency, setUrgency)}</View>
      <Text style={styles.meta}>路线时间和费用是演示估值，尚未接入地图、实时路况或天气服务。</Text>
    </>}

    <View style={[styles.output, { minHeight: 0, marginTop: 16, padding: 14 }]}>
      <Text style={styles.pill}>当前推荐 · {scenario}</Text>
      <Text style={[styles.profileTitle, { fontSize: 21 }]}>{recommendation?.name}</Text>
      <Text style={[styles.body, { color: palette.ink }]}>{recommendation?.detail}</Text>
      <Text style={styles.meta}>为什么：{recommendation?.reason}。按你的权重计算综合匹配度 {Math.round(recommendation?.score ?? 0)}%。{scenario === '出行' ? ` 线路：${origin || '起点'} → ${destination || '终点'}。` : ''}</Text>
      <Text style={[styles.label, { marginBottom: 0 }]}>其他方案</Text>
      {ranked.slice(1).map((item) => <View key={item.name} style={{ borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 8, marginTop: 8 }}><Text style={styles.moduleTitle}>{item.name} · {Math.round(item.score)}%</Text><Text style={styles.mutedSmall}>{item.detail}</Text></View>)}
    </View>
  </View>;
}

function rank<T extends { name: string; detail: string; cost: number; time: number; comfort: number; reason: string }>(items: T[], weights: { cost: number; time: number; comfort: number }) {
  const total = weights.cost + weights.time + weights.comfort;
  return items.map((x) => ({ ...x, score: (x.cost * weights.cost + x.time * weights.time + x.comfort * weights.comfort) / total })).sort((a, b) => b.score - a.score);
}
