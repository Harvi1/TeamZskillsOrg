import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { subscribe, onError } from 'lightning/empApi';
import getoppwithContentdata from '@salesforce/apex/opportunityContentDataController.getcontentdata';
import updatecontentData from '@salesforce/apex/opportunityContentDataController.updatecontentData';
import retrieveContent from '@salesforce/apex/opportunityContentDataController.retrieveContent';
import RevspaceImage from '@salesforce/resourceUrl/RevspaceImage';
import STAGE_NAME from '@salesforce/schema/Opportunity.StageName';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const fields = [STAGE_NAME];

export default class OpportunityContentDataCmp extends LightningElement {
    @track data = [];
    @track error;
    @track oppstage;
    @track IsLoading = false;
    @track message;
    @track serachkey = '';
    @track records = [];
    @track onsearchshowrecord = false;
    @track onclickdata = false;
    @track searchStageName = '';
    subscription = {};
    @api channelName = '/event/Content_Event__e';
    NoData = false;
    visblityPlay = false;
    visblityROI = false;
    opportunityStageName;
    @api recordId;

    RImage = RevspaceImage;

    @wire(getRecord, { recordId: '$recordId', fields })
    opportunity;

    constructor(){
        super();
    }

    connectedCallback() {
        this.IsLoading = true;

        // console.log('this.opportunityStageName--',this.recordId);

        // this.opportunityStageName = getFieldValue(this.opportunity.data, STAGE_NAME)

        getoppwithContentdata({ recordId: this.recordId })
        .then(result => {
            this.records = result;
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
            this.records = data;
            console.log('60 wire method called!! getoppwithContentdata', JSON.stringify(this.records));
            this.IsLoading = false;
            if (this.records.length>0) {
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

        console.log('this.searchStageName lenght',this.searchStageName.length);

        this.IsLoading = true;
        if (this.searchStageName === '') {
            this.opportunityStageName = getFieldValue(this.opportunity.data, STAGE_NAME)
            console.log('this.opportunityStageName--',this.opportunity.data);

            retrieveContent({ keySearch: this.opportunityStageName })
            .then(result => {
                this.records = result;
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
            if(this.searchStageName.length <= 2){
                this.IsLoading = false;
                return
            }

            retrieveContent({ keySearch: this.searchStageName })
            .then(result => {
                this.records = result;
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

    get iconName1() {
        return this.visblityPlay ? 'utility:chevronup' : 'utility:chevrondown';
    }

    playReducehandleClick() {
        this.visblityROI = false;
        this.visblityPlay = !this.visblityPlay;
    }

    roiHandleClick() {
        this.visblityPlay = false;
        this.visblityROI = !this.visblityROI;
    }
}