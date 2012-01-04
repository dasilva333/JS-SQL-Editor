
	var lastsel;  
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
				height: value.height(),
				onHeaderClick: value.resizeHeight,
				hoverrows: false,
				colModel: value.colModel,
				cmTemplate: { align: "center" }, //sets default property for the colModel 
				width: value.width,
				hiddengrid: value.hiddengrid, //sets the grid to be hidden initially
				pager: value.pager,
				rowNum: value.rowNum,
				onSelectRow: function (id) {
					if (value.editor == true){
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
										value.data.replace(oldItem, newItem);
									}
									lastsel = null;
									return true
								}
							});
							lastsel = id;
						}	
					}
					return true;
				}, 
				gridComplete: value.gridComplete,
				onCellSelect: value.onCellSelect,
				afterInsertRow: value.afterInsertRow,
				editurl: "clientArray",
				caption: value.caption,
				//disable paging
				rowList: [],        // disable page size dropdown
			    pgbuttons: !value.editor,     // disable page control like next, back button
			    pgtext: null,         // disable pager text like 'Page 0 of 10'
			    viewrecords: !value.editor    // disable current view record text like 'View 1-10 of 100' 
			})
			.jqGrid("setGridParam", {
				data: ko.utils.unwrapObservable(value.data).slice(0)
			})
			if (value.pager){
				$(element).jqGrid('navGrid',value.pager,
					{edit:false,add:false,del:false,search:false,nav:false,refresh:false}, //options
					{reloadAfterSubmit:false}, // edit options
					{reloadAfterSubmit:false}, // add options
					{reloadAfterSubmit:false}, // del options
					{} // search options
				)
				if (value.editor == true){
					$(element).jqGrid('inlineNav', value.pager, { 
					   edit: true,
					   editicon: "ui-icon-pencil",
					   add: true,
					   addicon:"ui-icon-plus",
					   save: true,
					   saveicon:"ui-icon-disk",
					   cancel: true,
					   cancelicon:"ui-icon-cancel",
					   addParams : {useFormatter : false},
					   editParams : {
						   aftersavefunc: function(){
							   //var newItem = value.selectedItem; //this one should def work
							   //var newItem = $(element).jqGrid('getLocalRow', "new_row"); //this one only gets the basic values
							   var newItem = Main.selectedCondition; //fix this so it doesn't reference Main directly
							  //newItem.ID = dataArr.length + 1; 
							   value.data.unshift(newItem);
							   lastsel = null;
							   Main.selectedCondition = window.emptyCondition;
						   }
					   }
					})
					.jqGrid('navButtonAdd',value.pager, {
					   caption:"Preview", 
					   buttonicon:"ui-icon-search", 
					   onClickButton: function(){ 
						   Main.previewRecords()
					   }, 
					   position:"last"
					})
					.jqGrid('navButtonAdd',value.pager, {
					   caption:"Save", 
					   buttonicon:"ui-icon-search", 
					   onClickButton: function(){ 
						   Main.saveCondition()
					   }, 
					   position:"last"
					})
				}
				else {	
					$(element).jqGrid('navButtonAdd', value.pager, { 
						caption: "Columns", 
						title: "Reorder Columns", 
						onClickButton : function (){ 
							jQuery(element).jqGrid('columnChooser', {
								done : function (perm) {   
									if (perm) {
										var defaultColumns = []
										this.jqGrid("getGridParam","colModel").map(function(col){
											if (!col.hidden)
												defaultColumns.push(col.id);
										})
										$.jStorage.set(COLUMN_KEY_NAMES, defaultColumns);
									}
								}
							}); 
				 		} 
					})
				} 
				if (value.resizeHeight)
					$(window).resize(value.resizeHeight)
			} 
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