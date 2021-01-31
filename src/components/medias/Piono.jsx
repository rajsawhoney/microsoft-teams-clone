import React from "react";
import pa040 from "./PionoAudio/pa040.wav";
import pa041 from "./PionoAudio/pa041.wav";
import pa042 from "./PionoAudio/pa042.wav";
import pa043 from "./PionoAudio/pa043.wav";
import pa044 from "./PionoAudio/pa044.wav";
import pa045 from "./PionoAudio/pa045.wav";
import pa046 from "./PionoAudio/pa046.wav";
import pa047 from "./PionoAudio/pa047.wav";
import pa048 from "./PionoAudio/pa048.wav";
import pa049 from "./PionoAudio/pa049.wav";
import pa050 from "./PionoAudio/pa050.wav";
import pa051 from "./PionoAudio/pa051.wav";
import pa052 from "./PionoAudio/pa052.wav";
import pa053 from "./PionoAudio/pa053.wav";
import pa054 from "./PionoAudio/pa054.wav";
import pa055 from "./PionoAudio/pa055.wav";
import pa056 from "./PionoAudio/pa056.wav";
import "./Piono.css";

const Piono = () => {
  const keys = document.querySelectorAll(".key"),
    note = document.querySelector(".nowplaying"),
    hints = document.querySelectorAll(".hints");

  function playNote(e) {
    const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`),
      key = document.querySelector(`.key[data-key="${e.keyCode}"]`);

    if (!key) return;

    const keyNote = key.getAttribute("data-note");

    key.classList.add("playing");
    if (note) {
      note.innerHTML = keyNote;
    }
    audio.currentTime = 0;
    audio.play();
  }

  function removeTransition(e) {
    if (e.propertyName !== "transform") return;
    this.classList.remove("playing");
  }

  function hintsOn(e, index) {
    e.setAttribute("style", "transition-delay:" + index * 50 + "ms");
  }

  hints.forEach(hintsOn);

  keys.forEach((key) =>
    key.addEventListener("transitionend", removeTransition)
  );

  window.addEventListener("keydown", playNote);

  return (
    <>
      <section className="piono__main__section" id="wrap">
        <div className="piono__header">
          <h1>Welcome To Piano Class</h1>
          <p>Try our Piono and Refresh yourself</p>
          <h2>Use your keyboard or Hover for hints.</h2>
        </div>
        <section id="main">
          <div class="nowplaying"></div>
          <div class="keys">
            <div data-key="65" class="key" data-note="C">
              <span class="hints">A</span>
            </div>
            <div data-key="87" class="key sharp" data-note="C#">
              <span class="hints">W</span>
            </div>
            <div data-key="83" class="key" data-note="D">
              <span class="hints">S</span>
            </div>
            <div data-key="69" class="key sharp" data-note="D#">
              <span class="hints">E</span>
            </div>
            <div data-key="68" class="key" data-note="E">
              <span class="hints">D</span>
            </div>
            <div data-key="70" class="key" data-note="F">
              <span class="hints">F</span>
            </div>
            <div data-key="84" class="key sharp" data-note="F#">
              <span class="hints">T</span>
            </div>
            <div data-key="71" class="key" data-note="G">
              <span class="hints">G</span>
            </div>
            <div data-key="89" class="key sharp" data-note="G#">
              <span class="hints">Y</span>
            </div>
            <div data-key="72" class="key" data-note="A">
              <span class="hints">H</span>
            </div>
            <div data-key="85" class="key sharp" data-note="A#">
              <span class="hints">U</span>
            </div>
            <div data-key="74" class="key" data-note="B">
              <span class="hints">J</span>
            </div>
            <div data-key="75" class="key" data-note="C">
              <span class="hints">K</span>
            </div>
            <div data-key="79" class="key sharp" data-note="C#">
              <span class="hints">O</span>
            </div>
            <div data-key="76" class="key" data-note="D">
              <span class="hints">L</span>
            </div>
            <div data-key="80" class="key sharp" data-note="D#">
              <span class="hints">P</span>
            </div>
            <div data-key="186" class="key" data-note="E">
              <span class="hints">;</span>
            </div>
          </div>

          <audio data-key="65" src={pa040}></audio>
          <audio data-key="87" src={pa041}></audio>
          <audio data-key="83" src={pa042}></audio>
          <audio data-key="69" src={pa043}></audio>
          <audio data-key="68" src={pa044}></audio>
          <audio data-key="70" src={pa045}></audio>
          <audio data-key="84" src={pa046}></audio>
          <audio data-key="71" src={pa047}></audio>
          <audio data-key="89" src={pa048}></audio>
          <audio data-key="72" src={pa049}></audio>
          <audio data-key="85" src={pa050}></audio>
          <audio data-key="74" src={pa051}></audio>
          <audio data-key="75" src={pa052}></audio>
          <audio data-key="79" src={pa053}></audio>
          <audio data-key="76" src={pa054}></audio>
          <audio data-key="80" src={pa055}></audio>
          <audio data-key="186" src={pa056}></audio>
        </section>
      </section>
      <video
        playsinline
        autoplay
        muted
        loop
        id="bgvid"
        poster="http://carolinegabriel.com/demo/js-keyboard/video/bg.jpg"
      >
        <source
          src="http://carolinegabriel.com/demo/js-keyboard/video/bg.mp4"
          type="video/mp4"
        />
      </video>
    </>
  );
};

export default Piono;
