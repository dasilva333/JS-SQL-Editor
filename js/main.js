(function() {
  var defaultColumns;

  defaultColumns = {
    "ColumnName-1": "varchar",
    "ColumnName-2": "int",
    "ColumnName-3": "datetime"
  };

  window.App = new function() {
    var Column, Condition, self;
    self = this;
    this.conditions = ko.observableArray();
    this.columns = ko.observableArray();
    this.load = function() {
      var name, type;
      for (name in defaultColumns) {
        type = defaultColumns[name];
        self.columns.push(new Column(name, type));
        console.log(self.columns()[0].toString());
      }
      self.conditions.push(new Condition("(", "ColumnName-2", "=", "2", ")"));
      ko.setTemplateEngine(new mustacheTemplateEngine());
      return ko.applyBindings(this);
    };
    Column = function(name, type) {
      var column, dataType, viewName;
      column = this;
      viewName = ko.observable(name);
      dataType = ko.observable(type);
      this.getName = function() {
        return viewName;
      };
      this.toString = function() {
        return viewName();
      };
      return column;
    };
    Condition = (function() {
      var columnName, comparison, endParen, operator, startParen;

      startParen = ko.observable("");

      columnName = ko.observable("");

      operator = ko.observable("");

      comparison = ko.observable("");

      endParen = ko.observable("");

      function Condition(startParen, columnName, operator, comparison, endParen) {
        this.setColumnName(columnName);
        this.setStartParen(startParen);
        this.setEndParen(endParen);
        this.setOperator(operator);
        this.setComparison(comparison);
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

      Condition.prototype.getStartParen = function() {
        return startParen;
      };

      Condition.prototype.getColumnName = function() {
        return columnName;
      };

      Condition.prototype.getOperator = function() {
        return operator;
      };

      Condition.prototype.getComparison = function() {
        return comparison;
      };

      Condition.prototype.getEndParen = function() {
        return endParen;
      };

      Condition.prototype.toString = function() {
        return "" + (startParen()) + " " + (columnName()) + " " + (operator()) + " " + (comparison()) + " " + (endParen());
      };

      return Condition;

    })();
    return self;
  };

  $(function() {
    return App.load();
  });

}).call(this);
