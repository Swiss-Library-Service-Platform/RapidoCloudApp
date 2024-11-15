import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { UserInformation } from '../../models/UserInformation';

@Component({
  selector: 'app-request-id',
  templateUrl: './request-id.component.html',
  styleUrls: ['./request-id.component.scss']
})
export class RequestIdComponent implements OnInit {
  inputRequestId: string = "";
  inputInstitutionId: string = null;

  institutionOptions: string[] = [];

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

  ngOnInit(): void {
  }

}
