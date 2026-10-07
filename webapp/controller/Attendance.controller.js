sap.ui.define([
    "project2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "project2/model/formatter"
], function (BaseController, JSONModel, MessageToast, formatter) {
    "use strict";

    return BaseController.extend("project2.controller.Attendance", {

        formatter: formatter,

        onInit: function () {
            var oViewModel = new JSONModel({
                selectedDate: new Date().toISOString().slice(0, 10),
                attendanceList: [],
                presentCount: 0,
                absentCount: 0,
                presentPercent: 0
            });
            this.getView().setModel(oViewModel, "view");

            this.getOwnerComponent().getRouter()
                .getRoute("RouteAttendance")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var oEmpModel = this.getOwnerComponent().getModel("employeeModel");
            var aEmployees = oEmpModel.getProperty("/Employees");

            if (aEmployees) {
                this._buildAttendanceList();
            } else {
                oEmpModel.attachEventOnce("requestCompleted", function () {
                    this._buildAttendanceList();
                }, this);
            }
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteView1");
        },

        onDateChange: function () {
            this._buildAttendanceList();
        },

        _buildAttendanceList: function () {
            var oViewModel = this.getView().getModel("view");
            var sDate = oViewModel.getProperty("/selectedDate");

            var aEmployees = this.getOwnerComponent().getModel("employeeModel").getProperty("/Employees");
            var aAttendance = this.getOwnerComponent().getModel("attendanceModel").getProperty("/Attendance");

            if (!aEmployees || !aAttendance) { return; }

            var aMerged = [];
            for (var i = 0; i < aEmployees.length; i++) {
                var oEmp = aEmployees[i];
                var oExisting = null;

                for (var j = 0; j < aAttendance.length; j++) {
                    if (aAttendance[j].empId === oEmp.empId && aAttendance[j].date === sDate) {
                        oExisting = aAttendance[j];
                        break;
                    }
                }

                aMerged.push({
                    empId: oEmp.empId,
                    name: oEmp.name,
                    department: oEmp.department,
                    status: oExisting ? oExisting.status : "Present"
                });
            }

            oViewModel.setProperty("/attendanceList", aMerged);
            this._updateSummary();
        },

        // count present/absent for the summary pane
        _updateSummary: function () {
            var oViewModel = this.getView().getModel("view");
            var aList = oViewModel.getProperty("/attendanceList");
            var iPresent = 0;
            var iAbsent = 0;

            for (var i = 0; i < aList.length; i++) {
                if (aList[i].status === "Present") {
                    iPresent++;
                } else {
                    iAbsent++;
                }
            }

            oViewModel.setProperty("/presentCount", iPresent);
            oViewModel.setProperty("/absentCount", iAbsent);
            oViewModel.setProperty("/presentPercent",
                aList.length ? Math.round((iPresent / aList.length) * 100) : 0);
        },

        onStatusChange: function (oEvent) {
            var sNewStatus = oEvent.getParameter("selectedIndex") === 0 ? "Present" : "Absent";
            var oCtx = oEvent.getSource().getBindingContext("view");
            oCtx.getModel().setProperty(oCtx.getPath() + "/status", sNewStatus);
            this._updateSummary();
        },

        onSaveAttendance: function () {
            var oViewModel = this.getView().getModel("view");
            var sDate = oViewModel.getProperty("/selectedDate");
            var aList = oViewModel.getProperty("/attendanceList");

            var oAttModel = this.getOwnerComponent().getModel("attendanceModel");
            var aAttendance = oAttModel.getProperty("/Attendance");

            var iUpdated = 0;
            var iCreated = 0;

            for (var i = 0; i < aList.length; i++) {
                var oRow = aList[i];
                var oExisting = null;

                for (var j = 0; j < aAttendance.length; j++) {
                    if (aAttendance[j].empId === oRow.empId && aAttendance[j].date === sDate) {
                        oExisting = aAttendance[j];
                        break;
                    }
                }

                if (oExisting) {
                    oExisting.status = oRow.status;
                    iUpdated++;
                } else {
                    aAttendance.push({
                        attId: "A" + Date.now() + oRow.empId,
                        empId: oRow.empId,
                        date: sDate,
                        status: oRow.status
                    });
                    iCreated++;
                }
            }

            oAttModel.setProperty("/Attendance", aAttendance);
            oAttModel.refresh();

            MessageToast.show("Saved for " + sDate + " - " + iCreated + " new, " + iUpdated + " updated");
        }
    });
});