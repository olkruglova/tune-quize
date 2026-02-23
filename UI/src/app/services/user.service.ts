import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, catchError, map, of } from "rxjs";
import { API } from "./api";
import { Track } from "../models/track.model";

@Injectable({
  providedIn: "root"
})
export class UserService {
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public userProfile$ = new BehaviorSubject<any>(null);
  public trackBatch$ = new Subject<{ level: number; tracks: Track[] }>();

  private readonly timeRanges = ["short_term", "medium_term", "long_term"] as const;
  private batchIndices: Record<number, number> = { 1: 0, 2: 0, 3: 0 };

  constructor(private http: HttpClient) {}

  getUserData(): void {
    this.getProfileData();
  }

  fetchTracks(level: number): void {
    const batch = this.batchIndices[level] ?? 0;
    this.batchIndices[level] = batch + 1;

    if (level === 1) {
      const timeRange = this.timeRanges[batch % this.timeRanges.length];
      this.loadTracks(level, `${API.GetTopTracks}?time_range=${timeRange}`);
    } else if (level === 2) {
      this.loadTracks(level, `${API.GetPopularTracks}?batch=${batch}`);
    } else {
      this.loadTracks(level, `${API.GetRandomTracks}?batch=${batch}`);
    }
  }

  private loadTracks(level: number, url: string): void {
    this.isLoading$.next(true);

    this.http
      .get<any>(url)
      .pipe(
        map((response: any) => {
          this.isLoading$.next(false);
          this.trackBatch$.next({ level, tracks: response.items });
        }),
        catchError((error) => {
          console.error("Error fetching tracks", error);
          this.isLoading$.next(false);
          return of(null);
        })
      )
      .subscribe();
  }

  private getProfileData(): void {
    this.isLoading$.next(true);

    this.http
      .get<any>(API.GetProfile)
      .pipe(
        map((response: any) => {
          this.isLoading$.next(false);
          this.userProfile$.next(response);
        }),
        catchError((error) => {
          console.error("Error fetching user profile", error);
          this.isLoading$.next(false);
          return of(null);
        })
      )
      .subscribe();
  }
}
