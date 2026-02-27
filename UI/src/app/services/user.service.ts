import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, catchError, map, of } from "rxjs";
import { Track } from "../models/track.model";

const ITUNES_SEARCH = "https://itunes.apple.com/search";

const POPULAR_ARTISTS = ["Taylor Swift", "The Weeknd", "Drake", "Billie Eilish", "Ed Sheeran", "Ariana Grande", "Post Malone", "Dua Lipa"];

const GENRES = ["pop", "rock", "hip hop", "r&b", "country", "electronic", "jazz", "soul"];

const RANDOM_CHARS = "abcdefghijklmnopqrstuvwxyz".split("");

@Injectable({
  providedIn: "root"
})
export class UserService {
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public userProfile$ = new BehaviorSubject<any>(null);
  public trackBatch$ = new Subject<{ level: number; tracks: Track[] }>();

  private batchIndices: Record<number, number> = { 1: 0, 2: 0, 3: 0 };

  constructor(private http: HttpClient) {}

  fetchTracks(level: number): void {
    const batch = this.batchIndices[level] ?? 0;
    this.batchIndices[level] = batch + 1;

    let term: string;
    if (level === 1) {
      term = POPULAR_ARTISTS[batch % POPULAR_ARTISTS.length];
    } else if (level === 2) {
      term = GENRES[batch % GENRES.length];
    } else {
      term = RANDOM_CHARS[batch % RANDOM_CHARS.length];
    }

    const url = `${ITUNES_SEARCH}?term=${encodeURIComponent(term)}&entity=song&limit=50&media=music`;
    this.loadTracks(level, url);
  }

  private loadTracks(level: number, url: string): void {
    this.isLoading$.next(true);

    this.http
      .get<any>(url)
      .pipe(
        map((response: any) => {
          const tracks: Track[] = response.results
            .filter((r: any) => r.kind === "song" && r.previewUrl)
            .map(
              (r: any): Track => ({
                id: r.trackId.toString(),
                name: r.trackName,
                artistName: r.artistName,
                preview_url: r.previewUrl,
                artworkUrl: r.artworkUrl100 ?? ""
              })
            );
          this.isLoading$.next(false);
          this.trackBatch$.next({ level, tracks });
        }),
        catchError((error) => {
          console.error("Error fetching tracks", error);
          this.isLoading$.next(false);
          return of(null);
        })
      )
      .subscribe();
  }
}
