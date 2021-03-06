import {Component, OnInit} from '@angular/core';
import {AccountService} from '../../../service/account.service';
import {AccountItem} from '../../../entity/AccountItem';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {CollapseService} from '../../../service/collapse.service';
import {MobileService} from '../../../service/mobile.service';
import {TableLoadingService} from '../../../service/table-loading.service';
import {NzMessageService, NzNotificationService} from 'ng-zorro-antd';
import {ItemTypeService} from '../../../service/item-type.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AccountItemService} from '../../../service/account-item.service';

@Component({
    selector: 'app-account-content',
    templateUrl: './account-content.component.html',
    styleUrls: ['./account-content.component.css']
})
export class AccountContentComponent implements OnInit {
    accountItemList: AccountItem[] = [];

    accountName = '';

    accountID = '';

    costSum = 0;

    incomeSum = 0;

    accountItemID = 0;

    modifyDrawerIsVisible: any;

    validateForm: FormGroup;

    constructor(private accountService: AccountService,
                private routerService: Router,
                private activatedRouterService: ActivatedRoute,
                public collapsedService: CollapseService,
                public mobileService: MobileService,
                public loading: TableLoadingService,
                private notification: NzNotificationService,
                public itemTypeService: ItemTypeService,
                public tableLoadingService: TableLoadingService,
                private fb: FormBuilder,
                private accountItemService: AccountItemService,
                private messageService: NzMessageService) {
    }

    ngOnInit() {
        this.validateForm = this.fb.group({
            date: [null, [Validators.required]],
            itemType: [null, [Validators.required]],
            money: [null, [Validators.required]],
            tip: [null],
            inOut: [null, [Validators.required]]
        });
        this.accountService.accountContent$.subscribe(
            value => {
                this.resetData();
                this.accountItemList = value;
                this.accountItemList.forEach(item => {
                    item['checked'] = false;
                    item['itDeleted'] = false;
                });
                this.incomeSum = this.accountItemList
                                     .filter(item => item.inOut === '收入')
                                     .map(item => item.money)
                                     .reduce((pre, curr) => pre + curr, 0);
                this.costSum = this.accountItemList
                                   .filter(item => item.inOut === '支出')
                                   .map(item => item.money)
                                   .reduce((pre, curr) => pre + curr, 0);
                setTimeout(() => {
                    this.loading.isLoading = false;
                    if (this.mobileService.isMobile &&
                        !this.collapsedService.isCollapsed) {
                        this.collapsedService.changeCollapsed();
                    }
                }, 500);
            }
        );
        this.routerService.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(
            () => {
                this.updateData();
            }
        );
        // 实在没有办法了T_T
        this.updateData();

    }

    // item.typeID, item.money, item.time, item.tip
    public createNotification(type: string, money: number, time: Date, tip: string) {
        this.notification.create('info', tip,
            `时间: ${time.toLocaleString()}   类型: ${type}`);
    }

    closeDrawer() {
        this.modifyDrawerIsVisible = false;
    }

    openDrawer(item: AccountItem) {
        this.modifyDrawerIsVisible = true;
        this.validateForm.controls['date'].setErrors({'incorrect': true});
        this.validateForm.controls['itemType'].setErrors({'incorrect': true});
        this.validateForm.controls['money'].setValue(item.money);
        this.validateForm.controls['tip'].setValue(item.tip);
        this.validateForm.controls['inOut'].setValue(item.inOut);
        this.accountItemID = item.iNo;
    }

    invalid(formControlName: string): boolean {
        return this.validateForm.get(formControlName).dirty &&
            this.validateForm.get(formControlName).invalid;
    }

    onSubmit() {
        this.tableLoadingService.isLoading = true;
        const $modifyItemResponse = this.accountItemService.modifyItemResponse$.subscribe(
            response => {
                if (response) {
                    this.messageService.create('success', '修改成功');
                } else {
                    this.messageService.create('failed', '修改失败');
                }
                this.closeDrawer();
                this.tableLoadingService.isLoading = false;
                $modifyItemResponse.unsubscribe();
            }
        );
        this.accountItemService.nextModifyItemResponse(
            this.accountID,
            this.accountItemID,
            this.validateForm.value['inOut'],
            parseInt(this.validateForm.value['money'], 10),
            this.validateForm.value['itemType'],
            (<Date>this.validateForm.value['date']),
            this.validateForm.value['tip'],
        );
    }

    resetData() {
        this.costSum = 0;
        this.incomeSum = 0;
        this.loading.isLoading = true;
    }

    updateData() {
        this.accountName = this.activatedRouterService.snapshot.queryParamMap.get('accountName');
        this.accountID = this.activatedRouterService.snapshot.paramMap.get('id');
        this.accountService.nextAccountContent(this.accountID);
    }
}
