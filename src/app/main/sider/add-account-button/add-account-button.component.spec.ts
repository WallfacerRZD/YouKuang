import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AddAccountButtonComponent} from './add-account-button.component';

describe('AddAccountButtonComponent', () => {
    let component: AddAccountButtonComponent;
    let fixture: ComponentFixture<AddAccountButtonComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AddAccountButtonComponent]
        })
               .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AddAccountButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
