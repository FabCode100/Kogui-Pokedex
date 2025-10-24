import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleSidebar } from './battle-sidebar';

describe('BattleSidebar', () => {
  let component: BattleSidebar;
  let fixture: ComponentFixture<BattleSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BattleSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
