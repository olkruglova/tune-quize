import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";
import { QuizComponent } from "../quiz/quiz.component";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  imports: [SidebarComponent, HeaderComponent, QuizComponent],
  standalone: true
})
export class MainComponent {}
