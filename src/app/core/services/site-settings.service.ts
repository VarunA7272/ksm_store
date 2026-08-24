import { Injectable, inject, signal } from '@angular/core';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '../models/site-settings.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private supabase = inject(SupabaseService);

  settings = signal<SiteSettings>(this.loadLocalSettings());
  loading = signal(false);

  waLink = () => 'https://wa.me/' + (this.settings().contact.whatsappNumber || '').replace(/[^0-9]/g, '');
  phoneLink = () => 'tel:' + (this.settings().contact.phone || '').replace(/[^0-9]/g, '');

  constructor() {
    this.fetchSettings();
  }

  private loadLocalSettings(): SiteSettings {
    try {
      const stored = localStorage.getItem('ksm_site_settings');
      return stored ? { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SITE_SETTINGS;
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  }

  async fetchSettings() {
    this.loading.set(true);
    try {
      const remote = await this.supabase.getSiteSettings();
      if (remote) {
        const merged = { ...DEFAULT_SITE_SETTINGS, ...remote };
        this.settings.set(merged);
        localStorage.setItem('ksm_site_settings', JSON.stringify(merged));
      }
    } catch {
    } finally {
      this.loading.set(false);
    }
  }

  async updateSettings(newSettings: SiteSettings): Promise<void> {
    this.settings.set(newSettings);
    localStorage.setItem('ksm_site_settings', JSON.stringify(newSettings));
    await this.supabase.updateSiteSettings(newSettings);
  }
}
