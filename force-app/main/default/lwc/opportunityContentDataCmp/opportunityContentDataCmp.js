import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { subscribe, onError } from 'lightning/empApi';
import getoppwithContentdata from '@salesforce/apex/opportunityContentDataController.getcontentdata';
import updatecontentData from '@salesforce/apex/opportunityContentDataController.updatecontentData';
import retrieveContent from '@salesforce/apex/opportunityContentDataController.retrieveContent';
import RevspaceImage from '@salesforce/resourceUrl/RevspaceImage';
import Excel from '@salesforce/resourceUrl/Excel';
import PDF from '@salesforce/resourceUrl/PDF';
import STAGE_NAME from '@salesforce/schema/Opportunity.StageName';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const fields = [STAGE_NAME];

export default class OpportunityContentDataCmp extends LightningElement {
    @track data = [];
    @track error;
    @track oppstage;
    @track IsLoading = false;
    @track message;
    @track records = [];
    @track onsearchshowrecord = false;
    @track searchStageName = '';
    subscription = {};
    @api channelName = '/event/Content_Event__e';
    NoData = false;
    chevroniconShowHide = true;
    visblityPlay = false;
    visblityROI = false;
    opportunityStageName;
    visblityPlay;
    @api recordId;

    RImage = RevspaceImage;
    PDFIcon = PDF;
    ExcelIcon = Excel;

    @wire(getRecord, { recordId: '$recordId', fields })
    opportunity;

    constructor() {
        super();
    }

    connectedCallback() {
        this.IsLoading = true;

        // console.log('this.opportunityStageName--',this.recordId);

        // this.opportunityStageName = getFieldValue(this.opportunity.data, STAGE_NAME)

        getoppwithContentdata({ recordId: this.recordId })
            .then(result => {
                var tempData = JSON.parse(JSON.stringify(result));
                this.records = tempData;
                console.log('this.records---connected------'+JSON.stringify(this.records));
                this.onsearchshowrecord = true;
                if (this.records.length > 0) {
                    this.NoData = false;
                } else {
                    this.NoData = true;
                }
                this.IsLoading = false;
            }).catch(error => {
                this.records = null;
                this.IsLoading = false;
                this.NoData = true;
            })

        this.registerErrorListener();
        this.handleSubscribe();

        // console.log('this.opportunityStageName--',this.opportunity.data);
        // console.log('this.opportunityStageName--',getFieldValue(this.opportunity.data, STAGE_NAME));
    }

    // @wire(getoppwithContentdata, { recordId: '$recordId' })
    // wiredContentData({ error, data }) {
    //     if (data) {
    //         console.log('42 wire method called!! getoppwithContentdata', JSON.stringify(data));
    //         this.records = data;
    //         this.onsearchshowrecord = true;
    //         this.IsLoading = false;
    //     } else if (error) {
    //         this.error = error;
    //         console.log('47 wire method called!! getoppwithContentdata', JSON.stringify(error));
    //         this.records = null;
    //         this.IsLoading = false;
    //         this.NoData = true;
    //     }
    // }

    @wire(updatecontentData, { oppStage: '$oppstage' })
    updatedwiredContentData({ error, data }) {
        this.IsLoading = true;
        if (data) {
            var tempdata = JSON.parse(JSON.stringify(data))
            this.records = tempdata;
            console.log('60 wire method called!! getoppwithContentdata', JSON.stringify(this.records));
            this.IsLoading = false;
            if (this.records.length > 0) {
                console.log('63 wire method called!! getoppwithContentdata', JSON.stringify(this.records));
                this.NoData = false;
            } else {
                console.log('66 wire method called!! getoppwithContentdata', JSON.stringify(this.records));
                this.NoData = true;
            }
        } else if (error) {
            console.log('70 wire method called!! getoppwithContentdata', JSON.stringify(this.records));
            this.error = error;
            this.records = null;
            this.IsLoading = false;
            this.NoData = true;
        }
    }
    handleSubscribe() {
        this.IsLoading = true;
        console.log('handleSubscribe method called');
        const self = this;
        const messageCallback = function (response) {
            var obj = response;
            let objData = obj.data.payload;
            self.message = objData.Message__c;
            self.oppstage = objData.Status__c;
            self.recordId = objData.RecordId__c;
        };
        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, messageCallback)
            .then(response => {
                // Response contains the subscription information on subscribe call
                console.log('Subscription request sent to: ', JSON.stringify(response.channel));
                this.IsLoading = false;
                this.subscription = response;
            });
    }

    registerErrorListener() {
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
        });
    }

    handleSectionToggle(event) {
        console.log(event.detail.openSections);
    }

    handleSearchchange(event) {
        this.searchStageName = event.target.value;

        console.log('this.searchStageName lenght', this.searchStageName.length);

        this.IsLoading = true;
        if (this.searchStageName === '') {
            this.opportunityStageName = getFieldValue(this.opportunity.data, STAGE_NAME)
            console.log('this.opportunityStageName--', this.opportunity.data);

            retrieveContent({ keySearch: this.opportunityStageName })
                .then(result => {
                    var tempData = JSON.parse(JSON.stringify(result));
                    this.records = tempData;
                    this.onsearchshowrecord = true;
                    if (this.records.length > 0) {
                        this.NoData = false;
                    } else {
                        this.NoData = true;
                    }
                    this.IsLoading = false;
                }).catch(error => {
                    this.records = null;
                    this.IsLoading = false;
                    this.NoData = true;
                })
        } else {
            if (this.searchStageName.length <= 2) {
                this.IsLoading = false;
                return
            }

            retrieveContent({ keySearch: this.searchStageName })
                .then(result => {
                    var tempData = JSON.parse(JSON.stringify(result));
                    this.records = tempData;
                    this.onsearchshowrecord = true;
                    if (this.records.length > 0) {
                        this.NoData = false;
                    } else {
                        this.NoData = true;
                    }
                    this.IsLoading = false;
                }).catch(error => {
                    this.records = null;
                    this.IsLoading = false;
                    this.NoData = true;
                })
        }
    }
    chevroniconShowHandleClick(event) {
        var recId = event.target.dataset.id;
        
        this.records.forEach(element => {
            if (recId == element.Id) {
                if (element.Show_Contents_Records__c === false) {
                    element.Show_Contents_Records__c = true;
                } else {
                    element.Show_Contents_Records__c = false;
                }
            } 
        });
        console.log(' this.records---------'+JSON.stringify(this.records));
    }
  /*  chevroniconHideHandleClick(event) {
        /*const ct = event.target.dataset.id;
        console.log('202 ct Id...', event.target.dataset.id);
        visblityPlay = ct;
        console.log('204 selectedContentId...',selectedContentId);
        this.visblityPlay = false;
        this.chevroniconShowHide = true;
        console.log('Is visibility false???...',this.visblityPlay);
    }*/
    // handleEnter() {
    //     this.IsLoading = true;
    //     if (this.searchStageName !== '') {
    //         retrieveContent({ keySearch: this.searchStageName })
    //         .then(result => {
    //             this.records = result;
    //             this.onsearchshowrecord = true;
    //             if (this.records.length > 0) {
    //                 this.NoData = false;
    //             } else {
    //                 this.NoData = true;
    //             }
    //             this.IsLoading = false;
    //         }).catch(error => {
    //             this.records = null;
    //             this.IsLoading = false;
    //             this.NoData = true;
    //         })
    //     } 
    //     else if(this.searchStageName == '') {
    //         const event = new ShowToastEvent({
    //             title: 'Information',
    //             message: 'Please select the search value',
    //             variant: 'info',
    //             mode: 'dismissable'
    //         });
    //         this.dispatchEvent(event);
    //         this.IsLoading = false;
    //     }
    // }

    // get iconName1() {
    //     if (this.visblityPlay) {
    //         return 'utility:chevronup';
            
    //     } else {
    //         return 'utility:chevrondown';
    //     }
    //     //return this.visblityPlay ? 'utility:chevronup' : 'utility:chevrondown';
    // }

    playReducehandleClick() {
        this.visblityROI = false;
        this.visblityPlay = !this.visblityPlay;
    }

    roiHandleClick() {
        this.visblityPlay = false;
        this.visblityROI = !this.visblityROI;
    }
}