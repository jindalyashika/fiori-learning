sap.ui.define([
    "project2/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("project2.controller.DepartmentDetail", {

        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("RouteDepartmentDetail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sDeptId = oEvent.getParameter("arguments").deptId;

            var oDeptModel = this.getOwnerComponent().getModel("deptModel");
            var aDepartments = oDeptModel.getProperty("/Departments");

            var iIndex = -1;       
            var oDept = null;   

            for (var i = 0; i < aDepartments.length; i++) {
                if (aDepartments[i].deptId === sDeptId) {
                    iIndex = i;               
                    oDept = aDepartments[i];   
                    break;                   
                }
            }

            this.getView().bindElement({
                path: "/Departments/" + iIndex,
                model: "deptModel"
            });

            var aEmployees = this.getOwnerComponent().getModel("employeeModel").getProperty("/Employees");
            var aDeptEmployees = [];   
            for (var j = 0; j < aEmployees.length; j++) {
                if (aEmployees[j].department === oDept.deptName) {
                    aDeptEmployees.push(aEmployees[j]);  
                }
            }

            var oDeptViewModel = new JSONModel({ employees: aDeptEmployees });
            this.getView().setModel(oDeptViewModel, "deptView");
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteDepartmentList");
        }
    });
});


