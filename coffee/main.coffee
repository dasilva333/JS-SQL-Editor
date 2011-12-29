window.defaultCaption = "--Select--"

allColumns =
  "FirstName": "varchar"
  "EmployeeCount": "int"
  "LastUpdated": "datetime" 
  "Active": "bit"
  
##TODO this should be cookie based and default to this set  
defaultColumns = ["FirstName","Active","LastUpdated"]  
  
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
    @presetComparison = ko.observable ""
    @endParen = ko.observable params[')'] || ""
    this[')'] = params[')'] || ""
    @seperator = ko.observable params['Seperator'] || ""
    @Seperator = params['Seperator'] || ""
    @Statement = @toString()
     
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
    
  getOperator: (elem, op, value) ->
    operation = op || "";
    if(operation is 'get')
      $(elem).val();
    else
      @Operator = @operator()
      @operator  
  
  getOperators: ->
    if (@getDataType() of columnTypes)
      operator for operator of columnTypes[ @getDataType() ]
    else
      [""]  

  operatorTemplate: (value, options) =>
    '<select data-bind="options: selectedCondition.getOperators(), value: selectedCondition.operator, optionsCaption: defaultCaption"></select>'
    
  getComparison: (elem, op, value) =>
    operation = op || "";
    $("#conditionsGrid").jqGrid("getGridParam","colModel").filter((o) -> 
      o.name is "Comparison"
    )[0].editrules = {
      required: true
      number: (@getDataType() is "int")
      date: (@getDataType() is "datetime")
    }
    if(operation is 'get')
      $(elem).filter("input").val();
    else
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
    else if (@getDataType() is 'datetime' and @presetComparison() is "")
      x = @comparison().singleQuoted()
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
    if (@getDataType() is 'datetime' and @presetComparison() isnt "")
      @setComparison @presetComparison() ##Once I figure out the parser bug I'll set it to @Today
    @presetComparison
  
  comparisonTemplate: (value, options) ->
    setTimeout(->
      $("input[name=Comparison]").datepicker
          showAnim: ->
            ##Todo Figure out why I cant reference this or @ from inside here
            if (Main.selectedCondition.getDataType() isnt 'datetime')
              'hide'
            else  
              'show'
    ,50) 
    '<input class="datePicker" size="11" type="text" data-bind="value: selectedCondition.getComparison(), valueUpdate: \'keyup\', visible: selectedCondition.showCustomComparisons()"><select data-bind="value: selectedCondition.getPresetComparison(), options: selectedCondition.getComparisons(), optionsText: function(item){ return item == \'\' ? \'Custom\' : item }, disable: !selectedCondition.showPresetComparisons()"></select>'

   
  showPresetComparisons: ->
    @getComparisons().length > 0
  
  showCustomComparisons: ->
    @getComparisons().indexOf("") > -1
    
  getEndParen: ->
    this[')'] = @endParen()
    @endParen
   
  getSeperator: ->
    @Seperator = @seperator()
    @seperator()
    
  getDataType: ->
    if (@columnName() of allColumns)
      allColumns[ @columnName() ]
    else  
      ""
      
  getOpAndComp: =>
    if (@operator() is "" or typeof @operator() is "undefined")
      ""
    else  
      operatorDefinitions[@getOperator()()].apply(@)
      
  statementTemplate: ->
    '<span data-bind="text: selectedCondition.toString()"></span><input type="hidden" data-bind="value: selectedCondition.toString()">'  
  
  getStatement: (elem, op, value) ->
    operation = op || "";
    if(operation is 'get')
      $(elem).filter("input").val();
    else
      @Statement = @toString()
      @toString()    
  
  toString: =>
    @Statement = " #{ @startParen() } #{ @columnName() } #{ @getOpAndComp() } #{ @endParen() } #{ @getSeperator() } "
    @Statement
    
Condition = Condition;

class Column

  constructor: (name,type) ->
    @viewName = ko.observable name
    @dataType = ko.observable type
    @index = name
    @name = name
  
  getViewName: ->
    @viewName
  
  toString: ->
    @viewName() + ":" + @viewName() 
    
class App
  
  self = @
  constructor: ->
    @conditions = ko.observableArray(dataArr)
    @columns = ko.observableArray(new Column n,t for n,t of allColumns)
    @selectedCondition = new Condition(emptyCondition)
    @contacts = ko.observableArray()
    @contactsModel = defaultColumns.map( (name) ->
      new Column(name, allColumns[name])
    )
    @previewRecords()
      
  getConditions: ->
    @conditions
  
  getColumns: ->
    @columns
  
  getGridColumns: ->
    ":;" + @columns().join(";")
  
  onCellSelect: => 
    if (@selectedCondition.ID isnt "new_row")
      setTimeout( =>
        ko.applyBindings @, $("#" + @selectedCondition.ID).parent().get 0
      ,250)
    else
      false;  
  
  afterInsertRow: =>
    setTimeout( =>
        @selectedCondition = new Condition emptyCondition
        ko.applyBindings @, $("#" + @selectedCondition.ID).parent().get 0
    ,250)
  
  selectCondition: (selectedItem) =>
    if (selectedItem.ID isnt "new_row")
      @selectedCondition = selectedItem 
      ko.mapping.fromJS(selectedItem, @selectedCondition)
    true
    
  previewRecords: ->
    $.ajax(
      url: "getContactsByQuery.cfm"
      data:
        where: @conditions().join("")
      complete: (data) =>
        ##TODO, process data into an array. maybe add paged records
        @contacts.removeAll()
        for i in [1..10] 
          @contacts.push(
              FirstName: "Richard" + i
              LastUpdated : "02/" + i + "/2010"
              Active: if Math.random() > 0.5 then true else false
              EmployeeCount: i * Math.random() 
          )
    )
    
  validateSeperator: =>
    if (@getConditions()()[@getConditions()().length - 1] isnt @selectedCondition and @selectedCondition.Seperator is "")
      [false, "You must use a seperator for your criteria, AND/OR"]
    else
      [true, ""]  
    
  validateStatement: =>
    try
      SQLParser.parse("SELECT * FROM Contacts WHERE " + @conditions().join(""))
      [true, ""]
    catch error
      [false, "Criteria is wrong: " + error.toString().split(":")[2]]
 
  validateParens: =>
    start = Main.selectedCondition.getStartParen()()
    end = Main.selectedCondition.getEndParen()()
    blank = ""
    if ((start is blank and end isnt blank) or (start isnt blank and end is blank))
      [false, "Parenthesis aren't both set"]
    else
      [true, ""]     
        
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
    "Column": "FirstName",
    "Operator": "Equal To",
    "Comparison": "richard",
    ")": ")",
    "Seperator": "OR",
    "Statement": "",
  }),
  new Condition({
    "ID": 2
    "(": "(",
    "Column": "LastUpdated",
    "Operator": "Equal To",
    "Comparison": "01/01/2012",
    ")": ")",
    "Seperator": "OR",
    "Statement": "",
  }),
  new Condition({
    "ID": 3,
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
  