(function() {
  var App, Column, Condition, columnTypes, dataArr, defaultColumns, emptyCondition, operatorDefinitions;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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
      return " DateAdd(d," + this.getComparison()() + "," + this.getColumnName()() + " ) > GetDate() ";
    },
    "Contains Data": function() {
      return " != '' OR IS NOT NULL  ";
    },
    "Days Equal": function() {
      return " DAY( " + this.getColumnName()() + " ) = ";
    },
    "Does Not Contain Data": function() {
      return " = '' OR IS NULL ";
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
      this.setOperatorByEvent = __bind(this.setOperatorByEvent, this);      this.ID = params['ID'] || 0;
      this.startParen = ko.observable(params['('] || "");
      this['('] = params['('];
      this.columnName = ko.observable(params['Column'] || "");
      this.Column = params['Column'];
      this.operator = ko.observable(params['Operator'] || "");
      this.Operator = params['Operator'];
      this.comparison = ko.observable(params['Comparison'] || "");
      this.Comparison = params['Comparison'];
      this.endParen = ko.observable(params[')'] || "");
      this[')'] = params[')'];
      this.seperator = ko.observable(params['Seperator'] || "");
      this.Seperator = params['Seperator'];
      this.Statement = this.toString();
    }

    Condition.prototype.setStartParen = function(parens) {
      return this.startParen(parens);
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
      return this.comparison(value);
    };

    Condition.prototype.setEndParen = function(parens) {
      return this.endParen(parens);
    };

    Condition.prototype.setSeperator = function(bool) {
      return this.seperator(bool);
    };

    Condition.prototype.getStartParen = function() {
      return this.startParen;
    };

    Condition.prototype.getColumnName = function() {
      return this.columnName;
    };

    Condition.prototype.getOperator = function() {
      return this.operator;
    };

    Condition.prototype.getOperators = function() {
      var operator, _results;
      _results = [];
      for (operator in columnTypes[this.getDataType()]) {
        _results.push(operator);
      }
      return _results;
    };

    Condition.prototype.operatorTemplate = function(value, options) {
      setTimeout(function() {
        return ko.applyBindings(Main, $("#" + options.id).parent().get(0));
      }, 250);
      return '<select data-bind="value: selectedCondition.getOperator(), options: selectedCondition.getOperators(), optionsCaption: defaultCaption"></select>';
    };

    Condition.prototype.getComparison = function() {
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
      return columnTypes[this.getDataType()][this.getOperator()()];
    };

    Condition.prototype.comparisonTemplate = function(value, options) {
      setTimeout(function() {
        return ko.applyBindings(Main, $("#" + options.id).parent().get(0));
      }, 250);
      return '<select data-bind="valueUpdate: \'change\', options: selectedCondition.getComparisons(), optionsText: function(item){ return item == \'\' ? \'Custom\' : item }, disable: !selectedCondition.showPresetComparisons()"></select><input type="text" data-bind="value: selectedCondition.getComparison(), valueUpdate: \'keyup\', visible: selectedCondition.showCustomComparisons()">';
    };

    Condition.prototype.showPresetComparisons = function() {
      return this.getComparisons().length > 0;
    };

    Condition.prototype.showCustomComparisons = function() {
      return this.getComparisons().indexOf("") > -1;
    };

    Condition.prototype.getEndParen = function() {
      return this.endParen;
    };

    Condition.prototype.getSeperator = function() {
      return this.seperator();
    };

    Condition.prototype.getDataType = function() {
      return defaultColumns[this.columnName()];
    };

    Condition.prototype.getOpAndComp = function() {
      var x;
      if (this.operator() === "") {
        x = "";
      } else {
        x = operatorDefinitions[this.operator()].apply(this);
      }
      return x;
    };

    Condition.prototype.stringTemplate = function(value, options) {
      setTimeout(function() {
        return ko.applyBindings(Main, $("#" + options.id).parent().get(0));
      }, 250);
      return '<span data-bind="text: selectedCondition.toString()"></span>';
    };

    Condition.prototype.toString = function() {
      return " " + (this.startParen()) + " " + (this.columnName()) + " " + (this.getOpAndComp()) + " " + (this.endParen()) + " " + (this.getSeperator()) + " ";
    };

    return Condition;

  })();

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
      return this.columns().join(";");
    };

    App.prototype.viewStatement = function() {
      var _this = this;
      return ko.computed(function() {
        var result, statement;
        statement = _this.conditions().join("");
        try {
          result = SQLParser.parse(statement).where.conditions;
        } catch (error) {
          result = error;
        }
        if (typeof result === "string") {
          $("#navPager_right").html(result);
        } else {
          $("#navPager_right").html(statement);
        }
        return statement;
      });
    };

    App.prototype.selectCondition = function(selectedItem) {
      console.log(" blah ");
      /*
          if selectedItem.ID is "new_row"
            item = emptyCondition
          else
            item = selectedItem;  
          item = $.extend( new Condition(item), item )  
          console.log(item)  
          ko.mapping.fromJS(item , @selectedCondition)
      */
      return this.selectedCondition = new Condition(selectedItem);
    };

    return App;

  })();

  emptyCondition = {
    "ID": "new_row",
    "(": "",
    "Column": "",
    "Operator": "",
    "Value": "",
    ")": "",
    "Seperator": "",
    "Statement": ""
  };

  dataArr = [
    new Condition({
      "ID": 1,
      "(": "(",
      "Column": "FirstName",
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
