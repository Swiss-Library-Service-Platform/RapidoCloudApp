import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { RequestIdComponent } from './request-id.component';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { UserInformation } from '../../models/UserInformation';

describe('RequestIdComponent', () => {
  let component: RequestIdComponent;
  let fixture: ComponentFixture<RequestIdComponent>;
  let backendService: jasmine.SpyObj<BackendService>;
  let loadingIndicator: jasmine.SpyObj<LoadingIndicatorService>;

  beforeEach(() => {
    backendService = jasmine.createSpyObj<BackendService>(
      'BackendService',
      ['retrieveInstitutions', 'retrieveUserInformation']);
    backendService.retrieveInstitutions.and.returnValue(Promise.resolve([]));
    loadingIndicator = jasmine.createSpyObj<LoadingIndicatorService>(
      'LoadingIndicatorService',
      ['show', 'hide']);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestIdComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: BackendService, useValue: backendService },
        { provide: LoadingIndicatorService, useValue: loadingIndicator },
        { provide: StatusIndicatorService, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not search with an empty or whitespace-only request ID', () => {
    component.inputRequestId = '   ';

    component.onClickRetrieveUserInformation();

    expect(component.isSearchDisabled).toBeTrue();
    expect(backendService.retrieveUserInformation).not.toHaveBeenCalled();
  });

  it('uses automatic lookup without showing the institution fallback', fakeAsync(() => {
    const user = new UserInformation({
      primary_id: '12345',
      email: 'user@example.org',
      note: 'Deliver electronically',
      borrowing_institution: 'ABC'
    });
    backendService.retrieveUserInformation.and.returnValue(Promise.resolve(user));
    component.inputRequestId = '  1//41SLSPABC012345  ';

    component.onClickRetrieveUserInformation();
    expect(component.isSearching).toBeTrue();
    flushMicrotasks();

    expect(backendService.retrieveUserInformation).toHaveBeenCalledTimes(1);
    expect(backendService.retrieveUserInformation)
      .toHaveBeenCalledWith('1//41SLSPABC012345', '');
    expect(component.responseUser).toBe(user);
    expect(component.showManualInstitution).toBeFalse();
    expect(component.isSearching).toBeFalse();
    expect(loadingIndicator.show).toHaveBeenCalled();
    expect(loadingIndicator.hide).toHaveBeenCalled();
  }));

  it('reveals the institution fallback when automatic resolution fails', fakeAsync(() => {
    backendService.retrieveUserInformation.and.returnValue(Promise.reject({
      error: {
        type: 'IZ_EXTRACTION_FAILED',
        error_id: 'support-123'
      }
    }));
    component.inputRequestId = '26940073';

    component.onClickRetrieveUserInformation();
    flushMicrotasks();

    expect(component.showManualInstitution).toBeTrue();
    expect(component.inputRequestId).toBe('26940073');
    expect(component.responseErrorMessage).toBeNull();
  }));

  it('keeps the selected institution through a failed manual retry', fakeAsync(() => {
    backendService.retrieveUserInformation.and.returnValue(Promise.reject({
      error: {
        type: 'DEFAULT',
        error_id: 'support-456'
      }
    }));
    component.inputRequestId = '26940073';
    component.inputInstitutionId = 'ABC';
    component.showManualInstitution = true;

    component.onClickRetrieveUserInformation();
    flushMicrotasks();

    expect(component.inputInstitutionId).toBe('ABC');
    expect(component.showManualInstitution).toBeTrue();
    expect(component.responseErrorTitle).toBeTruthy();
    expect(component.responseErrorMessage).toBeTruthy();
    expect(component.responseErrorId).toBe('support-456');
  }));

  it('clears the manual institution after a successful retry', fakeAsync(() => {
    backendService.retrieveUserInformation.and.returnValue(Promise.resolve(
      new UserInformation({
        primary_id: '12345',
        borrowing_institution: 'ABC'
      })));
    component.inputRequestId = '26940073';
    component.inputInstitutionId = 'ABC';
    component.showManualInstitution = true;

    component.onClickRetrieveUserInformation();
    flushMicrotasks();

    expect(backendService.retrieveUserInformation).toHaveBeenCalledTimes(1);
    expect(backendService.retrieveUserInformation)
      .toHaveBeenCalledWith('26940073', 'ABC');
    expect(component.inputInstitutionId).toBe('');
    expect(component.showManualInstitution).toBeFalse();
  }));

  it('clears previous state when the request ID changes', () => {
    component.inputInstitutionId = 'ABC';
    component.showManualInstitution = true;
    component.responseUser = new UserInformation({ primary_id: 'old-user' });
    component.responseErrorTitle = 'Old title';
    component.responseErrorMessage = 'Old error';
    component.responseErrorId = 'old-support-id';

    component.onRequestIdChanged('new-request');

    expect(component.inputRequestId).toBe('new-request');
    expect(component.inputInstitutionId).toBe('');
    expect(component.showManualInstitution).toBeFalse();
    expect(component.responseUser).toBeNull();
    expect(component.responseErrorTitle).toBeNull();
    expect(component.responseErrorMessage).toBeNull();
    expect(component.responseErrorId).toBeNull();
  });

  it('uses a concise title for an Alma authorization error', fakeAsync(() => {
    backendService.retrieveUserInformation.and.returnValue(Promise.reject({
      error: {
        type: 'MISSING_USER_INFORMATION',
        error_id: 'support-789',
        additionalInformation: {
          upstream_status: '403'
        }
      }
    }));
    component.inputRequestId = '26940073';

    component.onClickRetrieveUserInformation();
    flushMicrotasks();

    expect(component.responseErrorTitle).toBe('Requests.ErrorTitle.AUTHORIZATION');
    expect(component.responseErrorMessage)
      .toBe('Requests.Error.ALMA_UPSTREAM_AUTHORIZATION_ERROR');
  }));

  it('blocks duplicate searches while a lookup is running', fakeAsync(() => {
    let resolveLookup: (user: UserInformation) => void;
    backendService.retrieveUserInformation.and.returnValue(
      new Promise<UserInformation>(resolve => resolveLookup = resolve));
    component.inputRequestId = '26940073';

    component.onClickRetrieveUserInformation();
    component.onClickRetrieveUserInformation();

    expect(backendService.retrieveUserInformation).toHaveBeenCalledTimes(1);
    resolveLookup(new UserInformation({
      primary_id: '12345',
      borrowing_institution: 'ABC'
    }));
    flushMicrotasks();
    expect(component.isSearching).toBeFalse();
  }));

  it('renders a dash for missing email and note values', () => {
    component.responseUser = new UserInformation({
      primary_id: '12345',
      borrowing_institution: 'ABC'
    });

    fixture.detectChanges();

    const values = Array.from(
      fixture.nativeElement.querySelectorAll('.result-details dd'))
      .map((element: HTMLElement) => element.textContent.trim());
    expect(values).toEqual(['ABC', '12345', '—', '—']);
  });
});
