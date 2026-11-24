sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/resource/ResourceModel"
], function (Controller, JSONModel, Filter, FilterOperator, ResourceModel) {
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
                    { key: "RouteDepartmentList", text: "Departments", icon: "sap-icon://group" },
                    { key: "RouteTimeSheet", text: "TimeSheet", icon: "sap-icon://timesheet" },
                    { key: "LANG_TOGGLE", text: "हिंदी", icon: "sap-icon://globe" }
                ]
            });
            this.getView().setModel(oNavModel, "nav");
            this._sLang = "en";
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
            var sKey = oEvent.getParameter("item").getKey();

            if (sKey === "LANG_TOGGLE") {
                this._changeLanguage();
                return; 
            }

            this.getOwnerComponent().getRouter().navTo(sKey);
        },

        _changeLanguage: function () {
            this._sLang = (this._sLang === "en") ? "hi" : "en";
            var oResourceModel = new ResourceModel({
                bundleName: "project2.i18n.i18n",
                bundleLocale: this._sLang === "en" ? "" : this._sLang,
                supportedLocales: ["", "hi"],
                fallbackLocale: ""
            });

            this.getOwnerComponent().setModel(oResourceModel, "i18n");

            // nav button text flip 
            var oNavModel = this.getView().getModel("nav");
            var aItems = oNavModel.getProperty("/items");
            aItems[aItems.length - 1].text = this._sLang === "en" ? "हिंदी" : "English";
            oNavModel.setProperty("/items", aItems);
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