defaultColumns =
  "FirstName": "varchar"
  "EmployeeCount": "int"
  "LastUpdated": "datetime" 
  "Active": "bit"
  
columnTypes =
  int:
    "Contains Data": []
    "Does Not Contain Data": []
    "Equal To": [""]
    "Greater Than": [""]
    "Greater Than or Equal To": [""]
    "Less Than": [""]
    "Less Than or Equal To": [""]
    "Not Equal To": [""]
  varchar: 
    "Contains": [""]
    "Contains Data": []
    "Does Not Contain Data": []
    "Ends With": [""]
    "Equal To": [""]
    "Greater Than": [""]
    "Greater Than or Equal To": [""]
    "Less Than": [""]
    "Less Than or Equal To": [""]
    "Not Equal To": [""]
    "Starts With": [""]
  datetime:  
    "After Next [Days]" : [""]
    "Contains Data": []
    "Days Equal": [""]
    "Does Not Contain Data": []
    "Equal To": ["","Today"]
    "Months Equals [number]": [""]
    "Not Equal To": [""]
    "Older than [days]": [""]
    "On or After": ["","Today"]
    "On or Before": ["","Today"]
    "Within Last [days]": [""]
    "Within Next [days]": [""]
    "Years Equals [number]": [""]
  bit: 
    "Equal To": ["True", "False"]

operatorDefinitions = 
    "After Next [Days]": -> " DateAdd(d," + @getComparison()() + "," + @getColumnName()() + " ) > GetDate() "
    "Contains Data": -> " != '' OR IS NOT NULL  "
    "Days Equal": -> " DAY( " + @getColumnName()() + " ) = "
    "Does Not Contain Data": -> " = '' OR IS NULL "
    "Equal To": -> " = " + @getFormattedComparison()
    "Months Equals [number]": -> " MONTH( " + @getColumnName()() + " ) = "
    "Not Equal To": -> " != " + @getFormattedComparison() 
    "Older than [days]": -> ""
    "On or After": -> ""
    "On or Before": -> ""
    "Within Last [days]": -> ""
    "Within Next [days]": -> ""
    "Years Equals [number]": -> " YEAR( " + @getColumnName()() + " ) = YEAR( " + @getComparison()() + " )"
    "Starts With": -> " LIKE '" + @getComparison()() + "%' "
    "Contains": -> " LIKE '%" + @getComparison()() + "%' "
    "Ends With": -> " LIKE '%" + @getComparison()() + "' "
    "Greater Than": -> " > " + @getComparison()()
    "Less Than": -> " < " + @getComparison()()
    "Greater Than or Equal To": -> " => " + @getComparison()()
    "Less Than or Equal To": -> " =< " + @getComparison()()
    
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
  
  getOperators: ->
    operator for operator of columnTypes[ @getDataType() ]

  getComparison: ->
    @comparison
 
  getFormattedComparison: ->
    if (@getDataType() is 'varchar')
      @comparison().singleQuoted()
    else if (@getDataType() is 'bit')
      @comparison() is "True" ? 1 : 0;  
    else
      @comparison()
      
  getComparisons: ->
    columnTypes[ @getDataType() ][ @getOperator()() ]

  showPresetComparisons: ->
    true
    ##console.log @getComparisons().indexOf("")
    @getComparisons().length > 0
  
  showCustomComparisons: ->
    @getComparisons().indexOf("") > -1
    
  getEndParen: ->
    @endParen
   
  getSeperator: ->
    if (Main.getConditions()()[Main.getConditions()().length - 1] isnt @ and @seperator() is "")
      @seperator "AND"
    @seperator()
    
  getDataType: ->
    defaultColumns[ @columnName() ]
      
  getOpAndComp: ->
    operatorDefinitions[@operator()].apply(@)
    
  toString: () ->
    " #{ @startParen() } #{ @columnName() } #{ @getOpAndComp() } #{ @endParen() } #{ @getSeperator() } "

class Column

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
    @conditions.push new Condition "(", "FirstName", "Equal To" ,"richard" , ")"
  
$ ->
  window["Main"] = new App()
  ko.applyBindings Main