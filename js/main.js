
  window.App = new function() {
    var Condition, self;
    self = this;
    this.conditions = ko.observableArray();
    this.load = function() {
      self.conditions.push(new Condition("ColumnName-2", 1, 1, "=", "2"));
      ko.setTemplateEngine(new mustacheTemplateEngine());
      return ko.applyBindings(this);
    };
    Condition = (function() {
      var C, columnName, comparison, endParen, operator, startParen;

      C = Condition;

      startParen = ko.observable("");

      columnName = ko.observable("");

      operator = ko.observable("");

      comparison = ko.observable("");

      endParen = ko.observable("");

      function Condition(columnName, startParen, endParen, operator, comparison) {
        this.setColumnName(columnName);
        this.setStartParen(startParen);
        this.setEndParen(endParen);
        this.setOperator(operator);
        this.setComparison(comparison);
      }

      Condition.prototype.setStartParen = function(amount) {
        var paren, _results;
        _results = [];
        for (paren = 1; 1 <= amount ? paren <= amount : paren >= amount; 1 <= amount ? paren++ : paren--) {
          _results.push(startParen += "(");
        }
        return _results;
      };

      Condition.prototype.setColumnName = function(name) {
        return columnName = name;
      };

      Condition.prototype.setOperator = function(symbol) {
        return operator = symbol;
      };

      Condition.prototype.setComparison = function(value) {
        return comparison = value;
      };

      Condition.prototype.setEndParen = function(amount) {
        var paren, _results;
        _results = [];
        for (paren = 1; 1 <= amount ? paren <= amount : paren >= amount; 1 <= amount ? paren++ : paren--) {
          _results.push(endParen += ")");
        }
        return _results;
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

      Condition.prototype.toString = function(meters) {
        return "" + startParen + " " + columnName + " " + operator + " " + comparison + " " + endParen;
      };

      return Condition;

    })();
    return self;
  };

  $(function() {
    return App.load();
  });
