import { Component, OnDestroy, OnInit } from "@angular/core";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";
import { QuizComponent } from "../quiz/quiz.component";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  imports: [SidebarComponent, HeaderComponent, QuizComponent],
  standalone: true
})
export class MainComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Extract token from URL if present (after OAuth callback)
    this.authService.extractTokenFromUrl();

    // Only fetch user data if authenticated
    if (this.authService.getToken()) {
      this.userService.getUserData();
    }
  }

  ngOnDestroy(): void {}
}
