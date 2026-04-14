const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(ASSETS, { recursive: true });

function generateWav(frequency, duration, volume, fadeOut = true) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = fadeOut
      ? Math.max(0, 1 - (i / numSamples) * 1.5)
      : 1;
    const sample = Math.sin(2 * Math.PI * frequency * t) * volume * envelope;
    const val = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.floor(val * 32767), 44 + i * 2);
  }

  return buffer;
}

function generateCorrectSound() {
  // Two quick ascending notes (like a "ding-ding")
  const sampleRate = 44100;
  const duration = 0.25;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;
    // First note 880Hz, second note 1108Hz (major third up)
    const freq = progress < 0.45 ? 880 : 1108;
    const localProgress = progress < 0.45
      ? progress / 0.45
      : (progress - 0.45) / 0.55;
    const envelope = Math.max(0, 1 - localProgress * 1.2);
    const sample = Math.sin(2 * Math.PI * freq * t) * 0.4 * envelope;
    buffer.writeInt16LE(Math.floor(Math.max(-1, Math.min(1, sample)) * 32767), 44 + i * 2);
  }

  return buffer;
}

function generateWrongSound() {
  // Low buzz (descending)
  const sampleRate = 44100;
  const duration = 0.3;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;
    // Descend from 330Hz to 220Hz
    const freq = 330 - progress * 110;
    const envelope = Math.max(0, 1 - progress * 1.3);
    // Add slight distortion for "buzzy" feel
    const raw = Math.sin(2 * Math.PI * freq * t);
    const sample = (raw + 0.3 * Math.sin(2 * Math.PI * freq * 2 * t)) * 0.35 * envelope;
    buffer.writeInt16LE(Math.floor(Math.max(-1, Math.min(1, sample)) * 32767), 44 + i * 2);
  }

  return buffer;
}

function generateTapSound() {
  // Soft click
  return generateWav(1200, 0.05, 0.2, true);
}

// Generate all sounds
fs.writeFileSync(path.join(ASSETS, 'correct.wav'), generateCorrectSound());
console.log('✓ correct.wav');

fs.writeFileSync(path.join(ASSETS, 'wrong.wav'), generateWrongSound());
console.log('✓ wrong.wav');

fs.writeFileSync(path.join(ASSETS, 'tap.wav'), generateTapSound());
console.log('✓ tap.wav');

console.log('\nDone! Sounds in assets/sounds/');
