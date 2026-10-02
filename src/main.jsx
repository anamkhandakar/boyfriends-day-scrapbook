import React, { useEffect, useRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";
import "./styles.css";

// ── DATA ──────────────────────────────────────────────────────────────────────

const photos = Array.from(
  { length: 12 },
  (_, i) => `/images/photo-${String(i + 1).padStart(2, "0")}.png`
);

const memories = [
  { caption: "Our First Photo", emoji: "❤️",  index: 0  },
  { caption: "That Stupid Reel-Making Competition", emoji: "😂", index: 1  },
  { caption: "Cute Us",         emoji: "🥹",  index: 2  },
  { caption: "My Fav Photo",    emoji: "❤️",  index: 3  },
  { caption: "Our Cute Moments Captured", emoji: "✨", index: 4  },
  { caption: "My Sweet Pie",    emoji: "🥧❤️", index: 5  },
  { caption: "MCD Date",        emoji: "🍟",  index: 6  },
  { caption: "Movie Date",      emoji: "🎬",  index: 7  },
  { caption: "Winning Hearts by Twinning", emoji: "💙", index: 8  },
  { caption: "Random Classes",  emoji: "📚",  index: 9  },
  { caption: "Chant Aurat × Seedha Mard", emoji: "😂", index: 10 },
  { caption: "Our Fav MCD Meal", emoji: "🍔❤️", index: 11 },
];

const things = [
  "I love how you always scold me first, then love me like your baby.",
  "I love how you ended up consoling me for hours and hours.",
  "I love how you feed me the first bite of your food.",
  'I love how you call me "my babyyyyy." ❤️',
  "I love how you always pull me close to you.",
  "I love how you always check on me.",
  "I love how you always notice when my mood isn't okay.",
  "I love how you always make that cute face that I fall for again and again.",
  "I love the way you love me.",
  "I love you for you — for who you are. ❤️",
];

const cardColors = [
  "#fff5f7", "#fff9f0", "#f0f5ff", "#fff0f5",
  "#f5fff0", "#fffbf0", "#f0f9ff", "#fff5f0",
  "#f9f0ff", "#fff0f0",
];

const rotations = [-2.5, 1.8, -1.2, 2.3, -1.7, 1.5, -2.1, 1.3, -1.9, 2.0];
const photoRotations = [-6, 5, -2, 7, -4, 3, -7, 6, -3, 4, -5, 2];

// ── PAGE TRANSITION VARIANTS ──────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, x: 80, rotate: 1.5 },
  animate: {
    opacity: 1, x: 0, rotate: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0, x: -80, rotate: -1.5,
    transition: { duration: 0.38, ease: "easeInOut" },
  },
};

// ── REUSABLE COMPONENTS ───────────────────────────────────────────────────────

function Tape({ className = "", style = {} }) {
  return <div className={`tape ${className}`} aria-hidden="true" style={style} />;
}

function FloatingDoodles() {
  return (
    <div className="doodles" aria-hidden="true">
      <span className="doodle d1">♡</span>
      <span className="doodle d2">✦</span>
      <span className="doodle d3">♡</span>
      <span className="doodle d4">✧</span>
      <span className="doodle d5">♥</span>
      <span className="doodle d6">✦</span>
      <span className="doodle d7">✿</span>
      <span className="doodle d8">♡</span>
    </div>
  );
}

function FloatingHearts() {
  return (
    <div className="floating-hearts" aria-hidden="true">
      {["♥","♡","❤","♥","♡","❤","♥","♡"].map((h, i) => (
        <span key={i} className={`fheart fh${i + 1}`}>{h}</span>
      ))}
    </div>
  );
}

function NavButton({ onClick, label, className = "next-btn", icon }) {
  return (
    <button className={`nav-btn ${className}`} onClick={onClick}>
      {icon && <span className="nav-icon">{icon}</span>}
      {label}
    </button>
  );
}

function PageIndicator({ page, total }) {
  return (
    <div className="progress" aria-label={`Page ${page + 1} of ${total}`}>
      <span className="prog-num">{String(page + 1).padStart(2, "0")}</span>
      <span className="prog-sep"> / </span>
      <span className="prog-total">{String(total).padStart(2, "0")}</span>
    </div>
  );
}

function MusicControl() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onError = () => setAvailable(false);
    audio.addEventListener("error", onError);
    return () => audio.removeEventListener("error", onError);
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !available) return;
    try {
      if (audio.paused) {
        await audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch {
      setAvailable(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop src="/music/background.mp3" preload="none" />
      <button
        className={`music-btn ${playing ? "playing" : ""}`}
        onClick={toggle}
        title={
          available
            ? playing ? "Pause music" : "Play music"
            : "Add public/music/background.mp3 to enable music"
        }
        aria-label="Toggle background music"
      >
        <span className="music-note">{playing ? "♫" : "♪"}</span>
        <span className="music-label">{playing ? "ON" : "OFF"}</span>
      </button>
    </>
  );
}

function Polaroid({ src, caption, rotation = 0, className = "", onClick, size = "normal" }) {
  return (
    <motion.button
      className={`polaroid polaroid-${size} ${className}`}
      style={{ "--rotation": `${rotation}deg` }}
      whileHover={{ scale: 1.05, rotate: 0, y: -7, zIndex: 10 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-label={caption || "Open photo"}
    >
      <div className="polaroid-img-wrap">
        <img src={src} alt={caption || "A photo from our scrapbook"} />
      </div>
      {caption && <span className="polaroid-caption">{caption}</span>}
    </motion.button>
  );
}

function PhotoModal({ memory, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!memory) return null;
  return (
    <motion.div
      className="lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo: ${memory.caption}`}
    >
      <motion.div
        className="lightbox-inner"
        initial={{ scale: 0.82, rotate: -3, y: 30 }}
        animate={{ scale: 1, rotate: 0, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }}
        exit={{ scale: 0.88, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lightbox-tape lt1" />
        <div className="lightbox-tape lt2" />
        <img src={memory.src} alt={memory.caption} />
        <p className="lightbox-caption">{memory.caption}</p>
        <button className="lightbox-close" onClick={onClose} aria-label="Close photo">
          ✕ Close
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── PAGE 1 — SPECIAL DELIVERY ─────────────────────────────────────────────────

function Page1({ onNext }) {
  const [opened, setOpened] = useState(false);

  return (
    <section className="page page1">
      <FloatingDoodles />
      <FloatingHearts />

      <div className="delivery-stamp" aria-hidden="true">
        SPECIAL<br />DELIVERY
      </div>
      <div className="stamp-corner sc1" aria-hidden="true">❤</div>
      <div className="stamp-corner sc2" aria-hidden="true">✉</div>

      <motion.div
        className={`envelope-wrap ${opened ? "opened" : ""}`}
        initial={{ y: 50, opacity: 0, rotate: -3 }}
        animate={{ y: 0, opacity: 1, rotate: opened ? 0 : -2 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Envelope body */}
        <div className="envelope">
          <div className="env-top" />
          <div className="env-bottom" />
          <div className="env-left" />
          <div className="env-right" />
          <motion.div
            className="env-flap"
            animate={opened ? { rotateX: 180, y: -10 } : { rotateX: 0 }}
            transition={{ duration: 0.5 }}
          />
          <div className="heart-seal">♥</div>

          <motion.div
            className="envelope-letter"
            animate={opened ? { y: -80, opacity: 1 } : { y: 0, opacity: 0.7 }}
            transition={{ delay: opened ? 0.3 : 0, duration: 0.5 }}
          >
            <div className="mini-label">🚨 SPECIAL DELIVERY 🚨</div>
            <div className="mini-label" style={{ marginTop: 8 }}>ATTENTION, SAYAN!</div>
            <h2>Your girlfriend has prepared<br />something for you. 👀❤️</h2>
            <p>Proceed at your own risk.</p>
          </motion.div>
        </div>

        {/* Decorative tape pieces */}
        <Tape className="env-tape-1" />
        <Tape className="env-tape-2" />
      </motion.div>

      <div className="washi-strip ws-bottom" aria-hidden="true">
        🚨 SPECIAL DELIVERY 🚨 &nbsp;&nbsp; FOR SAYAN ONLY 🚨 SPECIAL DELIVERY 🚨 &nbsp;&nbsp; FOR SAYAN ONLY
      </div>

      <NavButton
        onClick={() => { setOpened(true); setTimeout(onNext, 600); }}
        label={opened ? "Opening... ❤️" : "Open the Letter 💌"}
        className="open-btn"
      />
    </section>
  );
}

// ── PAGE 2 — WARNING ──────────────────────────────────────────────────────────

function Page2({ onNext }) {
  return (
    <section className="page page2">
      <FloatingDoodles />

      <motion.div
        className="warning-card"
        initial={{ scale: 0.85, rotate: -3, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <Tape className="tape-tl" />
        <Tape className="tape-tr" />

        <div className="warning-icon-wrap">
          <span className="warning-icon">⚠️</span>
        </div>

        <h1 className="warning-title">WARNING</h1>

        <div className="hazard-strip" aria-hidden="true" />

        <p className="big-warning">
          You are entering<br />
          <strong>a dangerously cute zone.</strong>
        </p>

        <p className="side-effects-label">Side effects may include:</p>

        <div className="side-effects">
          <span>smiling</span>
          <span>blushing</span>
          <span>&</span>
          <span>falling in love. ❤️</span>
        </div>

        <div className="no-escape-sticker">
          NO ESCAPE<br />NOW 😌
        </div>

        <div className="small-hearts-row" aria-hidden="true">
          ♥ ♡ ♥ ♡ ♥
        </div>
      </motion.div>

      <NavButton onClick={onNext} label="Continue →" className="next-btn" />
    </section>
  );
}

// ── PAGE 3 — PERSONAL LETTER ──────────────────────────────────────────────────

function Page3({ onNext }) {
  return (
    <section className="page page3">
      <FloatingDoodles />

      <div className="letter-layout">
        <motion.div
          className="letter-paper"
          initial={{ x: -50, opacity: 0, rotate: -2 }}
          animate={{ x: 0, opacity: 1, rotate: -1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Tape className="tape-top tape-letter-top" />
          <Tape className="tape-letter-right" />

          <span className="eyebrow">A LITTLE NOTE FROM ANAM</span>

          <h1 className="letter-heading">
            To My Boyfriend,<br />
            My Best Friend &amp; My Home <span className="letter-heart">❤️</span>
          </h1>

          <div className="letter-text">
            <p>Happy Boyfriend's Day, my love, my cutu penguine, my potol kumar. 🥹❤️</p>
            <p>I don't know what to tell you!</p>
            <p>You just randomly came into my life and somehow made me the happiest.</p>
            <p>
              From being just casual to becoming two people who don't want to leave each
              other for even a second... we became something that we never thought we'd be.
            </p>
            <p>Thank you for everything, my baby. ❤️</p>
            <p className="signature-line">
              I'm so grateful that it's <strong>you.</strong>
            </p>
          </div>

          <span className="scribble">love, anam ♡</span>
        </motion.div>

        <motion.div
          className="photo-stack"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <Polaroid
            src={photos[0]}
            caption="us ♡"
            rotation={-6}
            size="medium"
          />
          <Polaroid
            src={photos[3]}
            caption="my favourite people"
            rotation={5}
            className="back-polaroid"
            size="small"
          />
          <div className="sticker-round">MY<br />PERSON<br />♡</div>
        </motion.div>
      </div>

      <NavButton onClick={onNext} label="Turn the Page →" className="next-btn" />
    </section>
  );
}

// ── PAGE 4 — 10 THINGS I LOVE ABOUT YOU ──────────────────────────────────────

function Page4({ onNext }) {
  return (
    <section className="page page4">
      <div className="things-header">
        <span className="eyebrow">A VERY IMPORTANT LIST</span>
        <h1>10 Things I Love About You <span>❤️</span></h1>
        <div className="things-underline" />
      </div>

      <div className="things-grid">
        {things.map((thing, i) => (
          <motion.div
            key={i}
            className="thing-card"
            style={{
              background: cardColors[i],
              "--rotation": `${rotations[i]}deg`,
            }}
            initial={{ opacity: 0, y: 25, rotate: rotations[i] }}
            animate={{ opacity: 1, y: 0, rotate: rotations[i] }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 180, damping: 15 }}
            whileHover={{ scale: 1.04, rotate: 0, y: -5, zIndex: 10 }}
          >
            <div className="thing-tape" aria-hidden="true" />
            <span className="thing-number">{String(i + 1).padStart(2, "0")}</span>
            <p>{thing}</p>
            {i === 3 && <span className="tiny-heart">♥</span>}
            {i === 9 && <span className="tiny-star">✦</span>}
          </motion.div>
        ))}
      </div>

      <NavButton onClick={onNext} label="Turn the Page →" className="next-btn" />
    </section>
  );
}

// ── PAGE 5 — HOW IT ALL STARTED ───────────────────────────────────────────────

function Page5({ onNext }) {
  const timelineItems = [
    { label: "2nd Semester", note: "We met at BPPIMT ✨" },
    { label: "3rd Semester", note: "After Freshers, we talked more..." },
    { label: "Random Talks", note: "Reels, classes, life, everything 💬" },
    { label: "Safe Space", note: "I started feeling safe with you 🤍" },
    { label: "That One Post 👀", note: "Saree. Comment. Offended. Apology.", special: true },
    { label: "Us ❤️", note: "And somehow... everything started." },
  ];

  return (
    <section className="page page5">
      <FloatingDoodles />

      <div className="story-layout">
        <motion.div
          className="story-copy"
          initial={{ x: -40, opacity: 0, rotate: -1 }}
          animate={{ x: 0, opacity: 1, rotate: -0.5 }}
          transition={{ duration: 0.7 }}
        >
          <Tape className="tape-story-top" />
          <span className="eyebrow">CHAPTER ONE</span>

          <h1>How It All Started <span>❤️</span></h1>

          <p>We met in our <strong>2nd semester at BPPIMT.</strong></p>
          <p>Nothing extraordinary. Just two people who happened to meet in college.</p>
          <p>
            Then came our <strong>3rd semester, after Freshers</strong>... and somehow,
            we started talking more.
          </p>
          <p>
            Random conversations. Reels. College gossip. Classes. Exams. Personal life.
            Relationships. Literally anything and everything.
          </p>
          <p>
            And somewhere in between all those random conversations, I started feeling{" "}
            <strong>safe sharing my thoughts with you.</strong>
          </p>
          <p className="not-love-yet">Not love. Not yet.</p>
          <p>
            Just this strange, beautiful feeling of being able to talk to you about
            anything without having to think twice.
          </p>
        </motion.div>

        <div className="timeline-col">
          <div className="timeline">
            <div className="timeline-line" />
            {timelineItems.map((item, i) => (
              <motion.div
                className={`timeline-item ${item.special ? "special" : ""}`}
                key={item.label}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.13 }}
              >
                <span className="timeline-dot" />
                <div className="timeline-content">
                  <strong>{item.label}</strong>
                  <span>{item.note}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="story-reply"
            initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 2 }}
            transition={{ delay: 0.8 }}
          >
            <Tape className="reply-tape" />
            <span className="reply-label">THAT ONE MOMENT! 👀</span>
            <p>I posted a picture wearing a saree.</p>
            <p>He left a flirty comment.</p>
            <p>I got offended. 😭 I talked rudely.</p>
            <p>He apologized.</p>
            <strong className="reply-strong">And somehow... everything started. ❤️</strong>
          </motion.div>
        </div>
      </div>

      <NavButton onClick={onNext} label="Turn the Page →" className="next-btn" />
    </section>
  );
}

// ── PAGE 6 — THINGS I WANT YOU TO KNOW ───────────────────────────────────────

function Page6({ onNext }) {
  return (
    <section className="page page6">
      <FloatingHearts />

      <div className="home-page">
        <motion.div
          className="home-note"
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 1 }}
          transition={{ duration: 0.7 }}
        >
          <Tape className="tape-home" />
          <Tape className="tape-home-2" />

          <span className="eyebrow">KEEP THIS SOMEWHERE SAFE</span>
          <h1>Things I Want You To Know <span>❤️</span></h1>

          <p>I'm grateful for you.</p>
          <p>
            For the way we got close when we actually needed each other, and for how,
            even till this day, we keep having each other's back — on the good days and
            the bad ones.
          </p>
          <p className="scared-text">I'm scared of losing you.</p>
          <p>I honestly don't know what I would do without you.</p>
          <p>
            You changed me in so many little ways. You taught me to think kindly, behave
            kindly, and talk kindly. You made me more confident about my life, about
            having goals, and about imagining a future with you.
          </p>
          <p>Thank you for staying with me. Thank you for choosing me. ❤️</p>
          <p className="home-question">And if you ever ask me what you are to me...</p>

          <motion.div
            className="my-home"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 14 }}
          >
            MY HOME <span>🏠❤️</span>
          </motion.div>

          <p>I don't know what the future holds, baby.</p>
          <p>But I know one thing — <strong>I don't want to lose you.</strong></p>
          <p>So whenever things get difficult, whenever we fight, whenever life gets messy...</p>
          <p className="final-small">Remember that you are my baby, and I'm yours. ❤️</p>
        </motion.div>

        <motion.div
          className="home-photo-wrap"
          initial={{ opacity: 0, x: 40, rotate: 8 }}
          animate={{ opacity: 1, x: 0, rotate: -5 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <Polaroid
            src={photos[10]}
            caption="home is you ♡"
            rotation={-5}
            size="medium"
            className="home-photo"
          />
        </motion.div>
      </div>

      <NavButton onClick={onNext} label="Turn the Page →" className="next-btn" />
    </section>
  );
}

// ── PAGE 7 — LITTLE PIECES OF US ─────────────────────────────────────────────

function Page7({ onNext, onPhotoOpen }) {
  return (
    <section className="page page7">
      <div className="memories-header">
        <span className="eyebrow">OUR LITTLE ARCHIVE</span>
        <h1>Little Pieces of Us <span>📸❤️</span></h1>
      </div>

      <div className="memory-collage">
        {memories.map(({ caption, index, emoji }, i) => (
          <Polaroid
            key={caption}
            src={photos[index]}
            caption={`${emoji} ${caption}`}
            rotation={photoRotations[i]}
            className={`memory m${i + 1}`}
            size="gallery"
            onClick={() =>
              onPhotoOpen({ caption: `${emoji} ${caption}`, src: photos[index] })
            }
          />
        ))}

        <div className="collage-note">
          tiny moments.<br />big feelings.<br />
          <strong>us. ♡</strong>
        </div>
      </div>

      <NavButton onClick={onNext} label="Turn the Page →" className="next-btn" />
    </section>
  );
}

// ── PAGE 8 — FINAL LETTER ─────────────────────────────────────────────────────

function Page8({ onRestart }) {
  return (
    <section className="page page8">
      <FloatingHearts />

      <div className="final-scene">
        <motion.div
          className="final-card"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Tape className="final-tape-1" />
          <Tape className="final-tape-2" />

          <span className="eyebrow">ONE LAST THING...</span>
          <div className="final-heart" aria-hidden="true">♥</div>

          <h1>One last thing... <span>❤️</span></h1>

          <p>
            I don't know what the future holds for us, baby, and maybe we don't need
            to know everything right now.
          </p>
          <p>
            I just know that I want to keep making silly memories with you, annoying
            you, laughing with you, fighting with you, and loving you through all the
            good and bad days.
          </p>
          <p>
            Thank you for finding me, choosing me, staying with me, and becoming my
            favourite person and my safest place.
          </p>
          <p>
            From random college conversations to whatever we are today, I wouldn't
            change a single thing about our story.
          </p>
          <p>So, Happy Boyfriend's Day, my cutu penguine, my potol kumar, my baby. 🥹❤️</p>

          <motion.div
            className="forever-line"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.8, type: "spring" }}
          >
            "You're my home,<br />and I'm yours. Always."
          </motion.div>

          <div className="signature">
            Love,<br />
            <strong>Anam 🫶</strong>
          </div>

          <button className="restart-btn" onClick={onRestart}>
            ↩ Start Over ❤️
          </button>
        </motion.div>

        <div className="final-polaroids">
          <Polaroid src={photos[2]}  rotation={-9} caption="♡"         size="medium" />
          <Polaroid src={photos[11]} rotation={8}  caption="always us"  size="medium" />
        </div>
      </div>
    </section>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────

function App() {
  const [page, setPage] = useState(0);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const TOTAL = 8;

  const next    = useCallback(() => setPage((p) => Math.min(TOTAL - 1, p + 1)), []);
  const prev    = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const restart = useCallback(() => {
    setSelectedMemory(null);
    setPage(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const closeModal = useCallback(() => setSelectedMemory(null), []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (selectedMemory) {
        if (e.key === "Escape") closeModal();
        return;
      }
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedMemory, next, prev, closeModal]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const pages = [
    <Page1 key="p1" onNext={next} />,
    <Page2 key="p2" onNext={next} />,
    <Page3 key="p3" onNext={next} />,
    <Page4 key="p4" onNext={next} />,
    <Page5 key="p5" onNext={next} />,
    <Page6 key="p6" onNext={next} />,
    <Page7 key="p7" onNext={next} onPhotoOpen={setSelectedMemory} />,
    <Page8 key="p8" onRestart={restart} />,
  ];

  return (
    <main>
      {/* Top bar */}
      <div className="topbar">
        <div className="brand-mini">A little corner for Sayan ♡</div>
        <MusicControl />
      </div>

      {/* Page indicator */}
      <PageIndicator page={page} total={TOTAL} />

      {/* Page content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {pages[page]}
        </motion.div>
      </AnimatePresence>

      {/* Back navigation */}
      <div className="page-nav">
        {page > 0 && (
          <button className="nav-btn back-btn" onClick={prev}>
            ← Back
          </button>
        )}
      </div>

      {/* Photo lightbox */}
      <AnimatePresence>
        {selectedMemory && (
          <PhotoModal memory={selectedMemory} onClose={closeModal} />
        )}
      </AnimatePresence>
    </main>
  );
}

// ── MOUNT ─────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")).render(<App />);
