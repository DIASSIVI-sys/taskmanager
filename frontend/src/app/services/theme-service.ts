import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly mode = signal<ThemeMode>(this.getInitialMode());

  constructor() {
    this.apply(this.mode());
  }

  toggle(): void {
    const nextMode: ThemeMode = this.mode() === 'light' ? 'dark' : 'light';
    this.mode.set(nextMode);
    this.apply(nextMode);

    try {
      this.document.defaultView?.localStorage.setItem('theme', nextMode);
    } catch (error) {
      console.warn('Le choix du thème n’a pas pu être enregistré.', error);
    }
  }

  private getInitialMode(): ThemeMode {
    try {
      const savedMode = this.document.defaultView?.localStorage.getItem('theme');
      if (savedMode === 'light' || savedMode === 'dark') return savedMode;
    } catch (error) {
      console.warn('Le choix du thème n’a pas pu être lu.', error);
    }

    const view = this.document.defaultView;
    return typeof view?.matchMedia === 'function' &&
      view.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private apply(mode: ThemeMode): void {
    this.document.documentElement.style.colorScheme = mode;
  }
}
