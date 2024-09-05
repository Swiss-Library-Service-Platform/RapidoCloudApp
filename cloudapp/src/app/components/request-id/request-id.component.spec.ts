import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestIdComponent } from './request-id.component';

describe('RequestIdComponent', () => {
  let component: RequestIdComponent;
  let fixture: ComponentFixture<RequestIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestIdComponent ]
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
});
