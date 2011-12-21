defaultColumns = 
  "FirstName": "varchar"
  "EmployeeCount": "int"
  "LastUpdated": "datetime"

String::singleQuoted = ->
  "'#{ this }'"

class App
  class Condition
    startParen = ko.observable ""
    columnName = ko.observable ""
    operator = ko.observable ""
    comparison = ko.observable ""
    endParen = ko.observable ""
    seperator = ko.observable ""
    
    constructor: (sp, name, op, comp, ep, sep) ->
      @setStartParen sp
      @setColumnName name
      @setOperator op
      @setComparison comp
      @setEndParen ep
      @setSeperator sep || ""
      
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
    
    setSeperator: (bool) ->
      seperator bool
      
    getStartParen: ->
      startParen

    getColumnName: ->
      columnName

    getOperator: ->
      operator
    
    ##Improve this bit   
    getOperators: ->
      ##if columnName().toString() != ""
      ##  index = columns().toString().split(",").indexOf(columnName().toString())
      ##  columns()[index].getTypes()
      [ operator ]
    getComparison: ->
      comparison
 
    getEndParen: ->
      endParen
   
    getSeperator: ->
      seperator   
    
    toString: () ->
      " #{ startParen() } #{ columnName() } #{ operator() } #{ comparison().singleQuoted() } #{ endParen() } #{ seperator() } "

  ##End of ConditionClass
  
  class Column
   
    viewName = ko.observable ""
    dataType = ko.observable ""
    columnTypes = 
      "varchar": [ "<", ">", "=", "LIKE" ]
      "int": ["=", ">"],
      "datetime": [ "within the last", "equal to" ]
      
    constructor: (name,type) ->
      viewName name
      dataType type 
    
    getViewName: ->
      viewName
    
    toString: ->
      viewName()
  
    getTypes: ->
      columnTypes[dataType()]
      
  ##End OF ColumnClass

  conditions = ko.observableArray()
  columns = []
      
  constructor: ->
    for n,t of defaultColumns
       columns.push new Column n,t
    console.log columns.join ","
    conditions.push new Condition "(", "FirstName", "=" ,"'richard'" , ")"
    ko.setTemplateEngine new mustacheTemplateEngine();

  getConditions: ->
    conditions
  
  getColumns: ->
    columns
  
  viewStatement: ->
    conditions().join("")


$ -> 
  window["Main"] = new App()
  ##ko.applyBindings Main