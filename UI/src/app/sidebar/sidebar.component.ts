import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
  imports: [CommonModule],
  standalone: true
})
export class SidebarComponent {
  public menuItems = [
    { id: 0, name: "level1", title: "Level 1", class: "vinyl-I", color: "green" },
    { id: 1, name: "level2", title: "Level 2", class: "vinyl-II", color: "yellow" },
    { id: 2, name: "level3", title: "Level 3", class: "vinyl-III", color: "orange" }
  ];

  setLevel(level: number) {
    const content: HTMLElement = document.getElementById("content")!;

    this.menuItems.forEach((item) => {
      if (item.id === level) {
        item.class += " active";
        content.classList.add(item.color);
      } else {
        item.class = item.class.replace(" active", "");
        content.classList.remove(item.color);
      }
    });
  }
}
