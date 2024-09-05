import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';

@Component({
  selector: 'app-request-id',
  templateUrl: './request-id.component.html',
  styleUrls: ['./request-id.component.scss']
})
export class RequestIdComponent implements OnInit {
  inputRequestId: string = "";

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
    console.log("I was clicked " + this.inputRequestId);
    this.backendService.retrieveUserInformation(this.inputRequestId).then(response => {
      console.log(response);
    }).catch(error => {
      console.log("ERROR: " + error);
    })
  }

  ngOnInit(): void {
  }

}
