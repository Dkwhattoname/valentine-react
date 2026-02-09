import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import "./App.css";

const useTypewriter = (text, speed = 50, shouldStart = true) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!shouldStart) {
      setDisplayText("");
      return;
    }

    let i = 0;
    setDisplayText(""); // Reset on text change

    const timer = setInterval(() => {
      if (i < text.length) {
        // Use substring to ensure deterministic output (avoids race conditions)
        setDisplayText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, shouldStart]);

  return displayText;
};

function App() {
  const [accepted, setAccepted] = useState(false);


  const [yesScale, setYesScale] = useState(1);
  const [noCount, setNoCount] = useState(0);
  const [resetCount, setResetCount] = useState(0);
  const isAngry = resetCount > 0 && noCount >= 8;
  const [rumbleType, setRumbleType] = useState(null);
  const [angryEmojis, setAngryEmojis] = useState([]);
  const [cardScale, setCardScale] = useState(1);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const noBtnRef = useRef(null);
  const yesBtnRef = useRef(null);
  const cardRef = useRef(null);
  const gifRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (isAngry) {
      setRumbleType("heavy");
      const timer = setTimeout(() => setRumbleType(null), 2000); // Stop after 2s
      return () => clearTimeout(timer);
    } else {
      setRumbleType(null);
      setCardScale(1);
      setIsHovered(false);
    }
  }, [isAngry]);

  // Magic Cursor Trail
  useEffect(() => {
    let lastCreated = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastCreated < 50) return; // Throttle to every 50ms
      lastCreated = now;

      const particle = document.createElement("div");
      particle.className = "cursor-particle";
      document.body.appendChild(particle);

      particle.style.left = `${e.pageX}px`;
      particle.style.top = `${e.pageY}px`;

      // Randomize slightly
      const size = Math.random() * 6 + 4;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = Math.random() > 0.5 ? "#ff4d6d" : "#ff9a9e";

      setTimeout(() => {
        particle.remove();
      }, 1000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Preload GIFs for smooth experience
  useEffect(() => {
    const images = [
      "https://media.tenor.com/AbakDm9tIkEAAAAM/white-cat-cats.gif",
      "https://media1.tenor.com/m/2Zhy-oXWJUwAAAAC/cat-angry-cat.gif",
      "https://steemitimages.com/DQmW2xebQAzsk1qM5A5HJq6qS9A1rqvgzgS6RyPtUhCQ1Qd/giphy%20(100).gif"
    ];
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const matches = useTypewriter("Will you be my Valentine? 💕", 50, isEnvelopeOpen);
  const tapText = useTypewriter("Tap to open", 100);

  const handleCardEnter = () => {
    if (isAngry) {
      setIsHovered(true);
      setCardScale((prev) => Math.min(prev + 0.05, 1.2)); // Enlarge slightly, cap at 1.2x

      // Spawn DOM emojis - Rise from bottom
      const emojis = ["😡", "👿", "😤", "🤬"];
      const newEmojis = Array.from({ length: 50 }).map((_, i) => {
        return {
          id: Date.now() + i,
          char: emojis[Math.floor(Math.random() * emojis.length)],
          left: Math.random() * 100, // Random 0-100% width
          delay: Math.random() * 2, // Stagger spawning
        };
      });
      setAngryEmojis((prev) => [...prev, ...newEmojis]);

      // Cleanup
      setTimeout(() => {
        setAngryEmojis((prev) =>
          prev.filter((e) => !newEmojis.find((ne) => ne.id === e.id))
        );
      }, 5000);
    }
  };

  const handleCardLeave = () => {
    if (isAngry) {
      setIsHovered(false);
      setCardScale(1); // Reset size
    }
  };

  const handleYesClick = () => {
    setAccepted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const resetGame = () => {
    setNoCount(0);
    setYesScale(1);
    setResetCount((prev) => prev + 1);
    setCardScale(1);
    setIsHovered(false);

    // Reset No button position
    if (noBtnRef.current) {
      noBtnRef.current.style.position = "static";
      noBtnRef.current.style.left = "auto";
      noBtnRef.current.style.top = "auto";
    }
  };

  const getNoButtonText = () => {
    if (noCount >= 5) return "Mt maan";
    if (noCount >= 3) return "sochle";
    return "No";
  };

  const moveNo = () => {
    const noBtn = noBtnRef.current;
    const card = cardRef.current;
    const yesBtn = yesBtnRef.current;
    const gifEl = gifRef.current;
    const textEl = textRef.current;

    setYesScale((prev) => Math.min(prev + 0.094, 1.75)); // Cap at 1.75
    setNoCount((prev) => prev + 1);

    if (!noBtn || !card || !yesBtn || !gifEl || !textEl) return;

    // Get basic rects
    const cardRect = card.getBoundingClientRect();
    const parentRect = noBtn.parentElement.getBoundingClientRect();

    // Approximate button size (since it might change text, we add padding)
    // "Mt maan" is wider than "No", so assume a larger width for safety
    const btnWidth = 120;
    const btnHeight = 50;

    // Elements to avoid (in absolute correlation to parent)
    // We want the new position to NOT overlap with these rects.
    // Simplifying: Just define a "Safe Zone" which is roughly the empty space.
    // OR: Retry loop with stricter collision toggles.

    // Calculate boundaries within the card
    // We want to keep it INSIDE the card.
    // minX = 0 relative to parent buttons container
    // maxX = container width - button width

    // Note: parentRect is .buttons div.
    // If we move it "absolute", it positions relative to the nearest relative ancestor.
    // If .buttons is relative, use its dims.
    // .card is also relative. Let's position relative to CARD.
    // But noBtn is child of .buttons.
    // Solution: Calculate offsets relative to .buttons, but bounded by .card.

    // Card boundaries relative to .buttons
    const minX = -20; // Allow slightly left of buttons container (padding)
    const maxX = parentRect.width - btnWidth + 20;

    // Y range is tricky. .buttons is at bottom.
    // Top of card relative to .buttons top is negative.
    const minY = -(cardRect.height - parentRect.height - 20); // Top of card (plus padding)
    const maxY = 10; // Slightly below .buttons

    let newX, newY;
    let safe = false;
    let attempts = 0;

    while (!safe && attempts < 50) {
      newX = Math.random() * (maxX - minX) + minX;
      newY = Math.random() * (maxY - minY) + minY;

      // Check collision with Yes button (which stays in .buttons)
      // Yes button is roughly at Left: 0-something in .buttons?
      // Let's get "Yes" value relative to .buttons
      // This is hard to perfect without layout thrashing.
      // Heuristic: Avoid the center-left area where Yes usually is (if we assume flow).

      // Simple Distance Check from initial center (where Yes is likely)
      const distFromCenter = Math.sqrt(Math.pow(newX - (parentRect.width / 4), 2) + Math.pow(newY - 0, 2));

      // Also avoid the GIF area (top of card)
      // GIF is at top. NewY is negative (near top).
      // If newY is very negative (top of card), check X center.
      const isOverGif = (newY < -150 && Math.abs(newX - parentRect.width / 2) < 100);

      const isOverYes = (Math.abs(newX - 20) < 100 && Math.abs(newY) < 60); // Approx yes location

      if (!isOverGif && !isOverYes) {
        safe = true;
      }
      attempts++;
    }

    noBtn.style.position = "absolute";
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;
  };

  const currentGif =
    resetCount > 0 && noCount >= 8
      ? "https://media1.tenor.com/m/2Zhy-oXWJUwAAAAC/cat-angry-cat.gif"
      : "https://media.tenor.com/AbakDm9tIkEAAAAM/white-cat-cats.gif";

  const handleNoHover = () => {
    moveNo();
    if (!isAngry) {
      setRumbleType("light");
      setTimeout(() => setRumbleType(null), 400);
    }
  };

  const handleEnvelopeClick = () => {
    setIsOpening(true);

    // 1. Wait for flap/letter animation (2.5s for slower, smoother feel)
    setTimeout(() => {
      setIsFadingOut(true);

      // 2. Wait for fade out (0.8s)
      setTimeout(() => {
        setIsEnvelopeOpen(true);
      }, 800);

    }, 2500);
  };

  if (!isEnvelopeOpen) {
    return (
      <div className={`envelope-container ${isFadingOut ? "fade-out" : ""}`} onClick={handleEnvelopeClick}>
        <div className={`envelope ${isOpening ? "open" : ""}`}>
          <div className="flap-container">
            <div className="flap"></div>
          </div>
          <div className="pocket"></div>
          <div className="side left"></div>
          <div className="side right"></div>
          <div className="letter">
            <div className="letter-text">For You 💝</div>
          </div>
          <div className="seal">💌</div>
        </div>
        <div className="tap-hint">{tapText}</div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="success">
        <div className="petals-container">
          {/* Layer 1: Continuous Rain (Infinite, starts immediately) */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`rain-${i}`}
              className="petal rain"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15 * -1}s`, // Negative delay to start mid-fall
                animationDuration: `${Math.random() * 5 + 10}s`, // 10-15s
                background: Math.random() > 0.6 ? '#ff0033' : Math.random() > 0.3 ? '#ff4d6d' : '#ff99ac',
              }}
            />
          ))}

          {/* Layer 2: Accumulating Pile (Lands and stays, starts after small delay) */}
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={`pile-${i}`}
              className="petal pile"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`, // Spread out over 20s
                animationDuration: `${Math.random() * 4 + 8}s`, // 8-12s
                background: Math.random() > 0.6 ? '#ff0033' : Math.random() > 0.3 ? '#ff4d6d' : '#ff99ac',
                '--landing-top': `${Math.random() * 15 + 83}%`, // Land between 83% and 98%
              }}
            />
          ))}
        </div>
        <div className="card" style={{ zIndex: 1 }}>
          <img
            src="https://steemitimages.com/DQmW2xebQAzsk1qM5A5HJq6qS9A1rqvgzgS6RyPtUhCQ1Qd/giphy%20(100).gif"
            alt="love gif"
            className="gif"
          />
          <h1>
            <span className="gradient-text">Yay!</span> 💖
          </h1>
          <p>
            <span className="gradient-text">You are my Valentine</span> 🥰
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${isAngry ? "angry" : ""}`}>
      {angryEmojis.map((emoji) => (
        <div
          key={emoji.id}
          className="angry-emoji"
          style={{
            left: `${emoji.left}%`,
            top: 0,
            animationDelay: `${emoji.delay}s`,
          }}
        >
          {emoji.char}
        </div>
      ))}
      <div
        className={`card ${rumbleType === "heavy"
          ? "rumble-heavy"
          : rumbleType === "light"
            ? "rumble-light"
            : ""
          }`}
        ref={cardRef}
        onMouseEnter={handleCardEnter}
        onMouseLeave={handleCardLeave}
        style={{
          transform: `scale(${cardScale})`,
          transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <img
          src={currentGif}
          alt="cute gif"
          className="gif"
          ref={gifRef}
        />

        {!(resetCount > 0 && noCount >= 8) && (
          <h2 ref={textRef} className="typewriter-text">
            {matches}
          </h2>
        )}

        <div className="buttons">
          {noCount < 8 ? (
            <>
              <button
                className="yes"
                ref={yesBtnRef}
                style={{ transform: `scale(${yesScale})` }}
                onClick={handleYesClick}
              >
                Yes
              </button>

              <button
                className="no"
                ref={noBtnRef}
                onMouseEnter={handleNoHover}
                onTouchStart={handleNoHover}
              >
                {getNoButtonText()}
              </button>
            </>
          ) : resetCount === 0 ? (
            <button className="reset" onClick={resetGame}>
              Chl second chance
            </button>
          ) : (
            <p style={{ color: "black", fontWeight: "bold" }}>
              Ja kisi aur se maan maine ni puchna ab
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
