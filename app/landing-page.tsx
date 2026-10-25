'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ShieldCheck } from 'lucide-react';

const moments = [
  { label: 'A slower morning', title: 'Your morning, unhurried.', description: 'Find the missing piece in your coffee ritual.', image: 'sample-01', alt: 'Coffee brewing equipment in a warm, quiet setting' },
  { label: 'Something creative', title: 'Make something just for you.', description: 'Explore a creative afternoon with less setup.', image: 'sample-41', alt: 'Watercolour painting supplies for a creative afternoon' },
  { label: 'A change of scene', title: 'Take the scenic route.', description: 'Try a photo walk in a new corner of your city.', image: 'sample-12', alt: 'A camera ready for a photography outing' },
];
const faqs = [
  ['Do I need to know what I want?', 'Not at all. Start with your day, a feeling, or something you’d like to change. The guide asks one useful question at a time to help you find a direction.'],
  ['Will Payday buy anything for me?', 'No. You choose what to save and whether to continue to a merchant. Checkout happens with the merchant, where you should confirm the final price and availability.'],
  ['What does Payday remember?', 'You can review and forget your assistant preferences and shared browsing interests in Your context. Assistant context stays in your browser. Signed-in reward shelves use account storage, and relevant context is sent to OpenAI when you use the guide.'],
  ['Are the prices and reviews guaranteed?', 'Live research uses cited search evidence to help you compare options. Stock and prices can change, and community discussions are anecdotal. Always check the exact listing and final costs. The examples on this page are illustrative ideas, not merchant offers.'],
];

export default function LandingPage() {
  const [selected, setSelected] = useState(0);
  const moment = moments[selected];
  const page = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('pl-enter');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    page.current?.querySelectorAll('[data-reveal]').forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return <div className="pl" ref={page}>
    <a className="pl-skip" href="#landing-main">Skip to content</a>
    <header className="pl-header">
      <a className="pl-logo" href="/" aria-label="Payday home"><span className="pl-mark" aria-hidden="true"><img src="/brand/payday-mark.png" alt="" width="68" height="68"/></span>payday<span className="pl-logo-dot">.</span></a>
      <nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#your-moment">Find your moment</a><a href="#questions">Good to know</a></nav>
      <a className="pl-button pl-button-small" href="/discover">Open Payday <ArrowUpRight size={16}/></a>
    </header>

    <main id="landing-main" className="pl-main">
      <section className="pl-hero" aria-labelledby="landing-title">
        <div className="pl-hero-copy"><h1 id="landing-title">You’ve earned<br/>a little <em>joy.</em></h1><p className="pl-description">Find your next payday treat with an AI companion that gets to know you.</p><div className="pl-hero-actions"><a className="pl-button" href="/discover">Find my next treat <ArrowRight size={18}/></a><a className="pl-text-link" href="#your-moment">Explore ideas <ChevronDown size={15}/></a></div></div>
        <div className="pl-hero-visual"><div className="pl-photo-frame"><img className="pl-hero-photo" src="/images/rewards/hero.webp" alt="Sunlight falling across a watercolour painting, a mug and flowers on a wooden table" width="1200" height="800" fetchPriority="high"/><span className="pl-photo-label">AI concept images</span></div><div className="pl-floating-photo pl-floating-coffee" aria-hidden="true"><img src="/images/rewards/sample-01.webp" alt="" width="1200" height="800"/><span>A slower morning</span></div><div className="pl-floating-photo pl-floating-camera" aria-hidden="true"><img src="/images/rewards/sample-12.webp" alt="" width="1200" height="800"/><span>A change of scene</span></div></div>
      </section>

      <section id="how-it-works" className="pl-how pl-section" aria-labelledby="how-title" data-reveal><h2 id="how-title">From a feeling to <em>a favourite.</em></h2><div className="pl-steps">
        <article><span className="pl-step-number">01</span><h3>Share a little.</h3><p>Your mood, your interests, your budget.</p></article>
        <article><span className="pl-step-number">02</span><h3>Explore together.</h3><p>A few ideas. Real options. Clear trade-offs.</p></article>
        <article><span className="pl-step-number">03</span><h3>Keep what clicks.</h3><p>Save a favourite. Decide in your own time.</p></article>
      </div></section>

      <section id="your-moment" className="pl-moment pl-section" aria-labelledby="moment-title" data-reveal><div className="pl-moment-copy"><h2 id="moment-title">What’s your<br/><em>kind of joy?</em></h2><div className="pl-moment-choices" role="group" aria-label="Explore an illustrative reward direction">{moments.map((item, index)=><button type="button" key={item.label} aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{item.label}</span>{selected===index?<Check size={16}/>:<ArrowRight size={16}/>}</button>)}</div><p className="pl-example-note">Example ideas. Your discovery starts with you.</p></div><div className="pl-moment-example" aria-live="polite" aria-atomic="true"><div key={moment.image} className="pl-moment-content"><div className="pl-moment-image"><img src={`/images/rewards/${moment.image}.webp`} alt={moment.alt} width="1200" height="800" loading="lazy"/><span className="pl-photo-label">AI concept image</span></div><div className="pl-moment-details"><h3>{moment.title}</h3><p>{moment.description}</p></div></div></div></section>

      <section className="pl-memory pl-section" aria-labelledby="memory-title" data-reveal><ShieldCheck size={32} strokeWidth={1.4}/><div><h2 id="memory-title">More you, <em>each time.</em></h2><p>Share what you loved. Change what we remember. Your context stays in your control.</p></div><a className="pl-text-link" href="#questions">About your context <ArrowRight size={16}/></a></section>

      <section id="questions" className="pl-faq pl-section" aria-labelledby="faq-title" data-reveal><div><h2 id="faq-title">Good to <em>know.</em></h2></div><div className="pl-faq-list">{faqs.map(([question,answer])=><details key={question}><summary>{question}<ChevronDown size={18}/></summary><p>{answer}</p></details>)}</div></section>

      <section className="pl-final" aria-labelledby="final-title" data-reveal><span className="pl-final-spark" aria-hidden="true">✳</span><h2 id="final-title">Make it <em>your payday.</em></h2><a className="pl-button pl-button-light" href="/discover">Find my next treat <ArrowRight size={18}/></a></section>
    </main>
    <footer className="pl-footer"><a className="pl-logo" href="/">payday<span className="pl-logo-dot">.</span></a><a href="#questions">Your context & privacy</a><a href="/discover">Open Payday <ArrowUpRight size={14}/></a></footer>
  </div>;
}
