import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminShellComponent } from '../admin-shell.component';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [AdminShellComponent],
  template: `
    <app-admin-shell>
      <div class="admin-page">
        <header class="page-header">
          <div>
            <h1>Customer Reviews Moderation</h1>
            <p>Approve or remove customer reviews for KSM Supermart</p>
          </div>
        </header>

        <div class="table-card glass-panel">
          @if (loading()) {
            <p>Loading reviews...</p>
          } @else if (reviews().length === 0) {
            <p class="empty-msg">No customer reviews submitted yet.</p>
          } @else {
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Message</th>
                  <th>Item Referenced</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (rev of reviews(); track rev.id) {
                  <tr>
                    <td><strong>{{ rev.customer_name }}</strong></td>
                    <td><span class="stars">★ {{ rev.rating }}/5</span></td>
                    <td><p class="msg-text">"{{ rev.message }}"</p></td>
                    <td><span class="prod-tag">{{ rev.product_name || 'General Store' }}</span></td>
                    <td>
                      <span class="status-badge" [class.approved]="rev.is_approved">
                        {{ rev.is_approved ? 'Approved' : 'Pending' }}
                      </span>
                    </td>
                    <td>
                      <div class="action-btns">
                        @if (!rev.is_approved) {
                          <button class="btn-icon-sm approve" (click)="approve(rev.id)" title="Approve Review">✅ Approve</button>
                        }
                        <button class="btn-icon-sm danger" (click)="deleteRev(rev.id)" title="Delete">🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </app-admin-shell>
  `,
  styles: [`
    .admin-page { padding: 2rem; max-width: 1200px; margin-inline: auto; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #fff; }
    .page-header p { color: var(--text-muted); font-size: 0.9375rem; }
    .table-card { padding: 1.5rem; overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.8125rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .admin-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.875rem; color: #fff; }
    .stars { color: var(--accent-gold); font-weight: 800; }
    .msg-text { font-style: italic; color: var(--text-muted); max-width: 320px; }
    .prod-tag { background: rgba(37,99,235,0.15); color: var(--primary-light); padding: 0.15rem 0.5rem; border-radius: var(--radius-xs); font-size: 0.75rem; }
    .status-badge { padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; background: rgba(245,158,11,0.2); color: #F59E0B; }
    .status-badge.approved { background: rgba(16,185,129,0.2); color: #10B981; }
    .action-btns { display: flex; gap: 0.5rem; }
    .btn-icon-sm { background: rgba(255,255,255,0.08); border: none; border-radius: var(--radius-xs); padding: 0.35rem 0.65rem; cursor: pointer; color: #fff; font-size: 0.8125rem; }
    .btn-icon-sm.approve { background: rgba(16,185,129,0.2); color: #10B981; }
    .btn-icon-sm.danger:hover { background: rgba(239,68,68,0.2); color: #EF4444; }
    .empty-msg { text-align: center; color: var(--text-muted); padding: 2rem; }
  `]
})
export class AdminReviewsComponent implements OnInit {
  private supabase = inject(SupabaseService);

  reviews = signal<Review[]>([]);
  loading = signal(true);

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const revs = await this.supabase.getAllReviews();
      this.reviews.set(revs);
    } catch {
    } finally {
      this.loading.set(false);
    }
  }

  async approve(id: string) {
    await this.supabase.approveReview(id);
    await this.loadData();
  }

  async deleteRev(id: string) {
    if (confirm('Delete this review?')) {
      await this.supabase.deleteReview(id);
      await this.loadData();
    }
  }
}
