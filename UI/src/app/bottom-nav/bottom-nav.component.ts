import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive, ActivatedRoute } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faHeart, faMusic, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { Subscription } from "rxjs";
import { SidebarComponentService } from "../sidebar/sidebar.component.service";
import { Level } from "../sidebar/sidebar.model";

@Component({
  selector: "app-bottom-nav",
  templateUrl: "./bottom-nav.component.html",
  styleUrls: ["./bottom-nav.component.scss"],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FontAwesomeModule]
})
export class BottomNavComponent implements OnInit, OnDestroy {
  public heartIcon = faHeart;
  public musicIcon = faMusic;
  public globeIcon = faGlobe;

  public levels: Level[] = [
    { id: 1, name: "level1", title: "Your Liked Songs", class: "vinyl-I", color: "green", routerLink: "/quiz/level/1", points: 10 },
    { id: 2, name: "level2", title: "Famous Songs", class: "vinyl-II", color: "yellow", routerLink: "/quiz/level/2", points: 20 },
    { id: 3, name: "level3", title: "Random World Songs", class: "vinyl-III", color: "orange", routerLink: "/quiz/level/3", points: 30 }
  ];

  private subscription = new Subscription();

  constructor(
    private readonly sidebarService: SidebarComponentService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.route.firstChild?.url.subscribe((segments) => {
        const levelId = +segments[1].path;
        const level = this.levels.find((item) => item.id === levelId);
        if (level) this.setLevel(level);
      })
    );
  }

  setLevel(level: Level): void {
    this.sidebarService.currentLevel$.next(level);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
