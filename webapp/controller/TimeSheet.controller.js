sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageToast",
    "sap/m/Text"

], function (Controller, JSONModel, DateFormat, MessageToast, Text) {
    "use strict";

    const MAX_DAYS = 7;
    const ONE_DAY = 24 * 60 * 60 * 1000;

    return Controller.extend("project2.controller.TimeSheet", {

        onInit: function () {
            this.getView().setModel(new JSONModel({ rows: [] }));
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteView1");
        },

        // Returns number of selected days (both dates included). Returns 0 if range is not complete.
        _getDayCount: function (oDRS) {
            const dFrom = oDRS.getDateValue();
            const dTo = oDRS.getSecondDateValue();
            if (!dFrom || !dTo) {
                return 0;
            }
            // Use only year, month and date (ignore time like 23:59:59)
            const nFrom = Date.UTC(dFrom.getFullYear(), dFrom.getMonth(), dFrom.getDate());
            const nTo = Date.UTC(dTo.getFullYear(), dTo.getMonth(), dTo.getDate());
            return Math.round((nTo - nFrom) / ONE_DAY) + 1;
        },

        // Removes all date columns (keeps the first column) and clears the rows
        _clearTable: function () {
            const oTable = this.byId("dynTable");
            oTable.getColumns().slice(1).forEach(function (oCol) {
                oTable.removeColumn(oCol);
                oCol.destroy();
            });
            this.getView().getModel().setData({ rows: [] });
        },

        onGenerate: function () {
            const oDRS = this.byId("drs");
            let n = this._getDayCount(oDRS);

            if (!n) {
                MessageToast.show("Select date range");
                return;
            }

            // Safety check: never create more than 7 columns
            if (n > MAX_DAYS) {
                MessageToast.show("Max " + MAX_DAYS + " days can be visible");
                n = MAX_DAYS;
            }

            const dFrom = oDRS.getDateValue();
            const oTable = this.byId("dynTable");
            const oColTemplate = this.byId("colTemplate");
            const oDateFmt = DateFormat.getDateInstance({ pattern: "dd MMM" });
            const oDayFmt = DateFormat.getDateInstance({ pattern: "EEE" });

            // Remove old columns before creating new ones
            this._clearTable();

            // Create one column for each day
            for (let i = 0; i < n; i++) {
                const oDate = new Date(dFrom);
                oDate.setDate(oDate.getDate() + i);

                const oNewCol = oColTemplate.clone();
                const aLabels = oNewCol.getMultiLabels();

                aLabels[0].setText(oDateFmt.format(oDate)); // Example: 05 Oct
                aLabels[1].setText(oDayFmt.format(oDate));  // Example: Mon

                // Each input reads its value from values[i]
                oNewCol.getTemplate().bindProperty("value", "values/" + i);

                oTable.addColumn(oNewCol);
            }
            // Get all employees from employees.json (loaded as "employeeModel" in manifest)
                const aEmployees = this.getOwnerComponent().getModel("employeeModel").getProperty("/Employees") || [];

                // One row per employee, with empty values (one per day)
                const aRows = aEmployees.map(function (oEmp) {
                    return {
                        empId: oEmp.empId,
                        name: oEmp.name,
                        values: new Array(n).fill("")
                    };
                });
                this.getView().getModel().setData({ rows: aRows });},
        onDateChange: function (oEvent) {
            const oDRS = oEvent.getSource();
            const nDays = this._getDayCount(oDRS);

            // 8th day or more: show error, clear the selection and the table
            if (nDays > MAX_DAYS) {
                const sMsg = "Max " + MAX_DAYS + " days can be selected";
                oDRS.setValueState("Error");
                oDRS.setValueStateText(sMsg);
                MessageToast.show(sMsg);
                oDRS.setValue("");
                this._clearTable();
            } else {
                oDRS.setValueState("None");
            }
        },

        // When calendar opens, listen to its date clicks
        onCalendarOpen: function (oEvent) {
            const oCal = oEvent.getSource()._oCalendar; // private property
            if (!oCal) { return; }

            // Detach first so the handler is not attached twice
            oCal.detachSelect(this._onCalendarSelect, this);
            oCal.attachSelect(this._onCalendarSelect, this);
        },

        // Runs on every click inside the calendar
        _onCalendarSelect: function (oEvent) {
            const oCal = oEvent.getSource();
            const oSel = oCal.getSelectedDates()[0];
            if (!oSel) { return; }

            const dStart = oSel.getStartDate();

            // Only the first click is done (start date selected, end date not yet)
            if (dStart && !oSel.getEndDate()) {
                const dMax = new Date(dStart);
                dMax.setDate(dMax.getDate() + (MAX_DAYS - 1)); // start + 6 days = 7 days total

                // Disable all dates outside this 7 day window
                oCal.setMinDate(new Date(dStart));
                oCal.setMaxDate(dMax);
            }
        },

        // When calendar closes, remove the limit so it opens fresh next time
        onCalendarClose: function (oEvent) {
            const oCal = oEvent.getSource()._oCalendar;
            if (oCal) {
                oCal.setMinDate(null);
                oCal.setMaxDate(null);
            }
        },

onSaveList: function () {
    const oModel = this.getView().getModel();
    const oTable = this.byId("dynTable");
    const aColumns = oTable.getColumns();
//     const aRows = oModel.getProperty("/rows") || [];
//     aRows.forEach(function (oRow) {
//         if (oRow.values && Array.isArray(oRow.values)) {
//             oRow.values.fill(""); 
//         }
//     });
//   oModel.setProperty("/rows", aRows);
    // Loop through dynamic columns and swap Input with Text
    for (let i = 1; i < aColumns.length; i++) {
        // Create a flat text control instead of input
        const oTextTemplate = new sap.m.Text({
            text: "{values/" + (i - 1) + "}"
        });
        
        // Destroy old Input template and assign the new Text template
        const oOldTemplate = aColumns[i].getTemplate();
        if (oOldTemplate) {
            oOldTemplate.destroy();
        }
        aColumns[i].setTemplate(oTextTemplate);
    }

    MessageToast.show("Data saved and inputs converted to text fields.");
    const v = this.getView().byId("EditBtn")
    v.setVisible(true)
},
onEditList: function () {
    const oTable = this.byId("dynTable");
    const aColumns = oTable.getColumns();

    // Loop through dynamic columns and swap Text back with Input
    for (let i = 1; i < aColumns.length; i++) {
        const oInputTemplate = new sap.m.Input({
            value: "{values/" + (i - 1) + "}"
        });

        // Destroy old Text template and assign the new Input template
        const oOldTemplate = aColumns[i].getTemplate();
        if (oOldTemplate) {
            oOldTemplate.destroy();
        }
        aColumns[i].setTemplate(oInputTemplate);
    }

    MessageToast.show("Switched back to edit mode.");

    const oEditBtn = this.getView().byId("EditBtn");
    if (oEditBtn) {
        oEditBtn.setVisible(false);
    }
}

 });
});