import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { filter, Subscription } from "rxjs";
import { SidebarComponentService } from "./sidebar/sidebar.component.service";
import { UserService } from "./services/user.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive]
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(private userService: UserService, private sidebarService: SidebarComponentService, private router: Router) {}

  @ViewChild("content") content!: ElementRef;

  ngOnInit(): void {
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
