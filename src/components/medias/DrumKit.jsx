import React from "react";
import "./DrumKit.css";
import drum_kit from "./drum-kit.png";
import crash from "./crash.png";
import hithat_top from "./hihat-top.png";

const DrumKit = () => {
  {
    const playingClass = "drum-playing",
      crashRide = document.getElementById("crash-ride"),
      hiHatTop = document.getElementById("hihat-top");

    const animateCrashOrRide = () => {
      crashRide && (crashRide.style.transform = "rotate(0deg) scale(1.5)");
    };

    const animateHiHatClosed = () => {
      hiHatTop && (hiHatTop.style.top = "171px");
    };

    const playSound = (e) => {
      const keyCode = e.keyCode,
        keyElement = document.querySelector(`div[data-key="${keyCode}"]`);

      if (!keyElement) return;

      const audioElement = document.querySelector(
        `audio[data-key="${keyCode}"]`
      );
      audioElement.currentTime = 0;
      audioElement.play();

      switch (keyCode) {
        case 69:
        case 82:
          animateCrashOrRide();
          break;
        case 75:
          animateHiHatClosed();
          break;
      }

      keyElement.classList.add(playingClass);
    };

    const removeCrashRideTransition = (e) => {
      if (e.propertyName !== "transform") return;

      e.target.style.transform = "rotate(-7.2deg) scale(1.5)";
    };

    const removeHiHatTopTransition = (e) => {
      if (e.propertyName !== "top") return;

      e.target.style.top = "166px";
    };

    const removeKeyTransition = (e) => {
      if (e.propertyName !== "transform") return;

      e.target.classList.remove(playingClass);
    };

    const drumKeys = Array.from(document.querySelectorAll(".drum-key"));

    drumKeys.forEach((key) => {
      key.addEventListener("transitionend", removeKeyTransition);
    });

    crashRide &&
      crashRide.addEventListener("transitionend", removeCrashRideTransition);
    hiHatTop &&
      hiHatTop.addEventListener("transitionend", removeHiHatTopTransition);

    window.addEventListener("keydown", playSound);
  }

  return (
    <>
      <main>
        <section class="main-wrapper">
          <div class="drum-key-map-wrapper">
            <h2>Key Mapping</h2>
            <ul class="drum-key-map-list">
              <li>
                <kbd class="drum-key-code">E</kbd>
                <span class="drum-key-sound">Crash</span>
              </li>
              <li>
                <kbd class="drum-key-code">R</kbd>
                <span class="drum-key-sound">Ride</span>
              </li>
              <li>
                <kbd class="drum-key-code">F</kbd>
                <span class="drum-key-sound">Floor tom</span>
              </li>
              <li>
                <kbd class="drum-key-code">G</kbd>
                <span class="drum-key-sound">Mid tom</span>
              </li>
              <li>
                <kbd class="drum-key-code">H</kbd>
                <span class="drum-key-sound">High tom</span>
              </li>
              <li>
                <kbd class="drum-key-code">V</kbd>
                <kbd class="drum-key-code">B</kbd>
                <span class="drum-key-sound">Kick</span>
              </li>
              <li>
                <kbd class="drum-key-code">J</kbd>
                <span class="drum-key-sound">Snare</span>
              </li>
              <li>
                <kbd class="drum-key-code">I</kbd>
                <span class="drum-key-sound">Hi-Hat Open</span>
              </li>
              <li>
                <kbd class="drum-key-code">K</kbd>
                <span class="drum-key-sound">Hi-Hat Closed</span>
              </li>
            </ul>
          </div>
          <h1 class="main-title">Welcome to Drum Kit Class</h1>
          <div class="drum-kit-wrapper">
            <img
              id="crash-ride"
              class="crash-cymbal"
              src={crash}
              alt="Crash cymbal"
            />
            <img
              id="hihat-top"
              class="hihat-top-cymbal"
              src={hithat_top}
              alt="Hi Hat cymbal"
            />
            <div data-key="74" class="drum-key snare">
              <kbd>J</kbd>
            </div>
            <div data-key="66" class="drum-key kick">
              <kbd>B</kbd>
            </div>
            <div data-key="86" class="drum-key kick2">
              <kbd>V</kbd>
            </div>
            <div data-key="72" class="drum-key tom-high">
              <kbd>H</kbd>
            </div>
            <div data-key="71" class="drum-key tom-mid">
              <kbd>G</kbd>
            </div>
            <div data-key="70" class="drum-key tom-low">
              <kbd>F</kbd>
            </div>
            <div data-key="69" class="drum-key crash">
              <kbd>E</kbd>
            </div>
            <div data-key="82" class="drum-key ride">
              <kbd>R</kbd>
            </div>
            <div data-key="73" class="drum-key hihat-open">
              <kbd>I</kbd>
            </div>
            <div data-key="75" class="drum-key hihat-close">
              <kbd>K</kbd>
            </div>
            <img class="drum-kit" src={drum_kit} alt="Drum Kit" />
          </div>
        </section>
      </main>
      <audio
        data-key="74"
        src="https://raw.githubusercontent.com/ArunMichaelDsouza/javascript-30-course/master/src/01-javascript-drum-kit/sounds/snare.wav"
      ></audio>
      <audio
        data-key="66"
        src="https://raw.githubusercontent.com/ArunMichaelDsouza/javascript-30-course/master/src/01-javascript-drum-kit/sounds/kick.wav"
      ></audio>
      <audio
        data-key="86"
        src="https://raw.githubusercontent.com/ArunMichaelDsouza/javascript-30-course/master/src/01-javascript-drum-kit/sounds/kick.wav"
      ></audio>
      <audio
        data-key="72"
        src="https://raw.githubusercontent.com/ArunMichaelDsouza/javascript-30-course/master/src/01-javascript-drum-kit/sounds/tom-high.wav"
      ></audio>
      <audio
        data-key="71"
        src="https://raw.githubusercontent.com/ArunMichaelDsouza/javascript-30-course/master/src/01-javascript-drum-kit/sounds/tom-mid.wav"
      ></audio>
      <audio
        data-key="70"
        src="https://raw.githubusercontent.com/ArunMichaelDsouza/javascript-30-course/master/src/01-javascript-drum-kit/sounds/tom-low.wav"
      ></audio>
      <audio
        data-key="69"
        src="https://raw.githubusercontent.com/ArunMichaelDsouza/javascript-30-course/master/src/01-javascript-drum-kit/sounds/crash.wav"
      ></audio>
      <audio
        data-key="82"
        src="https://raw.githubusercontent.com/ArunMichaelDsouza/javascript-30-course/master/src/01-javascript-drum-kit/sounds/ride.wav"
      ></audio>
      <audio
        data-key="73"
        src="https://raw.githubusercontent.com/ArunMichaelDsouza/javascript-30-course/master/src/01-javascript-drum-kit/sounds/hihat-open.wav"
      ></audio>
      <audio
        data-key="75"
        src="https://raw.githubusercontent.com/ArunMichaelDsouza/javascript-30-course/master/src/01-javascript-drum-kit/sounds/hihat-close.wav"
      ></audio>
    </>
  );
};

export default DrumKit;
