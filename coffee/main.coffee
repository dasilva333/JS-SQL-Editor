window.App = new ->
  self = @; 
  @conditions = ko.observableArray()
  @load = ->
    
    self.conditions.push new Condition "ColumnName-2",1,1,"=","2";
    ko.setTemplateEngine new mustacheTemplateEngine();
    ko.applyBindings @

  class Condition
    C = @      
    startParen = ko.observable("")
    columnName = ko.observable("")
    operator = ko.observable("")
    comparison = ko.observable("")
    endParen = ko.observable("")
    
    constructor: (columnName, startParen, endParen, operator, comparison) ->
      @setColumnName columnName
      @setStartParen startParen
      @setEndParen endParen
      @setOperator operator
      @setComparison comparison
    
    setStartParen: (amount) ->
      startParen += "(" for paren in [1..amount]
      
    setColumnName: (name) ->
      columnName = name
    
    setOperator: (symbol) ->
      operator = symbol
    
    setComparison: (value) ->
      comparison = value;
      
    setEndParen: (amount) ->
      endParen += ")" for paren in [1..amount] 
    
    getStartParen: ->
      startParen

    getColumnName: ->
      columnName
          
    getOperator: ->
      operator
    
    getComparison: ->
      comparison
      
    getEndParen: ->
      endParen
      
    toString: (meters) ->
      "#{ startParen } #{ columnName } #{ operator } #{ comparison } #{ endParen }"
   self
   
$ -> App.load()


