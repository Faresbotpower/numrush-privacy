import { Audio } from 'expo-av';

let correctSound: Audio.Sound | null = null;
let wrongSound: Audio.Sound | null = null;
let tapSound: Audio.Sound | null = null;

export async function loadSounds() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    const [c, w, t] = await Promise.all([
      Audio.Sound.createAsync(require('../../assets/sounds/correct.wav')),
      Audio.Sound.createAsync(require('../../assets/sounds/wrong.wav')),
      Audio.Sound.createAsync(require('../../assets/sounds/tap.wav')),
    ]);
    correctSound = c.sound;
    wrongSound = w.sound;
    tapSound = t.sound;
  } catch {
    // Sounds are optional — fail silently
  }
}

export async function playCorrect() {
  try {
    if (correctSound) {
      await correctSound.setPositionAsync(0);
      await correctSound.playAsync();
    }
  } catch {}
}

export async function playWrong() {
  try {
    if (wrongSound) {
      await wrongSound.setPositionAsync(0);
      await wrongSound.playAsync();
    }
  } catch {}
}

export async function playTap() {
  try {
    if (tapSound) {
      await tapSound.setPositionAsync(0);
      await tapSound.playAsync();
    }
  } catch {}
}

export async function unloadSounds() {
  try {
    await correctSound?.unloadAsync();
    await wrongSound?.unloadAsync();
    await tapSound?.unloadAsync();
  } catch {}
  correctSound = null;
  wrongSound = null;
  tapSound = null;
}
