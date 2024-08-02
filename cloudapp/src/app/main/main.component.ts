import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppRestService, CloudAppEventsService, Entity, AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  loading = false;
  selectedEntity: Entity;
  apiResult: any;

  entities$: Observable<Entity[]> = this.eventsService.entities$
    .pipe(tap(() => this.clear()))

  constructor(
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private alert: AlertService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

  entitySelected(event: MatRadioChange) {
    const value = event.value as Entity;
    this.loading = true;
    this.restService.call<any>(value.link)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        result => this.apiResult = result,
        error => this.alert.error('Failed to retrieve entity: ' + error.message)
      );
  }

  clear() {
    this.apiResult = null;
    this.selectedEntity = null;
  }
}
