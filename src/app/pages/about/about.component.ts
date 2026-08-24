import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { SiteSettingsService } from '../../core/services/site-settings.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="about-page" style="padding-top:70px">
      <!-- Hero -->
      <section class="about-hero">
        <div class="container">
          <span class="eyebrow">{{ settings().about.eyebrow }}</span>
          <h1>{{ settings().about.title }}</h1>
          <p class="about-sub">Delivering farm-fresh grocery, staples, and daily essentials across Jabalpur with trust & speed.</p>
        </div>
      </section>

      <!-- Story -->
      <section class="story-section section">
        <div class="container">
          <div class="story-grid">
            <div class="story-visual">
              <div class="story-logo-card card">
                <span class="big-store-icon">🛒</span>
                <h3>KSM Supermart</h3>
                <span class="badge-fresh">100% Quality Assured</span>
              </div>
            </div>
            <div class="story-text">
              <span class="eyebrow">Our Mission</span>
              <h2>Fresh Grocery for Every Family</h2>
              <p>{{ settings().about.paragraph1 }}</p>
              <p>{{ settings().about.paragraph2 }}</p>
              <p>{{ settings().about.paragraph3 }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Values -->
      <section class="values-section section-sm" style="background: var(--bg-white)">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow">Pillars of KSM</span>
            <h2>Our Core Commitments</h2>
          </div>

          <div class="values-grid">
            <div class="value-card card">
              <div class="v-icon">🥦</div>
              <h3>100% Farm Fresh</h3>
              <p>Direct farm sourcing ensures top nutritional freshness for your family.</p>
            </div>
            <div class="value-card card">
              <div class="v-icon">⚡</div>
              <h3>45-Min Home Delivery</h3>
              <p>Express delivery service across all major localities in Jabalpur, MP.</p>
            </div>
            <div class="value-card card">
              <div class="v-icon">🏷️</div>
              <h3>Honest Wholesale Rates</h3>
              <p>Maximum savings on your monthly grocery bill guaranteed every single day.</p>
            </div>
            <div class="value-card card">
              <div class="v-icon">💬</div>
              <h3>WhatsApp Ordering</h3>
              <p>Instant 1-click ordering via WhatsApp. Send your list and we handle the rest!</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="about-cta section-sm">
        <div class="container">
          <div class="cta-card glass-panel text-center">
            <h2>Ready to Order Your Daily Groceries?</h2>
            <p>Shop from 5000+ items online or drop us a message on WhatsApp for 45-minute home delivery.</p>
            <div class="cta-btns">
              <a routerLink="/catalog" class="btn btn-primary btn-lg">Explore Store Catalog</a>
              <a [href]="waLink()" target="_blank" class="btn btn-fresh btn-lg">Order on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .about-hero { padding: 4rem 0 3rem; text-align: center; background: linear-gradient(135deg, #0F172A, #1E293B); color: #fff; }
    .about-hero h1 { font-family: var(--font-heading); font-size: clamp(2rem, 4vw, 3.25rem); font-weight: 800; margin-block: 0.5rem; }
    .about-sub { color: var(--text-muted); font-size: 1.0625rem; max-width: 580px; margin-inline: auto; }
    .story-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 3rem; align-items: center; }
    @media (max-width: 768px) { .story-grid { grid-template-columns: 1fr; } }
    .story-visual { display: flex; justify-content: center; }
    .story-logo-card { padding: 2.5rem; text-align: center; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); width: 100%; max-width: 320px; }
    .big-store-icon { font-size: 4rem; display: block; margin-bottom: 0.5rem; }
    .story-logo-card h3 { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem; }
    .badge-fresh { background: var(--accent-fresh-bg); color: var(--accent-fresh); font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); }
    .story-text h2 { font-family: var(--font-heading); font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 800; margin-block: 0.5rem 1rem; }
    .story-text p { color: var(--text-mid); line-height: 1.7; margin-bottom: 1rem; font-size: 0.9375rem; }
    .values-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-top: 1.5rem; }
    @media (max-width: 900px) { .values-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 540px) { .values-grid { grid-template-columns: 1fr; } }
    .value-card { padding: 1.5rem; text-align: center; }
    .v-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .value-card h3 { font-family: var(--font-heading); font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
    .value-card p { font-size: 0.8125rem; color: var(--text-light); }
    .cta-card { padding: 3rem 2rem; text-align: center; color: #fff; }
    .cta-card h2 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; }
    .cta-card p { color: var(--text-muted); margin-bottom: 1.5rem; max-width: 540px; margin-inline: auto; }
    .cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  `]
})
export class AboutComponent implements OnInit {
  private seo = inject(SeoService);
  private siteSettings = inject(SiteSettingsService);

  settings = this.siteSettings.settings;
  waLink = this.siteSettings.waLink;

  ngOnInit() {
    this.seo.setPage({
      title: 'About Khandelwal Supermart (KSM) Jabalpur',
      description: 'Learn about Khandelwal Supermart (KSM), Jabalpur’s trusted grocery supermarket delivering farm-fresh produce and staples at honest prices.'
    });
  }
}
