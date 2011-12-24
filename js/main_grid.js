
	var isLoaded = false;
	var lastsel;  
	ko.bindingHandlers.grid = {
		init: function (element, valueAccessor) {
			if (isLoaded == false)
				isLoaded = true
			else
				return
			console.log("init")	
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
				pager: "#navPager",
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
				editurl: "grid.html",
				caption: value.caption
			})
			$(element).jqGrid("setGridParam", {
				data: ko.utils.unwrapObservable(value.data).slice(0)
			})
			jQuery(element).jqGrid('navGrid',"#navPager",
					{edit:false,add:false,del:false,search:false,nav:false,refresh:false}, //options
					{reloadAfterSubmit:false}, // edit options
					{reloadAfterSubmit:false}, // add options
					{reloadAfterSubmit:false}, // del options
					{} // search options
			); 
			jQuery(element).jqGrid('inlineNav',"#navPager", {edit:false,add:true,del:false,search:false,nav:false,refresh:false});
		},
		update: function (element, valueAccessor) {
			console.log("update")
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