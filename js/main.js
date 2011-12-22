(function() {
  var App, Column, Condition, columnTypes, defaultColumns, operatorDefinitions;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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
      "Greater Than Or Equal To": [""],
      "Less Than": [""],
      "Less Than or Equal To": [""],
      "Not Equal To !=": [""]
    },
    varchar: {
      "Contains": [""],
      "Contains Data": [],
      "Does Not Contain Data": [],
      "Ends With": [""],
      "Equal To": [""],
      "Greater Than": [""],
      "Greater Than Or Equal To": [""],
      "Less Than": [""],
      "Less Than or Equal To": [""],
      "Not Equal To !=": [""],
      "Starts With": [""]
    },
    datetime: {
      "After Next [Days]": [""],
      "Contains Data": [],
      "Days Equal": [""],
      "Does Not Contain Data": [],
      "Equal To": ["", "Today"],
      "Months Equals [number]": [""],
      "Not Equal To != ": [""],
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
      return " DateAdd(d," + this.getColumnName + "," + this.getComparison + " ) ";
    },
    "Contains Data": " != ''  ",
    "Days Equal": function() {
      return " DAY( " + this.getColumnName + " ) = ";
    },
    "Does Not Contain Data": " = '' OR IS NULL ",
    "Equal To": function() {
      return " = " + this.getFormattedComparison;
    },
    "Months Equals [number]": function() {
      return " MONTH( " + this.getColumnName + " ) = ";
    },
    "Not Equal To != ": function() {
      return " != " + this.getComparison;
    },
    "Older than [days]": "",
    "On or After": "",
    "On or Before": "",
    "Within Last [days]": "",
    "Within Next [days]": "",
    "Years Equals [number]": function() {
      return " YEAR( " + this.getColumnName + " ) = ";
    },
    "Starts With": function() {
      return " LIKE '" + this.getComparison + "%' ";
    }
  };

  String.prototype.singleQuoted = function() {
    return "'" + this + "'";
  };

  Condition = (function() {

    function Condition(sp, name, op, comp, ep, sep) {
      this.startParen = ko.observable(sp || "");
      this.columnName = ko.observable(name || "");
      this.operator = ko.observable(op || "");
      this.comparison = ko.observable(comp || "");
      this.endParen = ko.observable(ep || "");
      this.seperator = ko.observable(sep || "");
    }

    Condition.prototype.setStartParen = function(parens) {
      return this.startParen(parens);
    };

    Condition.prototype.setColumnName = function(name) {
      return this.columnName(name);
    };

    Condition.prototype.setOperator = function(symbol) {
      return this.operator(symbol);
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
      console.log(operatorDefinitions[this.operator()].apply(this)());
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

    Condition.prototype.getComparison = function() {
      return this.comparison;
    };

    Condition.prototype.getFormattedComparison = function() {
      if (this.getDataType() === 'varchar') {
        return this.comparison().singleQuoted();
      } else {
        return this.comparison();
      }
    };

    Condition.prototype.getComparisons = function() {
      return columnTypes[this.getDataType()][this.getOperator()()];
    };

    Condition.prototype.getEndParen = function() {
      return this.endParen;
    };

    Condition.prototype.getSeperator = function() {
      return this.seperator;
    };

    Condition.prototype.getDataType = function() {
      return defaultColumns[this.columnName()];
    };

    Condition.prototype.isOpenValue = function() {
      return this.getComparisons().indexOf("") > -1;
    };

    Condition.prototype.toString = function() {
      return " " + (this.startParen()) + " " + (this.columnName()) + " " + (this.operator()) + " " + (this.getFormattedComparison()) + " " + (this.endParen()) + " " + (this.seperator()) + " ";
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
      return this.viewName();
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

    function App() {
      this.addPlaceholder = __bind(this.addPlaceholder, this);
      var n, t;
      this.conditions = ko.observableArray();
      this.columns = ko.observableArray((function() {
        var _results;
        _results = [];
        for (n in defaultColumns) {
          t = defaultColumns[n];
          _results.push(new Column(n, t));
        }
        return _results;
      })());
      this.addPlaceholder();
      ko.setTemplateEngine(new mustacheTemplateEngine());
    }

    App.prototype.getConditions = function() {
      return this.conditions;
    };

    App.prototype.getColumns = function() {
      return this.columns;
    };

    App.prototype.viewStatement = function() {
      return this.conditions().join("");
    };

    App.prototype.addPlaceholder = function() {
      return this.conditions.push(new Condition("(", "LastUpdated", "Equal To", "richard", ")"));
    };

    return App;

  })();

  $(function() {
    window["Main"] = new App();
    return ko.applyBindings(Main);
  });

}).call(this);
