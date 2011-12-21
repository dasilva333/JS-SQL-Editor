(function() {
  var App, defaultColumns;

  defaultColumns = {
    "FirstName": "varchar",
    "EmployeeCount": "int",
    "LastUpdated": "datetime"
  };

  String.prototype.singleQuoted = function() {
    return "'" + this + "'";
  };

  App = (function() {
    var Column, Condition, columns, conditions;

    Condition = (function() {
      var columnName, comparison, endParen, operator, seperator, startParen;

      startParen = ko.observable("");

      columnName = ko.observable("");

      operator = ko.observable("");

      comparison = ko.observable("");

      endParen = ko.observable("");

      seperator = ko.observable("");

      function Condition(sp, name, op, comp, ep, sep) {
        this.setStartParen(sp);
        this.setColumnName(name);
        this.setOperator(op);
        this.setComparison(comp);
        this.setEndParen(ep);
        this.setSeperator(sep || "");
      }

      Condition.prototype.setStartParen = function(parens) {
        return startParen(parens);
      };

      Condition.prototype.setColumnName = function(name) {
        return columnName(name);
      };

      Condition.prototype.setOperator = function(symbol) {
        return operator(symbol);
      };

      Condition.prototype.setComparison = function(value) {
        return comparison(value);
      };

      Condition.prototype.setEndParen = function(parens) {
        return endParen(parens);
      };

      Condition.prototype.setSeperator = function(bool) {
        return seperator(bool);
      };

      Condition.prototype.getStartParen = function() {
        return startParen;
      };

      Condition.prototype.getColumnName = function() {
        return columnName;
      };

      Condition.prototype.getOperator = function() {
        return operator;
      };

      Condition.prototype.getOperators = function() {
        return [operator];
      };

      Condition.prototype.getComparison = function() {
        return comparison;
      };

      Condition.prototype.getEndParen = function() {
        return endParen;
      };

      Condition.prototype.getSeperator = function() {
        return seperator;
      };

      Condition.prototype.toString = function() {
        return " " + (startParen()) + " " + (columnName()) + " " + (operator()) + " " + (comparison().singleQuoted()) + " " + (endParen()) + " " + (seperator()) + " ";
      };

      return Condition;

    })();

    Column = (function() {
      var columnTypes, dataType, viewName;

      viewName = ko.observable("");

      dataType = ko.observable("");

      columnTypes = {
        "varchar": ["<", ">", "=", "LIKE"],
        "int": ["=", ">"],
        "datetime": ["within the last", "equal to"]
      };

      function Column(name, type) {
        viewName(name);
        dataType(type);
      }

      Column.prototype.getViewName = function() {
        return viewName;
      };

      Column.prototype.toString = function() {
        return viewName();
      };

      Column.prototype.getTypes = function() {
        return columnTypes[dataType()];
      };

      return Column;

    })();

    conditions = ko.observableArray();

    columns = [];

    function App() {
      var n, t;
      for (n in defaultColumns) {
        t = defaultColumns[n];
        columns.push(new Column(n, t));
      }
      console.log(columns.join(","));
      conditions.push(new Condition("(", "FirstName", "=", "'richard'", ")"));
      ko.setTemplateEngine(new mustacheTemplateEngine());
    }

    App.prototype.getConditions = function() {
      return conditions;
    };

    App.prototype.getColumns = function() {
      return columns;
    };

    App.prototype.viewStatement = function() {
      return conditions().join("");
    };

    return App;

  })();

  $(function() {
    return window["Main"] = new App();
  });

}).call(this);
