import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { SidebarComponentService } from "../sidebar/sidebar.component.service";
import { Level } from "../sidebar/sidebar.model";
import { CommonModule } from "@angular/common";
import { UserService } from "../services/user.service";
import { Track } from "../models/track.model";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlay, faPause, faStop } from "@fortawesome/free-solid-svg-icons";
import { PlayerControlsService } from "./player-controls.component.service";
import { ScoreService } from "../services/score.service";

@Component({
  selector: "app-player-controls",
  templateUrl: "./player-controls.component.html",
  styleUrls: ["./player-controls.component.scss"],
  imports: [CommonModule, FontAwesomeModule],
  standalone: true
})
export class PlayerControlsComponent implements OnInit, OnDestroy {
  public currentLevel: Level | null = null;
  public tracks: Track[] | null = null;
  public currentTracks: Track[] | null = null;
  public playIcon = faPlay;
  public pauseIcon = faPause;
  public stopIcon = faStop;
  public randomTrackNum: number = 0;
  public blockStates: ("correct" | "wrong" | null)[] = [null, null, null];
  public guessed = false;

  private readonly audio = new Audio();
  private readonly subscription: Subscription = new Subscription();

  constructor(
    private readonly sidebarService: SidebarComponentService,
    private readonly userService: UserService,
    private readonly playerControlsService: PlayerControlsService,
    private readonly scoreService: ScoreService
  ) {}

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
    let currentIndex = tracks.length;
    let randomIndex;

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
    this.blockStates = [null, null, null];
    this.guessed = false;
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
      .then(() => {})
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
    if (this.guessed) return;

    if (index === this.randomTrackNum) {
      this.blockStates[index] = "correct";
      this.guessed = true;
      this.stopPreview();
      this.playSuccessSound();
      if (this.currentLevel) {
        const wrongAttempts = this.blockStates.filter((s) => s === "wrong").length;
        const maxPoints = this.currentLevel.points;
        const earned = wrongAttempts === 0 ? maxPoints : wrongAttempts === 1 ? Math.floor(maxPoints / 2) : 1;
        this.scoreService.addPoints(earned);
      }
      setTimeout(() => this.shaffleTracks(this.tracks!), 1500);
    } else {
      this.blockStates[index] = "wrong";
      this.playFailSound();
    }
  }

  private playSuccessSound(): void {
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  }

  private playFailSound(): void {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
