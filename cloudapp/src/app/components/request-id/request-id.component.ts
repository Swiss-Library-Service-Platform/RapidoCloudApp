import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { UserInformation } from '../../models/UserInformation';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { Institution } from '../../models/Institution';

@Component({
  selector: 'app-request-id',
  templateUrl: './request-id.component.html',
  styleUrls: ['./request-id.component.scss']
})
export class RequestIdComponent implements OnInit {
  inputRequestId: string = "";
  inputInstitutionId: string = "";

  institutionOptions: Institution[] = [];
  instititutionFilterControl: FormControl = new FormControl('');
  filteredInstitutions: ReplaySubject<Institution[]> = new ReplaySubject<Institution[]>(1);

  responseUser: UserInformation;
  responseErrorId: string;
  responseErrorMessage: string;

  constructor(
    private backendService: BackendService,
    private translateService: TranslateService,
    private _loader: LoadingIndicatorService,
    private _status: StatusIndicatorService) {

    this.backendService.retrieveInstitutions().then(response => {
      this.institutionOptions = response;
      this.filteredInstitutions.next(this.institutionOptions);
    });

    this.instititutionFilterControl.valueChanges
      .subscribe(() => {
        this.filterInstitutions();
      });
  }

  /**
   * Getter for LoadingIndicatorService instance.
   * @returns LoadingIndicatorService instance
   */
  get loader(): LoadingIndicatorService {
    return this._loader;
  }

  /**
   * Getter for StatusIndicatorService instance.
   * @returns StatusIndicatorService instance
   */
  get status(): StatusIndicatorService {
    return this._status;
  }

  onClickRetrieveUserInformation(): void {
    this._loader.show();
    this.responseErrorId = null;
    this.responseUser = null;

    this.backendService.retrieveUserInformation(this.inputRequestId, this.inputInstitutionId).then(response => {
      this.responseUser = response;
    }).catch(error => {
      this.responseUser = null;
      if (error.error == null || !error.error.type || error.error.type == "DEFAULT") {
        this.responseErrorMessage = this.translateService.instant("Requests.Error.DEFAULT");
      } else if (error.error.type == "MISSING_RESOURCE_SHARING_INFORMATION") {
        this.responseErrorMessage = this.translateService.instant("Requests.Error.MISSING_RESOURCE_SHARING_INFORMATION", { institution: error.error.additionalInformation.institution });
      } else {
        this.responseErrorMessage = this.translateService.instant("Requests.Error." + error.error.type);
      }

      if (error.error != null) this.responseErrorId = error.error.error_id;
    }).finally(() => this._loader.hide())
  }

  protected filterInstitutions() {
    if (!this.institutionOptions) {
      return;
    }
    let search = this.instititutionFilterControl.value;
    if (!search) {
      this.filteredInstitutions.next(this.institutionOptions.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredInstitutions.next(
      this.institutionOptions.filter(iz => {
        return iz.full_name.toLowerCase().indexOf(search) > -1;
      })
    );
  }

  ngOnInit(): void {
  }

}
