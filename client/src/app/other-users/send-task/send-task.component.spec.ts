import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendTaskComponent } from './send-task.component';

describe('SendTaskComponent', () => {
  let component: SendTaskComponent;
  let fixture: ComponentFixture<SendTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
