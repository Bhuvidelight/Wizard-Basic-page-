sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("jobapplications.controller.View1", {
        _oDraftCtx: null,

        /* ================= INIT ================= */
        onInit: function () {
            const oLocalModel = new sap.ui.model.json.JSONModel({
                Company: { CompanyID: "", CompanyName: "" },
                Job: { JobID: "", Role: "", Location: "" },
                Application: { Status: "APPLIED", AppliedDate: null },
                Attachments: [],
                ui: {
                    companyNextVisible: false,
                    jobNextVisible: false,
                    applicationNextVisible: false
                }
            });

            this.getView().setModel(oLocalModel, "local");
            oLocalModel.setProperty("/Company/CompanyID", this._generateCompanyID());
            oLocalModel.setProperty("/Job/JobID", this._generateJobID());
            this._validateCompanyStep();
        },

        /* ================= WIZARD NAV ================= */
        onNextFromCompany: function () {
            const oWizard = this.byId("jobWizard");
            oWizard.validateStep(this.byId("stepCompany"));
            oWizard.nextStep();
        },

        onNextFromJob: function () {
            const oWizard = this.byId("jobWizard");
            oWizard.validateStep(this.byId("stepJob"));
            oWizard.nextStep();
        },

        onNextFromApplication: function () {
            const oWizard = this.byId("jobWizard");
            oWizard.validateStep(this.byId("stepApplication"));
            oWizard.nextStep();

            this.byId("submitBtn").setVisible(true);
            this.byId("saveDraftBtn").setVisible(true);
        },

        /* ================= VALIDATION ================= */
        onCompanyChange: function (oEvent) {
            const sValue = oEvent.getSource().getValue().trim();
            const oModel = this.getView().getModel("local");

            oEvent.getSource().setValueState(sValue ? "None" : "Error");
            oModel.setProperty("/ui/companyNextVisible", !!sValue);
        },

        onJobChange: function () {
            const oView = this.getView();
            const sRole = oView.byId("_IDGenInput3").getValue().trim();
            const sLoc = oView.byId("_IDGenInput4").getValue().trim();
            oView.getModel("local").setProperty("/ui/jobNextVisible", !!(sRole && sLoc));
        },

        onApplicationChange: function () {
            const oModel = this.getView().getModel("local");
            const bValid = !!oModel.getProperty("/Application/AppliedDate") &&
                oModel.getProperty("/Attachments").length > 0;
            oModel.setProperty("/ui/applicationNextVisible", bValid);
        },

        _validateCompanyStep: function () {
            const bValid = !!this.getView().getModel("local").getProperty("/Company/CompanyName");
            this.getView().getModel("local").setProperty("/ui/companyNextVisible", bValid);
        },

        /* ================= FILE HANDLING ================= */
        onFileChange: function (oEvent) {
            const oFiles = oEvent.getParameter("files");

            if (!oFiles || !oFiles.length) {
                return;
            }

            const aFiles = Array.from(oFiles);
            const oModel = this.getView().getModel("local");

            const aAttachments = aFiles.map(oFile => ({
                displayName: "Resume",
                fileName: oFile.name,
                mediaType: oFile.type,
                fileObject: oFile
            }));

            oModel.setProperty("/Attachments", aAttachments);

            // 🔑 This enables NEXT button
            this.onApplicationChange();
        },

        onPreviewAttachment: function (oEvent) {
            const oFile = oEvent.getSource().getBindingContext("local").getObject();
            const sUrl = URL.createObjectURL(oFile.fileObject);
            window.open(sUrl, "_blank");
            setTimeout(() => URL.revokeObjectURL(sUrl), 1000);
        },

        /* ================= DRAFT ================= */
        onSaveDraft: async function () {
    const oView = this.getView();
    const oOData = this.getOwnerComponent().getModel();
    const oLocal = oView.getModel("local").getData();

    try {
        /* =========================
           1. SAVE COMPANY (ACTIVE)
        ========================= */
        await oOData.bindList("/Companies").create({
            CompanyID: oLocal.Company.CompanyID,
            CompanyName: oLocal.Company.CompanyName
        }).created();

        /* =========================
           2. SAVE JOB (ACTIVE)
        ========================= */
        await oOData.bindList("/Jobs").create({
            JobID: oLocal.Job.JobID,
            CompanyID: oLocal.Company.CompanyID,
            Role: oLocal.Job.Role,
            Location: oLocal.Job.Location
        }).created();

        /* =========================
           3. SAVE APPLICATION (DRAFT)
        ========================= */
        if (!this._oDraftCtx) {
            const oAppList = oOData.bindList("/Applications");

            this._oDraftCtx = oAppList.create({
                JobID: oLocal.Job.JobID,
                Status: oLocal.Application.Status,
                AppliedDate: oLocal.Application.AppliedDate
            });

            await this._oDraftCtx.created();
        }

        /* =========================
           4. SAVE ATTACHMENTS (DRAFT)
        ========================= */
        const aFiles = oLocal.Attachments || [];
        const oAttachList = oOData.bindList(
            this._oDraftCtx.getPath() + "/Attachments"
        );

        for (const f of aFiles) {
            await oAttachList.create({
                FileName: f.fileName,
                MediaType: f.mediaType
            }).created();
        }

        // bind view to DRAFT Application
        oView.setBindingContext(this._oDraftCtx);

        MessageBox.success("Draft saved");

    } catch (e) {
        console.error(e);
        MessageBox.error("Draft save failed");
    }
}
,
        /* ================= SUBMIT ================= */
        onSubmit: async function () {
    const oView = this.getView();
    let oCtx = oView.getBindingContext();

    try {
        /* =========================
           ACTIVATE EXISTING DRAFT
        ========================= */
        if (oCtx && oCtx.getProperty("IsActiveEntity") === false) {
            await oCtx.getModel()
                .bindContext(
                    oCtx.getPath() + "/JobService.draftActivate(...)"
                )
                .execute();

            MessageBox.success("Application submitted successfully");
            this._afterSubmitReset();
            return;
        }

        /* =========================
           NO DRAFT → SAVE + ACTIVATE
        ========================= */
        await this.onSaveDraft();

        oCtx = oView.getBindingContext();

        await oCtx.getModel()
            .bindContext(
                oCtx.getPath() + "/JobService.draftActivate(...)"
            )
            .execute();

        MessageBox.success("Application submitted successfully");
        this._afterSubmitReset();

    } catch (e) {
        console.error(e);
        MessageBox.error("Submit failed");
    }
} ,

        _afterSubmitReset: function () {
            this._oDraftCtx = null;
            this.getView().setBindingContext(null);
            this._resetWizard();
        },

        /* ================= RESET ================= */
        _resetWizard: function () {
            const oWizard = this.byId("jobWizard");
            const oModel = this.getView().getModel("local");

            oModel.setData({
                Company: { CompanyID: this._generateCompanyID(), CompanyName: "" },
                Job: { JobID: this._generateJobID(), Role: "", Location: "" },
                Application: { Status: "APPLIED", AppliedDate: null },
                Attachments: [],
                ui: { companyNextVisible: false, jobNextVisible: false, applicationNextVisible: false }
            });

            oWizard.discardProgress(oWizard.getSteps()[0]);
            oWizard.goToStep(oWizard.getSteps()[0]);

            this.byId("submitBtn").setVisible(false);
            this.byId("saveDraftBtn").setVisible(false);
        },

        _generateCompanyID: () => "C" + Math.floor(100 + Math.random() * 900),
        _generateJobID: () => "J" + Math.floor(100 + Math.random() * 900)
    });
});
