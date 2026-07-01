export interface Movie {
  id: string
  title: string
  releaseYear: string
  genre: string
  movieDuration: string
  rating: number
  isHidden: boolean
}

export const genresMapping = {
  action: 'Action',
  'adventure/crime': 'Adventure/Crime',
  'adventure/drama': 'Adventure/Drama',
  'adventure/sci-fi': 'Adventure/Sci-fi',
  'adventure/fantasy': 'Adventure/Fantasy',
  comedy: 'Comedy',
  'comedy/adventure': 'Comedy/Adventure',
  'comedy/drama': 'Comedy/Drama',
  'comedy/romance': 'Comedy/Romance',
  'comedy/sci-fi': 'Comedy/Sci-fi',
  'comedy/thriller': 'Comedy/Thriller',
  'crime/action': 'Crime/Action',
  'crime/comedy': 'Crime/Comedy',
  'crime/thriller': 'Crime/Thriller',
  documentary: 'Documentary',
  drama: 'Drama',
  'drama/history': 'Drama/History',
  'drama/music': 'Drama/Music',
  'drama/romance' : 'Drama/Romance',
  'drama/sci-fi': 'Drama/Sci-fi',
  'drama/thriller': 'Drama/Thriller',
  'drama/war': 'Drama/War',
  'drama/western': 'Drama/Western',
  'drama/tragicomedy': 'Drama/Tragicomedy',
  'fantasy/romance': 'Fantasy/Romance',
  horror: 'Horror',
  'horror/comedy': 'Horror/Comedy',
  'horror/scifi': 'Horror/Sci-fi',
  'music/drama': 'Music/Drama',
  'romance/comedy': 'Romance/Comedy',
  'romance/drama': 'Romance/Drama',
  'romance/sci-fi': 'Romance/Sci-fi',
  'romance/thriller': 'Romance/Thriller',
  'sci-fi': 'Science Fiction',
  'sci-fi/thriller': 'Sci-fi/Thriller',
  'sport/action': 'Sport/Action',
  thriller: 'Thriller',
  'thriller/comedy': 'Thriller/Comedy',
  'thriller/crime': 'Thriller/Crime',
  'thriller/mystery': 'Thriller/Mystery',
  'thriller/war': 'Thriller/War',
  'war/action': 'War/Action',
  'western/action': 'Western/Action',
  'western/comedy': 'Western/Comedy',
  'western/drama': 'Western/Drama',
  'western/thriller': 'Western/Thriller',
  'western/western': 'Western/Western',
}
