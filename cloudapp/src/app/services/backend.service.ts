import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudAppEventsService, Entity, AlertService, CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserInformation } from '../models/UserInformation';

/**
 * Service which is responsible for all outgoing API calls in this cloud app
 *
 * @export
 * @class BackendService
 */
@Injectable({
    providedIn: 'root'
})
export class BackendService {
    private isDevelopmentEnvironment: boolean = false;
    private isInitialized = false;
    private initData: Object;
    private baseUrlProd: string = 'https://rapido-userdata.swisscovery.network/api/v1';
    private baseUrlEnv: string = 'http://localhost:4201/api/v1';
    httpOptions: {};

    public todaysRequests: Array<RequestInfo> = [];
    private readonly _todaysRequestsObject = new BehaviorSubject<Array<RequestInfo>>(new Array<RequestInfo>());

    constructor(
        private http: HttpClient,
        private eventsService: CloudAppEventsService,
        private alert: AlertService,
    ) { }

    private get baseUrl(): string {
        return this.isDevelopmentEnvironment ? this.baseUrlEnv : this.baseUrlProd;
    }

    /**
     * Initializes service
     * Gets the Alma Auth Token and defined HTTPOptions
     *
     * @return {*}  {Promise<void>}
     * @memberof LibraryManagementService
     */
    async init(): Promise<void> {
        if (this.isInitialized) {
            return;
        }
        this.initData = await this.eventsService.getInitData().toPromise();
        let regExp = new RegExp('^.*localhost.*'), // contains "localhost"
            currentUrl = this.initData["urls"]["alma"];
        this.isDevelopmentEnvironment = regExp.test(currentUrl);
        let authToken = await this.eventsService.getAuthToken().toPromise();
        this.httpOptions = {
            headers: new HttpHeaders({
                'Authorization': `Bearer ${authToken}`,
                //'Content-Type': 'application/json'
                'Accept': 'application/json'
            }),
            withCredentials: true
        };
    }

    /**
     * Checks if the library is allowed to use the cloud app
     *
     * @returns {Promise<boolean>}
     */
    async checkIfInstitutionAllowed(): Promise<boolean> {
        return new Promise(resolve => {
            this.http.get(`${this.baseUrl}/allowed`, this.httpOptions).subscribe(
                (data: any) => {
                    resolve(true);
                },
                error => {
                    console.log(error);
                    resolve(false);
                },
            );
        });
    }

    /**
     * Retrieves the user information of a request
     *
     * @returns {Promise<UserInformation>}
     */
    async retrieveUserInformation(externalId: string, institution: string = null): Promise<UserInformation> {
        const params = new URLSearchParams();
        if (institution) {
            params.set('institution', institution);
        }
        return new Promise((resolve, reject) => {
            externalId = encodeURIComponent(externalId);
            this.http.get(`${this.baseUrl}/user/${externalId}?${params.toString()}`, this.httpOptions).subscribe(
                (data: any) => {
                    resolve(data);
                },
                error => {
                    reject(error);
                },
            );
        });
    }

    /**
     * Retrieve all institutions
     * 
     * @returns {Promise<String>}
     */
    async retrieveInstitutions(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.baseUrl}/institutions`, this.httpOptions).subscribe(
                (data: string[]) => {
                    resolve(data);
                },
                error => {
                    reject(error);
                },
            );
        });
    }
}
