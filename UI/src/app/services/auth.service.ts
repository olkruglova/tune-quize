import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  public isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private route: ActivatedRoute, private router: Router) {}

  public handleAuth(): void {
    this.route.queryParams.subscribe((params) => {
      const accessToken = params["access_token"];
      const refreshToken = params["refresh_token"];

      if (accessToken && refreshToken) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        this.router.navigate(["/main"], {
          queryParams: {},
          replaceUrl: true
        });
      } else {
        console.log("No tokens found in the query parameters");
      }
    });
  }
}
