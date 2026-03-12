import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedChats } from './saved-chats';

describe('SavedChats', () => {
  let component: SavedChats;
  let fixture: ComponentFixture<SavedChats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedChats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedChats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
