defaultColumns =
  "FirstName": "varchar"
  "EmployeeCount": "int"
  "LastUpdated": "datetime"

String::singleQuoted = ->
  "'#{ this }'"

class Condition
  
  constructor: (sp, name, op, comp, ep, sep) ->
    @startParen = ko.observable sp || ""
    @columnName = ko.observable name || ""
    @operator = ko.observable op || ""
    @comparison = ko.observable comp || ""
    @endParen = ko.observable ep || ""
    @seperator = ko.observable sep || ""
    
  setStartParen: (parens) ->
    @startParen parens
    
  setColumnName: (name) ->
    @columnName name
    
  setOperator: (symbol) ->
    @operator symbol
  
  setComparison: (value) ->
    @comparison value
    
  setEndParen: (parens) ->
    @endParen parens
  
  setSeperator: (bool) ->
    @seperator bool
    
  getStartParen: ->
    @startParen

  getColumnName: ->
    @columnName

  getOperator: ->
    @operator
  
  ##Improve this bit   
  getOperators: ->
    index = Main.columns().toString().split(",").indexOf(@columnName().toString())
    Main.columns()[index].getTypes()
      
  getComparison: ->
    @comparison
 
  getEndParen: ->
    @endParen
   
  getSeperator: ->
    @seperator   
    
  toString: () ->
    " #{ @startParen() } #{ @columnName() } #{ @operator() } #{ @comparison().singleQuoted() } #{ @endParen() } #{ @seperator() } "

class Column

  columnTypes =
    int:
      "Contains Data": []
      "Does Not Contain Data": []
      "Equal To": [""]
      "Greater Than": [""]
      "Greater Than Or Equal To": [""]
      "Less Than": [""]
      "Less Than or Equal To": [""]
      "Not Equal To !=": [""]
    varchar: 
      "Contains": [""]
      "Contains Data": []
      "Does Not Contain Data": []
      "Ends With": [""]
      "Equal To": [""]
      "Greater Than": [""]
      "Greater Than Or Equal To": [""]
      "Less Than": [""]
      "Less Than or Equal To": [""]
      "Not Equal To !=": [""]
      "Starts With": [""]
    datetime:  
      "After Next [Days]" : [""]
      "Contains Data": []
      "Days Equal": [""]
      "Does Not Contain Data": []
      "Equal To": ["","Today"]
      "Months Equals [number]": [""]
      "Not Equal To != ": [""]
      "Older than [days]": [""]
      "On or After": ["","Today"]
      "On or Before": ["","Today"]
      "Within Last [days]": [""]
      "Within Next [days]": [""]
      "Years Equals [number]": [""]
    bit: 
      "Equal To": ["True", "False"]
    
  constructor: (name,type) ->
    @viewName = ko.observable name
    @dataType = ko.observable type
  
  getViewName: ->
    @viewName
  
  toString: ->
    @viewName()

  getTypes: =>
    operator for operator of columnTypes[ @dataType() ]
    
class App

  constructor: ->
    @conditions = ko.observableArray()
    @columns = ko.observableArray(new Column n,t for n,t of defaultColumns)
    @addPlaceholder()
    ko.setTemplateEngine new mustacheTemplateEngine()

  getConditions: ->
    @conditions
  
  getColumns: ->
    @columns
  
  viewStatement: ->
    @conditions().join("")

  addPlaceholder: =>
    @conditions.push new Condition "(", "FirstName", "=" ,"'richard'" , ")"
  
$ ->
  window["Main"] = new App()
  ko.applyBindings Main