sap.ui.define([
    "project2/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, Filter, FilterOperator, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("project2.controller.EmployeeList", {

        onInit: function () {
            this._oTable = this.byId("employeeTable");
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteView1");
        },

        onEmployeePress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("employeeModel");
            var sEmpId = oCtx.getProperty("empId");
            this.getOwnerComponent().getRouter().navTo("RouteEmployeeDetail", { empId: sEmpId });
        },

        // ==========================================
        // ADD EMPLOYEE — opens dialog in "Create" mode
        // ==========================================
        onAddEmployee: function () {
            // "Create" mode ke liye ek KHAALI employee object banate hain
            this._openEmployeeDialog({
                mode: "create",
                employee: {
                    empId: "",       // naya ID save ke time generate hoga
                    name: "",
                    department: "IT",
                    designation: "",
                    email: "",
                    salary: 30000,
                    joiningDate: new Date().toISOString().slice(0, 10),
                    status: "Active"
                }
            });
        },

        // Called from Table's item — hum "Edit" button add kar sakte hain,
        // filhaal isko later EmployeeDetail se bhi call karenge
        onEditEmployee: function (oEmployeeData) {
            // "Edit" mode - EXISTING data ko form me bhar dete hain
            // Object.assign se copy banate hain, original object ko directly nahi chhedte
            // (taaki Cancel dabane par original data untouched rahe)
            this._openEmployeeDialog({
                mode: "edit",
                employee: Object.assign({}, oEmployeeData)
            });
        },

        // ==========================================
        // COMMON function - dialog ko kholta hai
        // (Fragment lazy-loaded hota hai - sirf pehli baar file se load hota hai,
        //  uske baad cached rehta hai, dobara load nahi hota)
        // ==========================================
        _openEmployeeDialog: function (oConfig) {
            var oView = this.getView();

            // Local dialog model banate hain - temp form data + validation states rakhne ke liye
            var oDialogModel = new JSONModel({
                dialogTitle: oConfig.mode === "create" ? "Add New Employee" : "Edit Employee",
                mode: oConfig.mode,
                employee: oConfig.employee,
                nameState: "None"   // validation state - None/Error
            });
            oView.setModel(oDialogModel, "view");

            // Agar fragment pehli baar khul raha hai, tabhi load karo
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment(
                    oView.getId(),                          // prefix - IDs unique rakhne ke liye
                    "project2.fragment.AddEditEmployee",     // fragment path
                    this                                     // controller - taaki ".onSaveEmployee" isi me dhunde
                );
                oView.addDependent(this._oDialog);           // lifecycle ke liye view se attach karna zaroori hai
            }

            this._oDialog.open();
        },

        // ==========================================
        // SAVE - Create ya Update, dono handle karta hai
        // ==========================================
        onSaveEmployee: function () {
            var oDialogModel = this.getView().getModel("view");
            var oEmployee = oDialogModel.getProperty("/employee");
            var sMode = oDialogModel.getProperty("/mode");

            // --- Simple Validation ---
         // Name check (already tha)
                if (!oEmployee.name || oEmployee.name.trim() === "") {
                    oDialogModel.setProperty("/nameState", "Error");
                    MessageToast.show("Name is required");
                    return;
                }
                oDialogModel.setProperty("/nameState", "None");

                // Email format check - simple regex (@ aur . hona chahiye)
                if (!oEmployee.email || oEmployee.email.indexOf("@") === -1) {
                    MessageToast.show("Please enter a valid email");
                    return;
                }

                // Salary check - 0 se zyada hona chahiye
                if (!oEmployee.salary || oEmployee.salary <= 0) {
                    MessageToast.show("Salary must be greater than 0");
                    return;
                }

            var oEmpModel = this.getOwnerComponent().getModel("employeeModel");
            var aEmployees = oEmpModel.getProperty("/Employees");

            if (sMode === "create") {
                // CREATE - naya empId generate karke array me PUSH karo
                oEmployee.empId = "E" + String(aEmployees.length + 1).padStart(3, "0");
                aEmployees.push(oEmployee);
                MessageToast.show("Employee added successfully");
            } else {
                // UPDATE - existing record ko empId se dhoondo aur REPLACE karo
                var iIndex = aEmployees.findIndex(function (e) {
                    return e.empId === oEmployee.empId;
                });
                if (iIndex > -1) {
                    aEmployees[iIndex] = oEmployee;
                }
                MessageToast.show("Employee updated successfully");
            }

            // Model ko batao ki data change hua hai - UI refresh ho jayegi
            oEmpModel.setProperty("/Employees", aEmployees);
            oEmpModel.refresh();

            this._oDialog.close();
        },

        onCancelEmployeeDialog: function () {
            // Kuch save nahi karna - bas dialog band kar do
            // Original employeeModel already untouched hai (humne copy pe kaam kiya tha)
            this._oDialog.close();
        },

        // ==========================================
        // DELETE - confirmation ke saath
        // ==========================================
        onDeleteEmployee: function (sEmpId) {
            var that = this;

            // MessageBox.confirm - built-in confirmation dialog (custom fragment nahi banana pada)
            MessageBox.confirm("Are you sure you want to delete this employee?", {
                title: "Confirm Delete",
                onClose: function (sAction) {
                    // sAction "OK" ya "CANCEL" hoga
                    if (sAction === MessageBox.Action.OK) {
                        var oEmpModel = that.getOwnerComponent().getModel("employeeModel");
                        var aEmployees = oEmpModel.getProperty("/Employees");

                        // filter() se us employee ko HATA kar naya array banate hain
                        var aUpdated = aEmployees.filter(function (e) {
                            return e.empId !== sEmpId;
                        });

                        oEmpModel.setProperty("/Employees", aUpdated);
                        MessageToast.show("Employee deleted");
                    }
                }
            });
        },

        onSearchEmployee: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oFilter = new Filter("name", FilterOperator.Contains, sQuery);
            this._applyFilters(oFilter, this._oDeptFilter);
        },

        onFilterDepartment: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            this._oDeptFilter = sKey ? new Filter("department", FilterOperator.EQ, sKey) : null;
            this._applyFilters(this._oSearchFilter, this._oDeptFilter);
        },

        _applyFilters: function (oSearchFilter, oDeptFilter) {
            this._oSearchFilter = oSearchFilter;
            var aFilters = [];
            if (oSearchFilter) { aFilters.push(oSearchFilter); }
            if (oDeptFilter) { aFilters.push(oDeptFilter); }

            var oCombined = aFilters.length ? new Filter({ filters: aFilters, and: true }) : null;
            var oBinding = this._oTable.getBinding("items");
            oBinding.filter(oCombined ? [oCombined] : []);
        }
    });
});