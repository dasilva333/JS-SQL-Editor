(function() {
  var App, Column, Condition, Group, columnTypes, datePickerFields, defaultColumns, emptyCondition, emptyGroup, operatorDefinitions,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.defaultCaption = "--Select--";

  window.COLUMN_KEY_NAMES = "defaultColumns";

  window.allColumns = [];

  window.allGroups = [];

  window.ACT_DATA_URL = typeof private_URL !== "undefined" ? private_URL : "/act/ACT_Schema.cfm";

  defaultColumns = ["93", "3", "5"];

  window.savedColumns = $.jStorage.get(COLUMN_KEY_NAMES, defaultColumns);

  window.sortByAlpha = function(toSort) {
    var reA, reN;
    reA = /[^a-zA-Z]/g;
    reN = /[^0-9]/g;
    return toSort.sort(function(aa, bb) {
      var a, aA, aN, b, bA, bN;
      a = aa.name;
      b = bb.name;
      aA = a.replace(reA, "");
      bA = b.replace(reA, "");
      if (aA === bA) {
        aN = parseInt(a.replace(reN, ""), 10);
        bN = parseInt(b.replace(reN, ""), 10);
        if (aN === bN) {
          return 0;
        } else if (aN > bN) {
          return 1;
        } else {
          return -1;
        }
      } else {
        if (aA > bA) {
          return 1;
        } else {
          return -1;
        }
      }
    });
  };

  columnTypes = {
    CF_SQL_INTEGER: {
      "Contains Data": [],
      "Does Not Contain Data": [],
      "Equal To": [""],
      "Greater Than": [""],
      "Greater Than or Equal To": [""],
      "Less Than": [""],
      "Less Than or Equal To": [""],
      "Not Equal To": [""]
    },
    CF_SQL_VARCHAR: {
      "Contains": [""],
      "Contains Data": [],
      "Does Not Contain Data": [],
      "Ends With": [""],
      "Equal To": [""],
      "Greater Than": [""],
      "Greater Than or Equal To": [""],
      "Less Than": [""],
      "Less Than or Equal To": [""],
      "Not Equal To": [""],
      "Starts With": [""]
    },
    CF_SQL_TIMESTAMP: {
      "After Next [Days]": [""],
      "Contains Data": [],
      "Days Equal [number]": [""],
      "Does Not Contain Data": [],
      "Equal To": ["", "Today"],
      "Months Equals [number]": [""],
      "Not Equal To": ["", "Today"],
      "Older than [days]": [""],
      "On or After": ["", "Today"],
      "On or Before": ["", "Today"],
      "Within Last [days]": [""],
      "Within Next [days]": [""],
      "Years Equals [number]": [""]
    },
    CF_SQL_BIT: {
      "Equal To": ["True", "False"]
    }
  };

  columnTypes.CF_SQL_FLOAT = columnTypes.CF_SQL_INTEGER;

  operatorDefinitions = {
    "Contains Data": function() {
      return " != '' OR " + this.getColumnName()() + " IS NOT NULL  ";
    },
    "Days Equal [number]": function() {
      return " DAY( " + this.getColumnName()() + " ) = ";
    },
    "Does Not Contain Data": function() {
      return " = ''  OR " + this.getColumnName()() + " IS NULL ";
    },
    "Equal To": function() {
      return " = " + this.getFormattedComparison();
    },
    "Not Equal To": function() {
      return " != " + this.getFormattedComparison();
    },
    "After Next [Days]": function() {
      return " DateAdd(d," + this.getComparison()() + "," + this.getColumnName()() + " ) > GetDate";
    },
    "Months Equals [number]": function() {
      return " MONTH( " + this.getColumnName()() + " ) = ";
    },
    "Older than [days]": function() {
      return "";
    },
    "On or After": function() {
      return "";
    },
    "On or Before": function() {
      return "";
    },
    "Within Last [days]": function() {
      return "";
    },
    "Within Next [days]": function() {
      return "";
    },
    "Years Equals [number]": function() {
      return " YEAR( " + this.getColumnName()() + " ) = YEAR( " + this.getComparison()() + " )";
    },
    "Starts With": function() {
      return " LIKE '" + this.getComparison()() + "%' ";
    },
    "Contains": function() {
      return " LIKE '%" + this.getComparison()() + "%' ";
    },
    "Ends With": function() {
      return " LIKE '%" + this.getComparison()() + "' ";
    },
    "Greater Than": function() {
      return " > " + this.getComparison()();
    },
    "Less Than": function() {
      return " < " + this.getComparison()();
    },
    "Greater Than or Equal To": function() {
      return " => " + this.getComparison()();
    },
    "Less Than or Equal To": function() {
      return " =< " + this.getComparison()();
    }
  };

  datePickerFields = ["Equal To", "On or After", "On or Before", "Not Equal To"];

  emptyCondition = {
    "ID": "new_row",
    "(": "",
    "Column": "",
    "Operator": "",
    "Comparison": "",
    ")": "",
    "Seperator": "",
    "Statement": "",
    "Priority": "1"
  };

  emptyGroup = {
    "GroupId": "new_row",
    "Name": "",
    "Description": ""
  };

  String.prototype.singleQuoted = function() {
    return "'" + this + "'";
  };

  Condition = (function() {

    function Condition(params) {
      this.toString = __bind(this.toString, this);
      this.getOpAndComp = __bind(this.getOpAndComp, this);
      this.comparisonTemplate = __bind(this.comparisonTemplate, this);
      this.getComparison = __bind(this.getComparison, this);
      this.operatorTemplate = __bind(this.operatorTemplate, this);
      this.getColumnID = __bind(this.getColumnID, this);
      this.setOperatorByEvent = __bind(this.setOperatorByEvent, this);      this.ID = params['ID'] || 0;
      this.startParen = ko.observable(params['('] || "");
      this['('] = params['('] || "";
      this.columnName = ko.observable(params['Column'] || "");
      this.Column = params['Column'] || "";
      this.operator = ko.observable(params['Operator'] || "");
      this.Operator = params['Operator'] || "";
      this.comparison = ko.observable(params['Comparison'] || "");
      this.Comparison = params['Comparison'] || "";
      this.presetComparison = ko.observable("");
      this.endParen = ko.observable(params[')'] || "");
      this[')'] = params[')'] || "";
      this.seperator = ko.observable(params['Seperator'] || "");
      this.Seperator = params['Seperator'] || "";
      this.Statement = this.getStatement();
      this.Priority = params['Priority'];
    }

    Condition.prototype.setStartParen = function(parens) {
      this.startParen(parens);
      return this['('] = parens;
    };

    Condition.prototype.setColumnName = function(name) {
      this.columnName(name);
      return this.Column = name;
    };

    Condition.prototype.setOperator = function(symbol) {
      this.operator(symbol);
      return this.Operator = symbol;
    };

    Condition.prototype.setOperatorByEvent = function(event) {
      return this.getOperator()($(event.target).val());
    };

    Condition.prototype.setComparison = function(value) {
      this.comparison(value);
      return this.Comparison = value;
    };

    Condition.prototype.setEndParen = function(parens) {
      this.endParen(parens);
      return this[')'] = parens;
    };

    Condition.prototype.setSeperator = function(bool) {
      this.seperator(bool);
      return this.Seperator = bool;
    };

    Condition.prototype.getStartParen = function() {
      this['('] = this.startParen();
      return this.startParen;
    };

    Condition.prototype.getColumnName = function() {
      return this.columnName;
    };

    Condition.prototype.getColumnID = function() {
      var _this = this;
      return ko.computed(function() {
        var cid, column, id;
        cid = 0;
        for (id in allColumns) {
          column = allColumns[id];
          if (column.name === _this.getColumnName()()) cid = id;
        }
        return cid;
      });
    };

    Condition.prototype.getOperator = function(elem, op, value) {
      var operation;
      operation = op || "";
      if (operation === 'get') {
        return $(elem).val();
      } else {
        this.Operator = this.operator();
        return this.operator;
      }
    };

    Condition.prototype.getOperators = function() {
      var operator, _results;
      if (this.getDataType() in columnTypes) {
        _results = [];
        for (operator in columnTypes[this.getDataType()]) {
          _results.push(operator);
        }
        return _results;
      } else {
        return [""];
      }
    };

    Condition.prototype.operatorTemplate = function(value, options) {
      return '<select data-bind="options: selectedCondition.getOperators(), value: selectedCondition.operator, optionsCaption: defaultCaption"></select>';
    };

    Condition.prototype.getComparison = function(elem, op, value) {
      var operation;
      operation = op || "";
      $("#conditionsGrid").jqGrid("getGridParam", "colModel").filter(function(o) {
        return o.name === "Comparison";
      })[0].editrules = {
        required: false,
        number: this.getDataType() === "CF_SQL_INTEGER" || this.getDataType() === "CF_SQL_FLOAT",
        date: this.getDataType() === "CF_SQL_TIMESTAMP"
      };
      if (operation === 'get') {
        return $(elem).filter("input").val();
      } else {
        this.Comparison = this.comparison();
        return this.comparison;
      }
    };

    Condition.prototype.getFormattedComparison = function() {
      var x;
      x = null;
      if (this.getDataType() === "CF_SQL_VARCHAR") {
        x = this.comparison().toString().singleQuoted();
      } else if (this.getDataType() === "CF_SQL_BIT") {
        if (this.comparison() === "True") {
          x = 1;
        } else {
          x = 0;
        }
      } else if (this.getDataType() === "CF_SQL_TIMESTAMP" && this.presetComparison() === "") {
        x = this.comparison().singleQuoted();
      } else {
        x = this.comparison();
      }
      return x;
    };

    Condition.prototype.getComparisons = function() {
      var comps;
      if (this.getDataType() in columnTypes && this.getOperator()() in columnTypes[this.getDataType()]) {
        return comps = columnTypes[this.getDataType()][this.getOperator()()];
      } else {
        return comps = [];
      }
    };

    Condition.prototype.getPresetComparison = function() {
      if (this.getDataType() === "CF_SQL_BIT") {
        this.setComparison(this.presetComparison());
      } else if (this.getDataType() === "CF_SQL_TIMESTAMP" && this.presetComparison() !== "") {
        this.setComparison(this.presetComparison());
      }
      return this.presetComparison;
    };

    Condition.prototype.comparisonTemplate = function(value, options) {
      setTimeout(function() {
        return $("input[name=Comparison]").click(function() {
          return $(this).focus();
        }).datepicker({
          constrainInput: false,
          showAnim: function() {
            if (Main.selectedCondition.showDatePicker()) {
              return 'show';
            } else {
              return 'hide';
            }
          }
        });
      }, 50);
      return '<input class="datePicker" size="11" type="text" data-bind="value: selectedCondition.getComparison(), valueUpdate: \'keyup\', visible: selectedCondition.showCustomComparisons()"><select data-bind="value: selectedCondition.getPresetComparison(), options: selectedCondition.getComparisons(), optionsText: function(item){ return item == \'\' ? \'Custom\' : item }, disable: !selectedCondition.showPresetComparisons()"></select>';
    };

    Condition.prototype.showPresetComparisons = function() {
      return this.getComparisons().length > 0;
    };

    Condition.prototype.showCustomComparisons = function() {
      return this.getComparisons().indexOf("") > -1;
    };

    Condition.prototype.showDatePicker = function() {
      var _ref;
      return this.getDataType() === "CF_SQL_TIMESTAMP" && (_ref = this.getOperator()(), __indexOf.call(datePickerFields, _ref) >= 0);
    };

    Condition.prototype.getEndParen = function() {
      this[')'] = this.endParen();
      return this.endParen;
    };

    Condition.prototype.getSeperator = function() {
      this.Seperator = this.seperator();
      return this.seperator();
    };

    Condition.prototype.getDataType = function() {
      if (this.getColumnID()() in allColumns) {
        return allColumns[this.getColumnID()()].type;
      } else {
        return "";
      }
    };

    Condition.prototype.getOpAndComp = function() {
      if (this.operator() === "" || typeof this.operator() === "undefined") {
        return "";
      } else {
        return operatorDefinitions[this.getOperator()()].apply(this);
      }
    };

    Condition.prototype.statementTemplate = function() {
      return '<span data-bind="text: selectedCondition.getStatement"></span><input type="hidden" data-bind="value: selectedCondition.getStatement">';
    };

    Condition.prototype.getStatement = function(elem, op, value) {
      var operation;
      operation = op || "";
      if (operation === 'get') {
        return $(elem).filter("input").val();
      } else {
        return this.Statement = " " + (this.startParen()) + " " + (this.columnName()) + " " + (this.getOpAndComp()) + " " + (this.endParen()) + " " + (this.getSeperator()) + " ";
      }
    };

    Condition.prototype.toString = function() {
      return JSON.stringify({
        ID: this.ID,
        '(': this['('],
        Column: this.Column,
        Operator: this.Operator,
        Comparison: this.Comparison,
        ')': this[')'],
        Seperator: this.Seperator,
        type: this.getDataType()
      });
    };

    return Condition;

  })();

  window.Condition = Condition;

  Column = (function() {

    function Column(id, params, index) {
      this.id = id;
      this.viewName = ko.observable(params.name);
      this.dataType = ko.observable(params.type);
      this.index = params.name;
      this.name = params.name;
      this.hidden = index === -1;
      if (this.name === "ACT_ID") {
        this.formatter = 'showlink';
        this.formatoptions = {
          baseLinkUrl: 'ViewProfile.cfm',
          addParam: '&action=view',
          idName: 'ACT_ID'
        };
        this.fixed = true;
      }
    }

    Column.prototype.getViewName = function() {
      return this.viewName;
    };

    Column.prototype.toString = function() {
      return this.viewName() + ":" + this.viewName();
    };

    return Column;

  })();

  Group = (function() {

    function Group(index, params) {
      this.id = params.id;
      this.description = params.description;
      this.expanded = params.expanded;
      this.isLeaf = params.isLeaf;
      this.level = params.level;
      this.loaded = params.loaded;
      this.name = params.name;
      this.parent = params.parent;
    }

    return Group;

  })();

  App = (function() {

    function App() {
      this.validateParens = __bind(this.validateParens, this);
      this.validateStatement = __bind(this.validateStatement, this);
      this.validateSeperator = __bind(this.validateSeperator, this);
      this.selectCondition = __bind(this.selectCondition, this);
      this.selectGroup = __bind(this.selectGroup, this);
      this.loadSubGroups = __bind(this.loadSubGroups, this);
      this.afterInsertRow = __bind(this.afterInsertRow, this);
      this.onCellSelect = __bind(this.onCellSelect, this);
      var id, params;
      this.loadingOverlay = $("#loadingOverlay, #container");
      this.conditions = ko.observableArray();
      this.selectedCondition = new Condition(emptyCondition);
      this.columns = ko.observableArray((function() {
        var _results;
        _results = [];
        for (id in allColumns) {
          params = allColumns[id];
          _results.push(new Column(id, params, $.inArray(id, savedColumns)));
        }
        return _results;
      })());
      sortByAlpha(this.columns);
      this.contactsModel = this.columns();
      this.contacts = ko.observableArray();
      this.previewRecords();
      this.groups = ko.observableArray((function() {
        var _results;
        _results = [];
        for (id in allGroups) {
          params = allGroups[id];
          _results.push(new Group(id, params));
        }
        return _results;
      })());
      this.selectedGroup = new Group(0, emptyGroup);
      this.groupsModel = [
        {
          name: 'id',
          index: 'id',
          width: 1,
          hidden: true,
          key: true
        }, {
          name: 'name',
          index: 'name',
          editable: true,
          width: 200,
          align: 'left',
          cellattr: function(rowId, tv, rawObject, cm, rdata) {
            return 'title="' + rawObject.description + '"';
          }
        }, {
          name: 'description',
          index: 'description',
          editable: true,
          hidden: true,
          align: "left"
        }
      ];
    }

    App.prototype.getConditions = function() {
      return this.conditions;
    };

    App.prototype.getColumns = function() {
      return this.columns;
    };

    App.prototype.getGridColumns = function() {
      return ":;" + this.columns().join(";");
    };

    App.prototype.onCellSelect = function() {
      var _this = this;
      if (this.selectedCondition.ID !== "new_row") {
        return setTimeout(function() {
          return ko.applyBindings(_this, $("#" + _this.selectedCondition.ID, "#conditionsGrid").parent().get(0));
        }, 250);
      } else {
        return true;
      }
    };

    App.prototype.afterInsertRow = function() {
      var _this = this;
      return setTimeout(function() {
        _this.selectedCondition = new Condition(emptyCondition);
        return ko.applyBindings(_this, $("#" + _this.selectedCondition.ID, "#conditionsGrid").parent().get(0));
      }, 250);
    };

    App.prototype.loadSubGroups = function(postdata) {
      var _this = this;
      return jQuery.ajax({
        url: ACT_DATA_URL + '?Action=GetViewColumnsAndGroups',
        data: postdata,
        dataType: "jsonp",
        success: function(data, stat) {
          if (stat === "success") return _this.groups(data.groups);
        }
      });
    };

    App.prototype.selectGroup = function(ID) {
      var _this = this;
      this.selectedGroup = ID;
      return $.ajax({
        url: ACT_DATA_URL,
        data: {
          action: "GetGroupById",
          GroupID: ID
        },
        type: 'GET',
        dataType: 'jsonp',
        jsonp: 'callback',
        success: function(data) {
          var condition, _i, _len;
          _this.conditions.removeAll();
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            condition = data[_i];
            _this.conditions.push(new Condition(condition));
          }
          return _this.previewRecords();
        }
      });
    };

    App.prototype.selectCondition = function(selectedItem) {
      if (selectedItem.ID !== "new_row") {
        this.selectedCondition = selectedItem;
        ko.mapping.fromJS(selectedItem, this.selectedCondition);
      }
      return true;
    };

    App.prototype.saveCondition = function() {
      var _this = this;
      return $.ajax({
        url: ACT_DATA_URL,
        data: {
          action: "SaveCondition",
          groupid: this.selectedGroup,
          where: "[" + this.conditions().join(",") + "]"
        },
        type: 'GET',
        dataType: 'jsonp',
        jsonp: 'callback',
        success: function(data) {
          var condition, index, _len, _ref;
          _ref = _this.conditions();
          for (index = 0, _len = _ref.length; index < _len; index++) {
            condition = _ref[index];
            condition.ID = data.ConditionIDs[index];
          }
          $("#conditionsGrid").jqGrid("setGridParam", {
            data: ko.utils.unwrapObservable(_this.conditions).slice(0)
          }).trigger('reloadGrid', [
            {
              page: 1
            }
          ]);
          return _this.previewRecords();
        }
      });
    };

    App.prototype.previewRecords = function() {
      var _this = this;
      if (this.conditions().length > 0) {
        this.loadingOverlay.toggle();
        return $.ajax({
          url: ACT_DATA_URL,
          data: {
            action: "GetContactsByQuery",
            select: JSON.stringify(savedColumns),
            where: "[" + this.conditions().join(",") + "]"
          },
          type: 'GET',
          dataType: 'jsonp',
          jsonp: 'callback',
          success: function(data) {
            $("#contactsGrid").jqGrid('clearGridData').jqGrid('setGridParam', {
              data: data
            }).trigger('reloadGrid', [
              {
                page: 1
              }
            ]);
            return _this.loadingOverlay.toggle();
          }
        });
      }
    };

    App.prototype.validateSeperator = function() {
      if (this.getConditions()().length > 0 && this.getConditions()()[this.getConditions()().length - 1] !== this.selectedCondition && this.selectedCondition.Seperator === "") {
        return [false, "You must use a seperator for your criteria, AND/OR"];
      } else {
        return [true, ""];
      }
    };

    App.prototype.validateStatement = function() {
      try {
        if (this.conditions().length > 0) {
          SQLParser.parse("SELECT * FROM Contacts WHERE " + (this.conditions().map(function(o) {
            return o.getStatement();
          })).join(""));
        }
        return [true, ""];
      } catch (error) {
        return [false, "Criteria is wrong: " + error.toString().split(":")[2]];
      }
    };

    App.prototype.validateParens = function() {
      return [true, ""];
    };

    App.prototype.contactsGridHeight = function() {
      var height;
      height = $(window).height() - $('#gbox_conditionsGrid').height() - 105;
      $("#contactsGrid").jqGrid("setGridHeight", height);
      return height;
    };

    App.prototype.conditionsGridHeight = function() {
      return 'auto';
    };

    return App;

  })();

  $(function() {
    return $.ajax({
      url: ACT_DATA_URL,
      data: {
        action: "GetViewColumnsAndGroups"
      },
      type: 'GET',
      dataType: 'jsonp',
      jsonp: 'callback',
      success: function(data) {
        window['allColumns'] = data.schema;
        window['allGroups'] = data.groups;
        window["Main"] = new App();
        return ko.applyBindings(Main);
      }
    });
  });

}).call(this);
