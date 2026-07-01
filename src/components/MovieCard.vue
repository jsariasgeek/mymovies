<template>
  <div
    class="group relative bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 hover:scale-[1.03] transform cursor-pointer border border-gray-700 w-full aspect-[1500/2222]"
    @click="navigateToMovie"
    tabindex="0"
    role="button"
    @keydown.enter.prevent="navigateToMovie"
    @keydown.space.prevent="navigateToMovie"
  >
    <div
      v-if="!posterLoaded"
      class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-gray-700"
      aria-hidden="true"
    >
      <img
        class="w-14 h-14 object-contain opacity-90"
        :src="posterLoaderUrl"
        alt=""
      />
    </div>
    <img
      class="pointer-events-none select-none absolute inset-0 z-0 w-full h-full object-cover transition-opacity duration-300"
      :class="posterLoaded ? 'opacity-100' : 'opacity-0'"
      :src="posterSrc"
      :alt="movie.title"
      loading="lazy"
      decoding="async"
      @load="onPosterLoad"
      @error="handlePosterError"
    />
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-4 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0"
    >
      <h2 class="text-lg font-semibold text-white leading-snug drop-shadow">
        {{ movie.title }}
      </h2>
      <p class="text-gray-200 text-xs mt-1 drop-shadow">
        {{ movie.releaseYear }} • {{ formatGenre(movie.genre) }} •
        {{ movie.movieDuration }}
      </p>
      <div class="mt-3 flex items-center justify-between gap-2">
        <span class="text-yellow-300 text-sm drop-shadow">
          {{ '★'.repeat(movie.rating) }}{{ '☆'.repeat(5 - movie.rating) }}
        </span>
        <div
          class="flex flex-wrap items-center justify-end gap-1.5 shrink-0 pointer-events-auto"
          @click.stop
        >
          <button
            type="button"
            class="bg-green-600/95 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
            @click="navigateToMovie"
          >
            Watch Now
          </button>
          <template v-if="showAdminActions">
            <button
              type="button"
              class="bg-amber-600/95 hover:bg-amber-700 text-white px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
              @click="emit('admin-edit', movie)"
            >
              Edit
            </button>
            <button
              type="button"
              class="bg-red-600/95 hover:bg-red-700 text-white px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
              @click="emit('admin-delete', movie)"
            >
              Delete
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getMovieTitleURL, movieTitleToFileName } from '@/constants/api'
import type { Movie } from '@/types/movie'
import posterLoaderUrl from '@/assets/poster-loader.gif'

const props = defineProps<{
  movie: Movie
  showAdminActions?: boolean
}>()

const emit = defineEmits<{
  'admin-edit': [movie: Movie]
  'admin-delete': [movie: Movie]
}>()

const formatGenre = (genre: string) =>
  genre
    .split('/')
    .map((segment) =>
      segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-'),
    )
    .join('/')

const getJpgPosterUrl = () =>
  `${getMovieTitleURL(props.movie.title)}/${movieTitleToFileName(props.movie.title)}.jpg`
const getJpegPosterUrl = () =>
  `${getMovieTitleURL(props.movie.title)}/${movieTitleToFileName(props.movie.title)}.jpeg`

const posterSrc = ref(getJpgPosterUrl())
const posterLoaded = ref(false)

watch(posterSrc, () => {
  posterLoaded.value = false
})

watch(
  () => props.movie.title,
  () => {
    posterSrc.value = getJpgPosterUrl()
  },
)

const onPosterLoad = () => {
  posterLoaded.value = true
}

const handlePosterError = () => {
  if (posterSrc.value.endsWith('.jpg')) {
    posterSrc.value = getJpegPosterUrl()
  } else {
    posterLoaded.value = true
  }
}

const router = useRouter()

const navigateToMovie = () => {
  router.push({
    path: `/movie/${props.movie.id}`,
    query: {
      title: props.movie.title,
      releaseYear: props.movie.releaseYear,
    },
  })
}
</script>
