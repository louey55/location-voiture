import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyReservationsComponent } from './agency-reservations.component';

describe('AgencyReservationsComponent', () => {
  let component: AgencyReservationsComponent;
  let fixture: ComponentFixture<AgencyReservationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgencyReservationsComponent]
    });
    fixture = TestBed.createComponent(AgencyReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
