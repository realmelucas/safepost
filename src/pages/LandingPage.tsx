import React, { useEffect, useState } from 'react';
import './landing/LandingPage.css';

/**
 * 爱兔帮 SafeGuard 守岗系统 — 官网首页
 * Landing Page，独立于管理后台
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
          <a href="#hardware">硬件方案</a>
          <a href="#feishu">飞书集成</a>
          <a href="#/app/dashboard" className="lp-nav-cta">进入系统</a>
        </div>
      </nav>

      {/* 首屏 Hero */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-hero-orb orb-1" />
          <div className="lp-hero-orb orb-2" />
          <div className="lp-hero-orb orb-3" />
        </div>
        <div className="lp-hero-content">
          <p className="lp-hero-tag">智能物流安全监护</p>
          <h1 className="lp-hero-title">
            爱兔帮 <span className="lp-gradient">SafeGuard</span>
          </h1>
          <h2 className="lp-hero-subtitle">守岗系统</h2>
          <p className="lp-hero-desc">
            基于 T10 智能手环 + 蓝牙网关 + 飞书深度集成<br />
            为物流工作者提供 24/7 上岗准入与安全监护
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

      {/* 核心能力占位 */}
      <section id="features" className="lp-section">
        <div className="lp-container">
          <h3 className="lp-section-title">核心能力</h3>
          <p className="lp-section-desc">四大核心能力，全方位守护物流工作者的安全</p>
          <div className="lp-features-grid">
            {[
              { icon: '❤️', title: '实时体征监测', desc: '体温、心率、血氧、血压实时采集，异常自动预警' },
              { icon: '🚨', title: '智能报警联动', desc: 'SOS 紧急求救、失联告警、无响应检测，分级响应' },
              { icon: '📱', title: '飞书即时推送', desc: '报警卡片消息、按钮交互处置、定时日报周报推送' },
              { icon: '📊', title: '数据分析报告', desc: '日报、周报、月报自动生成，安全管理可视化' },
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

      {/* 硬件方案占位 */}
      <section id="hardware" className="lp-section lp-section-alt">
        <div className="lp-container">
          <h3 className="lp-section-title">硬件方案</h3>
          <p className="lp-section-desc">T10 智能手环 + 蓝牙网关，稳定可靠的硬件基础</p>
          <div className="lp-hardware-grid">
            <div className="lp-hw-card">
              <div className="lp-hw-icon">⌚</div>
              <h4>T10 智能手环</h4>
              <ul>
                <li>Nordic NRF52832 BLE 5.0</li>
                <li>TI TMP117 高精度体温 (±0.1°C)</li>
                <li>HX3690L 心率/血氧传感器</li>
                <li>SOS 一键求救 (0x02 广播)</li>
                <li>1秒广播间隔，持久续航</li>
              </ul>
            </div>
            <div className="lp-hw-card">
              <div className="lp-hw-icon">📡</div>
              <h4>蓝牙网关</h4>
              <ul>
                <li>NRF52832 + ESP32 双芯架构</li>
                <li>MQTT/HTTP/WebSocket 上传</li>
                <li>MessagePack 高效编码</li>
                <li>覆盖半径 50-100m</li>
                <li>即插即用，快速部署</li>
              </ul>
            </div>
          </div>
          <div className="lp-arch-flow">
            <span className="lp-arch-node">⌚ T10 手环</span>
            <span className="lp-arch-arrow">→ BLE →</span>
            <span className="lp-arch-node">📡 蓝牙网关</span>
            <span className="lp-arch-arrow">→ WiFi →</span>
            <span className="lp-arch-node">🖥️ SafeGuard</span>
            <span className="lp-arch-arrow">→ API →</span>
            <span className="lp-arch-node">📱 飞书</span>
          </div>
        </div>
      </section>

      {/* 飞书集成占位 */}
      <section id="feishu" className="lp-section">
        <div className="lp-container">
          <h3 className="lp-section-title">飞书深度集成</h3>
          <p className="lp-section-desc">不只是通知，而是完整的飞书工作流闭环</p>
          <div className="lp-feishu-showcase">
            <div className="lp-feishu-cards">
              <div className="lp-feishu-card demo-sos">
                <div className="lp-fc-header red">🚨 SOS 紧急求救</div>
                <div className="lp-fc-body">
                  <p><strong>张三</strong> · 3号岗亭 · 车厢B区</p>
                  <p className="lp-fc-time">2025-01-15 14:32:18</p>
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

      {/* 数据统计占位 */}
      <section className="lp-section lp-section-alt">
        <div className="lp-container">
          <div className="lp-stats-grid">
            {[
              { num: '12,580', label: '累计守护工时 (h)' },
              { num: '328', label: '成功预警次数' },
              { num: '32', label: '在职工人数' },
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

      {/* CTA 行动号召 */}
      <section className="lp-cta">
        <h3>为您的物流团队提供智能安全守护</h3>
        <p>接入爱兔帮 SafeGuard，让每一位物流工作者都得到及时守护</p>
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
