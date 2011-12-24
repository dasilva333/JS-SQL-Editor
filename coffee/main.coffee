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
  
  constructor: (params) ->
    @ID = params['ID'] || 0
    @startParen = ko.observable params['('] || ""
    this['('] = params['(']
    @columnName = ko.observable params['Column'] || ""
    @Column = params['Column'] 
    @operator = ko.observable params['Operator'] || ""
    @Operator = params['Operator'] 
    @comparison = ko.observable params['Comparison'] || ""
    @Comparison = params['Comparison'] 
    @endParen = ko.observable params[')'] || ""
    this[')'] = params[')'] 
    @seperator = ko.observable params['Seperator'] || ""
    @Seperator = params['Seperator']
    @Statement = @toString()
     
  setStartParen: (parens) ->
    @startParen parens
    
  setColumnName: (name) ->
    @columnName name
    @Column = name
    
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

  operatorTemplate: (value, options) ->
    elemID = options.id;
    setTimeout( ->
      ko.applyBindings(Main, $("#" + elemID).get(0))
    ,250)
    '<select data-bind="value: selectedCondition.selectedOperator, options: selectedCondition.getOperators()"></select>';
    ##'<select data-bind="value: selectedCondition.selectedOperator, options: selectedCondition.getOperators"></select>';
    
  getElemValue: (e) ->
    $(e).val()

  getComparison: ->
    @comparison
 
  getFormattedComparison: ->
    x = null
    if (@getDataType() is 'varchar')
      x = @comparison().singleQuoted()
    else if (@getDataType() is 'bit')
      if @comparison() is "True"
        x = 1
      else  
        x = 0;  
    else
      x = @comparison()
    return x
  getComparisons: ->
    columnTypes[ @getDataType() ][ @getOperator()() ]

  showPresetComparisons: ->
    @getComparisons().length > 0
  
  showCustomComparisons: ->
    @getComparisons().indexOf("") > -1
    
  getEndParen: ->
    @endParen
   
  getSeperator: ->
    ##TODO figure out a way to read the array its in and make these type of logic decisions
    ##if (Main.getConditions()()[Main.getConditions()().length - 1] isnt @ and @seperator() is "")
    ##  @seperator "AND"
    @seperator()
    
  getDataType: ->
    defaultColumns[ @columnName() ]
      
  getOpAndComp: =>
    @operator() is "" ? "" : operatorDefinitions[@operator()].apply(@)
    
  toString: () ->
    " #{ @startParen() } #{ @columnName() } #{ @getOpAndComp() } #{ @endParen() } #{ @getSeperator() } "

class Column

  constructor: (name,type) ->
    @viewName = ko.observable name
    @dataType = ko.observable type
  
  getViewName: ->
    @viewName
  
  toString: ->
    @viewName() + ":" + @viewName()

  getTypes: =>
    operator for operator of columnTypes[ @dataType() ]
    
class App
  
  self = @
  constructor: ->
    @conditions = ko.observableArray(dataArr)
    @columns = ko.observableArray(new Column n,t for n,t of defaultColumns)
    @selectedCondition = new Condition(emptyCondition)
    
  getConditions: ->
    @conditions
  
  getColumns: ->
    @columns
  
  getGridColumns: ->
    @columns().join(";")
    
  viewStatement: ->
    @conditions().join("")
  
  selectCondition: (selectedItem) =>
    console.log(" blah ")
    ###
    if selectedItem.ID is "new_row"
      item = emptyCondition
    else
      item = selectedItem;  
    item = $.extend( new Condition(item), item )  
    console.log(item)  
    ko.mapping.fromJS(item , @selectedCondition)
    ###
    @selectedCondition = new Condition(selectedItem)
    
  ########
  ##add: ->
  ##    if (!@selectedCondition.ID())
  ##      newId = @conditions().length + 1;
  ##      @selectedCondition.ID(newId);
  ##      @conditions.push(ko.mapping.toJS(@selectedCondition));    
  ##    ko.mapping.fromJS(emptyCondition, @selectedCondition);  
  #######
emptyCondition = {
  "ID": "new_row",
  "(": "",
  "Column": "",
  "Operator": "",
  "Value": "",
  ")": "",
  "Seperator": "",
  "Statement": ""
}

dataArr = [
  new Condition({
    "ID": 1,
    "(": "(",
    "Column": "FirstName",
    "Operator": "Equal To",
    "Value": "richard",
    ")": ")",
    "Seperator": "OR",
    "Statement": "",
  }),
  new Condition({
    "ID": 2,
    "(": "(",
    "Column": "Active",
    "Operator": "Equal To",
    "Value": "1",
    ")": ")",
    "Seperator": "",
    "Statement": "",
  })
]    
$ ->
  window["Main"] = new App()
  ko.applyBindings Main
  