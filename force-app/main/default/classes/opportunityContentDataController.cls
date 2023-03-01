public class opportunityContentDataController {
    @AuraEnabled(cacheable=true)
    public static List<Content__c> getcontentdata(Id recordId){

        try {
            string oppstagename;
            List<Opportunity> oppoList =  [SELECT id, name,StageName FROM Opportunity WHERE id =:recordId];
    
            List<Content__c> contentList = new List<Content__c>();
    
            if(!oppoList.isEmpty()){
                oppstagename = oppoList[0].StageName;
    
                //system.debug('oppstagename-->>'+oppstagename);
                contentList = [Select Id,Name, opportunity_stage__c, content_tags__c, document_title__c, 
                               thumbs_count__c, recommended_count__c, shared_count__c, views_count__c,time_created__c, 
                               document_description__c,time_last_edited__c,CreatedBy.Name, CreatedDate From Content__c 
                               WHERE opportunity_stage__c=:oppstagename AND op_is_current__c = True];
    
            }
            
            return contentList;    
        } catch (Exception e) {
            throw new AuraHandledException('No Record Found..'+e.getMessage());   
        }
        
    }
    @AuraEnabled(cacheable=true)
    public static void publishEvent(){
        Content_Event__e event = new Content_Event__e();
        EventBus.publish(event);
    }
    @AuraEnabled(cacheable=true)
    public static List<Content__c> updatecontentData(string oppStage){

        try {
            system.debug('oppStageName-->> '+oppStage);
            List<Content__c> updatedcontentList = [Select Id,Name, opportunity_stage__c, content_tags__c, document_title__c, thumbs_count__c, 
                                                   recommended_count__c, shared_count__c, views_count__c,time_created__c, document_description__c,
                                                   time_last_edited__c,CreatedBy.Name, CreatedDate From Content__c 
                                                   WHERE opportunity_stage__c =: oppStage AND op_is_current__c = True];
            system.debug('contentList-->>'+updatedcontentList);
    
            if(!updatedcontentList.isEmpty()) {
                return updatedcontentList;
            } else {
                return new List<Content__c>();
            }    
        } catch (Exception e) {
            throw new AuraHandledException('No Record Found..'+e.getMessage());
        }
        
    }
    @AuraEnabled(cacheable=true)
    public static List<Content__c> retrieveContent(string keySearch){
       keySearch = '%' + keySearch + '%';

        try {
            Set<Id> contIds = new Set<Id>();
            List<Content__c> mycontentList = [Select Id,Name, opportunity_stage__c, content_tags__c, document_title__c, thumbs_count__c, 
                                              recommended_count__c, shared_count__c, views_count__c,time_created__c, 
                                              document_description__c,time_last_edited__c From Content__c
                                              WHERE opportunity_stage__c LIKE :keySearch OR 
                                              content_tags__c LIKE: keySearch OR 
                                              document_title__c LIKE :keySearch];

            for(Content__c cont : mycontentList){
                contIds.add(cont.Id);
            }
            
            system.debug('mycontentList>>>>:'+mycontentList);

            List<Content__c> conRchTxtList = [Select Id,Name, opportunity_stage__c, content_tags__c, document_title__c, thumbs_count__c, 
            recommended_count__c, shared_count__c, views_count__c,time_created__c, 
            document_description__c,time_last_edited__c From Content__c];

            for(Content__c cont : conRchTxtList){
                if(cont.document_description__c != null && cont.document_description__c.contains(keySearch) && !contIds.contains(cont.Id)){
                    mycontentList.add(cont);
                }
            }

            return mycontentList;    
        } catch (Exception e) {
            throw new AuraHandledException('No Record Found..'+e.getMessage());
        }
    }
}