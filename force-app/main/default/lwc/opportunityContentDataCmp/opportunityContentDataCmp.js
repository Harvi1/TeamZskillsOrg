import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { subscribe, onError } from 'lightning/empApi';
import getoppwithContentdata from '@salesforce/apex/opportunityContentDataController.getContentData';
import updatecontentData from '@salesforce/apex/opportunityContentDataController.updateContentData';
import retrieveContent from '@salesforce/apex/opportunityContentDataController.retrieveContent';
import RevspaceImage from '@salesforce/resourceUrl/RevspaceImage';
// import Excel from '@salesforce/resourceUrl/Excel';
// import PDF from '@salesforce/resourceUrl/PDF';
import forward from '@salesforce/resourceUrl/forward';
import Liked from '@salesforce/resourceUrl/Liked';
import Viewed from '@salesforce/resourceUrl/Viewed';
import announcement from '@salesforce/resourceUrl/announcement';
// import 	DOC from '@salesforce/resourceUrl/DOC';
// import PPT from '@salesforce/resourceUrl/PPT';
import STAGE_NAME from '@salesforce/schema/Opportunity.StageName';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const fields = [STAGE_NAME];
export default class OpportunityContentDataCmp extends LightningElement {
    @track data = [];
    @track error;
    @track oppstage;
    @track IsLoading = false;
    @track message;
    @track records = [];
    //@track onsearchshowrecord = false;
    @track searchStageName = '';
    subscription = {};
    @api channelName = '/event/Content_Event__e';
    NoData = false;
    chevroniconShowHide = true;
    // visblityPlay = false;
    // visblityROI = false;
    opportunityStageName;
    //visblityPlay;
    @api recordId;
    RImage = RevspaceImage;
    //PDFIcon = PDF;
    announcement = announcement;
    forward = forward;
    Liked = Liked;
    Viewed = Viewed;
    // ExcelIcon = Excel;
    // DocIcon = DOC;
    // PPTIcon = PPT;


    @wire(getRecord, { recordId: '$recordId', fields })
    opportunity;

    constructor() {
        super();
    }

    connectedCallback() {
        this.IsLoading = true;

        getoppwithContentdata({ recordId: this.recordId })
            .then(result => {
                var tempData = JSON.parse(JSON.stringify(result));
                //this.records = tempData;

                var conts = tempData;
                this.records = [];
                for (var key in conts) {
                    this.records.push({ value: conts[key], key: key }); //Here we are creating the array to show on UI.
                }

                // if (this.records) {
                //     this.records.forEach(item => item['document_url__c'] = '/lightning/r/Content__c/' + item['Id'] + '/view');
                // }
                //console.log('this.records---connected------' + JSON.stringify(this.records));
                //console.log('this.records---connected------' + this.records.length);
                //this.onsearchshowrecord = true;
                if (this.records.length > 0) {
                    this.NoData = false;
                } else {
                    this.NoData = true;
                }
                this.IsLoading = false;
            }).catch(error => {
                console.log('70 wire method called!! getoppwithContentdata', JSON.stringify(error));
                this.records = [];
                this.IsLoading = false;
                this.NoData = true;
            })

        this.registerErrorListener();
        this.handleSubscribe();

        // //console.log('this.opportunityStageName--',this.opportunity.data);
        // //console.log('this.opportunityStageName--',getFieldValue(this.opportunity.data, STAGE_NAME));
    }

    // @wire(getoppwithContentdata, { recordId: '$recordId' })
    // wiredContentData({ error, data }) {
    //     if (data) {
    //         //console.log('42 wire method called!! getoppwithContentdata', JSON.stringify(data));
    //         this.records = data;
    //         this.onsearchshowrecord = true;
    //         this.IsLoading = false;
    //     } else if (error) {
    //         this.error = error;
    //         //console.log('47 wire method called!! getoppwithContentdata', JSON.stringify(error));
    //         this.records = [];
    //         this.IsLoading = false;
    //         this.NoData = true;
    //     }
    // }

    @wire(updatecontentData, { oppStage: '$oppstage' })
    updatedwiredContentData({ error, data }) {
        this.IsLoading = true;
        if (data) {
            var tempdata = JSON.parse(JSON.stringify(data))
            //this.records = tempdata;

            var conts = tempdata;
            this.records = [];
            for(var key in conts){
                this.records.push({value:conts[key], key:key}); //Here we are creating the array to show on UI.
            }

            //console.log('60 wire method called!! getoppwithContentdata', JSON.stringify(this.records));
            this.IsLoading = false;
            if (this.records.length > 0) {
                //console.log('63 wire method called!! getoppwithContentdata', JSON.stringify(this.records));
                this.NoData = false;
            } else {
                //console.log('66 wire method called!! getoppwithContentdata', JSON.stringify(this.records));
                this.NoData = true;
            }
        } else if (error) {
            //console.log('70 wire method called!! getoppwithContentdata', JSON.stringify(this.records));
            console.log('70 wire method called!! getoppwithContentdata', JSON.stringify(error));
            this.error = error;
            this.records = [];
            this.IsLoading = false;
            this.NoData = true;
        }
    }
    handleSubscribe() {
        this.IsLoading = true;
        //console.log('handleSubscribe method called');
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
            //console.log('Subscription request sent to: ', JSON.stringify(response.channel));
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

        //console.log('this.searchStageName lenght', this.searchStageName.length);
        this.IsLoading = true;
        this.records = [];

        if (this.searchStageName === '') {
            this.opportunityStageName = getFieldValue(this.opportunity.data, STAGE_NAME)

            this.retriveContentData(this.opportunityStageName);

            // retrieveContent({ keySearch: this.opportunityStageName })
            // .then(result => {

            //     var tempdata = JSON.parse(JSON.stringify(result));

            //     var conts = tempdata;
            //     this.records = [];
            //     for(var key in conts){
            //         this.records.push({value:conts[key], key:key}); //Here we are creating the array to show on UI.
            //     }

            //     //this.onsearchshowrecord = true;
            //     if (this.records.length > 0) {
            //         this.NoData = false;
            //     } else {
            //         this.NoData = true;
            //     }
            //     this.IsLoading = false;
            // }).catch(error => {
            //     console.log('retrieveContent---', JSON.stringify(error));
            //     this.records = [];
            //     this.IsLoading = false;
            //     this.NoData = true;
            // })
        } else {

            this.retriveContentData(this.searchStageName);
            // retrieveContent({ keySearch: this.searchStageName })
            // .then(result => {

            //     var tempdata = JSON.parse(JSON.stringify(result));
            //     var conts = tempdata;

            //     this.records = [];
            //     for(var key in conts){
            //         this.records.push({value:conts[key], key:key}); //Here we are creating the array to show on UI.
            //     }

            //     if (this.records.length > 0) {
            //         this.NoData = false;
            //     } else {
            //         this.NoData = true;
            //     }
            //     this.IsLoading = false;
                
            // }).catch(error => {
            //     console.log('retrieveContent---', JSON.stringify(error));
            //     this.records = [];
            //     this.IsLoading = false;
            //     this.NoData = true;
            // })
        }
    }

    retriveContentData(stageName){
        
        retrieveContent({ keySearch: stageName })
        .then(result => {

            var tempdata = JSON.parse(JSON.stringify(result));
            var conts = tempdata;

            this.records = [];
            for(var key in conts){
                this.records.push({value:conts[key], key:key}); //Here we are creating the array to show on UI.
            }

            if (this.records.length > 0) {
                this.NoData = false;
            } else {
                this.NoData = true;
            }
            this.IsLoading = false;
            
        }).catch(error => {
            console.log('retrieveContent---', JSON.stringify(error));
            this.records = [];
            this.IsLoading = false;
            this.NoData = true;
        })
    }

    chevroniconShowHandleClick(event) {
        var recId = event.target.dataset.id;

        var seaRecords = JSON.parse(JSON.stringify(this.records));
        seaRecords.forEach(element => {
            element.value.forEach(val => {
                if (recId == val.Id) {
                    if (val.Show_Contents_Records__c === false) {
                        val.Show_Contents_Records__c = true;
                    } else {
                        val.Show_Contents_Records__c = false;
                    }
                }
            });
        });

        this.records = [];
        this.records = JSON.parse(JSON.stringify(seaRecords));
    }
}