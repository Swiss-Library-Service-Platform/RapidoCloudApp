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
  isSearching: boolean = false;
  showManualInstitution: boolean = false;

  institutionOptions: Institution[] = [];
  instititutionFilterControl: FormControl = new FormControl('');
  filteredInstitutions: ReplaySubject<Institution[]> = new ReplaySubject<Institution[]>(1);

  responseUser: UserInformation;
  responseErrorId: string;
  responseErrorTitle: string;
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

  get isSearchDisabled(): boolean {
    return this.isSearching || !this.inputRequestId || !this.inputRequestId.trim();
  }

  onRequestIdChanged(requestId: string): void {
    this.inputRequestId = requestId;
    this.inputInstitutionId = "";
    this.showManualInstitution = false;
    this.responseErrorId = null;
    this.responseErrorTitle = null;
    this.responseErrorMessage = null;
    this.responseUser = null;
  }

  onClickRetrieveUserInformation(): void {
    const requestId = (this.inputRequestId || "").trim();
    if (!requestId || this.isSearching) {
      return;
    }

    this.inputRequestId = requestId;
    this.isSearching = true;
    this._loader.show();
    this.responseErrorId = null;
    this.responseErrorTitle = null;
    this.responseErrorMessage = null;
    this.responseUser = null;

    this.backendService.retrieveUserInformation(requestId, this.inputInstitutionId).then(response => {
      this.responseUser = response;
      this.inputInstitutionId = "";
      this.showManualInstitution = false;
    }).catch(error => {
      this.responseUser = null;
      const backendError = error && error.error;
      const errorType = backendError && backendError.type;
      const upstreamStatus = Number(backendError
        && backendError.additionalInformation
        && backendError.additionalInformation.upstream_status);
      const isAlmaLookupError = errorType == "MISSING_RESOURCE_SHARING_INFORMATION"
        || errorType == "MISSING_USER_INFORMATION";

      if (errorType == "IZ_EXTRACTION_FAILED") {
        this.showManualInstitution = true;
      } else if (isAlmaLookupError && (upstreamStatus == 401 || upstreamStatus == 403)) {
        this.setError(
          "Requests.ErrorTitle.AUTHORIZATION",
          "Requests.Error.ALMA_UPSTREAM_AUTHORIZATION_ERROR");
      } else if (isAlmaLookupError && upstreamStatus >= 500) {
        this.setError(
          "Requests.ErrorTitle.TEMPORARY",
          "Requests.Error.ALMA_UPSTREAM_ERROR",
          { status: upstreamStatus });
      } else if (!errorType || errorType == "DEFAULT") {
        this.setError("Requests.ErrorTitle.DEFAULT", "Requests.Error.DEFAULT");
      } else if (errorType == "MISSING_RESOURCE_SHARING_INFORMATION") {
        this.setError(
          "Requests.ErrorTitle.REQUEST_NOT_FOUND",
          "Requests.Error.MISSING_RESOURCE_SHARING_INFORMATION",
          { institution: backendError.additionalInformation.institution });
      } else if (errorType == "MISSING_USER_INFORMATION") {
        this.setError(
          "Requests.ErrorTitle.USER_UNAVAILABLE",
          "Requests.Error.MISSING_USER_INFORMATION");
      } else if (errorType == "UNAUTHORIZED") {
        this.setError("Requests.ErrorTitle.ACCESS_DENIED", "Requests.Error.UNAUTHORIZED");
      } else if (errorType == "MISSING_API_KEY") {
        this.setError("Requests.ErrorTitle.CONFIGURATION", "Requests.Error.MISSING_API_KEY");
      } else {
        this.setError("Requests.ErrorTitle.DEFAULT", "Requests.Error." + errorType);
      }

      if (backendError) this.responseErrorId = backendError.error_id;
    }).finally(() => {
      this.isSearching = false;
      this._loader.hide();
    })
  }

  private setError(titleKey: string, messageKey: string, params?: Object): void {
    this.responseErrorTitle = this.translateService.instant(titleKey);
    this.responseErrorMessage = this.translateService.instant(messageKey, params);
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
