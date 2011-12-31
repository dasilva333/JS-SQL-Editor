

	ko.bindingHandlers.treegrid = {
		init: function (element, valueAccessor) {
			var value = valueAccessor();
			var grid = $(element).jqGrid({
			    treeGrid: true,
			    treeGridModel: 'adjacency',
			    ExpandColumn : 'name',
			    treedatatype: value.ExpandTreeFunc,
			    datatype: function(){},
			    colNames: value.colNames,
			    colModel: value.colModel,
			    height:'100%',
			    caption: value.caption,
			    onCellSelect: value.onCellSelect,
	            jsonReader: {
	                repeatitems: false,
	                root: function (obj) { return obj; },
	                page: function (obj) { return 1; },
	                total: function (obj) { return 1; },
	                records: function (obj) { return obj.length; }
	            }
			});
		},
		update: function (element, valueAccessor) {
			var value = valueAccessor();
			var newData = ko.utils.unwrapObservable(value.data);
			element.addJSONData(newData);
		}
	};