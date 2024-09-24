import { API } from "./api";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class UserService {
  public isLoading$ = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient) {}

  public login(): Observable<any> {
    this.isLoading$.next(true);

    return this.http.get<any>(API.Login).pipe(
      map((response: any) => {
        this.isLoading$.next(false);
        return response;
      }),
      catchError((error) => {
        console.error("Error logging in", error);
        this.isLoading$.next(false);
        return of(null);
      })
    );
  }

  public getProfileData(): Observable<any> {
    this.isLoading$.next(true);

    return this.http.get<any>(API.GetProfile).pipe(
      map((response: any) => {
        this.isLoading$.next(false);
        return response;
      }),
      catchError((error) => {
        console.error("Error fetching user profile", error);
        this.isLoading$.next(false);
        return of(null);
      })
    );
  }
}
