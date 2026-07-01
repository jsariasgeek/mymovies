<template>
  <div class="container mx-auto px-4">
    <!-- Fixed Header -->
    <div class="fixed top-32 left-0 right-0 bg-gray-900 z-40 border-b border-gray-700 shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-white">Movie Administration</h2>
          <button
            @click="openCreateModal"
            class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Add Movie
          </button>
        </div>
      </div>
    </div>

    <!-- Scrollable Content with top padding to account for both headers -->
    <div class="pt-64">
      <!-- Table Container -->
      <div class="overflow-x-auto max-h-[calc(100vh-16rem)] overflow-y-auto">
        <table class="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <thead class="sticky top-0 z-50 bg-gray-900">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700"
              >
                Title
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700"
              >
                Year
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700"
              >
                Genre
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700"
              >
                Duration
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700"
              >
                Rating
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700"
              >
                Hidden
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-gray-800 divide-y divide-gray-700">
            <tr v-if="!movies.length">
              <td colspan="5" class="px-6 py-4 text-center text-gray-400">Loading movies...</td>
            </tr>
            <tr v-for="movie in movies" :key="movie.id" class="hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-white">{{ movie.title }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-300">{{ movie.releaseYear }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-300">
                {{ genresMapping[movie.genre as keyof typeof genresMapping] }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-300">{{ movie.movieDuration }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-yellow-400">
                  {{ '★'.repeat(movie.rating) }}{{ '☆'.repeat(5 - movie.rating) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-gray-400">
                  {{ movie.isHidden ? 'Yes' : 'No' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="openModal(movie)"
                  class="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 mx-1 my-0.5 rounded border border-green-700 shadow-sm transition-colors duration-200"
                >
                  Edit
                </button>
                &nbsp;&nbsp;
                <button
                  @click="openDeleteModal(movie)"
                  class="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 mx-1 my-0.5 rounded border border-red-700 shadow-sm transition-colors duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <!-- Edit Modal -->
  <div
    v-if="isModalOpen"
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
  >
    <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold text-white">Edit Movie</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-300">
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

      <form @submit.prevent="updateMovie" v-if="selectedMovie">
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            type="text"
            id="title"
            v-model="selectedMovie.title"
            class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        <div class="mb-4">
          <label for="year" class="block text-sm font-medium text-gray-300 mb-2">Year</label>
          <input
            type="text"
            id="year"
            v-model="selectedMovie.releaseYear"
            class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        <div class="mb-4">
          <label for="genre" class="block text-sm font-medium text-gray-300 mb-2">Genre</label>
          <select
            id="genre"
            v-model="selectedMovie.genre"
            class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="">Select a genre</option>
            <option v-for="genre in Object.keys(genresMapping)" :key="genre" :value="genre">
              {{ genresMapping[genre as keyof typeof genresMapping] }}
            </option>
          </select>
        </div>

        <div class="mb-6">
          <label for="rating" class="block text-sm font-medium text-gray-300 mb-2">Rating</label>
          <input
            type="number"
            id="rating"
            v-model="selectedMovie.rating"
            min="1"
            max="5"
            class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        <div class="mb-6">
          <label for="duration" class="block text-sm font-medium text-gray-300 mb-2"
            >Duration</label
          >
          <input
            type="text"
            id="duration"
            v-model="selectedMovie.movieDuration"
            class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        <br />

        <div class="mb-6">
          <label class="flex items-center">
            <div
              class="relative inline-block w-10 h-6 transition-colors duration-200 ease-in-out rounded-full cursor-pointer bg-gray-600"
              :class="{ 'bg-green-600': selectedMovie.isHidden }"
              @click="selectedMovie.isHidden = !selectedMovie.isHidden"
            >
              <div
                class="absolute w-4 h-4 transition-transform duration-200 ease-in-out transform bg-white rounded-full top-1 left-1"
                :class="{ 'translate-x-4': selectedMovie.isHidden }"
              ></div>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-300">Hide movie from public view</span>
          </label>
        </div>

        <br />

        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Delete Modal -->
  <div
    v-if="isDeleteModalOpen"
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
  >
    <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
      <h3 class="text-xl font-semibold text-white mb-4">Delete Movie</h3>
      <p class="text-gray-300 mb-6">Are you sure you want to delete this movie?</p>
      <div class="flex justify-end gap-3">
        <button
          @click="closeDeleteModal"
          class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          @click="selectedMovie && deleteMovie(selectedMovie)"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { API_ENDPOINTS, getMovieUpdateURL, getMovieDeleteURL } from '@/constants/api'
import { User } from 'oidc-client-ts'
import type { Movie } from '@/types/movie'
import { genresMapping } from '@/types/movie'

const movies = ref<Movie[]>([])
const nextToken = ref<string | null>(null)
const selectedMovie = ref<Movie | null>(null)
const user = ref<User | null>(null)
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isLoading = ref(false)

const openModal = (movie: Movie) => {
  selectedMovie.value = movie
  isModalOpen.value = true
}

const closeModal = () => {
  selectedMovie.value = null
  isModalOpen.value = false
  fetchMovies()
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

  if (!user.value) {
    console.error('User is not logged in')
    await userManager.signinRedirect()
    return
  }

  try {
    const isNew = !selectedMovie.value.id
    const url = isNew ? API_ENDPOINTS.MOVIE_CREATION : getMovieUpdateURL(selectedMovie.value.id)
    const method = isNew ? 'POST' : 'PUT'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.value?.access_token}`,
      },
      body: JSON.stringify(selectedMovie.value),
    })

    if (response.status !== 200 && response.status !== 201)
      throw new Error('Failed to save movie')
    closeModal()
    await fetchMovies()
  } catch (error) {
    console.error('Error saving movie:', error)
  }
}

const deleteMovie = async (movie: Movie) => {
  const response = await fetch(getMovieDeleteURL(movie.id), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.value?.access_token}`,
    },
  })
  if (response.status !== 200) throw new Error('Failed to delete movie')
  closeDeleteModal()
  await fetchMovies()
}

const fetchMovies = async (isLoadMore = false) => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const response = await fetch(
      API_ENDPOINTS.MOVIES + (nextToken.value ? `?nextToken=${nextToken.value}` : ''),
    )
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

const handleScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY
  const documentHeight = document.documentElement.scrollHeight

  if (documentHeight - scrollPosition < 100 && !isLoading.value && nextToken.value) {
    console.log('fetching more movies')
    fetchMovies(true)
  }
}

// Authorization Logic

import { UserManager } from 'oidc-client-ts'

const cognitoAuthConfig = {
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_8FoMklAQ7',
  client_id: '1oes8qqk19pp8ibpbj1lcivj0j',
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  response_type: 'code',
  scope: 'aws.cognito.signin.user.admin email openid phone profile',
}

// create a UserManager instance
const userManager = new UserManager({
  ...cognitoAuthConfig,
})

// export async function signOutRedirect () {
//     const clientId = "1oes8qqk19pp8ibpbj1lcivj0j";
//     const logoutUri = "<logout uri>";
//     const cognitoDomain = "https://us-east-18fomklaq7.auth.us-east-1.amazoncognito.com";
//     window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
// };

const verifyLogin = async () => {
  const currentUser = await userManager.getUser()
  if (!currentUser) {
    // await userManager.signinRedirect()
  } else {
    user.value = currentUser
    console.log('current user', currentUser)
    return
  }
  // check if code is in url
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  if (code) {
    try {
      const signedInUser = await userManager.signinCallback()
      if (signedInUser) {
        user.value = signedInUser
      }
      console.log('signed in user', signedInUser)
    } catch (err) {
      // redirect to sig in page
      console.log('error signing in', err)
      await userManager.signinRedirect()
    }
  } else {
    if (currentUser) {
      user.value = currentUser
      console.log('current user', currentUser)
      return
    } else {
      console.log('no user')
      await userManager.signinRedirect()
    }
  }
}

const openCreateModal = () => {
  selectedMovie.value = {
    id: '',
    title: '',
    releaseYear: '',
    genre: '',
    movieDuration: '',
    rating: 1,
    isHidden: false,
  }
  isModalOpen.value = true
}

onMounted(async () => {
  verifyLogin().then(() => {
    fetchMovies()
    window.addEventListener('scroll', handleScroll)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
