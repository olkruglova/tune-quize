import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "./services/auth.service";
import { SidebarComponentService } from "./sidebar/sidebar.component.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive]
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService, private sidebarService: SidebarComponentService) {}

  @ViewChild("content") content!: ElementRef;

  ngOnInit(): void {
    this.authService.handleAuth();

    this.subscription.add(
      this.sidebarService.currentLevel$.subscribe((level) => {
        if (this.content) {
          this.content.nativeElement.className = "";

          if (level) {
            this.content?.nativeElement.classList?.add(level.color);
          }
        }
      })
    );
  }

  login(): void {
    window.location.href = "http://localhost:3000/login";
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
