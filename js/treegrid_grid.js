

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
			    height: $(window).height() - 100,
			    editurl: value.editurl,
			    caption: value.caption,
			    pager : value.pager,
			    onCellSelect: value.onCellSelect,
	            jsonReader: {
	                repeatitems: false,
	                root: function (obj) { return obj; },
	                page: function (obj) { return 1; },
	                total: function (obj) { return 1; },
	                records: function (obj) { return obj.length; }
	            }
			})
			.jqGrid('navGrid', value.pager, {edit:true,add:true,del:true,search:false,nav:false,refresh:false} )
			/*adding the column then removing it again allows editing of description while not seeing it as a column, fix it
			 * .jqGrid('navButtonAdd', value.pager, { 
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
			})*/
			$(window).resize(function(){
				$(element).jqGrid("setGridHeight", $(window).height() - 75 )
			})
		},
		update: function (element, valueAccessor) {
			var value = valueAccessor();
			var newData = ko.utils.unwrapObservable(value.data);
			element.addJSONData(newData);
		}
	};
	
	/**
	
	grid = $("#groupsGrid")

	parentid = 6; //Sold

	parent = grid.jqGrid('getRowData', parentid);

	grid.jqGrid('reloadNode', parent);
	 */