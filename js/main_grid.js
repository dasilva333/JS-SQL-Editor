
jQuery(document).ready(function(){
    //$('#switcher').themeswitcher();

	$('body').layout({
		resizerClass: 'ui-state-default',
        west__onresize: function (pane, $Pane) {
            jQuery("#west-grid").jqGrid('setGridWidth',$Pane.innerWidth()-2);
		}
	});
	$.jgrid.defaults = $.extend($.jgrid.defaults,{loadui:"enable"});
	var maintab =jQuery('#tabs','#RightPane').tabs({
        add: function(e, ui) {
            // append close thingy
            $(ui.tab).parents('li:first')
                .append('<span class="ui-tabs-close ui-icon ui-icon-close" title="Close Tab"></span>')
                .find('span.ui-tabs-close')
                .click(function() {
                    maintab.tabs('remove', $('li', maintab).index($(this).parents('li:first')[0]));
                });
            // select just added tab
            maintab.tabs('select', '#' + ui.panel.id);
        }
    });
	var lastsel;
	function my_input(value, options) {
		return $("<input type='text' size='10' value='" + value + "'/>");
	}
	function my_value(value) {
		return "My value: " + value.val();
	}

	
	window.mydata = [{
		id: "1",
		invdate: "2007-10-01",
		name: "test",
		note: "note",
		amount: "200.00",
		tax: "10.00",
		total: "210.00"
	}, {
		id: "2",
		invdate: "2007-10-02",
		name: "test2",
		note: "note2",
		amount: "300.00",
		tax: "20.00",
		total: "320.00"
	}, {
		id: "3",
		invdate: "2007-09-01",
		name: "test3",
		note: "note3",
		amount: "400.00",
		tax: "30.00",
		total: "430.00"
	}, {
		id: "4",
		invdate: "2007-10-04",
		name: "test",
		note: "note",
		amount: "200.00",
		tax: "10.00",
		total: "210.00"
	}, {
		id: "5",
		invdate: "2007-10-05",
		name: "test2",
		note: "note2",
		amount: "300.00",
		tax: "20.00",
		total: "320.00"
	}, {
		id: "6",
		invdate: "2007-09-06",
		name: "test3",
		note: "note3",
		amount: "400.00",
		tax: "30.00",
		total: "430.00"
	}, {
		id: "7",
		invdate: "2007-10-04",
		name: "test",
		note: "note",
		amount: "200.00",
		tax: "10.00",
		total: "210.00"
	}, {
		id: "8",
		invdate: "2007-10-03",
		name: "test2",
		note: "note2",
		amount: "300.00",
		tax: "20.00",
		total: "320.00"
	}, {
		id: "9",
		invdate: "2007-09-01",
		name: "test3",
		note: "note3",
		amount: "400.00",
		tax: "30.00",
		total: "430.00"
	}];
	
	window.tableSrc = ko.observableArray()
	
	jQuery("#cinput").jqGrid({
		datastr: tableSrc(),
        datatype: "jsonstring",
        jsonReader: { repeatitems: false },
        height: 'auto',
		colNames: ['(', 'Column', 'Operator', 'Value', ')', 'Seperator', 'Statement'],
		colModel: [{
			name: 'id',
			index: 'id',
			width: 55,
			editable: true
		}, {
			name: 'invdate',
			index: 'invdate',
			width: 90,
			editable: true
		}, {
			name: 'name',
			index: 'name',
			width: 100,
			editable: true,
			edittype: 'custom',
			editoptions: {
				custom_element: my_input,
				custom_value: my_value
			}
		}, {
			name: 'amount',
			index: 'amount',
			width: 80,
			align: "right",
			editable: true
		}, {
			name: 'tax',
			index: 'tax',
			width: 80,
			align: "right",
			editable: true
		}, {
			name: 'total',
			index: 'total',
			width: 80,
			align: "right",
			editable: true
		}, {
			name: 'note',
			index: 'note',
			width: 150,
			sortable: false,
			editable: true
		}],
		onSelectRow: function (id) {
			if (id && id !== lastsel) {
				jQuery('#cinput').jqGrid('restoreRow', lastsel);
				jQuery('#cinput').jqGrid('editRow', id, true);
				lastsel = id;
			}
		},
		rowNum: 10,
		rowList: [10, 20, 30],
		pager: '#pcinput',
		viewrecords: true,
		caption: "Custom Input"
	});

	for (var i = 0; i <= mydata.length; i++) {
		//jQuery("#cinput").jqGrid('addRowData', i + 1, mydata[i]);
	}	
});