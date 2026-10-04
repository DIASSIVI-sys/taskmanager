import { ApplicationConfig, Injectable, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { routes } from './app.routes';

@Injectable()
export class FrenchPaginatorIntl extends MatPaginatorIntl {
  constructor() {
    super();
    this.itemsPerPageLabel = 'Éléments par page';
    this.nextPageLabel = 'Page suivante';
    this.previousPageLabel = 'Page précédente';
    this.firstPageLabel = 'Première page';
    this.lastPageLabel = 'Dernière page';
    this.getRangeLabel = (page, pageSize, length) => {
      if (length === 0 || pageSize === 0) return `0 sur ${length}`;
      const start = page * pageSize + 1;
      const end = Math.min(start + pageSize - 1, length);
      return `${start} – ${end} sur ${length}`;
    };
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: MatPaginatorIntl, useClass: FrenchPaginatorIntl },
  ]
};
