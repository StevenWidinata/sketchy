import { CATEGORIES } from "../../../shared/words";
import { Carousel } from "../components/Carousel";
import { JoinPanel } from "../components/JoinPanel";
import { Logo } from "../components/Logo";
import { Raccoon } from "../components/Raccoon";
import { useScribbles } from "../lib/scribbles";
import "../styles/landing.css";

export function Landing({ navigate }: { navigate: (path: string) => void }) {
  useScribbles("full", "landing");
  return (
    <div className="landing" data-paper>
      <a className="skip-link" href="#play">
        Skip to the game form
      </a>
      <header className="landing-nav" data-paper>
        <a href="/" className="logo-link" aria-label="Sketchy home">
          <Logo />
        </a>
        <nav aria-label="Page">
          <a href="#how" className="nav-link">
            How it plays
          </a>
        </nav>
      </header>

      <main data-paper>
        <section className="hero" aria-labelledby="hero-title" data-paper>
          <div className="hero-head">
            <h1 id="hero-title" className="hero-title">
              <span className="hero-line">Draw badly.</span>
              <span className="hero-line">Guess fast.</span>
            </h1>
            <div className="hero-raccoon" data-clear>
              <Raccoon mood="idle" follow size="100%" />
              <p className="note note-raccoon hand" aria-hidden="true">
                judges every drawing
                <svg viewBox="0 0 90 60" className="note-arrow">
                  <path d="M6 8C30 6 58 14 70 40M70 40L60 34M70 40L72 28" pathLength={1} />
                </svg>
              </p>
            </div>
          </div>

          <p className="hero-sub">
            A free drawing and guessing game for 2 to 20 friends. Pick the categories, share a 5‑letter code, and play in any
            browser, on a phone or a laptop.
          </p>

          <div className="hero-panel" id="play">
            <p className="note note-free hand" aria-hidden="true">
              no sign-up, no download
              <svg viewBox="0 0 90 60" className="note-arrow">
                <path d="M10 10C40 8 66 22 78 50M78 50L68 46M78 50L82 38" pathLength={1} />
              </svg>
            </p>
            <JoinPanel navigate={navigate} />
          </div>
        </section>

        <section className="cards-band" aria-label="Example rounds" data-paper>
          <p className="note note-cards hand" aria-hidden="true">
            20 categories, in English or Bahasa Indonesia
          </p>
          <Carousel />
        </section>

        <section className="how" id="how" aria-labelledby="how-title" data-paper>
          <h2 id="how-title" className="section-title">
            How a game goes
          </h2>
          <ol className="how-steps">
            <li>
              <h3>The host sets the table</h3>
              <p>Choose rounds, draw time, language and which of the 20 categories to play. Add your own words if you like.</p>
            </li>
            <li>
              <h3>One draws, everyone guesses</h3>
              <p>The drawer picks a word. Everyone else sees its category and the letter count, and types guesses in the chat.</p>
            </li>
            <li>
              <h3>Fast guesses score big</h3>
              <p>Up to 500 points for a quick guess, and the drawer scores for every player who gets it. Highest score after the last round wins.</p>
            </li>
          </ol>

          <h2 className="section-title section-title-sm">Categories</h2>
          <ul className="category-list">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                {c.name.en}
                <span lang="id">{c.name.id}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="landing-foot" data-paper>
        <Logo size={24} />
        <p>Made for drawing badly with friends.</p>
      </footer>
    </div>
  );
}
