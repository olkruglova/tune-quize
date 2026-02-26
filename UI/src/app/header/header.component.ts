import { Subscription } from "rxjs";
import { UserService } from "./../services/user.service";
import { ScoreService } from "../services/score.service";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  standalone: true,
  imports: [CommonModule]
})
export class HeaderComponent implements OnInit, OnDestroy {
  public userAvatarUrl: string = "";

  private subscription: Subscription = new Subscription();

  public score$;
  public combo$;

  constructor(private readonly userService: UserService, private readonly scoreService: ScoreService) {
    this.score$ = this.scoreService.score$;
    this.combo$ = this.scoreService.combo$;
  }

  ngOnInit() {
    this.subscription.add(
      this.userService.userProfile$.subscribe((user: any) => {
        const defaultImg = "./images/avatar_placeholder.png";
        const userImg = user?.images[0].url;

        if (this.userAvatar) {
          if (userImg) {
            this.userAvatar.nativeElement.style.backgroundImage = `url(${userImg})`;
          } else {
            this.userAvatar.nativeElement.style.backgroundImage = `url(${defaultImg})`;
          }
        }
      })
    );
  }

  @ViewChild("userAvatar") userAvatar!: ElementRef;

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
