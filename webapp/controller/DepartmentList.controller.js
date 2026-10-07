sap.ui.define([
    "project2/controller/BaseController",
], function (BaseController) {
    "use strict";

    return BaseController.extend("project2.controller.DepartmentList", {

        onInit: function () {
            this._calculateEmployeeCounts();
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteView1");
        },
      _calculateEmployeeCounts: function () {
    var oDeptModel = this.getOwnerComponent().getModel("deptModel");
    var oEmpModel = this.getOwnerComponent().getModel("employeeModel");

    var aDepartments = oDeptModel.getProperty("/Departments");
    var aEmployees = oEmpModel.getProperty("/Employees");

    for (var i = 0; i < aDepartments.length; i++) {
        var oDept = aDepartments[i];  
        var count = 0;               

        for (var j = 0; j < aEmployees.length; j++) {
            var oEmp = aEmployees[j];  

            if (oEmp.department === oDept.deptName) {
                count = count + 1;      
            }
        }
        oDept.employeeCount = count;
    }
    oDeptModel.setProperty("/Departments", aDepartments);
},
        onDeptPress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("deptModel");
            var sDeptId = oCtx.getProperty("deptId");
            this.getOwnerComponent().getRouter().navTo("RouteDepartmentDetail", { deptId: sDeptId });
        }
    });
});