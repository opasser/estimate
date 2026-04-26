import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslocoService } from "@jsverse/transloco";
import { environment } from "../../../environments/environment";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-language-switcher",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./language-switcher.component.html",
  styleUrl: "./language-switcher.component.scss",
})
export class LanguageSwitcherComponent {
  langList: string[] = environment.langList || [];
  translocoService = inject(TranslocoService);

  currentLang: string = this.translocoService.getActiveLang();
  panelOpen = false;

  constructor() {
    this.translocoService.langChanges$
      .pipe(takeUntilDestroyed())
      .subscribe((lang) => this.currentLang = lang);
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  selectLang(lang: string, event: Event): void {
    event.stopPropagation();
    if (lang !== this.currentLang && this.langList.includes(lang)) {
      this.translocoService.setActiveLang(lang);
      this.currentLang = lang;
    }
    this.panelOpen = false;
  }
}
