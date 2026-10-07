sap.ui.define([
    "project2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, MessageToast, MessageBox) {
    "use strict";

    var STATUS_OPTIONS = ["Active", "On Leave", "Inactive"];

    return BaseController.extend("project2.controller.EmployeeDetail", {

        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("RouteEmployeeDetail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sEmpId = oEvent.getParameter("arguments").empId;
            this._sCurrentEmpId = sEmpId;

            var oEmpModel = this.getOwnerComponent().getModel("employeeModel");
            var aEmployees = oEmpModel.getProperty("/Employees");

            var iIndex = -1;
            for (var i = 0; i < aEmployees.length; i++) {
                if (aEmployees[i].empId === sEmpId) {
                    iIndex = i;
                    break;
                }
            }

            this.getView().bindElement({
                path: "/Employees/" + iIndex,

                model: "employeeModel"
            });

            var aAttendance = this.getOwnerComponent().getModel("attendanceModel").getProperty("/Attendance");
            var aOwnRecords = [];
            for (var j = 0; j < aAttendance.length; j++) {
                if (aAttendance[j].empId === sEmpId) {
                    aOwnRecords.push(aAttendance[j]);
                }
            }

            // allRecords = original untouched copy, records = what the table shows (gets filtered)
            this.getView().setModel(new JSONModel({
                allRecords: aOwnRecords,
                records: aOwnRecords
            }), "empView");

            // reset date range control whenever a different employee is opened
            var oDateRange = this.byId("attDateRangeFilter");
            if (oDateRange) {
                oDateRange.setValue(null);
            }
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteEmployeeList");
        },

        // ==========================================
        // DATE RANGE FILTER for attendance tab
        // ==========================================
        onAttendanceDateRangeChange: function (oEvent) {
            var oValue = oEvent.getParameter("value");

            // no value / cleared -> show everything
            if (!oValue || !oValue.values || oValue.values.length < 2) {
                this._applyDateRangeFilter(null, null);
                return;
            }

            var oFromDate = oValue.values[0];
            var oToDate = oValue.values[1];
            this._applyDateRangeFilter(oFromDate, oToDate);
        },

        onClearAttendanceDateRange: function () {
            var oDateRange = this.byId("attDateRangeFilter");
            if (oDateRange) {
                oDateRange.setValue(null);
            }
            this._applyDateRangeFilter(null, null);
        },

        // core filtering logic - works on dates stored as "YYYY-MM-DD" strings
        _applyDateRangeFilter: function (oFromDate, oToDate) {
            var oViewModel = this.getView().getModel("empView");
            var aAll = oViewModel.getProperty("/allRecords");

            if (!oFromDate || !oToDate) {
                oViewModel.setProperty("/records", aAll);
                return;
            }

            // normalize to start/end of day so the boundary dates are included
            var oFrom = new Date(oFromDate);
            oFrom.setHours(0, 0, 0, 0);

            var oTo = new Date(oToDate);
            oTo.setHours(23, 59, 59, 999);

            var aFiltered = aAll.filter(function (oRecord) {
                var oRecordDate = new Date(oRecord.date);
                return oRecordDate >= oFrom && oRecordDate <= oTo;
            });

            oViewModel.setProperty("/records", aFiltered);
        },

        // ==========================================
        // EDIT (unchanged)
        // ==========================================
        onEditEmployee: function () {
            var oEmpModel = this.getOwnerComponent().getModel("employeeModel");
            var oCurrentEmployee = this.getView().getBindingContext("employeeModel").getObject();

            var oDialogModel = new JSONModel({
                dialogTitle: "Edit Employee",
                mode: "edit",
                employee: Object.assign({}, oCurrentEmployee),
                nameState: "None",
                statusIndex: STATUS_OPTIONS.indexOf(oCurrentEmployee.status)
            });
            this.getView().setModel(oDialogModel, "view");

            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment(
                    this.getView().getId(),
                    "project2.fragment.AddEditEmployee",
                    this
                );
                this.getView().addDependent(this._oDialog);
            }
            this._oDialog.open();
        },

        onSaveEmployee: function () {
            var oDialogModel = this.getView().getModel("view");
            var oEmployee = oDialogModel.getProperty("/employee");

            if (!oEmployee.name || oEmployee.name.trim() === "") {
                oDialogModel.setProperty("/nameState", "Error");
                MessageToast.show("Name is required");
                return;
            }
            oDialogModel.setProperty("/nameState", "None");

            if (!oEmployee.email || oEmployee.email.indexOf("@") === -1) {
                MessageToast.show("Please enter a valid email");
                return;
            }

            if (!oEmployee.salary || oEmployee.salary <= 0) {
                MessageToast.show("Salary must be greater than 0");
                return;
            }

            var iStatusIndex = oDialogModel.getProperty("/statusIndex");
            oEmployee.status = STATUS_OPTIONS[iStatusIndex];

            var oEmpModel = this.getOwnerComponent().getModel("employeeModel");
            var aEmployees = oEmpModel.getProperty("/Employees");

            for (var i = 0; i < aEmployees.length; i++) {
                if (aEmployees[i].empId === oEmployee.empId) {
                    aEmployees[i] = oEmployee;
                    break;
                }
            }

            oEmpModel.setProperty("/Employees", aEmployees);
            oEmpModel.refresh();

            MessageToast.show("Employee updated successfully");
            this._oDialog.close();
        },

        onCancelEmployeeDialog: function () {
            this._oDialog.close();
        },

        onDeleteEmployee: function () {
            var that = this;
            var sEmpId = this._sCurrentEmpId;

            MessageBox.confirm("Are you sure you want to delete this employee?", {
                title: "Confirm Delete",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        var oEmpModel = that.getOwnerComponent().getModel("employeeModel");
                        var aEmployees = oEmpModel.getProperty("/Employees");

                        var aUpdated = [];
                        for (var i = 0; i < aEmployees.length; i++) {
                            if (aEmployees[i].empId !== sEmpId) {
                                aUpdated.push(aEmployees[i]);
                            }
                        }

                        oEmpModel.setProperty("/Employees", aUpdated);
                        MessageToast.show("Employee deleted");

                        that.getOwnerComponent().getRouter().navTo("RouteEmployeeList");
                    }
                }
            });
        }
    });
});