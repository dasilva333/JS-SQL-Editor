window.defaultCaption = "--Select--"  
window.COLUMN_KEY_NAMES = "defaultColumns"
window.allColumns = []
window.allGroups = []
window.ACT_DATA_URL = if (typeof private_URL != "undefined") then private_URL else "/act/ACT_Schema.cfm"  
    
defaultColumns = ["93","3","5"] ##ACT_ID, FirstName, LastName  
savedColumns = $.jStorage.get(COLUMN_KEY_NAMES, defaultColumns)

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

emptyCondition = 
  "ID": "new_row"
  "(": ""
  "Column": ""
  "Operator": ""
  "Comparison": ""
  ")": ""
  "Seperator": ""
  "Statement": "",
  "Priority": "1"

emptyGroup = 
  "GroupId": "new_row"
  "Name": ""
  "Description": ""

    
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
    @Priority = params['Priority']
     
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
      cid = 0
      for id,column of allColumns
        if column.name is @getColumnName()() 
          cid = id
      cid    
    ) 
    
  getOperator: (elem, op, value) ->
    operation = op || ""
    if(operation is 'get')
      $(elem).val()
    else
      @Operator = @operator()
      @operator  
  
  getOperators: ->
    if (@getDataType() of columnTypes) then operator for operator of columnTypes[ @getDataType() ] else [""]  

  operatorTemplate: (value, options) =>
    '<select data-bind="options: selectedCondition.getOperators(), value: selectedCondition.operator, optionsCaption: defaultCaption"></select>'
    
  getComparison: (elem, op, value) =>
    operation = op || ""
    $("#conditionsGrid").jqGrid("getGridParam","colModel").filter((o) -> 
      o.name is "Comparison"
    )[0].editrules = {
      required: false
      number: (@getDataType() is "CF_SQL_INTEGER")
      date: (@getDataType() is "CF_SQL_TIMESTAMP")
    }
    if operation is 'get'
      $(elem).filter("input").val()
    else
      @Comparison = @comparison()
      @comparison    
 
  getFormattedComparison: ->
    x = null
    if (@getDataType() is "CF_SQL_VARCHAR")
      x = @comparison().toString().singleQuoted()
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
    if @getDataType() of columnTypes && @getOperator()() of columnTypes[ @getDataType() ]
      comps = columnTypes[ @getDataType() ][ @getOperator()() ]
    else
      comps = []
      
  getPresetComparison: ->
    if @getDataType() is "CF_SQL_BIT"
      @setComparison @presetComparison()
    else if @getDataType() is "CF_SQL_TIMESTAMP" and @presetComparison() isnt ""
      @setComparison @presetComparison() ##Once I figure out the parser bug I'll set it to @Today
    @presetComparison
  
  comparisonTemplate: (value, options) -> 
    setTimeout(->
      $("input[name=Comparison]").click(->
          $(this).focus()
        ).datepicker
          constrainInput: false
          showAnim: ->
            if (Main.selectedCondition.getDataType() isnt "CF_SQL_TIMESTAMP") then 'hide' else 'show'
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
    if (@getColumnID()() of allColumns) then allColumns[ @getColumnID()() ].type else ""
      
  getOpAndComp: =>
    if (@operator() is "" or typeof @operator() is "undefined") then "" else operatorDefinitions[@getOperator()()].apply(@)

  statementTemplate: ->
    '<span data-bind="text: selectedCondition.getStatement()"></span><input type="hidden" data-bind="value: selectedCondition.getStatement()">'  
  
  getStatement: (elem, op, value) ->
    operation = op || ""
    if(operation is 'get')
      $(elem).filter("input").val()
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

window.Condition = Condition;

class Column

  constructor: (id,params,index) ->
    @id = id
    @viewName = ko.observable params.name
    @dataType = ko.observable params.type
    @index = params.name
    @name = params.name
    @hidden = index is -1
  
    if (@name is "ACT_ID")
      @formatter = 'showlink'
      @formatoptions = 
        baseLinkUrl:'ViewProfile.cfm'
        addParam: '&action=view'
        idName:'ACT_ID'
      @fixed = true
  
  getViewName: ->
    @viewName
  
  toString: ->
    @viewName() + ":" + @viewName()
    
class Group
  
  constructor: (index,params) ->
    @id = params.id
    @description = params.description
    @expanded = params.expanded
    @isLeaf = params.isLeaf
    @level = params.level
    @loaded = params.loaded
    @name = params.name
    @parent = params.parent
    
class App
  
  constructor: ->
    @loadingOverlay = $("#loadingOverlay, #container")
    
    @conditions = ko.observableArray()
    @selectedCondition = new Condition(emptyCondition)
    
    @columns = ko.observableArray((new Column id,params, $.inArray(id, savedColumns) for id,params of allColumns))
    sortByAlpha(@columns)
    
    @contactsModel = @columns()
    @contacts = ko.observableArray()
    
    @previewRecords()
    @groups = ko.observableArray(new Group id,params for id,params of allGroups)
    @selectedGroup = new Group(0,emptyGroup)
    @groupsModel = [
       { name:'id', index:'id', width:1,hidden:true,key:true }
       { name:'name',index:'name',editable:true, width:200, align:'left', cellattr: (rowId, tv, rawObject, cm, rdata) -> 'title="'+ rawObject.description + '"' }
       { name:'description',index:'description',editable:true, hidden:true, align:"left" }
    ]
    
  getConditions: ->
    @conditions

  getColumns: ->
    @columns

  getGridColumns: ->
    ":;" + @columns().join(";")

  onCellSelect: => 
    if (@selectedCondition.ID isnt "new_row")
      setTimeout( =>
        ko.applyBindings @, $("#" + @selectedCondition.ID, "#conditionsGrid").parent().get 0
      ,250)
    else
      true
  
  afterInsertRow: =>
    setTimeout( =>
        @selectedCondition = new Condition emptyCondition
        ko.applyBindings @, $("#" + @selectedCondition.ID, "#conditionsGrid").parent().get 0
    ,250)
  
  loadSubGroups: (postdata) =>
    jQuery.ajax
      url: ACT_DATA_URL + '?Action=GetViewColumnsAndGroups'
      data:postdata
      dataType:"jsonp"
      success: (data,stat) =>           
        if stat is "success"
          @groups data.groups
    

  selectGroup: (ID) =>
    @selectedGroup = ID
    $.ajax
      url: ACT_DATA_URL
      data:
        action: "GetGroupById"
        GroupID: ID
      type: 'GET'
      dataType: 'jsonp'
      jsonp: 'callback',
      success: (data) =>      
        @conditions.removeAll()
        for condition in data
          @conditions.push(new Condition(condition))
        @previewRecords()  
    
    
  selectCondition: (selectedItem) =>
    if selectedItem.ID isnt "new_row"
      @selectedCondition = selectedItem 
      ko.mapping.fromJS(selectedItem, @selectedCondition)
    true
    
  saveCondition: ->
    $.ajax
      url: ACT_DATA_URL
      data:
        action: "SaveCondition"
        groupid: @selectedGroup
        where: "[" + @conditions().join(",") + "]"
      type: 'GET'
      dataType: 'jsonp'
      jsonp: 'callback',
      success: (data) =>
        for condition,index in @conditions()
          condition.ID = data.ConditionIDs[index]
        $("#conditionsGrid").jqGrid("setGridParam", {
          data: ko.utils.unwrapObservable(@conditions).slice(0)
        }).trigger('reloadGrid', [{
          page: 1
        }])
        @previewRecords()
          
  previewRecords: ->
    if @conditions().length > 0
      @loadingOverlay.toggle()
      $.ajax
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
            @contacts.push contact
          @loadingOverlay.toggle()  
      
    
  validateSeperator: =>
    if (@getConditions()().length > 0 and @getConditions()()[@getConditions()().length - 1] isnt @selectedCondition and @selectedCondition.Seperator is "")
      [false, "You must use a seperator for your criteria, AND/OR"]
    else
      [true, ""]  
    
  validateStatement: =>
    try
      if @conditions().length > 0
        SQLParser.parse "SELECT * FROM Contacts WHERE " + ( @conditions().map (o) -> o.getStatement() ).join("")
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
  
  contactsGridHeight: ->
    height = $(window).height() - $('#gbox_conditionsGrid').height() - 105
    $("#contactsGrid").jqGrid("setGridHeight", height ) 
    height
  
  conditionsGridHeight: ->
    'auto'
  
$ ->
  $.ajax
    url: ACT_DATA_URL
    data:
      action: "GetViewColumnsAndGroups"
    type: 'GET'
    dataType: 'jsonp'
    jsonp: 'callback',
    success: (data) ->
      window['allColumns'] = data.schema
      window['allGroups'] = data.groups 
      window["Main"] = new App()
      ko.applyBindings Main
  
  