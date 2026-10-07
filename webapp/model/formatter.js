sap.ui.define([], function () {
    "use strict";

    return {
        statusState: function (sStatus) {
            if (sStatus === "Active" || sStatus === "Present") {
                return "Success";
            } else if (sStatus === "On Leave" || sStatus === "Leave") {
                return "Warning";
            } else {
                return "Error";
            }
        },

        formatSalary: function (fSalary) {
            if (!fSalary) { return "₹0"; }
            return "₹" + fSalary.toLocaleString("en-IN");
        },

        calculateTenure: function (sJoiningDate) {
            if (!sJoiningDate) { return ""; }
            var oJoinDate = new Date(sJoiningDate);
            var oToday = new Date();
            return (oToday.getFullYear() - oJoinDate.getFullYear()) + " yrs";
        },

        statusToIndex: function (sStatus) {
            if (sStatus === "Present") {
                return 0;
            }
            return 1;
        },

        statusToHighlight: function (sStatus) {
            if (sStatus === "Present") {
                return "Success";  
            }
            return "Error";       
        }
    };
});