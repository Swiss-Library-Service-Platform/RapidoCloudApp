import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';
import { CloudAppEventsService, CloudAppRestService, InitData } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
  isInitialized: boolean = false;
  isLibraryAllowed: boolean = false;
  isUserHasRoles: boolean = false;

  constructor(
    private backendService: BackendService,
    private _loader: LoadingIndicatorService,
    private _status: StatusIndicatorService,
    private translateService: TranslateService,
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService
  ) { }

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


  async ngOnInit(): Promise<void> {
    this.loader.show();
    const statusText = await this.translateService.get('Main.Status.Initializing').toPromise();
    this.status.set(statusText);
    let initData = await this.eventsService.getInitData().toPromise();
    this.isUserHasRoles = await this.getIsCurrentUserAllowed(initData);
    this.backendService.init(initData).then(() => {
      this.backendService.checkIfInstitutionAllowed().then(allowed => {
        this.isLibraryAllowed = allowed;
        console.log('MainComponent: ngOnInit: allowed', allowed);
      }).catch(error => {
        console.log('MainComponent: ngOnInit: error', error);
        this.isLibraryAllowed = false;
      }).finally(() => {
        this.isInitialized = true;
        this.loader.hide();
      });
    });
  }

  /**
   * Checks wheter the currently loggedin user has sufficient permissions
   *
   * @param {string} primaryId of currently loggedin user
   * @return {Boolean} 
   * @memberof LibraryManagementService
   */
  async getIsCurrentUserAllowed(initData: InitData): Promise<boolean> {
    let primaryId = initData['user']['primaryId'];
    let user;
    try {
      user = await this.restService.call<any>('/users/' + primaryId).toPromise();
    } catch (error) {
      return false;
    }
    // 26 (General System Administrator)
    // 215 (Fulfillment Services Manager)
    // 21 (User Manager)
    const requiredRoles = ['26', '215', '21'];
    let isAllowed = false;
    for (let userrole of user.user_role) {
      if (requiredRoles.indexOf(userrole.role_type.value) != -1 &&
        userrole.status.value == 'ACTIVE') {
        isAllowed = true;
        break;
      }

    }
    return isAllowed;
  }

}
