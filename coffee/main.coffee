window.defaultCaption = "--Select--"

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
    "After Next [Days]": -> " DateAdd(d," + @getComparison()() + "," + @getColumnName()() + " ) > GetDate"
    "Contains Data": -> " != '' OR " + @getColumnName()() + " IS NOT NULL  "
    "Days Equal": -> " DAY( " + @getColumnName()() + " ) = "
    "Does Not Contain Data": -> " = ''  OR " + @getColumnName()() + " IS NULL "
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
    this['('] = params['('] || ""
    @columnName = ko.observable params['Column'] || ""
    @Column = params['Column'] || ""
    @operator = ko.observable params['Operator'] || ""
    @Operator = params['Operator'] || ""
    @comparison = ko.observable params['Comparison'] || ""
    @Comparison = params['Comparison'] || ""
    @presetComparison = ko.observable @comparison()
    @endParen = ko.observable params[')'] || ""
    this[')'] = params[')'] || ""
    @seperator = ko.observable params['Seperator'] || ""
    @Seperator = params['Seperator'] || ""
    @Statement = @toString()
    console.log params
     
  setStartParen: (parens) ->
    @startParen parens
    this['('] = parens
    
  setColumnName: (name) ->
    @columnName name
    @Column = name
    
  setOperator: (symbol) ->
    @operator symbol
    @Operator = symbol
  
  setOperatorByEvent: (event) =>
    @getOperator()($(event.target).val())
  
  setComparison: (value) ->
    @comparison value
    @Comparison = value
    
  setEndParen: (parens) ->
    @endParen parens
    this[')'] = parens
  
  setSeperator: (bool) ->
    @seperator bool
    @Seperator = bool
    
  getStartParen: ->
    this['('] = @startParen()
    @startParen
     
  getColumnName: ->
    @columnName
    
  getOperator: ->
    @Operator = @operator()
    @operator
  
  getOperators: ->
    if (@getDataType() of columnTypes)
      operator for operator of columnTypes[ @getDataType() ]
    else
      [""]  

  operatorTemplate: (value, options) =>
    '<select data-bind="options: selectedCondition.getOperators(), value: selectedCondition.operator, optionsCaption: defaultCaption"></select>'
    
  getComparison: ->
    @Comparison = @comparison()
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
    if (@getDataType() of columnTypes && @getOperator()() of columnTypes[ @getDataType() ] )
      comps = columnTypes[ @getDataType() ][ @getOperator()() ]
    else
      comps = []
      
  getPresetComparison: ->
    if (@getDataType() is 'bit')
      @setComparison @presetComparison()
    if (@getDataType() is 'datetime' and @presetComparison() is "Today")
      @setComparison "GetDate"
    @presetComparison
  
  comparisonTemplate: (value, options) ->
    '<select data-bind="value: selectedCondition.getPresetComparison(), options: selectedCondition.getComparisons(), optionsText: function(item){ return item == \'\' ? \'Custom\' : item }, disable: !selectedCondition.showPresetComparisons()"></select><input type="text" data-bind="value: selectedCondition.getComparison(), valueUpdate: \'keyup\', visible: selectedCondition.showCustomComparisons()">'
    
  showPresetComparisons: ->
    @getComparisons().length > 0
  
  showCustomComparisons: ->
    @getComparisons().indexOf("") > -1
    
  getEndParen: ->
    this[')'] = @endParen()
    @endParen
   
  getSeperator: ->
    ##TODO figure out a way to read the array its in and make these type of logic decisions
    ##if (Main.getConditions()()[Main.getConditions()().length - 1] isnt @ and @seperator() is "")
    ##  @seperator "AND"`
    @Seperator = @seperator()
    @seperator()
    
  getDataType: ->
    if (@columnName() of defaultColumns)
      defaultColumns[ @columnName() ]
    else  
      ""
      
  getOpAndComp: =>
    if (@operator() is "" or typeof @operator() is "undefined")
      ""
    else  
      operatorDefinitions[@getOperator()()].apply(@)
      
  stringTemplate: (value, options) ->
    '<span data-bind="text: selectedCondition.toString()"></span>'  
    
  toString: =>
    @Statement = " #{ @startParen() } #{ @columnName() } #{ @getOpAndComp() } #{ @endParen() } #{ @getSeperator() } "

Condition = Condition;

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
    ":;" + @columns().join(";")
      
  viewStatement: =>
    ko.computed =>
      statement = "SELECT * FROM Contacts WHERE " + @conditions().join("")
      try
        SQLParser.parse(statement).where.conditions
      catch error
        statement = '<span class="ui-state-error">' + error + '</span>'
      statement  
  
  onCellSelect: =>
    console.log("onCellSelect")
    console.log @selectedCondition.ID 
    if (@selectedCondition.ID isnt "new_row")
      setTimeout( =>
        ko.applyBindings @, $("#" + @selectedCondition.ID).parent().get 0
      ,250)
    else
      console.log 'do ur thing dude'  
  
  afterInsertRow: =>
    setTimeout( =>
        @selectedCondition = new Condition emptyCondition
        ##@selectedCondition.ID = @conditions().length + 1; 
        ##@conditions.push(@selectedCondition)
        ko.applyBindings(Main, $("#" + @selectedCondition.ID).parent().get(0))
    ,250) 

  gridComplete: ->
    setTimeout( ->
      ko.applyBindings Main, $("#navPager_right").parent().get 0
    ,250)    
    $("#navPager_right").html '<span data-bind="html: viewStatement()"></span>'
  
  selectCondition: (selectedItem) =>
    @selectedCondition = selectedItem 
    ko.mapping.fromJS(selectedItem, @selectedCondition)
    
  add: ->
      console.log("i am being used?")
      if (!@selectedCondition.ID())
        newId = @conditions().length + 1;
        @selectedCondition.ID(newId);
        @conditions.push(ko.mapping.toJS(@selectedCondition));    
      ko.mapping.fromJS(emptyCondition, @selectedCondition);  
  
emptyCondition = {
  "ID": "new_row",
  "(": "",
  "Column": "",
  "Operator": "",
  "Comparison": "",
  ")": "",
  "Seperator": "",
  "Statement": ""
}

dataArr = [
  new Condition({
    "ID": 1,
    "(": "(",
    "Column": "LastUpdated",
    "Operator": "Equal To",
    "Comparison": "richard",
    ")": ")",
    "Seperator": "OR",
    "Statement": "",
  }),
  new Condition({
    "ID": 2,
    "(": "(",
    "Column": "Active",
    "Operator": "Equal To",
    "Comparison": "1",
    ")": ")",
    "Seperator": "",
    "Statement": "",
  })
]    
$ ->
  window["Main"] = new App()
  ko.applyBindings Main
  