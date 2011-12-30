window.defaultCaption = "--Select--"  
window.COLUMN_KEY_NAMES = "defaultColumns"
window.allColumns = []
ACT_DATA_URL = if (typeof private_URL != "undefined") then private_URL else "/act/ACT_Schema.cfm"  
    
defaultColumns = ["93","3","5"] ##ACT_ID, FirstName, LastName  
savedColumns = $.jStorage.get(COLUMN_KEY_NAMES, defaultColumns);

window.sortByAlpha = (toSort) ->
  reA = /[^a-zA-Z]/g
  reN = /[^0-9]/g
  toSort.sort (aa, bb) ->
    a = aa.name
    b = bb.name
    aA = a.replace(reA, "")
    bA = b.replace(reA, "")
    if(aA is bA)
      aN = parseInt(a.replace(reN, ""), 10)
      bN = parseInt(b.replace(reN, ""), 10)
      if (aN is bN) then 0 else if (aN > bN) then 1 else -1
    else
      if (aA > bA) then 1 else -1
  
columnTypes =
  CF_SQL_INTEGER:
    "Contains Data": []
    "Does Not Contain Data": []
    "Equal To": [""]
    "Greater Than": [""]
    "Greater Than or Equal To": [""]
    "Less Than": [""]
    "Less Than or Equal To": [""]
    "Not Equal To": [""]
  CF_SQL_VARCHAR: 
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
  CF_SQL_TIMESTAMP:  
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
  CF_SQL_BIT: 
    "Equal To": ["True", "False"]

operatorDefinitions = 
    "Contains Data": -> " != '' OR " + @getColumnName()() + " IS NOT NULL  "
    "Days Equal": -> " DAY( " + @getColumnName()() + " ) = "
    "Does Not Contain Data": -> " = ''  OR " + @getColumnName()() + " IS NULL "
    "Equal To": -> " = " + @getFormattedComparison()
    "Not Equal To": -> " != " + @getFormattedComparison()
    "*After Next [Days]": -> " DateAdd(d," + @getComparison()() + "," + @getColumnName()() + " ) > GetDate"
    "*Months Equals [number]": -> " MONTH( " + @getColumnName()() + " ) = "
    "*Older than [days]": -> ""
    "*On or After": -> ""
    "*On or Before": -> ""
    "*Within Last [days]": -> ""
    "*Within Next [days]": -> ""
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
    @Statement = @getStatement()
     
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
  
  getColumnID: =>
    ko.computed(=>
      cid = 0;
      for id,column of allColumns
        if column.name is @getColumnName()() 
          cid = id
      cid    
    ) 
    
  getOperator: (elem, op, value) ->
    operation = op || "";
    if(operation is 'get')
      $(elem).val();
    else
      @Operator = @operator()
      @operator  
  
  getOperators: ->
    if (@getDataType() of columnTypes) then operator for operator of columnTypes[ @getDataType() ] else [""]  

  operatorTemplate: (value, options) =>
    '<select data-bind="options: selectedCondition.getOperators(), value: selectedCondition.operator, optionsCaption: defaultCaption"></select>'
    
  getComparison: (elem, op, value) =>
    operation = op || "";
    $("#conditionsGrid").jqGrid("getGridParam","colModel").filter((o) -> 
      o.name is "Comparison"
    )[0].editrules = {
      required: false
      number: (@getDataType() is "CF_SQL_INTEGER")
      date: (@getDataType() is "CF_SQL_TIMESTAMP")
    }
    if(operation is 'get')
      $(elem).filter("input").val();
    else
      @Comparison = @comparison()
      @comparison    
 
  getFormattedComparison: ->
    x = null
    if (@getDataType() is "CF_SQL_VARCHAR")
      x = @comparison().singleQuoted()
    else if (@getDataType() is "CF_SQL_BIT")
      if @comparison() is "True"
        x = 1
      else  
        x = 0;  
    else if (@getDataType() is "CF_SQL_TIMESTAMP" and @presetComparison() is "")
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
    if (@getDataType() is "CF_SQL_BIT")
      @setComparison @presetComparison()
    if (@getDataType() is "CF_SQL_TIMESTAMP" and @presetComparison() isnt "")
      @setComparison @presetComparison() ##Once I figure out the parser bug I'll set it to @Today
    @presetComparison
  
  comparisonTemplate: (value, options) ->
    ## TODO disable numeric validation if its disabled
    ##setTimeout(->
    ##  $("input[name=Comparison]").datepicker
    ##      showAnim: ->
    ##        ##Todo Figure out why I cant reference this or @ from inside here
    ##        if (Main.selectedCondition.getDataType() isnt "CF_SQL_TIMESTAMP") then 'hide' else 'show'
    ##,50) 
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
    if (@getColumnID()() of allColumns) then allColumns[ @getColumnID()() ].type else ""
      
  getOpAndComp: =>
    if (@operator() is "" or typeof @operator() is "undefined") then "" else operatorDefinitions[@getOperator()()].apply(@)

  statementTemplate: ->
    '<span data-bind="text: selectedCondition.getStatement()"></span><input type="hidden" data-bind="value: selectedCondition.toString()">'  
  
  getStatement: (elem, op, value) ->
    operation = op || "";
    if(operation is 'get')
      $(elem).filter("input").val();
    else
      @Statement = " #{ @startParen() } #{ @columnName() } #{ @getOpAndComp() } #{ @endParen() } #{ @getSeperator() } "
  
  toString: =>
    JSON.stringify
      ID: @ID
      '(': @['(']
      Column: @Column 
      Operator: @Operator
      Comparison: @Comparison
      ')': @[')']
      Seperator: @Seperator
      type: @getDataType()
        
Condition = Condition;

class Column

  constructor: (id,params,index) ->
    @id = id
    @viewName = ko.observable params.name
    @dataType = ko.observable params.type
    @index = params.name
    @name = params.name
    @hidden = index is -1
  
  getViewName: ->
    @viewName
  
  toString: ->
    @viewName() + ":" + @viewName() 
    
class App
  
  self = @
  constructor: ->
    @conditions = ko.observableArray(dataArr)
    @columns = ko.observableArray((new Column id,params,savedColumns.indexOf(id) for id,params of allColumns))
    sortByAlpha(@columns)
    @selectedCondition = new Condition(emptyCondition)
    @contactsModel = @columns()
    @contacts = ko.observableArray()
    @previewRecords()
    
      
  getConditions: ->
    @conditions
  
  getColumns: ->
    @columns
  
  getGridColumns: ->
    ##TODO figure out how to implement sorting from here: http://my.opera.com/GreyWyvern/blog/show.dml/1671288
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
      url: ACT_DATA_URL
      data:
        action: "GetContactsByQuery"
        where: "[" + @conditions().join(",") + "]"
      type: 'GET'
      dataType: 'jsonp'
      jsonp: 'callback',
      success: (data) =>
        @contacts.removeAll()
        for contact in data
          @contacts.push(contact)
    )
    
  validateSeperator: =>
    if (@getConditions()()[@getConditions()().length - 1] isnt @selectedCondition and @selectedCondition.Seperator is "")
      [false, "You must use a seperator for your criteria, AND/OR"]
    else
      [true, ""]  
    
  validateStatement: =>
    [true, ""]
    ##TODO fix this thing 
    ##try
    ##  statement = "SELECT * FROM Contacts WHERE " + ( @conditions().map( (o) -> o.getStatement() ).join("")
    ##  console.log statement
    ##  SQLParser.parse statement
    ##catch error
    ##  [false, "Criteria is wrong: " + error.toString().split(":")[2]]
 
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
    "Operator": "Contains Data",
    "Comparison": "",
    ")": ")",
    "Seperator": "", 
    "Statement": "",
  })
]

$ ->
  $.ajax(
    url: ACT_DATA_URL
    data:
      action: "GetViewColumns"
    type: 'GET'
    dataType: 'jsonp'
    jsonp: 'callback',
    success: (data) ->
      window['allColumns'] = data
      window["Main"] = new App()
      ko.applyBindings Main
  )
  