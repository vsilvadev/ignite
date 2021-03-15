import { MovieCard } from './MovieCard';

interface ContentProps {
  movies: Array<{
    Title: string;
    Poster: string;
    Ratings: Array<{
      Source: string;
      Value: string;
    }>;
    Runtime: string;
  }>;

  selectedGenre: {
    id: number;
    name: 'action' | 'comedy' | 'documentary' | 'drama' | 'horror' | 'family';
    title: string;
  };
}


export function Content(props: ContentProps) {

  const {movies, selectedGenre} = props;

  return (
    <>
    <header>
          <span className="category">Categoria:<span> {selectedGenre.title}</span></span>
    </header>

        <main>
          <div className="movies-list">
            {movies.map(movie => (
              <MovieCard title={movie.Title} poster={movie.Poster} runtime={movie.Runtime} rating={movie.Ratings[0].Value} />
            ))}
          </div>
        </main>
    </>
  );
}