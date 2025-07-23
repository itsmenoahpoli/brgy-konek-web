import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { provideHttpClient } from '@angular/common/http';
import {
  heroHome,
  heroUser,
  heroCog,
  heroEye,
  heroUserCircle,
  heroKey,
  heroArrowRightOnRectangle,
} from '@ng-icons/heroicons/outline';
import {
  featherCheckCircle,
  featherInfo,
  featherAlertTriangle,
  featherUpload,
  featherLoader,
} from '@ng-icons/feather-icons';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideIcons({
      heroHome,
      heroUser,
      heroCog,
      heroEye,
      heroUserCircle,
      heroKey,
      heroArrowRightOnRectangle,
      featherCheckCircle,
      featherInfo,
      featherAlertTriangle,
      featherUpload,
      featherLoader,
    }),
    provideNgIconsConfig({ size: '1.5em' }),
  ],
};
