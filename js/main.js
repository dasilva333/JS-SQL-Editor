(function() {
  var App, Column, Condition, columnTypes, dataArr, defaultColumns, emptyCondition, operatorDefinitions,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.defaultCaption = "--Select--";

  defaultColumns = {
    "FirstName": "varchar",
    "EmployeeCount": "int",
    "LastUpdated": "datetime",
    "Active": "bit"
  };

  columnTypes = {
    int: {
      "Contains Data": [],
      "Does Not Contain Data": [],
      "Equal To": [""],
      "Greater Than": [""],
      "Greater Than or Equal To": [""],
      "Less Than": [""],
      "Less Than or Equal To": [""],
      "Not Equal To": [""]
    },
    varchar: {
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
    datetime: {
      "After Next [Days]": [""],
      "Contains Data": [],
      "Days Equal": [""],
      "Does Not Contain Data": [],
      "Equal To": ["", "Today"],
      "Months Equals [number]": [""],
      "Not Equal To": [""],
      "Older than [days]": [""],
      "On or After": ["", "Today"],
      "On or Before": ["", "Today"],
      "Within Last [days]": [""],
      "Within Next [days]": [""],
      "Years Equals [number]": [""]
    },
    bit: {
      "Equal To": ["True", "False"]
    }
  };

  operatorDefinitions = {
    "After Next [Days]": function() {
      return " DateAdd(d," + this.getComparison()() + "," + this.getColumnName()() + " ) > GetDate";
    },
    "Contains Data": function() {
      return " != '' OR " + this.getColumnName()() + " IS NOT NULL  ";
    },
    "Days Equal": function() {
      return " DAY( " + this.getColumnName()() + " ) = ";
    },
    "Does Not Contain Data": function() {
      return " = ''  OR " + this.getColumnName()() + " IS NULL ";
    },
    "Equal To": function() {
      return " = " + this.getFormattedComparison();
    },
    "Months Equals [number]": function() {
      return " MONTH( " + this.getColumnName()() + " ) = ";
    },
    "Not Equal To": function() {
      return " != " + this.getFormattedComparison();
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

  String.prototype.singleQuoted = function() {
    return "'" + this + "'";
  };

  Condition = (function() {

    function Condition(params) {
      this.toString = __bind(this.toString, this);
      this.getOpAndComp = __bind(this.getOpAndComp, this);
      this.operatorTemplate = __bind(this.operatorTemplate, this);
      this.setOperatorByEvent = __bind(this.setOperatorByEvent, this);      this.ID = params['ID'] || 0;
      this.startParen = ko.observable(params['('] || "");
      this['('] = params['('] || "";
      this.columnName = ko.observable(params['Column'] || "");
      this.Column = params['Column'] || "";
      this.operator = ko.observable(params['Operator'] || "");
      this.Operator = params['Operator'] || "";
      this.comparison = ko.observable(params['Comparison'] || "");
      this.Comparison = params['Comparison'] || "";
      this.presetComparison = ko.observable(this.comparison());
      this.endParen = ko.observable(params[')'] || "");
      this[')'] = params[')'] || "";
      this.seperator = ko.observable(params['Seperator'] || "");
      this.Seperator = params['Seperator'] || "";
      this.Statement = this.toString();
      console.log(params);
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

    Condition.prototype.getOperator = function(elem, op, value) {
      var operation;
      console.log(arguments);
      operation = op || "";
      if (operation === 'get') {
        console.log("operation is get");
        return $(elem).val();
      } else if (operation === 'set') {
        console.log("set your stuff");
        return "";
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

    Condition.prototype.getComparison = function() {
      this.Comparison = this.comparison();
      return this.comparison;
    };

    Condition.prototype.getFormattedComparison = function() {
      var x;
      x = null;
      if (this.getDataType() === 'varchar') {
        x = this.comparison().singleQuoted();
      } else if (this.getDataType() === 'bit') {
        if (this.comparison() === "True") {
          x = 1;
        } else {
          x = 0;
        }
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
      if (this.getDataType() === 'bit') {
        this.setComparison(this.presetComparison());
      }
      if (this.getDataType() === 'datetime' && this.presetComparison() === "Today") {
        this.setComparison("GetDate");
      }
      return this.presetComparison;
    };

    Condition.prototype.comparisonTemplate = function(value, options) {
      return '<select data-bind="value: selectedCondition.getPresetComparison(), options: selectedCondition.getComparisons(), optionsText: function(item){ return item == \'\' ? \'Custom\' : item }, disable: !selectedCondition.showPresetComparisons()"></select><input type="text" data-bind="value: selectedCondition.getComparison(), valueUpdate: \'keyup\', visible: selectedCondition.showCustomComparisons()">';
    };

    Condition.prototype.showPresetComparisons = function() {
      return this.getComparisons().length > 0;
    };

    Condition.prototype.showCustomComparisons = function() {
      return this.getComparisons().indexOf("") > -1;
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
      if (this.columnName() in defaultColumns) {
        return defaultColumns[this.columnName()];
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

    Condition.prototype.stringTemplate = function(value, options) {
      return '<span data-bind="text: selectedCondition.toString()"></span>';
    };

    Condition.prototype.toString = function() {
      return this.Statement = " " + (this.startParen()) + " " + (this.columnName()) + " " + (this.getOpAndComp()) + " " + (this.endParen()) + " " + (this.getSeperator()) + " ";
    };

    return Condition;

  })();

  Condition = Condition;

  Column = (function() {

    function Column(name, type) {
      this.getTypes = __bind(this.getTypes, this);      this.viewName = ko.observable(name);
      this.dataType = ko.observable(type);
    }

    Column.prototype.getViewName = function() {
      return this.viewName;
    };

    Column.prototype.toString = function() {
      return this.viewName() + ":" + this.viewName();
    };

    Column.prototype.getTypes = function() {
      var operator, _results;
      _results = [];
      for (operator in columnTypes[this.dataType()]) {
        _results.push(operator);
      }
      return _results;
    };

    return Column;

  })();

  App = (function() {
    var self;

    self = App;

    function App() {
      this.selectCondition = __bind(this.selectCondition, this);
      this.afterInsertRow = __bind(this.afterInsertRow, this);
      this.onCellSelect = __bind(this.onCellSelect, this);
      this.viewStatement = __bind(this.viewStatement, this);
      var n, t;
      this.conditions = ko.observableArray(dataArr);
      this.columns = ko.observableArray((function() {
        var _results;
        _results = [];
        for (n in defaultColumns) {
          t = defaultColumns[n];
          _results.push(new Column(n, t));
        }
        return _results;
      })());
      this.selectedCondition = new Condition(emptyCondition);
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

    App.prototype.viewStatement = function() {
      var _this = this;
      return ko.computed(function() {
        var statement;
        statement = "SELECT * FROM Contacts WHERE " + _this.conditions().join("");
        try {
          SQLParser.parse(statement).where.conditions;
        } catch (error) {
          statement = '<span class="ui-state-error">' + error + '</span>';
        }
        return statement;
      });
    };

    App.prototype.onCellSelect = function() {
      var _this = this;
      console.log("onCellSelect");
      console.log(this.selectedCondition.ID);
      if (this.selectedCondition.ID !== "new_row") {
        return setTimeout(function() {
          return ko.applyBindings(_this, $("#" + _this.selectedCondition.ID).parent().get(0));
        }, 250);
      } else {
        return false;
      }
    };

    App.prototype.afterInsertRow = function() {
      var _this = this;
      return setTimeout(function() {
        _this.selectedCondition = new Condition(emptyCondition);
        return ko.applyBindings(Main, $("#" + _this.selectedCondition.ID).parent().get(0));
      }, 250);
    };

    App.prototype.gridComplete = function() {
      setTimeout(function() {
        return ko.applyBindings(Main, $("#navPager_right").parent().get(0));
      }, 250);
      return $("#navPager_right").html('<span data-bind="html: viewStatement()"></span>');
    };

    App.prototype.selectCondition = function(selectedItem) {
      console.log("selectCondition");
      if (selectedItem.ID !== "new_row") {
        this.selectedCondition = selectedItem;
        ko.mapping.fromJS(selectedItem, this.selectedCondition);
      }
      return true;
    };

    App.prototype.add = function() {
      var newId;
      console.log("i am being used?");
      if (!this.selectedCondition.ID()) {
        newId = this.conditions().length + 1;
        this.selectedCondition.ID(newId);
        this.conditions.push(ko.mapping.toJS(this.selectedCondition));
      }
      return ko.mapping.fromJS(emptyCondition, this.selectedCondition);
    };

    return App;

  })();

  emptyCondition = {
    "ID": "new_row",
    "(": "",
    "Column": "",
    "Operator": "",
    "Comparison": "",
    ")": "",
    "Seperator": "",
    "Statement": ""
  };

  dataArr = [
    new Condition({
      "ID": 1,
      "(": "(",
      "Column": "LastUpdated",
      "Operator": "Equal To",
      "Comparison": "richard",
      ")": ")",
      "Seperator": "OR",
      "Statement": ""
    }), new Condition({
      "ID": 2,
      "(": "(",
      "Column": "Active",
      "Operator": "Equal To",
      "Comparison": "1",
      ")": ")",
      "Seperator": "",
      "Statement": ""
    })
  ];

  $(function() {
    window["Main"] = new App();
    return ko.applyBindings(Main);
  });

}).call(this);
