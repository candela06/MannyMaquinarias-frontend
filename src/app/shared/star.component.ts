import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule

@Component({
  selector: 'app-star-rating',
  templateUrl: './star.component.html',
  imports: [CommonModule],
  standalone: true,
})
export class StarRatingComponent implements OnInit {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() readonly: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  stars: number[] = [];
  hoverRating: number = 0;

  ngOnInit() {
    this.stars = Array(this.maxRating)
      .fill(0)
      .map((x, i) => i + 1);
  }

  selectRating(star: number): void {
    if (!this.readonly) {
      this.rating = star;
      this.ratingChange.emit(this.rating);
    }
  }

  onMouseOver(star: number): void {
    if (!this.readonly) {
      this.hoverRating = star;
    }
  }

  onMouseLeave(): void {
    if (!this.readonly) {
      this.hoverRating = 0;
    }
  }

  isStarFilled(star: number): boolean {
    if (this.hoverRating > 0) {
      return star <= this.hoverRating;
    }
    return star <= this.rating;
  }
}
