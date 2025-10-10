import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BatalhaComponent } from './batalha.component';

describe('BatalhaComponent', () => {
    let component: BatalhaComponent;
    let fixture: ComponentFixture<BatalhaComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BatalhaComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(BatalhaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display pokemons in the team', () => {
        component.equipe = [
            { nome: 'pikachu', imagem_url: 'url1' },
            { nome: 'squirtle', imagem_url: 'url2' }
        ];
        expect(component.equipe.length).toBe(2);
        expect(component.equipe[0].nome).toBe('pikachu');
    });
});
