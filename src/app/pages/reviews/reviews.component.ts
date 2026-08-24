import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/services/seo.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { Review } from '../../core/models/review.model';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="reviews-page" style="padding-top:70px">
      <!-- Hero -->
      <section class="reviews-hero">
        <div class="container">
          <span class="eyebrow">Verified Feedback</span>
          <h1>Customer Reviews</h1>
          <p>Read what families in Jabalpur say about Khandelwal Supermart (KSM).</p>
          <div class="avg-pill">
            <span class="stars">★★★★★</span>
            <strong>4.9 / 5.0 Rating</strong>
          </div>
        </div>
      </section>

      <!-- Grid -->
      <section class="reviews-body section">
        <div class="container">
          @if (loading()) {
            <div class="reviews-grid">
              @for (_ of [1,2,3,4,5,6]; track $index) {
                <div class="skeleton" style="height: 180px; border-radius: var(--radius-md)"></div>
              }
            </div>
          } @else if (reviews().length === 0) {
            <div class="empty-reviews card">
              <p>🛒 No reviews yet. Be the first to share your experience with KSM!</p>
            </div>
          } @else {
            <div class="reviews-grid">
              @for (rev of reviews(); track rev.id) {
                <div class="review-tile card">
                  <div class="stars">
                    @for (_ of getStars(rev.rating); track $index) { <span>★</span> }
                  </div>
                  <p class="tile-msg">"{{ rev.message }}"</p>
                  @if (rev.product_name) {
                    <span class="tile-prod">re: {{ rev.product_name }}</span>
                  }
                  <div class="tile-author">
                    <div class="avatar">{{ rev.customer_name.charAt(0) }}</div>
                    <strong>{{ rev.customer_name }}</strong>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </section>

      <!-- Form -->
      <section class="leave-review section-sm" style="background: var(--bg-white)">
        <div class="container">
          <div class="form-card card">
            <div class="section-header text-center">
              <span class="eyebrow">Share Your Feedback</span>
              <h2>Leave a Store Review</h2>
            </div>

            @if (submitted()) {
              <div class="success-alert">
                <span>🎉</span>
                <div>
                  <strong>Thank you for your feedback!</strong>
                  <p>Your review has been submitted and will appear after moderation.</p>
                </div>
              </div>
            } @else {
              <form (ngSubmit)="submitReview()" class="review-form">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" for="rev-name">Your Name *</label>
                    <input id="rev-name" class="form-input" type="text" [(ngModel)]="form.name" name="name" required placeholder="e.g. Rajesh Khandelwal" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="rev-prod">Item Purchased (optional)</label>
                    <input id="rev-prod" class="form-input" type="text" [(ngModel)]="form.productName" name="productName" placeholder="e.g. Aashirvaad Atta / Fresh Vegetables" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Rating *</label>
                  <div class="star-picker">
                    @for (i of [1,2,3,4,5]; track i) {
                      <button type="button" class="star-pick" [class.lit]="form.rating >= i" (click)="form.rating = i">★</button>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="rev-msg">Your Review *</label>
                  <textarea id="rev-msg" class="form-textarea" [(ngModel)]="form.message" name="message" required placeholder="Tell us about the grocery quality, delivery speed, or pricing..."></textarea>
                </div>

                <button type="submit" class="btn btn-primary" [disabled]="submitting()">
                  {{ submitting() ? 'Submitting...' : 'Submit Review' }}
                </button>
              </form>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .reviews-hero { padding: 4rem 0 3rem; text-align: center; background: linear-gradient(135deg, #0F172A, #1E293B); color: #fff; }
    .reviews-hero h1 { font-family: var(--font-heading); font-size: clamp(2rem, 4vw, 3.25rem); font-weight: 800; margin-block: 0.5rem; }
    .reviews-hero p { color: var(--text-muted); font-size: 1rem; margin-bottom: 1.5rem; }
    .avg-pill { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.1); padding: 0.4rem 1.25rem; border-radius: var(--radius-full); border: 1px solid rgba(255,255,255,0.15); }
    .stars { color: var(--accent-gold); font-size: 1.125rem; }
    .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    @media (max-width: 900px) { .reviews-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 560px) { .reviews-grid { grid-template-columns: 1fr; } }
    .review-tile { padding: 1.5rem; }
    .tile-msg { font-style: italic; color: var(--text-mid); font-size: 0.9375rem; margin-block: 0.5rem; }
    .tile-prod { display: inline-block; font-size: 0.75rem; color: var(--primary); background: rgba(37,99,235,0.08); padding: 0.15rem 0.5rem; border-radius: var(--radius-xs); margin-bottom: 0.75rem; font-weight: 700; }
    .tile-author { display: flex; align-items: center; gap: 0.625rem; }
    .avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--gradient-blue); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.875rem; }
    .form-card { max-width: 640px; margin-inline: auto; padding: 2.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 540px) { .form-row { grid-template-columns: 1fr; } }
    .star-picker { display: flex; gap: 0.25rem; }
    .star-pick { font-size: 2rem; color: var(--text-muted); background: none; border: none; cursor: pointer; line-height: 1; }
    .star-pick.lit { color: var(--accent-gold); }
    .success-alert { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; background: var(--accent-fresh-bg); border-radius: var(--radius-md); border: 1px solid rgba(16,185,129,0.3); }
    .empty-reviews { text-align: center; padding: 3rem; color: var(--text-light); }
  `]
})
export class ReviewsComponent implements OnInit {
  private seo = inject(SeoService);
  private supabase = inject(SupabaseService);

  reviews = signal<Review[]>([]);
  loading = signal(true);
  submitted = signal(false);
  submitting = signal(false);

  form = { name: '', productName: '', rating: 5, message: '' };

  getStars(n: number) { return Array(n).fill(0); }

  async ngOnInit() {
    this.seo.setPage({
      title: 'Customer Reviews — Khandelwal Supermart (KSM)',
      description: 'Read customer reviews for Khandelwal Supermart (KSM) Jabalpur.'
    });

    try {
      const revs = await this.supabase.getApprovedReviews();
      this.reviews.set(revs);
    } catch {
    } finally {
      this.loading.set(false);
    }
  }

  async submitReview() {
    if (!this.form.name || !this.form.message) return;
    this.submitting.set(true);
    try {
      await this.supabase.submitReview({
        customer_name: this.form.name,
        product_name: this.form.productName || undefined,
        rating: this.form.rating,
        message: this.form.message
      });
      this.submitted.set(true);
    } catch {
      alert('Failed to submit review.');
    } finally {
      this.submitting.set(false);
    }
  }
}
