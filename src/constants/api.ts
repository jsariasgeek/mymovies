const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export const API_ENDPOINTS = {
  MOVIES: `${API_BASE_URL}/api/movies/`,
  MOVIE_CREATION: `${API_BASE_URL}/api/movies/create/`,
} as const

export const getMovieUpdateURL = (id: string | number) =>
  `${API_BASE_URL}/api/movies/${id}/update/`

export const getMovieDeleteURL = (id: string | number) =>
  `${API_BASE_URL}/api/movies/${id}/delete/`

export const MOVIES_BASE_URL = 'https://movies.jsarias.me'

export const getMovieTitleURL = (title: string) => {
  return `${MOVIES_BASE_URL}/${movieTitleToFileName(title)}`
}

export const movieTitleToFileName = (title: string) => {
  return title.toLowerCase().replace(/\s+/g, '-')
}
