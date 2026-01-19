using { JobApplicationTracker as db } from '../db/schema';

service JobService {

entity Companies as projection on db.Companies;
entity Jobs as projection on db.Jobs;

@odata.draft.enabled
entity Applications as projection on db.Applications;
entity ApplicationAttachments as projection on db.ApplicationAttachments;
    
}