<template>
  <div class="px-4 py-8">
    <h1 class="text-3xl font-bold text-white mb-6">Movie Creation</h1>
    <form @submit.prevent="handleSubmit" class="mt-4 max-w-2xl">
      <div class="mb-4">
        <label for="title" class="block text-sm font-medium text-gray-300 mb-2">Movie Title</label>
        <input
          type="text"
          id="title"
          v-model="movieData.title"
          class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      <div class="mb-4">
        <label for="year" class="block text-sm font-medium text-gray-300 mb-2">Release Year</label>
        <input
          type="number"
          id="year"
          v-model="movieData.year"
          min="1888"
          :max="new Date().getFullYear()"
          class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      <div class="mb-4">
        <label for="genre" class="block text-sm font-medium text-gray-300 mb-2">Genre</label>
        <select
          id="genre"
          v-model="movieData.genre"
          class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Select a genre</option>
          <option value="action">Action</option>
          <option value="comedy">Comedy</option>
          <option value="romance/comedy">Romance/Comedy</option>
          <option value="drama">Drama</option>
          <option value="horror">Horror</option>
          <option value="sci-fi">Science Fiction</option>
          <option value="thriller">Thriller</option>
          <option value="documentary">Documentary</option>
        </select>
      </div>

      <br />

      <button
        type="submit"
        class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
      >
        Create Movie
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { fetchAuthSession } from '@aws-amplify/auth'
import { API_ENDPOINTS } from '@/constants/api'

const movieData = ref({
  title: '',
  year: null,
  genre: '',
})

const handleSubmit = async () => {
  const { tokens } = await fetchAuthSession()
  const token = tokens?.accessToken?.toString()
  const response = await fetch(API_ENDPOINTS.MOVIE_CREATION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(movieData.value),
  })
  const data = await response.json()
  console.log(data)
}
</script>
