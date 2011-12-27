
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
									value.data.replace(oldItem, newItem);
								}
								lastsel = null;
								return true
							}
						});
						lastsel = id;
					}
				}, 
				gridComplete: value.gridComplete,
				onCellSelect: value.onCellSelect,
				afterInsertRow: function(){
					console.log("before " + Main.selectedCondition.Operator) 
					
					setTimeout(function(){
						try {
							console.log("emptyCondition " + emptyCondition.Operator)
							Main.selectedCondition = new Condition(emptyCondition)
							console.log("after " + Main.selectedCondition.Operator)	
							ko.applyBindings(Main, $("#" + Main.selectedCondition.ID).parent().get(0))
						    
						}catch(e){
							console.log(e)
						}
						
					},250)
				},
				editurl: "grid.html",
				caption: value.caption,
				//disable paging
				rowList: [],        // disable page size dropdown
			    pgbuttons: false,     // disable page control like next, back button
			    pgtext: null,         // disable pager text like 'Page 0 of 10'
			    viewrecords: false    // disable current view record text like 'View 1-10 of 100' 
			})
			$(element).jqGrid("setGridParam", {
				data: ko.utils.unwrapObservable(value.data).slice(0)
			})
			jQuery(element).jqGrid('navGrid',"#navPager",
					{edit:false,add:false,del:false,search:false,nav:false,refresh:false,addfunc: function(){
						console.log("i should do nothing now")
						return false;
					}}, //options
					{reloadAfterSubmit:false,addfunc: function(){
						console.log("i should do nothing now")
						return false;
					}}, // edit options
					{reloadAfterSubmit:false,addfunc: function(){
						console.log("i should do nothing now")
						return false;
					}}, // add options
					{reloadAfterSubmit:false}, // del options
					{} // search options
			); 
			jQuery(element).jqGrid('inlineNav',"#navPager", {edit:false,add:true,del:false,search:false,nav:false,refresh:false,addfunc: function(){
				console.log("i should do nothing now")
				return false;
			}});
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