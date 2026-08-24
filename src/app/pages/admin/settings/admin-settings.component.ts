import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminShellComponent } from '../admin-shell.component';
import { SiteSettingsService } from '../../../core/services/site-settings.service';
import { SiteSettings } from '../../../core/models/site-settings.model';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [AdminShellComponent, FormsModule],
  template: `
    <app-admin-shell>
      <div class="admin-page">
        <header class="page-header">
          <div>
            <h1>Site Content CMS</h1>
            <p>Customize every banner, heading, description & store info across KSM website</p>
          </div>
          <button class="btn btn-primary" (click)="saveAllSettings()" [disabled]="saving()">
            {{ saving() ? '⚡ Saving Changes...' : '⚡ Save All Changes' }}
          </button>
        </header>

        <!-- CMS Tabs -->
        <div class="cms-tabs">
          <button class="tab-btn" [class.active]="activeTab() === 'hero'" (click)="activeTab.set('hero')">🎨 Hero & Search</button>
          <button class="tab-btn" [class.active]="activeTab() === 'about'" (click)="activeTab.set('about')">📖 About Story</button>
          <button class="tab-btn" [class.active]="activeTab() === 'wa'" (click)="activeTab.set('wa')">💬 WhatsApp Banner</button>
          <button class="tab-btn" [class.active]="activeTab() === 'contact'" (click)="activeTab.set('contact')">📍 Contact & Hours</button>
        </div>

        <div class="tab-content-card glass-panel">
          <!-- Tab 1: Hero -->
          @if (activeTab() === 'hero') {
            <div class="cms-form">
              <h3>Hero Section Configuration</h3>
              <div class="form-group">
                <label class="form-label">Eyebrow Tagline</label>
                <input class="form-input dark-input" [(ngModel)]="form.hero.eyebrow" name="hero_eyebrow" />
              </div>

              <div class="form-group">
                <label class="form-label">Main Heading Title</label>
                <input class="form-input dark-input" [(ngModel)]="form.hero.title" name="hero_title" />
              </div>

              <div class="form-group">
                <label class="form-label">Subtitle</label>
                <input class="form-input dark-input" [(ngModel)]="form.hero.subtitle" name="hero_subtitle" />
              </div>

              <div class="form-group">
                <label class="form-label">Description Text</label>
                <textarea class="form-textarea dark-input" [(ngModel)]="form.hero.description" name="hero_desc"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Stat 1 (Products)</label>
                  <input class="form-input dark-input" [(ngModel)]="form.hero.statProducts" name="stat_prod" />
                </div>
                <div class="form-group">
                  <label class="form-label">Stat 2 (Customers)</label>
                  <input class="form-input dark-input" [(ngModel)]="form.hero.statCustomers" name="stat_cust" />
                </div>
                <div class="form-group">
                  <label class="form-label">Stat 3 (Delivery Time)</label>
                  <input class="form-input dark-input" [(ngModel)]="form.hero.statDelivery" name="stat_del" />
                </div>
              </div>
            </div>
          }

          <!-- Tab 2: About Story -->
          @if (activeTab() === 'about') {
            <div class="cms-form">
              <h3>About Page Story & Commitments</h3>
              <div class="form-group">
                <label class="form-label">Section Eyebrow</label>
                <input class="form-input dark-input" [(ngModel)]="form.about.eyebrow" name="about_eyebrow" />
              </div>

              <div class="form-group">
                <label class="form-label">Story Heading Title</label>
                <input class="form-input dark-input" [(ngModel)]="form.about.title" name="about_title" />
              </div>

              <div class="form-group">
                <label class="form-label">Paragraph 1</label>
                <textarea class="form-textarea dark-input" [(ngModel)]="form.about.paragraph1" name="p1"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Paragraph 2</label>
                <textarea class="form-textarea dark-input" [(ngModel)]="form.about.paragraph2" name="p2"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Paragraph 3</label>
                <textarea class="form-textarea dark-input" [(ngModel)]="form.about.paragraph3" name="p3"></textarea>
              </div>
            </div>
          }

          <!-- Tab 3: WhatsApp Banner -->
          @if (activeTab() === 'wa') {
            <div class="cms-form">
              <h3>WhatsApp Express Checkout Banner</h3>
              <div class="form-group">
                <label class="form-label">Banner Headline</label>
                <input class="form-input dark-input" [(ngModel)]="form.waBanner.title" name="wa_title" />
              </div>

              <div class="form-group">
                <label class="form-label">Subtext / Instructions</label>
                <textarea class="form-textarea dark-input" [(ngModel)]="form.waBanner.subtext" name="wa_sub"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Button Label</label>
                <input class="form-input dark-input" [(ngModel)]="form.waBanner.buttonText" name="wa_btn" />
              </div>
            </div>
          }

          <!-- Tab 4: Contact & Hours -->
          @if (activeTab() === 'contact') {
            <div class="cms-form">
              <h3>Store Location & Operating Hours</h3>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">WhatsApp Number</label>
                  <input class="form-input dark-input" [(ngModel)]="form.contact.whatsappNumber" name="c_wa" />
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input class="form-input dark-input" [(ngModel)]="form.contact.phone" name="c_phone" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input class="form-input dark-input" [(ngModel)]="form.contact.email" name="c_email" />
                </div>
                <div class="form-group">
                  <label class="form-label">Store Location City</label>
                  <input class="form-input dark-input" [(ngModel)]="form.contact.location" name="c_loc" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Mon – Sat Hours</label>
                  <input class="form-input dark-input" [(ngModel)]="form.contact.hoursMonSat" name="c_ms" />
                </div>
                <div class="form-group">
                  <label class="form-label">Sunday Hours</label>
                  <input class="form-input dark-input" [(ngModel)]="form.contact.hoursSun" name="c_sun" />
                </div>
                <div class="form-group">
                  <label class="form-label">WhatsApp Hours</label>
                  <input class="form-input dark-input" [(ngModel)]="form.contact.hoursWa" name="c_wah" />
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </app-admin-shell>
  `,
  styles: [`
    .admin-page { padding: 2rem; max-width: 1100px; margin-inline: auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .page-header h1 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #fff; }
    .page-header p { color: var(--text-muted); font-size: 0.9375rem; }
    .cms-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .tab-btn { padding: 0.65rem 1.25rem; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: var(--text-muted); font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .tab-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); font-weight: 700; box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
    .tab-content-card { padding: 2rem; }
    .cms-form { display: flex; flex-direction: column; gap: 1.25rem; color: #fff; }
    .cms-form h3 { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.75rem; margin-bottom: 0.5rem; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private siteSettings = inject(SiteSettingsService);

  activeTab = signal<'hero' | 'about' | 'wa' | 'contact'>('hero');
  saving = signal(false);

  form: SiteSettings = JSON.parse(JSON.stringify(this.siteSettings.settings()));

  ngOnInit() {
    this.form = JSON.parse(JSON.stringify(this.siteSettings.settings()));
  }

  async saveAllSettings() {
    this.saving.set(true);
    try {
      await this.siteSettings.updateSettings(this.form);
      alert('⚡ Site settings updated successfully!');
    } catch {
      alert('Failed to save site settings.');
    } finally {
      this.saving.set(false);
    }
  }
}
