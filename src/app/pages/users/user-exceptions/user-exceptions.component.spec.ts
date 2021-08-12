import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserExceptionsComponent } from './user-exceptions.component';

describe('UserExceptionsComponent', () => {
  let component: UserExceptionsComponent;
  let fixture: ComponentFixture<UserExceptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserExceptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserExceptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
