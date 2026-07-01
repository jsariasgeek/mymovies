<template>
  <div class="min-h-screen bg-gray-900">
    <header
      class="fixed top-0 left-0 w-full bg-gray-800 bg-opacity-100 shadow-lg z-50 p-4"
      style="background-color: #1f2937"
    >
      <div class="grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <div
          class="flex items-center gap-4 cursor-pointer justify-self-start"
          v-on:click="navigateToHome"
        >
          <img src="@/assets/logo.svg" alt="TopMovies Logo" class="w-12 h-12" />
          <div>
            <h1 class="text-4xl font-bold text-white">TopMovies</h1>
            <p class="text-gray-300">A curated collection of must-watch films</p>
          </div>
        </div>
        <div
          v-if="!isAdminRoute"
          class="flex items-center gap-2 min-w-0 w-[25vw] min-w-[18rem] max-w-[32rem] justify-self-end mr-16"
        >
          <input
            v-model="searchQuery"
            @input="onSearchInput"
            type="text"
            placeholder="Search movies..."
            class="bg-gray-700 text-white placeholder-gray-400 rounded px-5 py-4 text-2xl w-full border border-gray-500 ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
          />
        </div>
      </div>
    </header>
    <br />
    <div class="pb-20" :class="{ 'pt-18': !isAdminRoute }">
      <RouterView />
    </div>
    <footer
      v-if="!isAdminRoute"
      class="fixed bottom-0 left-0 w-full bg-gray-800 bg-opacity-100 text-white shadow-lg z-50 p-4"
      style="background-color: #1f2937"
    >
      <div class="text-center">
        <p class="text-sm">
          For more info (request movies, inquiries, etc.):
          <a
            href="mailto:jsarias0514@outlook.com"
            class="text-blue-400 hover:text-blue-300 underline"
          >
            jsarias0514@outlook.com
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed, ref } from 'vue'

const router = useRouter()
const route = useRoute()

const navigateToHome = () => {
  router.push('/')
}

const isAdminRoute = computed(() => route.path === '/admin')

const searchQuery = ref<string>((route.query.q as string) || '')
let searchTimeout: number | null = null

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  const q = (searchQuery.value || '').trim()
  searchTimeout = window.setTimeout(() => {
    if (q.length === 0) {
      router.push({ path: '/' })
    } else {
      router.push({ path: '/', query: { q } })
    }
  }, 700)
}
</script>
