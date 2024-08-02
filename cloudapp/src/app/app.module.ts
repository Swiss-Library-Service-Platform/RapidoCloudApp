import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule, CloudAppTranslateModule, AlertModule } from '@exlibris/exl-cloudapp-angular-lib';
import { FilterByTypePipe } from './pipes/filter-by-types.pipe';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';
import { RequestIdComponent } from './request-id/request-id.component';
import { SelectionListComponent } from './selection-list/selection-list.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    FilterByTypePipe,
    RequestIdComponent,
    SelectionListComponent
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AlertModule,
    FormsModule,
    ReactiveFormsModule,
    CloudAppTranslateModule.forRoot(),
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
