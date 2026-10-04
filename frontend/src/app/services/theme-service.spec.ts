import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme-service';

describe('ThemeService', () => {
  const matchMediaMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.colorScheme = '';
    matchMediaMock.mockReturnValue({ matches: false });
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, 'matchMedia');
    document.documentElement.style.colorScheme = '';
  });

  it('initialise le mode depuis localStorage', () => {
    localStorage.setItem('theme', 'dark');

    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);

    expect(service.mode()).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('utilise prefers-color-scheme si aucun choix n’est mémorisé', () => {
    matchMediaMock.mockReturnValue({ matches: true });

    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);

    expect(service.mode()).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('inverse le mode et enregistre le choix', () => {
    localStorage.setItem('theme', 'light');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);

    service.toggle();

    expect(service.mode()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
