<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getMovieTitleURL, movieTitleToFileName } from '@/constants/api'
import { ref, onMounted, nextTick, watch } from 'vue'

const route = useRoute()
const videoRef = ref<HTMLVideoElement | null>(null)
const hasSpanishSubtitles = ref(false)
type SubtitleSelection = 'off' | 'en' | 'es'
const subtitleSelection = ref<SubtitleSelection>('en')

const title = route.query.title as string
const releaseYear = Number(route.query.releaseYear)

const checkSpanishSubtitlesAvailable = async () => {
  if (!title) return

  const spanishVttUrl = `${getMovieTitleURL(title)}/${movieTitleToFileName(title)}_es.vtt`

  try {
    const headRes = await fetch(spanishVttUrl, { method: 'HEAD' })
    if (headRes.ok) {
      hasSpanishSubtitles.value = true
      return
    }

    // Some hosts don't support HEAD; fall back to a small GET.
    if (headRes.status === 405 || headRes.status === 501) {
      const getRes = await fetch(spanishVttUrl, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
      })
      hasSpanishSubtitles.value = getRes.ok
    }
  } catch {
    hasSpanishSubtitles.value = false
  }
}

const applySubtitleSelection = () => {
  const video = videoRef.value
  if (!video) return

  const tracks = video.textTracks
  if (!tracks || tracks.length === 0) return

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    const lang = (track.language || '').toLowerCase()
    const label = (track.label || '').toLowerCase()

    const isEnglish = lang === 'en' || label.includes('english')
    const isSpanish = lang === 'es' || label.includes('spanish')

    if (subtitleSelection.value === 'off') {
      track.mode = 'disabled'
      continue
    }

    if (subtitleSelection.value === 'en') {
      track.mode = isEnglish ? 'showing' : 'disabled'
      continue
    }

    // 'es'
    track.mode = isSpanish ? 'showing' : 'disabled'
  }
}

const ensureSubtitleSelectionApplied = async () => {
  // Text tracks can populate asynchronously; retry briefly.
  for (let i = 0; i < 20; i++) {
    applySubtitleSelection()
    const tracks = videoRef.value?.textTracks
    if (tracks && tracks.length > 0) return
    await new Promise((r) => setTimeout(r, 100))
  }
}

const handleVideoPlay = () => {
  if (videoRef.value) {
    // Try to enter fullscreen when video starts playing
    const video = videoRef.value as HTMLVideoElement & {
      webkitRequestFullscreen?: () => void
      mozRequestFullScreen?: () => void
      msRequestFullscreen?: () => void
    }

    if (video.requestFullscreen) {
      video.requestFullscreen().catch((err) => {
        console.log('Fullscreen request failed:', err)
      })
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen()
    } else if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen()
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen()
    }
  }
}

onMounted(async () => {
  await checkSpanishSubtitlesAvailable()
  await nextTick()
  ensureSubtitleSelectionApplied()

  // Also try to go fullscreen when the component mounts
  setTimeout(() => {
    if (videoRef.value) {
      const video = videoRef.value
      ensureSubtitleSelectionApplied()
      video
        .play()
        .then(() => {
          handleVideoPlay()
        })
        .catch((err) => {
          console.log('Autoplay failed:', err)
        })
    }
  }, 100)
})

watch(hasSpanishSubtitles, async () => {
  await nextTick()
  applySubtitleSelection()
})

watch(subtitleSelection, async (newVal) => {
  if (newVal === 'es' && !hasSpanishSubtitles.value) {
    subtitleSelection.value = 'en'
    return
  }
  await nextTick()
  applySubtitleSelection()
})
</script>
<template>
  <div class="px-4 py-8">
    <h1 class="movie-title text-white">{{ title }} ({{ releaseYear }})</h1>
    <div class="video-container">
      <div class="max-w-5xl mx-auto mb-2 flex items-center justify-end gap-2">
        <label for="subtitleSelect" class="text-gray-200 text-sm">Subtitles</label>
        <select
          id="subtitleSelect"
          v-model="subtitleSelection"
          class="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm"
        >
          <option value="off">Off</option>
          <option value="en">English</option>
          <option v-if="hasSpanishSubtitles" value="es">Spanish</option>
        </select>
      </div>
      <video
        ref="videoRef"
        :src="`${getMovieTitleURL(title)}/${movieTitleToFileName(title)}.mkv`"
        @error="
          ($event.target as HTMLVideoElement).src =
            `${getMovieTitleURL(title)}/${movieTitleToFileName(title)}.mp4`
        "
        @loadedmetadata="ensureSubtitleSelectionApplied"
        @play="handleVideoPlay"
        controlsList="nodownload"
        controls
        autoplay
        class="w-full max-w-5xl mx-auto rounded-lg shadow-2xl"
        crossOrigin="anonymous"
      >
        <track
          v-if="title"
          :src="`${getMovieTitleURL(title)}/${movieTitleToFileName(title)}.vtt`"
          label="English"
          srclang="en"
          kind="subtitles"
        />
        <track
          v-if="hasSpanishSubtitles"
          :src="`${getMovieTitleURL(title)}/${movieTitleToFileName(title)}_es.vtt`"
          label="Spanish"
          srclang="es"
          kind="subtitles"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</template>

<style scoped>
.movie-title {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
