import Head from 'next/head';
import { useState, useEffect } from 'react';
import { getConfig, DEFAULT_CONFIG } from '../lib/db';

export async function getServerSideProps() {
  try { const cfg = await getConfig(); return { props: { cfg: cfg || DEFAULT_CONFIG } }; }
  catch { return { props: { cfg: DEFAULT_CONFIG } }; }
}

const t = (f, l) => { if (!f) return ''; if (typeof f === 'string') return f; return f[l] || f['uz'] || ''; };

function useCountdown(d) {
  const [time, setTime] = useState({ d:0,h:0,m:0,s:0 });
  useEffect(() => {
    const tick = () => { const diff = new Date(d).getTime()-Date.now(); if (diff<=0) return setTime({d:0,h:0,m:0,s:0}); setTime({d:Math.floor(diff/86400000),h:Math.floor(diff%86400000/3600000),m:Math.floor(diff%3600000/60000),s:Math.floor(diff%60000/1000)}); };
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  }, [d]);
  return time;
}
const pad = n => String(n).padStart(2,'0');

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target);}}),{threshold:0.08,rootMargin:'0px 0px -60px 0px'});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
    return ()=>io.disconnect();
  }, []);
}

function useAnalytics() {
  useEffect(()=>{try{fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:window.location.pathname})}).catch(()=>{});}catch{}}, []);
}

const UI = {
  uz:{tel:'Telefon',manzil:'Manzil',veb:'Veb-sayt',kun:'Kun',soat:'Soat',daqiqa:'Daqiqa',soniya:'Soniya'},
  ru:{tel:'Телефон',manzil:'Адрес',veb:'Сайт',kun:'Дней',soat:'Часов',daqiqa:'Минут',soniya:'Секунд'},
  en:{tel:'Phone',manzil:'Address',veb:'Website',kun:'Days',soat:'Hours',daqiqa:'Minutes',soniya:'Seconds'},
};

export default function Home({ cfg }) {
  const [lang, setLang] = useState('uz');
  const time = useCountdown(cfg.site.countdownDate);
  useReveal(); useAnalytics();
  const L = UI[lang];
  const { site, hero, prices, countdown, faculties, about, steps, advantages, stats, contact, cta, social, footer } = cfg;
  return (
    <>
      <Head>
        <title>ISFT × Greenwich — Dual Degree 2026</title>
        <meta name="description" content="ISFT Samarqand va University of Greenwich qo'shma dasturi."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
      </Head>
      <div className="bg-wrapper"><div className="diag"/><div className="shape shape-1"/><div className="shape shape-2"/></div>
      <div className="page-content">
        <div className="lang-sw">
          {['uz','ru','en'].map(l=><button key={l} className={`lang-btn${lang===l?' active':''}`} onClick={()=>setLang(l)}>{l==='uz'?'🇺🇿':l==='ru'?'🇷🇺':'🇬🇧'} {l.toUpperCase()}</button>)}
        </div>

        {/* HERO */}
        <section className="hero">
          <div className="hero-wrap">
            <div className="hero-left">
              <div className="logo-wrap">
                <div className="logo-box"><div className="logo-txt">ISFT</div></div>
                <div className="hero-badge">{t(hero.badge,lang)}</div>
              </div>
              <h1 className="hero-title">{hero.title} <span className="hero-year">{hero.year}</span></h1>
              <p className="hero-sub">{hero.subtitle}</p>
              <div className="feature-list">
                {hero.features.map((f,i)=><div key={i} className="feat-pill"><div className="feat-ico"><i className={`fas ${f.icon}`}/></div><span className="feat-txt">{t(f.text,lang)}</span></div>)}
              </div>
              <a href={site.admissionUrl} className="btn-hero"><i className="fas fa-rocket"/><span>{t(hero.ctaText,lang)}</span></a>
            </div>
            <div className="hero-right">
              <div className="price-card">
                <div className="price-hd"><h2>{t(prices.title,lang)}</h2></div>
                <div className="price-bd">
                  <div className="price-big-wrap">
                    <div className="price-big-amount">{prices.amount}</div>
                    <div className="price-big-period">/ {t(prices.period,lang)}</div>
                  </div>
                  <div className="price-years-badge"><i className="fas fa-calendar-alt"/> {t(prices.years,lang)}</div>
                  <div className="price-diplomas">
                    {[{flag:'🇺🇿',label:{uz:"ISFT diplomi",ru:"Диплом ISFT",en:"ISFT Diploma"}},{flag:'🇬🇧',label:{uz:"University of Greenwich diplomi",ru:"Диплом Гринвич",en:"Greenwich Degree"}}].map((d,i)=>(
                      <div key={i} className="price-diploma-row">
                        <span className="price-diploma-flag">{d.flag}</span>
                        <span className="price-diploma-label">{t(d.label,lang)}</span>
                        <i className="fas fa-check-circle price-diploma-check"/>
                      </div>
                    ))}
                  </div>
                  <div className="price-note-box"><i className="fas fa-info-circle"/> {t(prices.note,lang)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COUNTDOWN */}
        <section className="countdown-sec">
          <div className="cd-wrap">
            <h2 className="cd-title">{t(countdown.title,lang)}</h2>
            <p className="cd-sub">{t(countdown.subtitle,lang)}</p>
            <div className="cd-timer">
              {[{val:time.d,lbl:L.kun},{val:time.h,lbl:L.soat},{val:time.m,lbl:L.daqiqa},{val:time.s,lbl:L.soniya}].map((item,i)=>(
                <div key={i} className="cd-item">
                  <div className="cd-flip"><div className="flip-card"><div className="flip-front"><div className="flip-num">{pad(item.val)}</div></div></div></div>
                  <div className="cd-lbl">{item.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="sec-about">
          <div className="container">
            <div className="about-grid">
              <div className="about-txt reveal">
                <div className="mini-tag">{t(about.tag,lang)}</div>
                <h2 className="about-h">{t(about.title,lang)}</h2>
                <p className="about-sub">{t(about.subtitle,lang)}</p>
                {about.paragraphs.map((p,i)=><p key={i} className="about-p">{t(p,lang)}</p>)}
              </div>
              <div className="uni-card reveal">
                <div className="uni-card-inner">
                  <span className="uni-flag">🇬🇧</span>
                  <h3>{about.uniName}</h3>
                  <p>{t(about.uniDesc,lang)}</p>
                  <div className="uni-chip"><i className="fas fa-award" style={{color:'var(--gold)'}}/> {t(about.uniBadge,lang)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FACULTIES */}
        <section className="faculty-sec">
          <div className="container">
            <div className="sec-hd reveal">
              <h2 className="sec-title">{t(faculties.title,lang)}</h2>
              <p className="sec-sub">{t(faculties.subtitle,lang)}</p>
            </div>
            <div className="fac-grid">
              {faculties.items.map((fac,fi)=>(
                <div key={fi} className="fac-card reveal" style={{transitionDelay:`${(fi%3)*80}ms`}}>
                  <div className="fac-hd">
                    <div className="fac-ico-wrap"><i className={`fas ${fac.icon}`}/></div>
                    <h3 className="fac-title">{t(fac.title,lang)}</h3>
                    {fac.badge&&<div className="fac-badge">{fac.badge}</div>}
                  </div>
                  <div className="fac-bd">
                    <div className="fac-duration"><i className="fas fa-clock"/> {t(faculties.duration,lang)}</div>
                    {fac.programs.map((prog,pi)=>(
                      <div key={pi} className="prog-row">
                        <div className="prog-chk"><i className="fas fa-check"/></div>
                        <div className="prog-det"><div className="prog-name">{t(prog.name,lang)}</div></div>
                      </div>
                    ))}
                    <div className="fac-price">
                      <span className="fac-price-amount">{prices.amount}</span>
                      <span className="fac-price-period"> / {t(prices.period,lang)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section className="steps-sec">
          <div className="container">
            <div className="sec-hd reveal"><h2 className="sec-title">{t(steps.title,lang)}</h2></div>
            <div className="steps-list">
              {steps.items.map((s,i)=>(
                <div key={i} className="step reveal" style={{transitionDelay:`${i*100}ms`}}>
                  <div className="step-num">{s.num}</div>
                  <div className="step-body"><h3>{t(s.title,lang)}</h3><p>{t(s.desc,lang)}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ADVANTAGES */}
        <section className="adv-sec">
          <div className="container">
            <div className="sec-hd reveal"><h2 className="sec-title">{t(advantages.title,lang)}</h2></div>
            <div className="adv-grid">
              {advantages.items.map((a,i)=>(
                <div key={i} className="adv-card reveal" style={{transitionDelay:`${(i%3)*70}ms`}}>
                  <span className="adv-ico">{a.icon}</span><h3>{t(a.title,lang)}</h3><p>{t(a.desc,lang)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="stats-sec">
          <div className="container">
            <div className="sec-hd reveal">
              <h2 className="sec-title" style={{color:'#fff',textShadow:'2px 2px 8px rgba(0,0,0,.3)'}}>
                {t(stats.title,lang)} — <span style={{color:'var(--gold)'}}>{t(stats.subtitle,lang)}</span>
              </h2>
            </div>
            <div className="stats-grid">
              {stats.items.map((s,i)=>(
                <div key={i} className="stat-item reveal" style={{transitionDelay:`${i*100}ms`}}>
                  <div className="stat-ico"><i className={`fas ${s.icon}`}/></div>
                  <span className="stat-num">{s.number}</span>
                  <span className="stat-lbl">{t(s.label,lang)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="contact-sec">
          <div className="container">
            <div className="sec-hd reveal">
              <h2 className="sec-title">{t(contact.title,lang)}</h2>
              <p className="sec-sub">{t(contact.subtitle,lang)}</p>
            </div>
            <div className="contact-grid">
              {[
                {icon:'fa-phone-volume',title:L.tel,val:site.phone,href:site.phoneLink},
                {icon:'fa-map-marked-alt',title:L.manzil,val:`${t(site.address1,lang)}, ${t(site.address2,lang)}`},
                {icon:'fa-laptop',title:L.veb,val:site.website,href:site.websiteUrl,ext:true},
              ].map((c,i)=>(
                <div key={i} className="contact-card reveal" style={{transitionDelay:`${i*100}ms`}}>
                  <div className="contact-ico-wrap"><i className={`fas ${c.icon}`}/></div>
                  <h3 className="contact-card-title">{c.title}</h3>
                  <div className="contact-info">
                    {c.href?<a href={c.href} target={c.ext?'_blank':undefined} rel="noreferrer" className="contact-link">{c.val}</a>:c.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-sec">
          <div className="cta-inner">
            <h2 className="cta-title">{t(cta.title,lang)}</h2>
            <p className="cta-txt">{t(cta.text,lang)}</p>
            <div className="cta-btns">
              <a href={site.admissionUrl} className="btn-cta"><i className="fas fa-edit"/><span>{t(cta.btn1,lang)}</span></a>
              <a href={site.phoneLink} className="btn-cta btn-outline"><i className="fas fa-phone"/><span>{cta.btn2}</span></a>
            </div>
          </div>
        </section>

        {/* SOCIAL */}
        <section className="social-sec">
          <div className="social-wrap">
            <h2 className="social-title reveal">{t(social.title,lang)}</h2>
            <p className="social-sub reveal">{t(social.subtitle,lang)}</p>
            <a href={site.mainSiteUrl} target="_blank" rel="noreferrer" className="main-site-btn reveal">
              <i className="fas fa-globe"/><span>{t(social.mainBtnText,lang)}</span>
            </a>
            <div className="soc-grid">
              {social.items.map(s=>(
                <div key={s.id} className="soc-3d-card reveal">
                  <div className="soc-3d-inner">
                    <div className="soc-3d-front"><i className={s.icon}/><h3>{s.name}</h3></div>
                    <div className="soc-3d-back"><a href={s.url} target="_blank" rel="noreferrer"><i className="fas fa-arrow-right"/><span>{t(social.openText,lang)}</span></a></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-content">
            <div className="footer-grid">
              <div>
                <div className="footer-logo"><div className="footer-logo-circle">ISFT</div><div className="footer-logo-text">ISFT</div></div>
                <p className="footer-desc">{t(footer.desc,lang)}</p>
                <a href={site.websiteUrl} target="_blank" rel="noreferrer" className="website-btn"><i className="fas fa-globe"/> {t(footer.visitSite,lang)}</a>
              </div>
              <div>
                <h3 className="footer-title">{t(footer.quickLinksTitle,lang)}</h3>
                <ul className="footer-links">{footer.quickLinks.map((l,i)=><li key={i}><a href={l.url} target="_blank" rel="noreferrer">{t(l.label,lang)}</a></li>)}</ul>
              </div>
              <div>
                <h3 className="footer-title">{t(footer.programsTitle,lang)}</h3>
                <ul className="footer-links">{footer.programs.map((l,i)=><li key={i}><a href={l.url} target="_blank" rel="noreferrer">{t(l.label,lang)}</a></li>)}</ul>
              </div>
              <div>
                <h3 className="footer-title">{t(footer.contactTitle,lang)}</h3>
                <div className="footer-contact-item"><div className="footer-contact-ico"><i className="fas fa-map-marker-alt"/></div><div className="footer-contact-txt">{t(site.address1,lang)}<br/>{t(site.address2,lang)}</div></div>
                <div className="footer-contact-item"><div className="footer-contact-ico"><i className="fas fa-phone"/></div><div className="footer-contact-txt"><a href={site.phoneLink}>{site.phoneFull}</a></div></div>
                <div className="footer-contact-item"><div className="footer-contact-ico"><i className="fas fa-envelope"/></div><div className="footer-contact-txt"><a href={`mailto:${site.email}`}>{site.email}</a></div></div>
                <div className="social-row">{social.items.map(s=><a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="social-link"><i className={s.icon}/></a>)}</div>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-copy">© 2026 <a href={site.websiteUrl} target="_blank" rel="noreferrer">ISFT Samarqand</a>. {t(footer.rights,lang)}</div>
              <div className="footer-credits">
                <a href={`${site.websiteUrl}/uz/about`} target="_blank" rel="noreferrer">{t(footer.privacy,lang)}</a>
                <a href={`${site.websiteUrl}/uz/about`} target="_blank" rel="noreferrer">{t(footer.terms,lang)}</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
