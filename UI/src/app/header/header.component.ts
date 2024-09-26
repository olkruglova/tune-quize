import { Subscription } from "rxjs";
import { UserService } from "./../services/user.service";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  standalone: true
})
export class HeaderComponent implements OnInit, OnDestroy {
  public userAvatarUrl: string = "";

  private subscription: Subscription = new Subscription();

  constructor(private userService: UserService) {}

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
