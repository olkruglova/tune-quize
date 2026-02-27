import { Component, OnDestroy, OnInit } from "@angular/core";
import { HeaderComponent } from "../header/header.component";
import { QuizComponent } from "../quiz/quiz.component";
import { BottomNavComponent } from "../bottom-nav/bottom-nav.component";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  imports: [HeaderComponent, QuizComponent, BottomNavComponent],
  standalone: true
})
export class MainComponent {}
