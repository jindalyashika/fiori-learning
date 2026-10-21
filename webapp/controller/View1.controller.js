sap.ui.define([
    "project2/controller/BaseController",
], (BaseController) => {
    "use strict";

    return BaseController.extend("project2.controller.View1", {
        onInit() {
        },
        onNavToEmployeeList: function () {
            this.getOwnerComponent().getRouter().navTo("RouteEmployeeList");
        },
        onNavToAttendance: function () {
            this.getOwnerComponent().getRouter().navTo("RouteAttendance");
        },
        onNavToDepartmentList: function () {
        this.getOwnerComponent().getRouter().navTo("RouteDepartmentList");

    },
    onNavToTimeSheet: function () {
        this.getOwnerComponent().getRouter().navTo("RouteTimeSheet");
    }

})
});