import React, { useEffect, useState } from 'react';
import './landing/LandingPage.css';

/**
 * 爱兔帮 SafeGuard 守岗系统 — 官网首页
 */
const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* 导航栏 */}
      <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-nav-brand">
          <span className="lp-logo-icon">🛡️</span>
          <span className="lp-logo-text">爱兔帮 SafeGuard</span>
        </div>
        <div className="lp-nav-links">
          <a href="#features">核心能力</a>
          <a href="#solution">解决方案</a>
          <a href="#ai-system">AI 守岗</a>
          <a href="#feishu">飞书集成</a>
          <a href="#/app/dashboard" className="lp-nav-cta">进入系统</a>
        </div>
      </nav>

      {/* Hero 首屏 — 视频背景 */}
      <section className="lp-hero">
        <div className="lp-hero-video-wrap">
          <video
            className="lp-hero-video"
            src="/videos/product-demo.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="lp-hero-overlay" />
        </div>
        <div className="lp-hero-bg">
          <div className="lp-hero-orb orb-1" />
          <div className="lp-hero-orb orb-2" />
        </div>
        <div className="lp-hero-content">
          <p className="lp-hero-tag">AI 驱动的物流安全监护</p>
          <h1 className="lp-hero-title">
            爱兔帮 <span className="lp-gradient">SafeGuard</span>
          </h1>
          <h2 className="lp-hero-subtitle">守岗系统</h2>
          <p className="lp-hero-desc">
            智能穿戴 + AI 分析 + 飞书即时响应<br />
            <strong>确保每个物流工作人员的生命安全</strong>
          </p>
          <div className="lp-hero-actions">
            <a href="#/app/dashboard" className="lp-btn lp-btn-primary">
              立即体验
            </a>
            <a href="#features" className="lp-btn lp-btn-outline">
              了解更多
            </a>
          </div>
          <div className="lp-scroll-hint">
            <div className="lp-scroll-arrow" />
          </div>
        </div>
      </section>

      {/* 核心能力 */}
      <section id="features" className="lp-section">
        <div className="lp-container">
          <h3 className="lp-section-title">核心能力</h3>
          <p className="lp-section-desc">四重守护，确保每个物流工作人员的生命安全</p>
          <div className="lp-features-grid">
            {[
              { icon: '❤️', title: '实时体征监测', desc: '体温、心率、血氧、血压实时采集，异常数据秒级预警，让健康隐患无所遁形' },
              { icon: '🚨', title: '智能报警联动', desc: 'SOS 紧急求救、失联告警、无响应检测，多级响应机制，确保每一次报警都被及时处理' },
              { icon: '📱', title: '飞书即时推送', desc: '报警卡片消息直达飞书群、按钮交互处置、定时日报周报推送，管理不掉线' },
              { icon: '🧠', title: 'AI 智能分析', desc: '基于历史数据的智能风险预测，异常模式识别，从被动响应走向主动预防' },
            ].map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 解决方案 */}
      <section id="solution" className="lp-section lp-section-alt">
        <div className="lp-container">
          <h3 className="lp-section-title">爱兔帮守岗解决方案</h3>
          <p className="lp-section-desc">从智能穿戴到云端大脑，一体化安全监护闭环</p>
          <div className="lp-solution-layout">
            <div className="lp-solution-image">
              <img src="/images/product-design.png" alt="爱兔帮守岗解决方案" className="lp-product-img" />
            </div>
            <div className="lp-solution-content">
              <div className="lp-solution-card">
                <div className="lp-sc-icon">⌚</div>
                <div className="lp-sc-text">
                  <h4>智能穿戴设备</h4>
                  <p>专为物流场景定制的智能手环，集成高精度体征传感器与一键 SOS，IP68 防护等级，适应转运中心复杂环境</p>
                </div>
              </div>
              <div className="lp-solution-card">
                <div className="lp-sc-icon">📡</div>
                <div className="lp-sc-text">
                  <h4>无线传感网络</h4>
                  <p>大范围低功耗无线覆盖，毫秒级数据采集与传输，支持多设备并发接入，确保不遗漏任何信号</p>
                </div>
              </div>
              <div className="lp-solution-card">
                <div className="lp-sc-icon">☁️</div>
                <div className="lp-sc-text">
                  <h4>云端智能大脑</h4>
                  <p>实时流式计算引擎 + AI 风险预测模型，7×24 小时不间断分析，异常事件自动触发飞书告警</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI 兔守岗系统 */}
      <section id="ai-system" className="lp-section">
        <div className="lp-container">
          <h3 className="lp-section-title">
            <span className="lp-gradient">AI 兔</span> 守岗系统
          </h3>
          <p className="lp-section-desc">智能分析 · 实时监控 · 主动预警 — 确保每个物流工作人员的生命安全</p>
          <div className="lp-ai-grid">
            <div className="lp-ai-card">
              <div className="lp-ai-icon">🔍</div>
              <h4>实时监控</h4>
              <p>在岗人员体征数据实时大屏展示，车厢盲区可视化定位，状态异常即时高亮，安全态势一目了然</p>
            </div>
            <div className="lp-ai-card">
              <div className="lp-ai-icon">📈</div>
              <h4>智能分析</h4>
              <p>基于机器学习的体征趋势分析，自动识别异常模式，提前预警潜在健康风险，从被动响应到主动预防</p>
            </div>
            <div className="lp-ai-card">
              <div className="lp-ai-icon">⚡</div>
              <h4>秒级响应</h4>
              <p>SOS 一键触发 → 飞书即时推送 → 现场快速处置，全链路秒级响应，为生命争取每一秒</p>
            </div>
            <div className="lp-ai-card">
              <div className="lp-ai-icon">🛡️</div>
              <h4>生命守护</h4>
              <p>每一位物流工作人员都值得被守护。爱兔帮 SafeGuard 用科技筑牢安全防线，让守护成为本能</p>
            </div>
          </div>
        </div>
      </section>

      {/* 飞书集成 */}
      <section id="feishu" className="lp-section lp-section-alt">
        <div className="lp-container">
          <h3 className="lp-section-title">飞书深度集成</h3>
          <p className="lp-section-desc">不只是通知，而是完整的飞书工作流闭环</p>
          <div className="lp-feishu-showcase">
            <div className="lp-feishu-cards">
              <div className="lp-feishu-card demo-sos">
                <div className="lp-fc-header red">🚨 SOS 紧急求救</div>
                <div className="lp-fc-body">
                  <p><strong>张三</strong> · 3号岗亭 · 车厢B区</p>
                  <p className="lp-fc-time">触发时间：14:32:18</p>
                  <div className="lp-fc-actions">
                    <span className="lp-fc-btn primary">✅ 已确认处理</span>
                    <span className="lp-fc-btn danger">❌ 误报</span>
                  </div>
                </div>
              </div>
              <div className="lp-feishu-card demo-vital">
                <div className="lp-fc-header orange">🫀 体征异常告警</div>
                <div className="lp-fc-body">
                  <p><strong>王五</strong> · 体温 39.5°C · 心率 128bpm</p>
                  <div className="lp-fc-actions">
                    <span className="lp-fc-btn primary">🏥 安排就医</span>
                  </div>
                </div>
              </div>
              <div className="lp-feishu-card demo-daily">
                <div className="lp-fc-header blue">📊 安全日报</div>
                <div className="lp-fc-body">
                  <p>在岗 30/32 · 报警 3次 · 处置率 100%</p>
                  <p className="lp-fc-time">每日 08:00 自动推送</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 数据统计 */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-stats-grid">
            {[
              { num: '12,580', label: '累计守护工时 (h)' },
              { num: '328', label: '成功预警次数' },
              { num: '32', label: '在岗守护人数' },
              { num: '99.8%', label: '报警处置率' },
            ].map((s, i) => (
              <div key={i} className="lp-stat-item">
                <div className="lp-stat-num">{s.num}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <h3>确保每个物流工作人员的生命安全</h3>
        <p>爱兔帮 SafeGuard 守岗系统 — 用 AI 为每一位物流工作者筑牢安全防线</p>
        <div className="lp-hero-actions">
          <a href="#/app/dashboard" className="lp-btn lp-btn-primary">立即体验</a>
          <a href="mailto:contact@safeguard.cn" className="lp-btn lp-btn-outline">联系我们</a>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="lp-footer">
        <div className="lp-footer-content">
          <div className="lp-footer-brand">
            <span className="lp-logo-icon">🛡️</span>
            <span>爱兔帮 SafeGuard 守岗系统</span>
          </div>
          <p>© 2025 爱兔帮 SafeGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
