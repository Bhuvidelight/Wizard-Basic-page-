sap.ui.define(['sap/ui/core/mvc/ControllerExtension'], function (ControllerExtension) {
	'use strict';

	return ControllerExtension.extend('project1.ext.controller.CustomerObject', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf project1.ext.controller.CustomerObject
             */
			onInit: function () {
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				//var oModel = this.base.getExtensionAPI().getModel();
				let historyBtn=sap.ui.core.Element.getElementById("project1::CustomerObjectPage--fe::CustomAction::history");
				historyBtn.setIcon("sap-icon://work-history");
				//historyBtn.setIconFirst(false);

				 if (historyBtn) {
        historyBtn.addStyleClass("historyBtn");
    }

			}
		}
	});
});
