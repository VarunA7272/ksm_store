import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { SiteSettingsService } from '../../core/services/site-settings.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  template: `
    <div class="contact-page" style="padding-top:70px">
      <!-- Hero -->
      <section class="contact-hero">
        <div class="container">
          <span class="eyebrow">Get in Touch</span>
          <h1>Contact Khandelwal Supermart</h1>
          <p>We are always here to serve your daily grocery needs in Jabalpur, MP.</p>
        </div>
      </section>

      <!-- Grid -->
      <section class="contact-body section">
        <div class="container">
          <div class="contact-grid">
            <!-- Cards Column -->
            <div class="contact-cards">
              <a [href]="waLink()" target="_blank" class="contact-card card wa-card">
                <div class="c-icon">💬</div>
                <div class="c-info">
                  <h3>WhatsApp Orders</h3>
                  <p>Send your list for 45-min delivery!</p>
                  <span class="c-val">{{ settings().contact.whatsappNumber }}</span>
                </div>
              </a>

              <a [href]="phoneLink()" class="contact-card card phone-card">
                <div class="c-icon">📞</div>
                <div class="c-info">
                  <h3>Phone Support</h3>
                  <p>Call us directly for queries</p>
                  <span class="c-val">{{ settings().contact.phone }}</span>
                </div>
              </a>

              <a [href]="'mailto:' + settings().contact.email" class="contact-card card email-card">
                <div class="c-icon">📧</div>
                <div class="c-info">
                  <h3>Email Inquiry</h3>
                  <p>For bulk orders & vendor queries</p>
                  <span class="c-val">{{ settings().contact.email }}</span>
                </div>
              </a>

              <div class="contact-card card loc-card">
                <div class="c-icon">📍</div>
                <div class="c-info">
                  <h3>Store Location</h3>
                  <p>Visit or order home delivery in</p>
                  <span class="c-val">{{ settings().contact.location }}</span>
                </div>
              </div>

              <!-- Hours Card -->
              <div class="hours-card card">
                <h3>🕐 KSM Store Timings</h3>
                <div class="hours-list">
                  <div class="h-row"><span>Mon – Sat:</span> <strong>{{ settings().contact.hoursMonSat }}</strong></div>
                  <div class="h-row"><span>Sunday:</span> <strong>{{ settings().contact.hoursSun }}</strong></div>
                  <div class="h-row"><span>WhatsApp:</span> <strong style="color:#25D366">{{ settings().contact.hoursWa }}</strong></div>
                </div>
              </div>
            </div>

            <!-- WhatsApp Panel -->
            <div class="wa-cta-panel glass-panel text-center">
              <div class="wa-big-icon">🛒</div>
              <h2>Easiest Grocery Ordering</h2>
              <p>Browse our catalog, add items to your cart, and hit "Order via WhatsApp". Or simply type your list and send it to us!</p>
              <div class="steps-list">
                <div class="step-item"><span class="step-num">1</span> Browse KSM store catalog</div>
                <div class="step-item"><span class="step-num">2</span> Add items & select quantities</div>
                <div class="step-item"><span class="step-num">3</span> Click "Order via WhatsApp"</div>
                <div class="step-item"><span class="step-num">4</span> Express delivery to your home! 🚚</div>
              </div>
              <a [href]="waLink()" target="_blank" class="btn btn-fresh btn-lg wa-btn-block">
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
                Open WhatsApp Chat
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .contact-hero { padding: 4rem 0 3rem; text-align: center; background: linear-gradient(135deg, #0F172A, #1E293B); color: #fff; }
    .contact-hero h1 { font-family: var(--font-heading); font-size: clamp(2rem, 4vw, 3.25rem); font-weight: 800; margin-block: 0.5rem; }
    .contact-hero p { color: var(--text-muted); font-size: 1rem; max-width: 500px; margin-inline: auto; }
    .contact-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: start; }
    @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; } }
    .contact-cards { display: flex; flex-direction: column; gap: 1rem; }
    .contact-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; text-decoration: none; }
    .c-icon { font-size: 2rem; flex-shrink: 0; }
    .c-info h3 { font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.15rem; }
    .c-info p { font-size: 0.8125rem; color: var(--text-light); }
    .c-val { font-size: 0.9375rem; font-weight: 700; color: var(--primary); }
    .hours-card { padding: 1.5rem; }
    .hours-card h3 { font-family: var(--font-heading); font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }
    .hours-list { display: flex; flex-direction: column; gap: 0.625rem; }
    .h-row { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-mid); }
    .wa-cta-panel { padding: 2.5rem 2rem; color: #fff; border-radius: var(--radius-lg); position: sticky; top: 90px; }
    .wa-big-icon { font-size: 3.5rem; margin-bottom: 0.5rem; }
    .wa-cta-panel h2 { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
    .wa-cta-panel p { color: var(--text-muted); font-size: 0.9375rem; margin-bottom: 1.5rem; }
    .steps-list { display: flex; flex-direction: column; gap: 0.75rem; text-align: left; margin-bottom: 2rem; }
    .step-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9375rem; color: var(--text-muted); }
    .step-num { width: 26px; height: 26px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 0.8125rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .wa-btn-block { width: 100%; justify-content: center; }
  `]
})
export class ContactComponent implements OnInit {
  private seo = inject(SeoService);
  private siteSettings = inject(SiteSettingsService);

  settings = this.siteSettings.settings;
  waLink = this.siteSettings.waLink;
  phoneLink = this.siteSettings.phoneLink;

  ngOnInit() {
    this.seo.setPage({
      title: 'Contact Khandelwal Supermart (KSM) Jabalpur',
      description: 'Contact Khandelwal Supermart in Jabalpur. WhatsApp order delivery, phone support, store location and operating hours.'
    });
  }
}
