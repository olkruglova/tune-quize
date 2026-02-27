import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCheck, faPause, faPlay, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Subscription } from "rxjs";
import { AudioVisualizerComponent } from "../audio-visualizer/audio-visualizer.component";
import { LevelCaptionComponent } from "../level-caption/level-caption.component";
import { Track } from "../models/track.model";
import { MusicAnimationComponent } from "../music-animation/music-animation.component";
import { ScoreService } from "../services/score.service";
import { UserService } from "../services/user.service";
import { SidebarComponentService } from "../sidebar/sidebar.component.service";
import { Level } from "../sidebar/sidebar.model";

@Component({
  selector: "app-player-controls",
  templateUrl: "./player-controls.component.html",
  styleUrls: ["./player-controls.component.scss"],
  imports: [CommonModule, FontAwesomeModule, MusicAnimationComponent, LevelCaptionComponent, AudioVisualizerComponent],
  standalone: true
})
export class PlayerControlsComponent implements OnInit, OnDestroy {
  public currentLevel: Level | null = null;
  public currentTracks: Track[] | null = null;
  public playIcon = faPlay;
  public pauseIcon = faPause;
  public plusIcon = faPlus;
  public checkIcon = faCheck;
  public isPlaying = false;
  public randomTrackNum: number = 0;
  public blockStates: ("correct" | "wrong" | null)[] = [null, null, null];
  public guessed = false;
  public transitioning = false;
  public savedTrackIds = new Set<string>();
  public questionNumber = 1;
  public readonly totalQuestions = 10;

  public readonly levelInfo: Record<number, string> = {
    1: "Listen to a short preview of one of your top tracks, and guess the song.",
    2: "Listen to a short preview of a popular hit, and guess the track.",
    3: "Listen to a short preview of a random song, and guess the track."
  };

  private readonly pools: Record<number, Track[]> = { 1: [], 2: [], 3: [] };

  private readonly audio = new Audio();
  private readonly subscription: Subscription = new Subscription();

  constructor(
    private readonly sidebarService: SidebarComponentService,
    private readonly userService: UserService,
    private readonly scoreService: ScoreService
  ) {}

  ngOnInit() {
    this.audio.onended = () => {
      this.isPlaying = false;
    };

    this.subscription.add(
      this.sidebarService.currentLevel$.subscribe((level: Level | null) => {
        if (level && level.id !== this.currentLevel?.id) {
          this.stopPreview();
          this.currentTracks = null;
          this.blockStates = [null, null, null];
          this.guessed = false;
          this.questionNumber = 1;
          this.scoreService.resetCombo();
          this.currentLevel = level;
          const pool = this.pools[level.id];
          if (pool.length >= 3) {
            this.shaffleTracks();
          } else {
            this.userService.fetchTracks(level.id);
          }
        } else {
          this.currentLevel = level;
        }
      })
    );

    this.subscription.add(
      this.userService.trackBatch$.subscribe(({ level, tracks }) => {
        const pool = this.pools[level];
        const existingIds = new Set(pool.map((t) => t.id));
        const newTracks = tracks.filter((t) => !existingIds.has(t.id));
        pool.push(...newTracks);

        if (this.currentLevel?.id === level && this.currentTracks === null) {
          this.shaffleTracks();
        }
      })
    );
  }

  shaffleTracks() {
    if (!this.currentLevel) return;
    const pool = this.pools[this.currentLevel.id];
    if (pool.length < 3) return;

    let i = pool.length;
    while (i) {
      const j = Math.floor(Math.random() * i--);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const currentTracks = pool.splice(0, 3);
    currentTracks.forEach((track) => {
      track.artistsText = track.artistName;
    });

    this.randomTrackNum = Math.floor(Math.random() * 3);
    this.currentTracks = currentTracks;
    this.blockStates = [null, null, null];
    this.guessed = false;
    this.transitioning = false;

    if (pool.length < 20) {
      this.userService.fetchTracks(this.currentLevel.id);
    }

    this.togglePreview();
  }

  togglePreview(): void {
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      return;
    }

    const previewUrl = this.currentTracks?.[this.randomTrackNum].preview_url;

    if (!previewUrl) {
      console.warn("No preview URL available for this track.");
      return;
    }

    if (this.audio.src !== previewUrl) {
      this.audio.src = previewUrl;
      this.audio.load();
    }

    this.audio
      .play()
      .then(() => {
        this.isPlaying = true;
      })
      .catch((error) => {
        console.error("Error playing preview:", error);
      });
  }

  stopPreview(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
  }

  selectTrack(index: number): void {
    if (this.guessed) return;

    if (index === this.randomTrackNum) {
      this.blockStates[index] = "correct";
      this.guessed = true;
      this.transitioning = true;
      this.stopPreview();
      this.playSuccessSound();
      if (this.currentLevel) {
        const wrongAttempts = this.blockStates.filter((s) => s === "wrong").length;
        const maxPoints = this.currentLevel.points;
        const earned = wrongAttempts === 0 ? maxPoints : wrongAttempts === 1 ? Math.floor(maxPoints / 2) : 1;
        this.scoreService.addPoints(earned);
        if (wrongAttempts === 0) {
          this.scoreService.incrementCombo();
        } else {
          this.scoreService.resetCombo();
        }
      }
      this.questionNumber = this.questionNumber < this.totalQuestions ? this.questionNumber + 1 : 1;
      setTimeout(() => this.shaffleTracks(), 1500);
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
