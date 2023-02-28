trigger OpportunityTrigger on Opportunity (after update) {
    opportunityContentDataController.publishEvent();
    List<Opportunity> opplist = Trigger.new;
    system.debug('opplist-->>'+opplist[0].StageName);
    If(trigger.isAfter && trigger.isUpdate){
        List<Content_Event__e> publishEvents = new List<Content_Event__e>();
        for(Opportunity opp : Trigger.new){
            Content_Event__e eve = new Content_Event__e();
            eve.message__c = opp.NextStep ;
            eve.status__c = opp.StageName;
            eve.recordId__c = opp.Id;
            publishEvents.add(eve);            
        }
        if(publishEvents.size()>0){
            EventBus.publish(publishEvents);
        }
    }
    
    
}