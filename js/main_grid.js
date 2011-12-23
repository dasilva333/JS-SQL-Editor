
	
	var lastsel;
	var dataArr = [
   		{
   			"ID": 1,
   			"(": "(",
   			"Column": "FirstName",
   			"Operator": "=",
   			"Value": "richard",
   			")": ")",
   			"Seperator": "OR",
   			"Statement": "",
   		},
   		{
   			"ID": 2,
   			"(": "(",
   			"Column": "Active",
   			"Operator": "=",
   			"Value": "1",
   			")": ")",
   			"Seperator": "",
   			"Statement": "",
   		}
   	];
   	
   	var emptyCondition = {
   		"ID": null,
   		"(": null,
   		"Column": "",
   		"Operator": null,
   		"Value": null,
   		")": null,
   		"Seperator": null,
   		"Statement": null
   	};
	       	
	ko.bindingHandlers.grid = {
		init: function (element, valueAccessor) {
			var value = valueAccessor();
			var dataArr = ko.utils.unwrapObservable(value.data).slice(0);
			var grid = $(element).jqGrid({
				data: dataArr,
				datatype: "local",
				localReader: {
					repeatitems: false,
					id: value.rowId
				},
				gridview: true,
				height: 'auto',
				hoverrows: false,
				colModel: value.colModel,
				cmTemplate: { align: "center" },
				pager: value.pager,
				rowNum: 3,
				onSelectRow: function (id) {
					var item = $(element).jqGrid('getLocalRow', id);
					value.selectItem(item);
					if (id && id !== lastsel) {
						jQuery(element).jqGrid('restoreRow', lastsel);
						jQuery(element).jqGrid('editRow', id, {
							keys: true,
							aftersavefunc: function(){
								var oldItem = ko.utils.arrayFirst(dataArr, function (obj) { return obj.ID == id;  });
								var newItem = $(element).jqGrid('getLocalRow', id);
								if (oldItem !== null) {
									value.data.replace(oldItem, ko.mapping.toJS(newItem));
								}
								lastsel = null;
								return true
							}
						});
						lastsel = id;
					}
				}, 
				afterEditCell:function (rowid, cellname, value, iRow, iCol){
					console.log(arguments); 				   
				},
				editurl: "grid.html"			
			});
			$(element).jqGrid("setGridParam", {
				data: ko.utils.unwrapObservable(value.data).slice(0)
			});
		},
		update: function (element, valueAccessor) {
			var value = valueAccessor();
			var gridData = $(element).jqGrid('getGridParam', 'data');
			var newData = ko.utils.unwrapObservable(value.data);
			var prevPage = $(element).jqGrid("getGridParam", 'page');
			var rowNum = parseInt($(element).jqGrid("getGridParam", 'rowNum'), 10);
			var lastPage = Math.ceil(newData.length / rowNum);
			$(element).jqGrid('clearGridData').jqGrid('setGridParam', {
				data: newData
			}).jqGrid('setGridParam', {
				lastpage: lastPage
			}).trigger('reloadGrid', [{
				page: prevPage
			}]);
		}
	};