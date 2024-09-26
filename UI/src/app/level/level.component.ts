import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { SidebarComponentService } from "../sidebar/sidebar.component.service";
import { Level } from "../sidebar/sidebar.model";
import { CommonModule } from "@angular/common";
import { UserService } from "../services/user.service";
import { Track } from "../models/track.model";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlay, faPause, faStop } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-level",
  templateUrl: "./level.component.html",
  styleUrl: "./level.component.scss",
  imports: [CommonModule, FontAwesomeModule],
  standalone: true
})
export class LevelComponent implements OnInit, OnDestroy {
  public currentLevel: Level | null = null;
  public tracks: Track[] | null = null;
  public currentTracks: Track[] | null = null;
  public playIcon = faPlay;
  public pauseIcon = faPause;
  public stopIcon = faStop;
  public randomTrackNum: number = 0;

  private audio = new Audio();
  private subscription: Subscription = new Subscription();

  constructor(private sidebarService: SidebarComponentService, private userService: UserService) {}

  ngOnInit() {
    this.subscription.add(
      this.sidebarService.currentLevel$.subscribe((level: Level | null) => {
        this.currentLevel = level;
      })
    );

    this.subscription.add(
      this.userService.userTopTracks$.subscribe((topTracks: Track[] | null) => {
        this.tracks = topTracks;

        if (topTracks) {
          this.shaffleTracks(topTracks);
        }
      })
    );
  }

  shaffleTracks(tracks: Track[]) {
    let currentIndex = tracks.length,
      randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [tracks[currentIndex], tracks[randomIndex]] = [tracks[randomIndex], tracks[currentIndex]];
    }

    const currentTracks = tracks.slice(0, 3);
    currentTracks.forEach((track) => {
      track.artistsText = track.artists.map((artist) => artist.name).join(", ");
    });

    const randomNum = Math.floor(Math.random() * (2 - 0 + 1) + 0);
    this.randomTrackNum = randomNum;

    this.currentTracks = currentTracks;
  }

  playPreview(): void {
    const previewUrl = this.currentTracks?.[this.randomTrackNum].preview_url;

    if (!previewUrl) {
      console.warn("No preview URL available for this track.");
      return;
    }

    if (this.audio.src !== previewUrl) {
      this.audio.pause();
    }

    this.audio.src = previewUrl;
    this.audio.load();
    this.audio
      .play()
      .then(() => {
        console.log("Playing preview:", previewUrl);
      })
      .catch((error) => {
        console.error("Error playing preview:", error);
      });
  }

  pausePreview(): void {
    this.audio.pause();
  }

  stopPreview(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  selectTrack(index: number): void {
    console.log("Selected track:", index);
    console.log(this.randomTrackNum);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
