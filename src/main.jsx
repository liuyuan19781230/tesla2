import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, Brain, Gauge, ShieldCheck, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import './styles.css';

const MOCK_SCENARIOS = [
  {
    name: '强势偏多突破',
    price: 248.72,
    change: 2.18,
    callFlow: 72,
    putFlow: 28,
    sweepScore: 82,
    volumeSpike: 76,
    ivRank: 42,
    gammaBias: '上方吸引',
    eventRisk: '低',
    trend: 'up',
    vwapStatus: '站上 VWAP',
    consecutiveLosses: 0,
  },
  {
    name: '混乱震荡',
    price: 245.18,
    change: -0.34,
    callFlow: 51,
    putFlow: 49,
    sweepScore: 38,
    volumeSpike: 31,
    ivRank: 67,
    gammaBias: '中性',
    eventRisk: '中',
    trend: 'flat',
    vwapStatus: '贴近 VWAP',
    consecutiveLosses: 1,
  },
  {
    name: '高风险空仓',
    price: 241.66,
    change: -3.92,
    callFlow: 39,
    putFlow: 61,
    sweepScore: 71,
    volumeSpike: 88,
    ivRank: 86,
    gammaBias: '下方吸引',
    eventRisk: '高',
    trend: 'down',
    vwapStatus: '跌破 VWAP',
    consecutiveLosses: 2,
  },
];

function getDecision(data) {
  let score = 50;
  const reasons = [];
  const blocks = [];

  if (data.callFlow >= 65) {
    score += 18;
    reasons.push(`Call Flow ${data.callFlow}%：资金明显偏多`);
  } else if (data.putFlow >= 60) {
    score -= 18;
    reasons.push(`Put Flow ${data.putFlow}%：资金偏空`);
  } else {
    score -= 8;
    reasons.push('Call/Put 分布接近：方向不够清晰');
  }

  if (data.sweepScore >= 70) {
    score += data.trend === 'up' ? 12 : -8;
    reasons.push('扫单强度高：短线资金活跃');
  }

  if (data.volumeSpike >= 70) {
    score += data.trend === 'up' ? 10 : -6;
    reasons.push('成交量放大：价格运动有资金配合');
  } else {
    score -= 6;
    reasons.push('成交量不足：容易假突破');
  }

  if (data.ivRank >= 80) {
    score -= 22;
    blocks.push('IV Rank 过高：0DTE 权利金太贵，追单风险大');
  }

  if (data.eventRisk === '高') {
    score -= 30;
    blocks.push('事件风险高：禁止重仓，优先空仓');
  }

  if (data.consecutiveLosses >= 2) {
    score -= 40;
    blocks.push('已连续亏损 2 次：触发日内停手机制');
  }

  score = Math.max(0, Math.min(99, Math.round(score)));

  let action = '等待';
  let direction = 'NO TRADE';
  let color = 'yellow';
  let strike = '不建议开仓';
  let position = '0%';
  let stop = '不适用';

  if (blocks.length > 0 || score < 55) {
    action = '不做';
    direction = 'NO TRADE';
    color = 'red';
  } else if (score >= 70 && data.callFlow > data.putFlow && data.trend === 'up') {
    action = '做多';
    direction = 'CALL';
    color = 'green';
    strike = `$${Math.round(data.price + 2.5)} / ATM+1`;
    position = score >= 80 ? '40%' : '25%';
    stop = '-30% 权利金 / 跌回 VWAP';
  } else if (score >= 70 && data.putFlow > data.callFlow && data.trend === 'down') {
    action = '做空';
    direction = 'PUT';
    color = 'green';
    strike = `$${Math.round(data.price - 2.5)} / ATM-1`;
    position = '25%';
    stop = '-30% 权利金 / 收回 VWAP';
  }

  return { score, action, direction, color, strike, position, stop, reasons, blocks };
}

function MetricCard({ icon: Icon, title, value, sub }) {
  return (
    <div className="card metric-card">
      <div className="metric-icon"><Icon size={18} /></div>
      <div>
        <p className="muted">{title}</p>
        <h3>{value}</h3>
        <span>{sub}</span>
      </div>
    </div>
  );
}

function App() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [now, setNow] = useState(new Date());
  const data = MOCK_SCENARIOS[scenarioIndex];
  const decision = useMemo(() => getDecision(data), [data]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="page">
      <section className="hero card">
        <div>
          <p className="eyebrow">TSLA 0DTE Decision Copilot · MVP Demo</p>
          <h1>TSLA 0DTE 决策仪表盘</h1>
          <p className="hero-subtitle">把资金流、IV、成交量、风险控制，压缩成一句交易判断：做 / 不做 / 怎么做。</p>
        </div>
        <div className="scenario-box">
          <label>模拟场景</label>
          <select value={scenarioIndex} onChange={(e) => setScenarioIndex(Number(e.target.value))}>
            {MOCK_SCENARIOS.map((item, index) => (
              <option key={item.name} value={index}>{item.name}</option>
            ))}
          </select>
          <small>更新时间：{now.toLocaleTimeString('zh-CN')}</small>
        </div>
      </section>

      <section className={`decision-panel card ${decision.color}`}>
        <div className="decision-main">
          <div className="decision-badge"><Brain size={20} /> 操作建议</div>
          <h2>{decision.action} {decision.direction !== 'NO TRADE' ? decision.direction : ''}</h2>
          <p>{decision.blocks.length ? decision.blocks[0] : decision.reasons[0]}</p>
        </div>
        <div className="confidence">
          <div className="circle"><span>{decision.score}</span></div>
          <p>置信度评分</p>
        </div>
      </section>

      <section className="grid metrics">
        <MetricCard icon={Activity} title="TSLA 当前价格" value={`$${data.price}`} sub={`${data.change > 0 ? '+' : ''}${data.change}%`} />
        <MetricCard icon={TrendingUp} title="Call Flow" value={`${data.callFlow}%`} sub="看涨资金占比" />
        <MetricCard icon={TrendingDown} title="Put Flow" value={`${data.putFlow}%`} sub="看跌资金占比" />
        <MetricCard icon={Zap} title="扫单强度" value={data.sweepScore} sub="大单/急单活跃度" />
        <MetricCard icon={Gauge} title="IV Rank" value={data.ivRank} sub="越高越贵" />
        <MetricCard icon={ShieldCheck} title="事件风险" value={data.eventRisk} sub={data.vwapStatus} />
      </section>

      <section className="grid two-col">
        <div className="card">
          <h3>进场方案</h3>
          <div className="trade-plan">
            <div><span>方向</span><b>{decision.direction}</b></div>
            <div><span>建议 Strike</span><b>{decision.strike}</b></div>
            <div><span>最大仓位</span><b>{decision.position}</b></div>
            <div><span>止损规则</span><b>{decision.stop}</b></div>
          </div>
        </div>

        <div className="card">
          <h3>风控状态</h3>
          <div className="risk-box">
            <AlertTriangle size={22} />
            <div>
              <b>连续亏损：{data.consecutiveLosses} / 2</b>
              <p>{data.consecutiveLosses >= 2 ? '触发停手：今天不再交易。' : '未触发停手，但单笔亏损必须小于账户资金 1/3。'}</p>
            </div>
          </div>
          <div className="risk-rule">日内资金 $1,000 示例：单笔最大亏损建议不超过 $250-$300。</div>
        </div>
      </section>

      <section className="card">
        <h3>系统判断理由</h3>
        <div className="reason-list">
          {[...decision.reasons, ...decision.blocks].map((reason) => (
            <div key={reason} className="reason-item">{reason}</div>
          ))}
        </div>
      </section>

      <footer>
        仅用于产品原型和教育演示，不构成投资建议。真实交易前必须接入实时行情、期权链、成交量、新闻事件和风控账户数据。
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
