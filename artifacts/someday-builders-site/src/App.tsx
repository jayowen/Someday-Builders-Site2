import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Menu, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();
const asset = (name: string) => `/imported/assets/${name}`;

type Story = {
  name: string;
  gender: string;
  birthday: string;
  maritalStatus: string;
  spouseName: string;
  anniversary: string;
  boys: string;
  girls: string;
  grandBoys: string;
  grandGirls: string;
  email: string;
};

const initialStory: Story = {
  name: '', gender: '', birthday: '', maritalStatus: '', spouseName: '', anniversary: '',
  boys: '', girls: '', grandBoys: '', grandGirls: '', email: '',
};

function BrandNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <nav className="sb-nav" aria-label="Primary navigation">
      <a className="sb-nav-mark" href="#intake" onClick={close} data-testid="link-brand-home">
        <img src={asset('logo-monogram.png')} alt="" />
        <span>Someday Builders</span>
      </a>
      <div id="primary-navigation" className={`sb-nav-links ${open ? 'is-open' : ''}`}>
        <a href="#mission" onClick={close} data-testid="link-mission">Our mission</a>
        <a href="#pillars" onClick={close} data-testid="link-pillars">The work</a>
        <Link href="/resources" onClick={close} data-testid="link-resources">Resources <ArrowUpRight size={13} aria-hidden="true" /></Link>
        <a className="sb-nav-cta" href="#assessment" onClick={close} data-testid="link-assessment">Join the list</a>
      </div>
      <button type="button" className="sb-menu-button" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="primary-navigation" data-testid="button-mobile-menu">
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>
    </nav>
  );
}

function StoryIntake({ focusEmail = false }: { focusEmail?: boolean }) {
  const [story, setStory] = useState<Story>(initialStory);
  const [step, setStep] = useState(focusEmail ? 5 : 1);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const isPartner = story.maritalStatus === 'Married' || story.maritalStatus === 'Engaged';
  const steps = isPartner || !story.maritalStatus ? [1, 2, 3, 4, 5] : [1, 2, 4, 5];
  const total = steps.length;

  useEffect(() => {
    if (focusEmail) {
      const timer = window.setTimeout(() => emailRef.current?.focus(), 500);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [focusEmail]);

  const update = (key: keyof Story, value: string) => {
    setStory((current) => ({ ...current, [key]: value }));
    setError('');
  };
  const currentIndex = Math.max(0, steps.indexOf(step));
  const nextStep = () => {
    const index = steps.indexOf(step);
    return steps[index + 1] ?? 6;
  };
  const previousStep = () => {
    const index = steps.indexOf(step);
    return steps[index - 1] ?? 1;
  };
  const continueStory = () => {
    if (step === 1 && !story.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (step === 5 && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(story.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (step === 5) {
      const payload = { ...story, submittedAt: new Date().toISOString() };
      const existing = JSON.parse(window.localStorage.getItem('somedayStories') || '[]') as unknown[];
      window.localStorage.setItem('somedayStories', JSON.stringify([...existing, payload]));
      setComplete(true);
      setError('');
      return;
    }
    if (step === 2 && story.maritalStatus && story.maritalStatus !== 'Married' && story.maritalStatus !== 'Engaged') {
      setStep(4);
      return;
    }
    setStep(nextStep());
    setError('');
  };
  const beginFromAssessment = () => {
    setStep(5);
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => emailRef.current?.focus(), 450);
  };
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    continueStory();
  };

  return (
    <div className="sb-hero-note" ref={cardRef} data-testid="card-story-intake">
      {!complete ? (
        <>
          <div className="sb-intake-top">
            <img src={asset('logo-wordmark.png')} alt="Someday Builders" />
            <span>{step === 5 ? 'Almost there' : `Question ${currentIndex + 1} / ${total}`}</span>
          </div>
          <div className="sb-progress" aria-label={`Step ${currentIndex + 1} of ${total}`}>
            {steps.map((item, index) => <span key={item} className={index <= currentIndex ? 'active' : ''} />)}
          </div>
          <form onSubmit={onSubmit} noValidate>
            {step === 1 && (
              <fieldset className="sb-form-step sb-reveal" data-testid="step-identity">
                <legend>What’s your name?</legend>
                <label htmlFor="story-name">Name</label>
                <input id="story-name" value={story.name} onChange={(event) => update('name', event.target.value)} autoComplete="name" data-testid="input-story-name" />
                <label className="sb-choice-label">Gender <span>optional</span></label>
                <div className="sb-choices">
                  {['Male', 'Female'].map((gender) => <label key={gender} className={story.gender === gender ? 'selected' : ''}><input type="radio" name="gender" value={gender} checked={story.gender === gender} onChange={() => update('gender', gender)} />{gender}</label>)}
                </div>
              </fieldset>
            )}
            {step === 2 && (
              <fieldset className="sb-form-step sb-reveal" data-testid="step-life">
                <legend>Where are you on the journey?</legend>
                <label htmlFor="story-birthday">Birthday <span className="sb-optional">optional</span></label>
                <input id="story-birthday" type="date" value={story.birthday} onChange={(event) => update('birthday', event.target.value)} data-testid="input-birthday" />
                <label className="sb-choice-label">Are you married?</label>
                <div className="sb-choices sb-choices-wide">
                  {['Married', 'Engaged', 'Single', 'Divorced'].map((status) => <label key={status} className={story.maritalStatus === status ? 'selected' : ''}><input type="radio" name="marital" value={status} checked={story.maritalStatus === status} onChange={() => update('maritalStatus', status)} />{status}</label>)}
                </div>
              </fieldset>
            )}
            {step === 3 && (
              <fieldset className="sb-form-step sb-reveal" data-testid="step-partnership">
                <legend>{story.maritalStatus === 'Engaged' ? 'Tell us about your engagement' : 'Tell us about your marriage'}</legend>
                <label htmlFor="story-spouse">{story.maritalStatus === 'Engaged' ? 'What’s your fiancé’s name?' : 'What’s your spouse’s name?'}</label>
                <input id="story-spouse" value={story.spouseName} onChange={(event) => update('spouseName', event.target.value)} data-testid="input-partner-name" />
                <label htmlFor="story-anniversary">{story.maritalStatus === 'Engaged' ? 'When is your wedding date?' : 'When is your wedding anniversary?'}</label>
                <input id="story-anniversary" type="date" value={story.anniversary} onChange={(event) => update('anniversary', event.target.value)} data-testid="input-anniversary" />
              </fieldset>
            )}
            {step === 4 && (
              <fieldset className="sb-form-step sb-reveal" data-testid="step-family">
                <legend>Do you have children?</legend>
                <div className="sb-number-grid">
                  {(['boys', 'girls'] as const).map((key) => <label key={key} htmlFor={`story-${key}`}>{key[0].toUpperCase() + key.slice(1)}<input id={`story-${key}`} type="number" min="0" max="30" placeholder="0" value={story[key]} onChange={(event) => update(key, event.target.value)} data-testid={`input-${key}`} /></label>)}
                </div>
                <label className="sb-choice-label">Do you have grandchildren? <span>optional</span></label>
                <div className="sb-number-grid">
                  {(['grandBoys', 'grandGirls'] as const).map((key) => <label key={key} htmlFor={`story-${key}`}>{key === 'grandBoys' ? 'Boys' : 'Girls'}<input id={`story-${key}`} type="number" min="0" max="60" placeholder="0" value={story[key]} onChange={(event) => update(key, event.target.value)} data-testid={`input-${key}`} /></label>)}
                </div>
              </fieldset>
            )}
            {step === 5 && (
              <fieldset className="sb-form-step sb-reveal" data-testid="step-email">
                <legend>What’s your email address?</legend>
                <label htmlFor="story-email">Email</label>
                <input ref={emailRef} id="story-email" type="email" value={story.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" data-testid="input-story-email" />
                <p className="sb-field-caption">So we can send your someday story and what’s coming next.</p>
              </fieldset>
            )}
            {error && <p className="sb-form-error" role="alert" data-testid="status-form-error">{error}</p>}
            <div className="sb-form-actions">
              {step > 1 && <button type="button" className="sb-back" onClick={() => { setStep(previousStep()); setError(''); }} data-testid="button-story-back">Back</button>}
              <button type="submit" className="sb-continue" data-testid="button-story-continue">{step === 1 ? 'Begin your story' : step === 5 ? 'Share my story' : 'Continue'}</button>
            </div>
          </form>
          <p className="sb-enter-hint">Press Enter to continue</p>
        </>
      ) : (
        <div className="sb-thanks sb-reveal" data-testid="status-story-complete">
          <span className="sb-thanks-mark">SB</span>
          <h2>Thank you for sharing a little bit of your someday story with us.</h2>
          <p>We look forward to being a part of helping you build your someday in the days ahead.</p>
          <a href="#pillars" data-testid="link-thanks-pillars">Explore the work <ArrowDown size={14} /></a>
        </div>
      )}
      <button className="sb-intake-assessment" onClick={beginFromAssessment} type="button" data-testid="button-intake-assessment">The Someday Assessment <span>coming this September</span></button>
    </div>
  );
}

function Home() {
  const [joined, setJoined] = useState(false);
  useEffect(() => {
    const revealables = Array.from(document.querySelectorAll<HTMLElement>('.sb-reveal-on-scroll'));
    if (!('IntersectionObserver' in window)) {
      revealables.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealables.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return (
    <main className="sb-site">
      <section className="sb-hero" id="intake">
        <BrandNav />
        <img className="sb-hero-image" src={asset('photo-hands-2.jpg')} alt="A couple holding hands walking through tall grass at golden hour" data-testid="img-hero-hands" />
        <div className="sb-hero-overlay" />
        <div className="sb-hero-inner">
          <div className="sb-hero-copy sb-reveal">
            <p className="sb-kicker">A community for the long view</p>
            <h1>Your someday starts with <em>your story.</em></h1>
            <p className="sb-hero-deck">For couples preparing for marriage, as well as couples and families already on the journey.</p>
            <img className="sb-hero-tagline" src={asset('tagline-terracotta.png')} alt="Start building your Someday..." data-testid="img-tagline" />
          </div>
          <StoryIntake />
        </div>
        <span className="sb-scroll-cue">Scroll to begin</span>
      </section>

      <section className="sb-section sb-empathy" id="story">
        <div className="sb-section-inner sb-reveal-on-scroll">
          <p className="sb-eyebrow">For every couple</p>
          <p data-testid="text-empathy">Legacies aren’t built by accident. Most couples are handed a ceremony and a honeymoon, then left to figure out the rest on their own. <em>You were never meant to build without a guide—and a community.</em></p>
        </div>
      </section>

      <section className="sb-section sb-mission" id="mission">
        <div className="sb-section-inner sb-mission-grid sb-reveal-on-scroll">
          <div><p className="sb-eyebrow">Our mission</p><h2>Build what<br />outlives you.</h2></div>
          <div className="sb-mission-copy">
            <blockquote data-testid="text-mission">Creating legacies by building healthy, Christ-centered marriages and families from the start through science, spiritual formation, and community.</blockquote>
            <div className="sb-rule" />
            <p>Our approach pairs scientifically rigorous assessments from Dr. Coker with spiritual formation and real community.</p>
          </div>
        </div>
      </section>

      <section className="sb-section sb-plan" id="how-it-works">
        <div className="sb-section-inner sb-plan-grid sb-reveal-on-scroll">
          <div><p className="sb-eyebrow">How it works</p><h2>A better<br />beginning.</h2></div>
          <ol className="sb-plan-list">
            {[
              ['01', 'Share your someday story', 'It takes about two minutes and tells us who you are.'],
              ['02', 'Take the Someday Assessment', 'Proprietary and backed by research, coming this September. The list gets it first.'],
              ['03', 'Build together', 'Counseling, community, and events & retreats that strengthen your marriage and family.'],
            ].map(([number, title, copy]) => <li className="sb-plan-item" key={number} data-testid={`item-plan-${number}`}><span className="sb-plan-num">{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="sb-section sb-pillars" id="pillars">
        <div className="sb-section-inner sb-reveal-on-scroll">
          <div className="sb-pillars-intro"><div><p className="sb-eyebrow">The work</p><h2>Three ways<br />to build.</h2></div><p>Small, meaningful practices become the architecture of a life together.</p></div>
          {([
            ['Pillar one', 'Counseling', 'Premarital and marital counseling rooted in science and scripture.', 'photo-counseling.jpg', 'Two people talking quietly over coffee mugs at a table', false],
            ['Pillar two', 'Community', 'Monthly SomedayBuilders Family Reunions & Couples Community Nights.', 'photo-events.jpg', 'Friends sharing dinner at a long table under string lights', true],
            ['Pillar three', 'Events & Retreats', 'Special moments throughout the year to celebrate and grow your legacy.', 'photo-retreats.jpg', 'A wooden cabin in golden morning mist', false],
          ] as const).map(([label, title, copy, image, alt, reverse]) => <article className={`sb-pillar ${reverse ? 'reverse' : ''}`} key={title} data-testid={`card-pillar-${title.toLowerCase().replaceAll(' ', '-')}`}><figure className="sb-pillar-photo"><img src={asset(image)} alt={alt} loading="lazy" /></figure><div className="sb-pillar-copy"><span className="sb-pillar-label">{label}</span><h3>{title}</h3><div className="sb-rule" /><p>{copy}</p></div></article>)}
        </div>
      </section>

      <section className="sb-section sb-scripture">
        <figure className="sb-keepsake sb-reveal-on-scroll"><img src={asset('photo-legacy-hands.jpg')} alt="An engaged couple holding hands in warm golden light" loading="lazy" /></figure>
        <blockquote className="sb-reveal-on-scroll" data-testid="text-scripture">“This mystery is profound, and I am saying that it refers to… Christ and the church.”<cite>Ephesians 5:32</cite></blockquote>
      </section>

      <section className="sb-section sb-assessment" id="assessment">
        <div className="sb-section-inner sb-reveal-on-scroll">
          <div><p className="sb-eyebrow">The next step</p><h2>The Someday<br />Assessment</h2></div>
          <div className="sb-assessment-copy"><p className="sb-assessment-vision">Marriages and families that thrive, and a legacy that reaches beyond you.</p><p>Proprietary assessments from Dr. Coker, backed by scientific rigor. Premarital, marriage, and family health, all in one place.</p><p className="sb-coming">Coming this September. The list gets it first.</p><button type="button" onClick={() => setJoined(true)} data-testid="button-join-list">Join the list <ArrowUpRight size={14} /></button>{joined && <span className="sb-list-note" role="status" data-testid="status-joined-list">You’re on the list.</span>}</div>
        </div>
      </section>

      <footer className="sb-footer">
        <p className="sb-footer-mark"><em>Someday</em> <strong>BUILDERS</strong></p>
        <div className="sb-footer-meta"><nav className="sb-footer-links" aria-label="Footer"><Link href="/resources" data-testid="link-footer-resources">Resources</Link><a href="mailto:hello@somedaybuilders.com" data-testid="link-footer-email">hello@somedaybuilders.com</a><a href="#intake" data-testid="link-footer-top">Back to top</a></nav><p className="sb-footer-copy">© 2026 Someday Builders</p></div>
      </footer>
    </main>
  );
}

function Resources() {
  return (
    <main className="sb-resources-page">
      <div className="sb-resources-main">
        <div className="sb-resource-top"><Link href="/" data-testid="link-resources-home"><img className="sb-resource-logo" src={asset('logo-wordmark.png')} alt="Someday Builders" /></Link><Link className="sb-back-link" href="/" data-testid="link-back-home">← Back to Someday Builders</Link></div>
        <header className="sb-resource-header"><p className="sb-eyebrow">Resources</p><h1>Build your<br /><em>someday library.</em></h1><p>Books, music, and more to help you build a Christ-centered marriage, family, and legacy.</p></header>
        <ul className="sb-resource-list">
          <li className="sb-resource-card" data-testid="card-resource-book"><span className="sb-resource-kind">Book</span><h2>Daddy Set The Church On Fire</h2><p>A journey toward restoration. Michael Charles Olson’s memoir of faith, fatherhood, and forgiveness.</p><a href="https://daddysetthechurchonfire.com/" target="_blank" rel="noreferrer" data-testid="link-resource-book">Get the book <ArrowUpRight size={14} /></a></li>
          <li className="sb-resource-card" data-testid="card-resource-playlist"><span className="sb-resource-kind">Music</span><h2>The SomedayBuilders Playlist</h2><p>Songs for building your someday, curated on Spotify.</p><a href="https://open.spotify.com/playlist/7iRXW6BXhf6Y9YGsmH60as?si=sMonyuw3QXCluZB79MVctA" target="_blank" rel="noreferrer" data-testid="link-resource-playlist">Listen on Spotify <ArrowUpRight size={14} /></a></li>
        </ul>
        <p className="sb-more">More coming soon…</p><p className="sb-more-note">Bible studies, cookbooks, a podcast, and more.</p>
      </div>
      <footer className="sb-footer"><p className="sb-footer-mark"><em>Someday</em> <strong>BUILDERS</strong></p><p className="sb-footer-copy">© 2026 Someday Builders</p></footer>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/resources" component={Resources} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;