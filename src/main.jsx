import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const genres = [
  "Mystery", "Horror", "Fantasy", "Sci-fi",
  "Adventure", "Thriller", "Comedy", "Drama"
];

const styles = [
  "Cinematic", "Suspenseful", "Emotional",
  "Realistic", "Whimsical"
];

function App() {
  const [idea, setIdea] = useState("");
  const [length, setLength] = useState("medium");
  const [genre, setGenre] = useState("Mystery");
  const [style, setStyle] = useState("Cinematic");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("mikey-theme");
      return savedTheme === "green" ? "green" : "blue";
    } catch {
      return "blue";
    }
  });

  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("storyforge-saved") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem("mikey-theme", theme);
  }, [theme]);

  async function generateStory() {
    if (idea.trim().length < 3) {
      setError("Add a story idea first. Even a tiny spark will do.");
      return;
    }

    setLoading(true);
    setError("");
    setStory("");
    setCopied(false);

    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idea,
          length,
          genre,
          style
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not generate your story."
        );
      }

      setStory(data.story);
    } catch (err) {
      setError(
        err.message ||
        "Connection failed. Check that the app server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyStory() {
    try {
      await navigator.clipboard.writeText(story);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access was blocked by your browser.");
    }
  }

  function saveStory() {
    const item = {
      id: Date.now(),
      idea,
      genre,
      story,
      date: new Date().toLocaleDateString()
    };

    const next = [item, ...saved].slice(0, 30);

    setSaved(next);
    localStorage.setItem(
      "storyforge-saved",
      JSON.stringify(next)
    );
  }

  function openSaved(item) {
    setIdea(item.idea);
    setGenre(item.genre);
    setStory(item.story);
    setShowSaved(false);
    setError("");
  }

  function removeSaved(id) {
    const next = saved.filter(item => item.id !== id);

    setSaved(next);
    localStorage.setItem(
      "storyforge-saved",
      JSON.stringify(next)
    );
  }

  return (
    <div className="app-shell" data-theme={theme}>

      {/* NAVIGATION */}

      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">✦</span>
          MIKEY_STORY AI
        </a>

        <div className="nav-actions">

          <div className="theme-control">
            <span>◐</span>

            <select
              className="theme-select"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              aria-label="Choose website theme"
            >
              <option value="blue">Neon Blue</option>
              <option value="green">Neon Green</option>
            </select>
          </div>

          <button
            className="saved-button"
            onClick={() => setShowSaved(!showSaved)}
          >
            <span>▤</span> My Library
            <b>{saved.length}</b>
          </button>

        </div>
      </header>

      <main>

        {/* HERO */}

        <section className="hero">

          <div className="eyebrow">
            <span className="pulse" />
            YOUR AI STORY STUDIO
          </div>

          <h1>
            One idea.
            <br />
            <span>Infinite stories.</span>
          </h1>

          <p className="hero-copy">
            Give us a spark of imagination.
            We'll help turn it into a story worth staying up for.
          </p>

        </section>

        {/* MAIN WORKSPACE */}

        <section className="workspace">

          {/* INPUT PANEL */}

          <div className="form-panel">

            <div className="section-heading">
              <div>
                <span className="step">01</span>
                <h2>Start with an idea</h2>
              </div>

              <span className="tiny-label">YOUR PROMPT</span>
            </div>

            <textarea
              value={idea}
              onChange={e => setIdea(e.target.value)}
              maxLength={1200}
              placeholder="A lonely astronaut receives a message from Earth, but it was sent 200 years in the future..."
            />

            <div className="char-count">
              {idea.length}/1200
            </div>

            <div className="section-heading options-heading">
              <div>
                <span className="step">02</span>
                <h2>Shape your story</h2>
              </div>
            </div>

            <label className="field-label">
              STORY LENGTH
            </label>

            <div className="choice-row">
              {["short", "medium", "long"].map(v => (
                <button
                  key={v}
                  className={`choice ${length === v ? "active" : ""}`}
                  onClick={() => setLength(v)}
                >
                  <strong>
                    {v[0].toUpperCase() + v.slice(1)}
                  </strong>

                  <small>
                    {v === "short"
                      ? "Quick read"
                      : v === "medium"
                      ? "A full tale"
                      : "Deep journey"}
                  </small>
                </button>
              ))}
            </div>

            <label className="field-label">
              GENRE
            </label>

            <div className="chips">
              {genres.map(v => (
                <button
                  key={v}
                  className={`chip ${genre === v ? "selected" : ""}`}
                  onClick={() => setGenre(v)}
                >
                  {v}
                </button>
              ))}
            </div>

            <label className="field-label">
              WRITING STYLE
            </label>

            <select
              value={style}
              onChange={e => setStyle(e.target.value)}
              className="style-select"
            >
              {styles.map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <button
              className="generate"
              onClick={generateStory}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Weaving your story...
                </>
              ) : (
                <>
                  ✧ &nbsp; Generate my story
                  <span>→</span>
                </>
              )}
            </button>

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            <p className="privacy-note">
              ✦ Your ideas are used to generate your story.
              Saved stories stay in this browser.
            </p>

          </div>

          {/* RESULT PANEL */}

          <div className="result-panel">

            {!story && !loading ? (

              <div className="empty-state">

                <div className="book-art">
                  <div className="book-glow">✧</div>
                  <div className="book">✦</div>
                </div>

                <span className="tiny-label">
                  THE STORY CANVAS
                </span>

                <h2>
                  Your next favourite story
                  <br />
                  starts here.
                </h2>

                <p>
                  Your generated story will appear in this space,
                  ready to read, copy, or save.
                </p>

                <div className="hint">
                  ✧ &nbsp; Tip: unusual ideas make unforgettable stories.
                </div>

              </div>

            ) : loading ? (

              <div className="loading-state">
                <div className="loader-orbit">✧</div>
                <h2>Writing your story</h2>
                <p>
                  Gathering ideas, building worlds,
                  finding the right words...
                </p>
              </div>

            ) : (

              <article className="story-output">

                <div className="story-meta">
                  <span className="tiny-label">
                    YOUR GENERATED STORY
                  </span>

                  <span>
                    {genre} · {length}
                  </span>
                </div>

                <div className="story-text">
                  {story}
                </div>

                <div className="story-actions">

                  <button onClick={copyStory}>
                    {copied ? "✓ Copied" : "▣ Copy story"}
                  </button>

                  <button onClick={saveStory}>
                    ♡ Save story
                  </button>

                  <button
                    onClick={generateStory}
                    disabled={loading}
                  >
                    ↻ Regenerate
                  </button>

                </div>

              </article>

            )}

          </div>

        </section>

        {/* FOOTER */}

        <footer>
          <span>✦ MIKEY_STORY AI</span>
          <span>Made for curious minds.</span>
        </footer>

      </main>

      {/* LIBRARY DRAWER */}

      {showSaved && (

        <div
          className="drawer-backdrop"
          onClick={() => setShowSaved(false)}
        >

          <aside
            className="library-drawer"
            onClick={e => e.stopPropagation()}
          >

            <div className="drawer-head">

              <div>
                <span className="tiny-label">
                  YOUR COLLECTION
                </span>

                <h2>My Library</h2>
              </div>

              <button
                onClick={() => setShowSaved(false)}
              >
                ✕
              </button>

            </div>

            {saved.length === 0 ? (

              <p className="no-saved">
                Stories you save will appear here.
              </p>

            ) : (

              saved.map(item => (

                <div className="saved-item" key={item.id}>

                  <button
                    className="saved-open"
                    onClick={() => openSaved(item)}
                  >
                    <strong>{item.idea}</strong>
                    <small>
                      {item.genre} · {item.date}
                    </small>
                  </button>

                  <button
                    className="delete"
                    onClick={() => removeSaved(item.id)}
                    aria-label="Delete story"
                  >
                    ×
                  </button>

                </div>

              ))

            )}

          </aside>

        </div>

      )}

    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);