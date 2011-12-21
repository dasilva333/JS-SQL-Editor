defaultColumns = {
  "ColumnName-1":"varchar",
  "ColumnName-2":"int",
  "ColumnName-3":"datetime",
}
window.App = new ->
  self = @; 
  @conditions = ko.observableArray()
  @columns = ko.observableArray()
  @load = ->
    for name, type of defaultColumns
        self.columns.push new Column name,type
        console.log self.columns()[0].toString() 
    self.conditions.push new Condition "(", "ColumnName-2","=","2", ")";
    ko.setTemplateEngine new mustacheTemplateEngine();
    ko.applyBindings @
  
  Column = (name,type) ->
    column = @;
    viewName = ko.observable name
    dataType = ko.observable type
    
    @getName = ->
      viewName
      
    @toString = ->
      viewName()
        
    column
    
  class Condition
    startParen = ko.observable ""
    columnName = ko.observable ""
    operator = ko.observable ""
    comparison = ko.observable ""
    endParen = ko.observable ""
    
    constructor: (startParen, columnName, operator, comparison, endParen) ->
      @setColumnName columnName
      @setStartParen startParen
      @setEndParen endParen
      @setOperator operator
      @setComparison comparison
    
    setStartParen: (parens) ->
      startParen parens
      
    setColumnName: (name) ->
      columnName name
    
    setOperator: (symbol) ->
      operator symbol
    
    setComparison: (value) ->
      comparison value
      
    setEndParen: (parens) ->
      endParen parens 
    
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
      
    toString: () ->
      "#{ startParen() } #{ columnName() } #{ operator() } #{ comparison() } #{ endParen() }"
   self
   
$ -> App.load()


