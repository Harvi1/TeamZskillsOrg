import { LightningElement, api, track, wire } from 'lwc';
import { subscribe, onError } from 'lightning/empApi';
import getoppwithContentdata from '@salesforce/apex/opportunityContentDataController.getcontentdata';
import updatecontentData from '@salesforce/apex/opportunityContentDataController.updatecontentData';
import retrieveContent from '@salesforce/apex/opportunityContentDataController.retrieveContent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import STAGE_NAME from '@salesforce/schema/Opportunity.StageName';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const fields = [STAGE_NAME];
const DELAY = 100;

export default class OpportunityContentDataCmp extends LightningElement {
    @api recordId;
    @track opportunity;
    @track data = [];
    @track error;
    @track oppstage;
    @track IsLoading = false;
    @track message;
    @track serachkey = '';
    @track records = [];
    @track onsearchshowrecord = false;
    @track onsearchHiderecord = false;
    @track searchStageName = '';
    @track keySearch = '';
    subscription = {};
    @api channelName = '/event/Content_Event__e';
    NoData = false;
    visblityPlay = false;
    visblityROI = false;

    @wire(getRecord, { recordId: '$recordId', fields })
    opportunity;

    connectedCallback() {
        this.registerErrorListener();
        this.handleSubscribe();
    }

    @wire(getoppwithContentdata, { recordId: '$recordId' })
    wiredContentData({ error, data }) {
        if (data) {
            console.log('42 wire method called!! getoppwithContentdata', JSON.stringify(data));
            this.records = data;
            this.onsearchHiderecord = true;
            this.onsearchshowrecord = false;
            this.IsLoading = false;
        } else if (error) {
            this.error = error;
            console.log('47 wire method called!! getoppwithContentdata', JSON.stringify(error));
            this.records = null;
            this.IsLoading = false;
            this.NoData = true;
        }
    }

    @wire(updatecontentData, { oppStage: '$oppstage' })
    updatedwiredContentData({ error, data }) {
        this.IsLoading = true;
        if (data) {
            this.records = data;
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

    handleKeyUp(event) {
        this.keySearch = event.target.value;
        
        if (this.keySearch !== '') {
            retrieveContent({ keySearch: this.keySearch })
                .then(result => {
                    if (event.key === 'Enter') {
                        this.records = result;
                        console.log('117 this.records on search click...', JSON.stringify(this.records));
                        this.onsearchshowrecord = true;
                        this.onsearchHiderecord = false;
                        if (this.records.length > 0) {
                            this.NoData = false;
                        } else {
                            this.NoData = true;
                        }
                    } else{
                        this.onsearchHiderecord = true;
                        this.onsearchshowrecord = false;
                    }
                }).catch(error => {
                    this.records = null;
                    this.NoData = true;
                    

                })
        } /*else if (this.keySearch == '') {
            const event = new ShowToastEvent({
                title: 'Information',
                message: 'Please select the search value',
                variant: 'info',
                mode: 'dismissable'
            });
            this.dispatchEvent(event);

            this.IsLoading = false;
        }*/
        
    }
    handleScroll(event) {
    let area = this.template.querySelector('.scrollArea');
    let threshold = 5 * event.target.clientHeight;
    let areaHeight = area.clientHeight;
    let scrollTop = event.target.scrollTop;
    console.log("scrollTop:" + JSON.stringify(scrollTop));
    if (areaHeight - threshold < scrollTop) {
      let t = this.records.length;
      this.data.push(this.result[t]);
      console.log("data after push--------- :" + JSON.stringify(this.data));
      //this.Contentdata.push( {id:i+t, name:"Row "+(i+t), desc: "Example Row "+(i+t)} );
    }
  }

    /*handleSearchclick() {
        this.IsLoading = true;
        if (this.keySearch !== '') {
            retrieveContent({ keySearch: this.keySearch })
            .then(result => {
                this.records = result;
                console.log('143 this.records on search click...', JSON.stringify(this.records));
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
        else if(this.keySearch == '') {
            const event = new ShowToastEvent({
                title: 'Information',
                message: 'Please select the search value',
                variant: 'info',
                mode: 'dismissable'
            });
            this.dispatchEvent(event);

            this.IsLoading = false;
        }
    }*/

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