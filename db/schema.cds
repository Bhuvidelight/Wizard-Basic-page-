namespace JobApplicationTracker;

using { cuid, managed } from '@sap/cds/common';

entity Companies : managed {
    key CompanyID : String;
    CompanyName  : String;

    CompaniestoJobs : Composition of many Jobs  on CompaniestoJobs.CompanyID = $self.CompanyID;
}


entity Jobs : managed {
    key JobID         : String;
    key CompanyID     : String;
    Role              : String;
    Location          : String;
    
    JobstoCompany : Association to one Companies on JobstoCompany.CompanyID = CompanyID;

    JobstoApplications : Composition of many Applications on JobstoApplications.JobID = $self.JobID;
}


entity Applications : cuid, managed {
    
    JobID        : String;
    Status            : String default 'APPLIED';
    AppliedDate       : String;

    ApplicationstoJobs : Association to one Jobs  on ApplicationstoJobs.JobID = JobID;

    Attachments : Composition of many ApplicationAttachments on Attachments.application = $self;
}

entity ApplicationAttachments : cuid, managed {
    application : Association to Applications;
    FileName     : String;
    MediaType   : String;
   
}

