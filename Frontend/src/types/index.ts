export type GameStatus = 'Playing' | 'Completed' | 'Dropped' | 'Plan to Play';

export interface Game {
  id: string;
  igdb_id: number;
  name: string;
  cover_url: string | null;
  release_year: string | null;
  genres: string[];
  platforms: string[];
  summary: string | null;
}

export interface ExternalGame {
  igdb_id: number;
  name: string;
  cover_url: string | null;
  release_year: string | null;
  genres: string[];
  platforms: string[];
}

export interface RatingAspect {
  aspect: string;
  score: number;  
}

export interface Review {
  id: string;
  gameId: string;
  status: GameStatus;
  aspectRatings: RatingAspect[];
  overallRating: number;
  content: string;
  dateAdded: string;
}