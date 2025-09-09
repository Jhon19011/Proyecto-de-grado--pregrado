import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';

// bootstrapApplication(AppComponent,{
//   providers: [provideHttpClient()]  // habilita el HttpClient en toda la aplicación
// }).catch((err) => console.error(err));

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
