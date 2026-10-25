'use client';

import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Heart, ShieldCheck, Sparkles } from 'lucide-react';

const moments = [
  { label: 'A slower morning', title: 'Make room for a better ritual.', description: 'A coffee moment you’ll actually look forward to. Start with what you own, then find the little thing that’s missing.', image: 'sample-01', alt: 'Coffee brewing equipment in a warm, quiet setting', tags: ['A daily ritual', 'A little less rush'], thought: '“I want my mornings to feel less like a race.”' },
  { label: 'Something creative', title: 'A small escape from the screen.', description: 'An afternoon making something with your hands. Your guide can help you weigh the setup, supplies and space it needs.', image: 'sample-41', alt: 'Watercolour painting supplies for a creative afternoon', tags: ['Away from screens', 'Time for yourself'], thought: '“I’d love to make something, but I’m not sure where to start.”' },
  { label: 'A change of scene', title: 'A different kind of afternoon.', description: 'A photo walk, a gallery visit, a new corner of your city. Explore the experience before deciding what to spend.', image: 'sample-12', alt: 'A camera ready for a photography outing', tags: ['Explore nearby', 'Less to bring home'], thought: '“I want a good memory, not another thing on my shelf.”' },
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
  return <div className="pl">
    <a className="pl-skip" href="#landing-main">Skip to content</a>
    <header className="pl-header">
      <a className="pl-logo" href="/" aria-label="Payday home"><span className="pl-mark" aria-hidden="true"><img src="/brand/payday-mark.png" alt="" width="68" height="68"/></span>payday<span className="pl-logo-dot">.</span></a>
      <nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#your-moment">Find your moment</a><a href="#questions">Good to know</a></nav>
      <a className="pl-button pl-button-small" href="/discover">Open Payday <ArrowUpRight size={16}/></a>
    </header>

    <main id="landing-main" className="pl-main">
      <section className="pl-hero" aria-labelledby="landing-title">
        <div className="pl-hero-copy"><p className="pl-eyebrow"><span/> A LITTLE SOMETHING, WELL CHOSEN</p><h1 id="landing-title">You’ve earned<br/>a little <em>joy.</em></h1><p className="pl-intro">Let’s find what that looks like for you.</p><p className="pl-description">An AI shopping companion that starts with your life, your budget and what you already love. For a payday treat that feels like you.</p><div className="pl-hero-actions"><a className="pl-button" href="/discover">Find my next treat <ArrowRight size={18}/></a><a className="pl-text-link" href="#how-it-works">Take a little look <ChevronDown size={15}/></a></div><p className="pl-micro"><Check size={14}/> Your budget. Your pace. Your decision.</p></div>
        <div className="pl-hero-visual"><div className="pl-photo-frame"><img className="pl-hero-photo" src="/images/rewards/hero.webp" alt="Sunlight falling across a watercolour painting, a mug and flowers on a wooden table" width="1200" height="800" fetchPriority="high"/><span className="pl-photo-caption">A little space for yourself.</span><span className="pl-photo-label">AI concept image</span></div><div className="pl-hero-note"><span className="pl-note-icon"><Sparkles size={19}/></span><div><small>START WITH A MOMENT</small><p>“Less scrolling.<br/>More Saturday afternoons like this.”</p></div><Heart size={18} className="pl-note-heart"/></div><span className="pl-visual-tag">THOUGHTFULLY YOURS <span aria-hidden="true">✳</span></span></div>
      </section>

      <div className="pl-principles" aria-label="Our approach"><p>More thoughtful.<br/><em>Less overwhelming.</em></p><span><Check size={17}/> A budget you’re comfortable with</span><span><Check size={17}/> A few ideas worth considering</span><span><Check size={17}/> The final say stays yours</span></div>

      <section id="how-it-works" className="pl-how pl-section" aria-labelledby="how-title"><div className="pl-section-heading"><div><p className="pl-eyebrow">FROM “I’M NOT SURE” TO “THAT’S ME”</p><h2 id="how-title">A little conversation.<br/><em>A better choice.</em></h2></div><p>You don’t need the right search words.<br/>Just a little context about you.</p></div><div className="pl-steps">
        <article><span className="pl-step-number">01 /</span><h3>Tell us about your days.</h3><p>More time outside? A calmer morning? Start with the feeling you’re after and a comfortable budget.</p></article>
        <article><span className="pl-step-number">02 /</span><h3>Try a few ideas on.</h3><p>Work through what appeals, what doesn’t, and what you already own. Your guide helps narrow the possibilities.</p></article>
        <article><span className="pl-step-number">03 /</span><h3>Make it your kind of reward.</h3><p>Research real options, consider the trade-offs, and save a favourite for payday. You decide what happens next.</p></article>
      </div></section>

      <section id="your-moment" className="pl-moment pl-section" aria-labelledby="moment-title"><div className="pl-moment-copy"><p className="pl-eyebrow">A TREAT ISN’T ALWAYS A THING</p><h2 id="moment-title">What would make<br/>your day <em>better?</em></h2><p>Sometimes it’s a small upgrade.<br/>Sometimes it’s trying something new.</p><div className="pl-moment-choices" role="group" aria-label="Explore an illustrative reward direction">{moments.map((item, index)=><button type="button" key={item.label} aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{item.label}</span>{selected===index?<Check size={16}/>:<ArrowRight size={16}/>}</button>)}</div><p className="pl-example-note">A few illustrative directions. Your own discovery starts with you.</p></div><div className="pl-moment-example" aria-live="polite" aria-atomic="true"><div className="pl-moment-image"><img src={`/images/rewards/${moment.image}.webp`} alt={moment.alt} width="1200" height="800" loading="lazy"/><span className="pl-photo-label">AI concept image</span></div><div className="pl-moment-details"><p className="pl-example-thought">{moment.thought}</p><h3>{moment.title}</h3><p>{moment.description}</p><div className="pl-tags">{moment.tags.map(tag=><span key={tag}>{tag}</span>)}</div></div></div></section>

      <section className="pl-memory pl-section" aria-labelledby="memory-title"><div className="pl-memory-example"><span className="pl-eyebrow"><Sparkles size={15}/> EXAMPLE PREFERENCE</span><blockquote>“I like making things.<br/>I don’t love the setup.”</blockquote><div className="pl-memory-rule"/><span className="pl-memory-label">SOMETHING TO EXPLORE NEXT</span><p>A creative session with<br/><strong>the materials taken care of.</strong></p><span className="pl-example-note">An illustrative direction, not a verified booking.</span></div><div className="pl-memory-copy"><p className="pl-eyebrow">A LITTLE MORE YOU, EVERY TIME</p><h2 id="memory-title">Your last treat<br/>can teach us <em>something.</em></h2><p>What you loved. What you never used. What sounded better than it felt. Share your feedback, and bring those lessons into your next discovery.</p><p className="pl-memory-control"><ShieldCheck size={18}/><span>Your context is yours to review, correct or forget.</span></p><a className="pl-text-link" href="/discover">Meet your shopping companion <ArrowRight size={16}/></a></div></section>

      <section id="questions" className="pl-faq pl-section" aria-labelledby="faq-title"><div><p className="pl-eyebrow">BEFORE YOU SETTLE IN</p><h2 id="faq-title">Good to <em>know.</em></h2></div><div className="pl-faq-list">{faqs.map(([question,answer])=><details key={question}><summary>{question}<ChevronDown size={18}/></summary><p>{answer}</p></details>)}</div></section>

      <section className="pl-final" aria-labelledby="final-title"><span className="pl-final-spark" aria-hidden="true">✳</span><p className="pl-eyebrow">MAKE ROOM FOR SOMETHING GOOD</p><h2 id="final-title">Your next little joy.<br/><em>Let’s find it.</em></h2><a className="pl-button pl-button-light" href="/discover">Find my next treat <ArrowRight size={18}/></a><p>No rush. No pressure to buy.</p></section>
    </main>
    <footer className="pl-footer"><a className="pl-logo" href="/">payday<span className="pl-logo-dot">.</span></a><p>A little something for you.</p><a href="#questions">Your context & privacy</a><a href="/discover">Open Payday <ArrowUpRight size={14}/></a></footer>
  </div>;
}
