sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("project2.controller.App", {

        onInit: function () {
            // ui state: side nav open/closed
            this.getView().setModel(new JSONModel({ sideExpanded: true }), "ui");

            // menu items - key = route name
            var oNavModel = new JSONModel({
                items: [
                    { key: "RouteView1", text: "Dashboard", icon: "sap-icon://home" },
                    { key: "RouteEmployeeList", text: "Employees", icon: "sap-icon://employee" },
                    { key: "RouteAttendance", text: "Mark Attendance", icon: "sap-icon://appointment-2" },
                    { key: "RouteDepartmentList", text: "Departments", icon: "sap-icon://group" }
                ]
            });
            this.getView().setModel(oNavModel, "nav");
        },

        onToggleMenu: function () {
            var oUiModel = this.getView().getModel("ui");
            oUiModel.setProperty("/sideExpanded", !oUiModel.getProperty("/sideExpanded"));
        },

        onNavSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oFilter = sQuery ? new Filter("text", FilterOperator.Contains, sQuery) : null;
            this.byId("navList").getBinding("items").filter(oFilter ? [oFilter] : []);
        },

        onNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sRoute = oItem.getKey();
            this.getOwnerComponent().getRouter().navTo(sRoute);
        },

        // global button - ask the currently open page to toggle its own summary pane
        onToggleSummary: function () {
            var oCurrentPage = this.byId("navContainer").getCurrentPage();
            var oPageController = oCurrentPage && oCurrentPage.getController();

            if (oPageController && typeof oPageController.toggleSummary === "function") {
                oPageController.toggleSummary();
            }
        }
    });
});