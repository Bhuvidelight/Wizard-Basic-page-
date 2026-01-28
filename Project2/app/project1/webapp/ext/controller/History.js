sap.ui.define([
    "sap/m/Dialog",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/Button"
], function (Dialog, Table, Column, ColumnListItem, Text, Button) {
    "use strict";

    let oDialog, oTable, oTemplate;

    return {

        onHistoryClick: function (oContext, aSelectedContexts) {
            debugger;


            const oCtx =  oContext;
            if (!oCtx) return;

            const sCustomerId = oCtx.getProperty("customerId");
            var oCustomerData = [];


            $.ajax({
                url: "/odata/v4/myservice/AuditHistoryCustomer?$filter=customerId eq '" + sCustomerId + "'",
                type: "GET",
                contentType: "application/json",
                success: function (data) {
                    oCustomerData = data.value;

                    oCustomerData.sort(function (a, b) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });


                    if (oTable) {
                        oTable.destroyItems();
                    }

                    //date
                    
                    oCustomerData.forEach(record => {
                        const dt = new Date(record.createdAt);

                        const day = dt.getDate().toString().padStart(2, '0');
                        const month = dt.toLocaleString('default', { month: 'short' }); 
                        const year = dt.getFullYear();
                        const hours = dt.getHours().toString().padStart(2, '0');
                        const minutes = dt.getMinutes().toString().padStart(2, '0');

                        record.createdAtFormatted = `${day}-${month}-${year} ${hours}:${minutes}`;
                    });



                    var oModel = new sap.ui.model.json.JSONModel({ records: oCustomerData });
                    oTable.setModel(oModel);

                    oTable.bindItems({
                        path: "/records",
                        template: oTemplate
                    });
                },
                error: function (xhr, status, error) {
                    console.error("Error fetching customer:", status, error);
                }
            });


            if (!oDialog) {
                oDialog = new Dialog({
                    title: "Customer Audit History",
                    contentWidth: "70%",
                    resizable: true,
                    draggable: true,
                    endButton: new Button({
                        text: "Close",
                        press: () => oDialog.close()
                    })
                });

                oTable = new Table({
                    growing: true,
                    growingScrollToLoad: true,
                    noDataText: "No Audit history Found "
                });

                // Columns
                oTable.addColumn(new Column({ header: new Text({ text: "Name" }) }));
                oTable.addColumn(new Column({ header: new Text({ text: "Email" }) }));
                oTable.addColumn(new Column({ header: new Text({ text: "Phone" }) }));
                oTable.addColumn(new Column({ header: new Text({ text: "Address" }) }));
                oTable.addColumn(new Column({ header: new Text({ text: "Edited At" }) }));

                // Template
                oTemplate = new ColumnListItem({
                    cells: [
                        new Text({ text: "{customerName}" }),
                        new Text({ text: "{email}" }),
                        new Text({ text: "{phoneNumber}" }),
                        new Text({ text: "{address}" }),
                        new Text({ text: "{createdAtFormatted}" })
                    ]
                });

                oDialog.addContent(oTable);
            }

            oDialog.open();
        }

    };
});
