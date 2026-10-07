sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/layout/ResponsiveSplitter"
], function (Controller, ResponsiveSplitter) {
    "use strict";

    return Controller.extend("project2.controller.BaseController", {

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        // runs once, right after the view is first rendered
        onAfterRendering: function () {
            if (this._bSummaryHiddenInitially) {
                return;
            }
            this._bSummaryHiddenInitially = true;
            this._hideSummaryByDefault();
        },

        // remove the summary pane so it's hidden until "Show Summary" is clicked
        _hideSummaryByDefault: function () {
            var oSplitter = this._findControlByType(this.getView(), ResponsiveSplitter);
            if (!oSplitter) { return; }

            var oPaneContainer = oSplitter.getRootPaneContainer();
            var oSummaryPane = this._findSummaryPane(oPaneContainer);

            if (oSummaryPane && oPaneContainer.indexOfPane(oSummaryPane) > -1) {
                this._oRemovedSummaryPane = oSummaryPane;
                oPaneContainer.removePane(oSummaryPane);
            }
        },

        toggleSummary: function () {
            var oView = this.getView();

            var oSplitter = this._findControlByType(oView, ResponsiveSplitter);
            if (!oSplitter) { return; }

            var oPaneContainer = oSplitter.getRootPaneContainer();
            var oSummaryPane = this._oRemovedSummaryPane || this._findSummaryPane(oPaneContainer);

            if (!oSummaryPane) { return; }

            if (oPaneContainer.indexOfPane(oSummaryPane) > -1) {
                this._oRemovedSummaryPane = oSummaryPane;
                oPaneContainer.removePane(oSummaryPane);
            } else {
                oPaneContainer.addPane(oSummaryPane);
                this._oRemovedSummaryPane = null;
            }
        },

        _findSummaryPane: function (oPaneContainer) {
            var aPanes = oPaneContainer.getPanes();
            return aPanes.length ? aPanes[aPanes.length - 1] : null;
        },

        _findControlByType: function (oParent, fnType) {
            var aContent = oParent.findAggregatedObjects(true, function (oControl) {
                return oControl instanceof fnType;
            });
            return aContent.length ? aContent[0] : null;
        }
    });
});