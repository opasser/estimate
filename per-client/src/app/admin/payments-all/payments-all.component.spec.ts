import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsAllComponent } from './payments-all.component';

describe('PaymentsAllComponent', () => {
  let component: PaymentsAllComponent;
  let fixture: ComponentFixture<PaymentsAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
