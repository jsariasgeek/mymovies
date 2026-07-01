<script setup lang="ts">
import MovieCard from '@/components/MovieCard.vue'
import { onMounted, ref, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { UserManager, type User } from 'oidc-client-ts'
import { API_ENDPOINTS, getMovieUpdateURL, getMovieDeleteURL } from '@/constants/api'
import type { Movie } from '@/types/movie'
import { genresMapping } from '@/types/movie'

/** Claims from Cognito ID token — same admin rule as GetUser `UserAttributes`. */
function claimsAsUserAttributes(
  payload: Record<string, unknown> | null,
): { Name: string; Value: string }[] {
  if (!payload) return []
  return Object.entries(payload).map(([Name, Value]) => ({
    Name,
    Value: Value == null ? '' : String(Value),
  }))
}

function parseIdTokenPayload(idToken: string | undefined): Record<string, unknown> | null {
  if (!idToken) return null
  try {
    const part = idToken.split('.')[1]
    if (!part) return null
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function computeIsAdmin(user: User | null): boolean {
  if (!user?.id_token) return false
  const payload = parseIdTokenPayload(user.id_token)
  const cognitoUser = { UserAttributes: claimsAsUserAttributes(payload) }
  return (
    cognitoUser.UserAttributes.find((attr) => attr.Name === 'custom:isAdmin')?.Value === 'true'
  )
}

const cognitoAuthConfig = {
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_8FoMklAQ7',
  client_id: '1oes8qqk19pp8ibpbj1lcivj0j',
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  response_type: 'code',
  scope: 'aws.cognito.signin.user.admin email openid phone profile',
}

const userManager = new UserManager({
  ...cognitoAuthConfig,
})

const oidcUser = ref<User | null>(null)
const isAuthenticated = computed(() => oidcUser.value != null && !oidcUser.value.expired)
const isAdmin = computed(() => isAuthenticated.value && computeIsAdmin(oidcUser.value))

// state
const movies = ref<Movie[]>([])
const nextToken = ref<string | null>(null)
const isLoading = ref(false)
const route = useRoute()
const isSearching = ref(false)

const selectedMovie = ref<Movie | null>(null)
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const searchQuery = computed(() => ((route.query.q as string) || '').toLowerCase())
const filteredMovies = computed(() => {
  const q = searchQuery.value.trim()
  if (q) return movies.value  // already filtered server-side
  return movies.value.filter((movie) => movie.isHidden !== true)
})

const resolveOidcUser = async () => {
  let u = await userManager.getUser()
  if (u?.expired) {
    try {
      u = await userManager.signinSilent()
    } catch {
      u = null
    }
  }
  oidcUser.value = u
}

const searchMovies = async (q: string) => {
  isLoading.value = true
  isSearching.value = true
  try {
    const url = new URL(API_ENDPOINTS.MOVIES)
    url.searchParams.set('q', q)
    const response = await fetch(url.toString())
    const data = await response.json()
    movies.value = data.items
    nextToken.value = null
  } catch (e) {
    console.error('Search failed', e)
  } finally {
    isLoading.value = false
    isSearching.value = false
  }
}

const fetchMovies = async (isLoadMore = false) => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const url = new URL(API_ENDPOINTS.MOVIES)
    if (isLoadMore && nextToken.value) {
      url.searchParams.append('nextToken', nextToken.value)
    }

    const response = await fetch(url.toString())
    const data = await response.json()

    if (isLoadMore) {
      movies.value = [...movies.value, ...data.items]
    } else {
      movies.value = data.items
    }
    nextToken.value = data.nextToken
  } catch (error) {
    console.error('Error fetching movies:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshMovieList = async () => {
  const q = searchQuery.value.trim()
  if (q) {
    await searchMovies(q)
  } else {
    nextToken.value = null
    await fetchMovies(false)
  }
}

const openEditModal = (movie: Movie) => {
  selectedMovie.value = { ...movie }
  isModalOpen.value = true
}

const closeModal = () => {
  selectedMovie.value = null
  isModalOpen.value = false
  void refreshMovieList()
}

const openDeleteModal = (movie: Movie) => {
  selectedMovie.value = movie
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  selectedMovie.value = null
  isDeleteModalOpen.value = false
}

const updateMovie = async () => {
  if (!selectedMovie.value) return
  let u = oidcUser.value
  if (!u || u.expired) {
    await resolveOidcUser()
    u = oidcUser.value
  }
  if (!u?.access_token) {
    console.error('User is not logged in')
    await userManager.signinRedirect()
    return
  }

  try {
    const response = await fetch(getMovieUpdateURL(selectedMovie.value.id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${u.access_token}`,
      },
      body: JSON.stringify(selectedMovie.value),
    })

    if (response.status !== 200) throw new Error('Failed to update movie')
    closeModal()
  } catch (error) {
    console.error('Error updating movie:', error)
  }
}

const deleteMovie = async (movie: Movie) => {
  let u = oidcUser.value
  if (!u || u.expired) {
    await resolveOidcUser()
    u = oidcUser.value
  }
  if (!u?.access_token) {
    console.error('User is not logged in')
    await userManager.signinRedirect()
    return
  }

  try {
    const response = await fetch(getMovieDeleteURL(movie.id), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${u.access_token}`,
      },
    })
    if (response.status !== 200) throw new Error('Failed to delete movie')
    closeDeleteModal()
    await refreshMovieList()
  } catch (error) {
    console.error('Error deleting movie:', error)
  }
}

const handleScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY
  const documentHeight = document.documentElement.scrollHeight

  if (scrollPosition >= documentHeight - 100 && !isLoading.value && nextToken.value) {
    fetchMovies(true)
  }
}

onMounted(async () => {
  await resolveOidcUser()
  const q = searchQuery.value.trim()
  if (q) {
    window.removeEventListener('scroll', handleScroll)
    await searchMovies(q)
  } else {
    await fetchMovies()
    window.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(
  () => route.query.q,
  async (newQ) => {
    const q = ((newQ as string) || '').trim()
    if (q) {
      window.removeEventListener('scroll', handleScroll)
      await searchMovies(q)
    } else {
      isSearching.value = false
      await fetchMovies()
      window.addEventListener('scroll', handleScroll)
    }
  },
)
</script>

<template>
  <div class="w-full px-4 py-8">
    <!-- Edit modal (admin, from home) -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-700">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-semibold text-white">Edit Movie</h3>
          <button type="button" @click="closeModal" class="text-gray-400 hover:text-gray-300">
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form v-if="selectedMovie" @submit.prevent="updateMovie">
          <div class="mb-4">
            <label for="home-edit-title" class="block text-sm font-medium text-gray-300 mb-2"
              >Title</label
            >
            <input
              id="home-edit-title"
              v-model="selectedMovie.title"
              type="text"
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div class="mb-4">
            <label for="home-edit-year" class="block text-sm font-medium text-gray-300 mb-2"
              >Year</label
            >
            <input
              id="home-edit-year"
              v-model="selectedMovie.releaseYear"
              type="text"
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div class="mb-4">
            <label for="home-edit-genre" class="block text-sm font-medium text-gray-300 mb-2"
              >Genre</label
            >
            <select
              id="home-edit-genre"
              v-model="selectedMovie.genre"
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="">Select a genre</option>
              <option v-for="g in Object.keys(genresMapping)" :key="g" :value="g">
                {{ genresMapping[g as keyof typeof genresMapping] }}
              </option>
            </select>
          </div>
          <div class="mb-6">
            <label for="home-edit-rating" class="block text-sm font-medium text-gray-300 mb-2"
              >Rating</label
            >
            <input
              id="home-edit-rating"
              v-model.number="selectedMovie.rating"
              type="number"
              min="1"
              max="5"
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div class="mb-6">
            <label for="home-edit-duration" class="block text-sm font-medium text-gray-300 mb-2"
              >Duration</label
            >
            <input
              id="home-edit-duration"
              v-model="selectedMovie.movieDuration"
              type="text"
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div class="mb-6">
            <label class="flex items-center cursor-pointer">
              <div
                class="relative inline-block w-10 h-6 transition-colors duration-200 ease-in-out rounded-full bg-gray-600"
                :class="{ 'bg-green-600': selectedMovie.isHidden }"
                @click.prevent="selectedMovie.isHidden = !selectedMovie.isHidden"
              >
                <div
                  class="absolute w-4 h-4 transition-transform duration-200 ease-in-out transform bg-white rounded-full top-1 left-1"
                  :class="{ 'translate-x-4': selectedMovie.isHidden }"
                ></div>
              </div>
              <span class="ml-2 text-sm font-medium text-gray-300">Hide movie from public view</span>
            </label>
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete modal -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-700">
        <h3 class="text-xl font-semibold text-white mb-4">Delete Movie</h3>
        <p class="text-gray-300 mb-6">Are you sure you want to delete this movie?</p>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="closeDeleteModal"
            class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="selectedMovie && deleteMovie(selectedMovie)"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-6">
      <div
        v-if="(isLoading || isSearching) && !movies.length"
        class="col-span-full flex justify-center items-center py-12"
      >
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
          ></div>
          <p class="text-gray-300">Loading movies...</p>
        </div>
      </div>
      <div
        v-else-if="searchQuery && !isLoading && !movies.length"
        class="col-span-full flex justify-center items-center py-12"
      >
        <div class="text-center text-gray-300 text-2xl md:text-3xl font-semibold">No results</div>
      </div>
      <MovieCard
        v-for="movie in filteredMovies"
        :key="movie.id"
        :movie="movie"
        :show-admin-actions="isAdmin"
        @admin-edit="openEditModal"
        @admin-delete="openDeleteModal"
      />
    </div>
  </div>
</template>
