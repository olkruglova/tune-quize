import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, of } from "rxjs";
import { API } from "./api";
import { Track } from "../models/track.model";

@Injectable({
  providedIn: "root"
})
export class UserService {
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public userProfile$ = new BehaviorSubject<any>(null);
  public userTopTracks$ = new BehaviorSubject<Track[] | null>(null);

  constructor(private http: HttpClient) {}

  getUserData(): void {
    this.getProfileData();
    this.getTopTracks();
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

  private getTopTracks(): void {
    this.isLoading$.next(true);

    this.http
      .get<any>(API.GetTopTracks)
      .pipe(
        map((response: any) => {
          this.isLoading$.next(false);
          this.userTopTracks$.next(response.items);
        }),
        catchError((error) => {
          console.error("Error fetching user top tracks", error);
          this.isLoading$.next(false);
          return of(null);
        })
      )
      .subscribe();
  }
}
