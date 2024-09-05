import { Component, OnInit } from '@angular/core';
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
  userInformation: UserInformation;

  constructor(
    private backendService: BackendService,
    private _loader: LoadingIndicatorService,
    private _status: StatusIndicatorService) { }

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
    this.backendService.retrieveUserInformation(this.inputRequestId).then(response => {
      this.userInformation = response;
    }).catch(error => {
      this.userInformation = null;
      console.log("ERROR: " + error);
    }).finally(() => this._loader.hide())
  }

  ngOnInit(): void {
  }

}
