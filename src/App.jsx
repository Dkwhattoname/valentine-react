import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import "./App.css";

function App() {
  const [accepted, setAccepted] = useState(false);
  const [gif, setGif] = useState(
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWZ6bWZxY2JwY2x2N3JrM2xwN3A5bG5mYjRmbHJ6b3h2d2Y5aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oriO0OEd9QIDdllqo/giphy.gif"
  );

  const [yesScale, setYesScale] = useState(1);
  const [noCount, setNoCount] = useState(0);
  const [resetCount, setResetCount] = useState(0);

  const noBtnRef = useRef(null);
  const yesBtnRef = useRef(null);
  const cardRef = useRef(null);
  const gifRef = useRef(null);
  const textRef = useRef(null);

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

    // Reset No button position
    if (noBtnRef.current) {
      noBtnRef.current.style.position = 'static';
      noBtnRef.current.style.left = 'auto';
      noBtnRef.current.style.top = 'auto';
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

    setYesScale((prev) => Math.min(prev + 0.094, 1.75)); // Cap at 1.75 (approx 8 hovers)
    setNoCount((prev) => prev + 1);

    if (!noBtn || !card || !yesBtn || !gifEl || !textEl) return;

    // Get dimensions
    const cardRect = card.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const parentRect = noBtn.parentElement.getBoundingClientRect();

    // Elements to avoid
    const obstacles = [
      yesBtn.getBoundingClientRect(),
      gifEl.getBoundingClientRect(),
      textEl.getBoundingClientRect(),
    ];

    // Calculate available space relative to the button's parent (.buttons div)
    const minX = cardRect.left - parentRect.left + 20;
    const maxX = cardRect.right - parentRect.left - btnRect.width - 20;
    const minY = cardRect.top - parentRect.top + 20;
    const maxY = cardRect.bottom - parentRect.top - btnRect.height - 20;

    let newX, newY;
    let safe = false;
    let attempts = 0;

    // Try to find a safe spot
    while (!safe && attempts < 50) {
      newX = Math.random() * (maxX - minX) + minX;
      newY = Math.random() * (maxY - minY) + minY;

      // Calculate the absolute position of the potential new button spot for collision check
      const absoluteLeft = parentRect.left + newX;
      const absoluteTop = parentRect.top + newY;

      const potentialRect = {
        left: absoluteLeft,
        top: absoluteTop,
        right: absoluteLeft + btnRect.width,
        bottom: absoluteTop + btnRect.height,
      };

      // Check collision with all obstacles
      const isOverlapping = obstacles.some((obs) => {
        return (
          potentialRect.left < obs.right + 10 && // +10 buffer
          potentialRect.right > obs.left - 10 &&
          potentialRect.top < obs.bottom + 10 &&
          potentialRect.bottom > obs.top - 10
        );
      });

      if (!isOverlapping) {
        safe = true;
      }
      attempts++;
    }

    // Apply position
    noBtn.style.position = "absolute";
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;

    setGif("https://media.giphy.com/media/g3y7Ojdct0aozW7M6x/giphy.gif");
  };


  if (accepted) {
    return (
      <div className="success">
        <div className="card">
          <img
            src="https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif"
            alt="love gif"
            className="gif"
          />
          <h1><span className="gradient-text">Yay!</span> 💖</h1>
          <p><span className="gradient-text">You are my Valentine</span> 🥰</p>
        </div>
      </div>
    );
  }

  const currentGif = resetCount > 0 && noCount >= 8
    ? "https://media1.tenor.com/m/2Zhy-oXWJUwAAAAC/cat-angry-cat.gif"
    : gif;

  const isAngry = resetCount > 0 && noCount >= 8;

  return (
    <div className={`container ${isAngry ? "angry" : ""}`}>
      <div className="card" ref={cardRef}>
        <img src={currentGif} alt="cute gif" className="gif" ref={gifRef} />

        {!(resetCount > 0 && noCount >= 8) && (
          <h2 ref={textRef}>Will you be my Valentine? 💕</h2>
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
                onMouseEnter={moveNo}
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
