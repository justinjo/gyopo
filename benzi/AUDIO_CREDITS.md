# Pronunciation audio

The 100 pronunciation clips in `public/audio/*.m4a` are synthesized Mandarin speech, generated locally from the vocabulary text using **Kokoro-82M-v1.1-zh**, voice **zf_001**, at speed 0.85. They are not human recordings. No speech service is contacted during playback.

- Model and voice: [hexgrad/Kokoro-82M-v1.1-zh](https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh), licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
- Generation code: [hexgrad/kokoro](https://github.com/hexgrad/kokoro), Apache 2.0.
- Mandarin text processing: [hexgrad/misaki](https://github.com/hexgrad/misaki), Apache 2.0.
- Model training data acknowledgments: see the original model card, including its credit to LongMaoData.

The generated clips are distributed under Apache 2.0; a copy is included at [public/audio/LICENSE](public/audio/LICENSE). The model weights and Python dependencies are not shipped with the website.

To regenerate, install `scripts/audio-requirements.txt` in a Python 3.12 environment, install FFmpeg, then run `python scripts/generate-pronunciations.py`. The first run downloads the model. Model, voice, input text, phonemes, duration, and each clip’s SHA-256 checksum are recorded in [public/audio/sources.json](public/audio/sources.json).

All clips are cached by the service worker for offline playback after the app is loaded and its offline cache is ready.
