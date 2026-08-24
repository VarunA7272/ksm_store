import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card glass-panel animate-fade-in">
        <div class="login-header">
          <div class="logo-circle">🛒</div>
          <h2>KSM Admin Portal</h2>
          <p>Sign in to manage grocery products, categories, reviews & site settings.</p>
        </div>

        @if (errorMessage()) {
          <div class="error-banner">
            ⚠️ {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <input id="login-email" type="email" [(ngModel)]="email" name="email" class="form-input dark-input" required placeholder="admin@ksmgrocery.com" />
          </div>

          <div class="form-group">
            <label class="form-label" for="login-pass">Password</label>
            <input id="login-pass" type="password" [(ngModel)]="password" name="password" class="form-input dark-input" required placeholder="••••••••" />
          </div>

          <button type="submit" class="btn btn-primary btn-lg submit-btn" [disabled]="loading()">
            {{ loading() ? 'Signing in...' : 'Sign In to Portal' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      padding: 1.5rem;
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
      color: #fff;
    }
    .login-header { text-align: center; margin-bottom: 2rem; }
    .logo-circle { font-size: 3rem; margin-bottom: 0.5rem; }
    .login-header h2 { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; }
    .login-header p { color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem; }
    .error-banner { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #FCA5A5; padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.875rem; margin-bottom: 1.25rem; text-align: center; }
    .login-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .submit-btn { width: 100%; margin-top: 0.5rem; }
  `]
})
export class AdminLoginComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  email = 'admin@ksmgrocery.com';
  password = 'admin';
  loading = signal(false);
  errorMessage = signal('');

  async onLogin() {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { data, error } = await this.supabase.signIn(this.email, this.password);
      if (error) {
        this.errorMessage.set(error.message);
      } else if (data.session) {
        this.router.navigate(['/admin/dashboard']);
      }
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Login failed.');
    } finally {
      this.loading.set(false);
    }
  }
}
