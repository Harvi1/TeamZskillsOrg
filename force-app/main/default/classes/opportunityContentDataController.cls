public class opportunityContentDataController {
    
    @AuraEnabled(cacheable = true)
    public static Map<string, List<Content__c>> getContentData(Id recordId){

        try {
            string oppStageName;

            List<Opportunity> oppoList =  [SELECT Id, 
                                                Name, 
                                                StageName 
                                        FROM Opportunity 
                                        WHERE Id =: recordId];
    
            Map<string, List<Content__c>> conWrapMap = new Map<string, List<Content__c>>();
    
            if(!oppoList.isEmpty()){
                oppStageName = oppoList[0].StageName != null ? oppoList[0].StageName : '';
    
                List<Content__c> contentList = [SELECT Id, 
                                                        Name, 
                                                        opportunity_stage__c, 
                                                        content_tags__c, 
                                                        document_title__c,
                                                		document_url__c,
                                                        thumbs_count__c, 
                                                        recommended_count__c, 
                                                        shared_count__c, 
                                                        views_count__c, 
                                                        time_created__c, 
                                                        document_description__c, 
                                                        time_last_edited__c, 
                                                        CreatedBy.Name, 
                                                        Show_Contents_Records__c, 
                                                        CreatedDate,
                                                        document_thumbnail_url__c,
                                                        document_icon_url__c
                                                FROM Content__c 
                                                WHERE opportunity_stage__c =: oppStageName 
                                                AND op_is_current__c = true];
                
                conWrapMap = contentData(contentList);
            }
            return conWrapMap;    
        } catch (Exception e) {
            throw new AuraHandledException('No Record Found..'+e.getMessage());   
        }
    }

    public static Map<string, List<Content__c>> contentData(List<Content__c> contList){
        
        Map<string, List<Content__c>> conWrapMap = new Map<string, List<Content__c>>();

        for(Content__c conObj : contList) {
            if(conObj.content_tags__c != null){
                if(!conWrapMap.containsKey(conObj.content_tags__c)){
                    conWrapMap.put(conObj.content_tags__c, new List<Content__c>{conObj});
                } else {
                    List<Content__c> coList = conWrapMap.get(conObj.content_tags__c);
                    coList.add(conObj);
                    conWrapMap.put(conObj.content_tags__c, coList);
                }
            }
        }

        return conWrapMap;
    }
    
    @AuraEnabled(cacheable=true)
    public static void publishEvent(){
        Content_Event__e event = new Content_Event__e();
        EventBus.publish(event);
    }

    @AuraEnabled(cacheable=true)
    public static Map<string, List<Content__c>> updateContentData(string oppStage){

        try {
            Map<string, List<Content__c>> conWrapMap = new Map<string, List<Content__c>>();

            system.debug('oppStageName-->> '+oppStage);
            
            List<Content__c> updatedcontentList = [SELECT Id, 
                                                        Name, 
                                                        opportunity_stage__c, 
                                                        content_tags__c, 
                                                        document_title__c,
                                                   		document_url__c,
                                                        thumbs_count__c, 
                                                        recommended_count__c, 
                                                        shared_count__c, 
                                                        views_count__c,
                                                        time_created__c, 
                                                        document_description__c,
                                                        time_last_edited__c,
                                                        CreatedBy.Name, 
                                                        Show_Contents_Records__c,
                                                        CreatedDate,
                                                        document_thumbnail_url__c,
                                                        document_icon_url__c
                                                    FROM Content__c 
                                                    WHERE opportunity_stage__c =: oppStage 
                                                    AND op_is_current__c = True];
    
            if(!updatedcontentList.isEmpty()) {
                conWrapMap = contentData(updatedcontentList);
            } 

            return conWrapMap;
        } catch (Exception e) {
            throw new AuraHandledException('No Record Found..'+e.getMessage());
        }
        
    }
    @AuraEnabled(cacheable=true)
    public static Map<string, List<Content__c>> retrieveContent(string keySearch){
       keySearch = '%' + keySearch + '%';
       Map<string, List<Content__c>> conWrapMap = new Map<string, List<Content__c>>();

        try {
            Set<Id> contIds = new Set<Id>();

            List<Content__c> mycontentList = [SELECT Id,
                                                    Name, 
                                                    opportunity_stage__c, 
                                                    content_tags__c, 
                                                    document_title__c,
                                              		document_url__c,
                                                    thumbs_count__c, 
                                                    recommended_count__c, 
                                                    shared_count__c, 
                                                    views_count__c,
                                                    time_created__c, 
                                                    document_description__c,
                                                    time_last_edited__c,
                                                    CreatedBy.Name,
                                                    CreatedDate,
                                                    Show_Contents_Records__c,
                                                    document_thumbnail_url__c,
                                                    document_icon_url__c
                                            FROM Content__c
                                            WHERE opportunity_stage__c LIKE :keySearch 
                                            OR content_tags__c LIKE: keySearch 
                                            OR document_title__c LIKE :keySearch];

            for(Content__c cont : mycontentList){
                contIds.add(cont.Id);
            }
            
            system.debug('mycontentList>>>>:'+mycontentList);

            List<Content__c> conRchTxtList = [SELECT Id,
                                                    Name, 
                                                    opportunity_stage__c, 
                                                    content_tags__c, 
                                                    document_title__c,
                                                    document_url__c,
                                                    thumbs_count__c, 
                                                    recommended_count__c, 
                                                    shared_count__c, 
                                                    views_count__c,
                                                    time_created__c, 
                                                    document_description__c,
                                                    time_last_edited__c,
                                                    CreatedBy.Name,
                                                    CreatedDate,
                                                    Show_Contents_Records__c,
                                                    document_thumbnail_url__c,
                                                    document_icon_url__c
                                            FROM Content__c];

            for(Content__c cont : conRchTxtList){
                if(cont.document_description__c != null && cont.document_description__c.contains(keySearch) && !contIds.contains(cont.Id)){
                    mycontentList.add(cont);
                }
            }

            if(!mycontentList.isEmpty()){
                conWrapMap = contentData(mycontentList);
            }

            return conWrapMap;

        } catch (Exception e) {
            throw new AuraHandledException('No Record Found..'+e.getMessage());
        }
    }
}