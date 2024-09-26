import { Component, OnDestroy, OnInit } from "@angular/core";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";
import { QuizComponent } from "../quiz/quiz.component";
import { UserService } from "../services/user.service";
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

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUserData();
  }

  ngOnDestroy(): void {}
}
