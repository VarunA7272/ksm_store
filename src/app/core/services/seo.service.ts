import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  setPage(opts: { title: string; description?: string }) {
    const fullTitle = `${opts.title} | Khandelwal Supermart (KSM) Jabalpur`;
    this.title.setTitle(fullTitle);

    const desc = opts.description || 'Khandelwal Supermart (KSM) — Fresh Grocery, Fruits, Atta, Rice, Oils, Dairy & Household Essentials delivered to your doorstep in Jabalpur.';
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
  }
}
