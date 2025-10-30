import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleSidebarComponent } from './battle-sidebar.component';

describe('BattleSidebarComponent', () => {
  let component: BattleSidebarComponent;
  let fixture: ComponentFixture<BattleSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleSidebarComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BattleSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
