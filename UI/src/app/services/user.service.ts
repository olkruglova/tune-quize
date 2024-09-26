import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class UserService {
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public userProfile$ = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  public getProfileData(): void {
    this.isLoading$.next(true);

    this.http
      .get<any>("/api/profile")
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
