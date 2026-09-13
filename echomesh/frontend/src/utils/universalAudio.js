import BenzAMRRecorder from 'benz-amr-recorder';

let activeNativeAudio = null;
let activeAmrAudio = null;

/**
 * Check if the given audio source is in AMR format
 */
export function isAmrFormat(src) {
  if (!src) return false;
  if (typeof src === 'string') {
    if (src.startsWith('data:audio/amr') || src.startsWith('data:audio/3gpp') || src.includes('audio/amr')) {
      return true;
    }
    // Check base64 magic bytes for #!AMR\n ("IyFBTVI")
    if (src.includes('base64,IyFBTVI')) {
      return true;
    }
  }
  return false;
}

/**
 * Stop any active audio clip playback (both native and AMR)
 */
export function stopAudioClip() {
  if (activeNativeAudio) {
    try {
      activeNativeAudio.pause();
      activeNativeAudio.currentTime = 0;
    } catch (e) {}
    activeNativeAudio = null;
  }
  if (activeAmrAudio) {
    try {
      activeAmrAudio.stop();
    } catch (e) {}
    activeAmrAudio = null;
  }
}

/**
 * Universal Audio Player that seamlessly plays standard audio (MP3, WAV, OGG, WebM)
 * AND AMR format (from Android voice capture) via Web Audio API.
 *
 * @param {string|Blob} audioSource Base64 data URL, blob, or audio URL
 * @param {Object} options Callbacks { onStart, onEnd, onError }
 * @returns {Promise<Object>} controller { stop, isPlaying }
 */
export async function playAudioClip(audioSource, { onStart, onEnd, onError } = {}) {
  stopAudioClip();

  if (!audioSource) {
    onError && onError(new Error('No audio source provided'));
    return null;
  }

  // Handle AMR format using BenzAMRRecorder (Web Audio API decoder)
  if (isAmrFormat(audioSource)) {
    try {
      const amr = new BenzAMRRecorder();
      activeAmrAudio = amr;

      if (audioSource instanceof Blob) {
        await amr.initWithBlob(audioSource);
      } else {
        await amr.initWithUrl(audioSource);
      }

      amr.onPlay(() => {
        onStart && onStart();
      });

      amr.onEnded(() => {
        activeAmrAudio = null;
        onEnd && onEnd();
      });

      amr.onStop(() => {
        activeAmrAudio = null;
        onEnd && onEnd();
      });

      amr.play();

      return {
        stop: () => {
          try { amr.stop(); } catch (e) {}
          activeAmrAudio = null;
        },
        isPlaying: () => amr.isPlaying()
      };
    } catch (err) {
      console.warn('[UniversalAudio] AMR playback error, attempting fallback:', err);
      activeAmrAudio = null;
      // Fallback to native Audio below
    }
  }

  // Handle standard audio (WAV, MP3, WebM, OGG, etc.)
  try {
    const srcUrl = (audioSource instanceof Blob) ? URL.createObjectURL(audioSource) : audioSource;
    const audio = new Audio(srcUrl);
    activeNativeAudio = audio;

    audio.onended = () => {
      activeNativeAudio = null;
      if (audioSource instanceof Blob) URL.revokeObjectURL(srcUrl);
      onEnd && onEnd();
    };

    audio.onerror = (e) => {
      activeNativeAudio = null;
      if (audioSource instanceof Blob) URL.revokeObjectURL(srcUrl);
      onError && onError(e);
    };

    onStart && onStart();
    await audio.play();

    return {
      stop: () => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {}
        activeNativeAudio = null;
      },
      isPlaying: () => !audio.paused && !audio.ended
    };
  } catch (err) {
    console.error('[UniversalAudio] Native playback failed:', err);
    activeNativeAudio = null;
    onError && onError(err);
    return null;
  }
}

/**
 * Convert an AMR Blob or Base64 into a universal standard WAV Data URL.
 * Every browser and HTML5 <audio> tag can play WAV natively!
 */
export async function convertAmrToWavDataUrl(blobOrUrl) {
  try {
    const amr = new BenzAMRRecorder();
    if (blobOrUrl instanceof Blob) {
      await amr.initWithBlob(blobOrUrl);
    } else {
      await amr.initWithUrl(blobOrUrl);
    }
    const wavBlob = amr.getBlobWithWav();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(wavBlob);
    });
  } catch (err) {
    console.warn('[UniversalAudio] Could not convert AMR to WAV:', err.message);
    // If conversion fails, return the original url/blob
    if (typeof blobOrUrl === 'string') return blobOrUrl;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blobOrUrl);
    });
  }
}
