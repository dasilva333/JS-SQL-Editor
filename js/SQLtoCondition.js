
//DEFINE static variables 
arrSeperators = ["AND","OR"]
opEquivalents = {
    "=": "Equal To"
}
arrStartParens = ["(","((","((("]
arrEndParens = [")","))",")))"]
function processCondition(condition, seperator){
    if ( condition.operation && arrSeperators.indexOf(condition.operation) > -1 ){
        arrConditions.push( processCondition(condition.left, condition.operation) )
        arrConditions.push( processCondition(condition.right) )
    }
    else {
        return new Condition({
		  "(": arrStartParens[ condition.toString().split('(').length-2 ],
		  "Column": condition.left.toString().replace(/`/g,""),
		  "Operator": opEquivalents[condition.operation],
		  "Comparison": condition.right.toString(),
		  ")": arrStartParens[ condition.toString().split(')').length-2 ],
		  "Seperator": "" || seperator
        })
    }  
}
function reduceStatement(query){
	return "SELECT * FROM tablename WHERE " + query.replace(/.*WHERE\ (.*)UNION\ SELECT\ CONTACTID.*/g,"$1").replace(/N'/g,"'").replace(/@NOW/g,"'Today'")
}

arrConditions = []
query = reduceStatement( "SELECT DISTINCT TBL_CONTACT.CONTACTID FROM dbo.TBL_CONTACT  LEFT OUTER JOIN dbo.CUST_ContactTable1_071707 ON TBL_CONTACT.CONTACTID = CUST_ContactTable1_071707.CONTACTID LEFT OUTER JOIN dbo.CUST_ContactTable2_074445 ON TBL_CONTACT.CONTACTID = CUST_ContactTable2_074445.CONTACTID WHERE ((TBL_CONTACT.CUST_Vendor_013957110 = N'MCR' AND TBL_CONTACT.CATEGORY LIKE N'%Completed Sale%' AND TBL_CONTACT.CUST_ActivePt_070325020 = N'Yes' AND TBL_CONTACT.CUST_EOB_CLAIM_PAID_084651871 = 1 AND TBL_CONTACT.CUST_V_GPCode2_054924635 < DATEADD(DAY, -76, @NOW) AND CUST_ContactTable1_071707.CUST_R90SHIPdate_115212742 IS NULL AND (CUST_ContactTable2_074445.CUST_CCCLASTCALL_094837704 < DATEADD(DAY, -2, @NOW) OR CUST_ContactTable2_074445.CUST_CCCLASTCALL_094837704 IS NULL)) OR (TBL_CONTACT.CUST_Vendor_013957110 = N'MCR' AND TBL_CONTACT.CATEGORY = N'Completed Sale' AND TBL_CONTACT.CUST_EOB_CLAIM_PAID_084651871 = 1 AND TBL_CONTACT.CUST_MCRIncDof_074556369 = 1 AND CUST_ContactTable1_071707.CUST_R90Ck_115128336 = 0 AND CUST_ContactTable1_071707.CUST_R90SHIPdate_115212742 < DATEADD(DAY, -76, @NOW) AND TBL_CONTACT.CUST_ActivePt_070325020 = N'Yes' AND (CUST_ContactTable2_074445.CUST_CCCLASTCALL_094837704 < DATEADD(DAY, -2, @NOW) OR CUST_ContactTable2_074445.CUST_CCCLASTCALL_094837704 IS NULL)) AND CUST_ContactTable2_074445.CUST_Cancelled_Date_072812897 IS NULL) UNION SELECT CONTACTID FROM dbo.TBL_GROUP_CONTACT WHERE GROUPID = '5fc44bf1-5464-45a9-b7fe-167f9b79357d' UNION  SELECT DISTINCT TBL_CONTACT_OPPORTUNITY.CONTACTID FROM dbo.TBL_GROUP_OPPORTUNITY            INNER JOIN dbo.TBL_OPPORTUNITY ON TBL_GROUP_OPPORTUNITY.OPPORTUNITYID = TBL_OPPORTUNITY.OPPORTUNITYID                      AND EXISTS (SELECT OUAE.OPPORTUNITYID FROM dbo.VWX_OPPORTUNITY_USER_ENUM OUAE WHERE OUAE.USERID=@USERID AND TBL_OPPORTUNITY.OPPORTUNITYID=OUAE.OPPORTUNITYID)            INNER JOIN dbo.TBL_CONTACT_OPPORTUNITY ON TBL_CONTACT_OPPORTUNITY.OPPORTUNITYID = TBL_OPPORTUNITY.OPPORTUNITYID               WHERE TBL_GROUP_OPPORTUNITY.GROUPID = '5fc44bf1-5464-45a9-b7fe-167f9b79357d' AND TBL_GROUP_OPPORTUNITY.ISMEMBER = 1" )
console.log( query )

conditions = SQLParser.parse(query).where.conditions;
processCondition(conditions)

console.dir( arrConditions )