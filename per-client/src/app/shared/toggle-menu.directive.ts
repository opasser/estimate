import { Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';
import { Router} from '@angular/router';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[appToggleMenu]'
})
export class ToggleMenuDirective implements OnDestroy {
  @Input('appToggleMenu') menuList!: HTMLUListElement;

  private readonly listenFunc: () => void;
  private isOpen = false;

  constructor(private element: ElementRef, private renderer: Renderer2, private router: Router) {
    this.listenFunc = this.renderer.listen('window', 'pointerdown', (event: Event) => this.handleWindowClick(event));

    // Subscribe to router events
    this.router.events.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.closeMenu();
    });
  }

  private handleWindowClick(event: Event): void {
    /*if (this.element.nativeElement.contains(event.target)) {
      this.toggleMenu();
    } else {
      this.closeMenu();
    }*/

    const target = event.target as HTMLElement;

    if (this.element.nativeElement.contains(target)) {
      this.toggleMenu();
    } else if (!this.menuList.contains(target)) {
      // click outside the menu
      this.closeMenu();
    }
  }

  private toggleMenu(): void {
    this.isOpen = !this.isOpen;
    this.updateMenuState();
  }

  private closeMenu(): void {
    this.isOpen = false;
    this.updateMenuState();
  }

  private updateMenuState(): void {
    if (this.isOpen) {
      this.renderer.addClass(this.menuList, 'active');
    } else {
      this.renderer.removeClass(this.menuList, 'active');
    }
  }

  ngOnDestroy(): void {
    if (this.listenFunc) {
      this.listenFunc();
    }
  }
}
