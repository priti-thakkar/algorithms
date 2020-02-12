/*

https://data.sfgov.org/resource/jjew-r69b.json?$$app_token=IM7f90KFy8bZfaJatVpM9gw80&$where=start24<='21:7' and end24>'21:7' and dayofweekstr='Sunday'&$select=location,applicant,starttime,endtime&$order=applicant&$limit=10&$offset=0

https://data.sfgov.org/resource/jjew-r69b.json?$where=start24<"15:00" and dayofweekstr="Tuesday"  and end24>"15:00"&$select=location,applicant&$order=applicant&$limit=10&$offset=70

*/
const TimeUtil = require('./TimeUtil');

class ConnectionUtil {
	constructor(pageNumber, pageLimit=10){
		this.host = 'https://data.sfgov.org';  // TODO: Host property store in a config file
		this.endpoint  = '/resource/jjew-r69b.json'; // TODO: store in config file
		this.appToken = 'IM7f90KFy8bZfaJatVpM9gw80'; // TODO: store in config file
		this.columnNames = 'location,applicant,starttime,endtime'; //TODO:  can be used from argument of constructor
		this.pageLimit = pageLimit; 
		this.pageOffset = pageNumber*this.pageLimit;
		this.orderBy = 'applicant'; // TODO: can be used from argument of constructor
		this.t = new TimeUtil();
	}
	/* Build a SoQL query to fetch data */
	/*
		Example: Fetch Name & Location of Open FoodTrucks on Tuesday at 3pm
			https://data.sfgov.org/resource/jjew-r69b.json?
			$select=location,applicant&
			$where=start24<"15:00" and end24>"15:00" and dayofweekstr="Tuesday"&
			$order=applicant&
			$limit=10&
			$offset=70
		
	*/
	initConnectionURL = ()=>{
		return this.host+this.endpoint+
			"?$$app_token="+this.appToken+
			"&$where=start24<='"+this.t.getCurTime24()+"' and end24>'"+this.t.getCurTime24()+
			"' and dayofweekstr='"+this.t.getCurDay()+
			"'&$select="+this.columnNames+
			"&$order="+this.orderBy+
			"&$limit="+this.pageLimit+
			"&$offset="+this.pageOffset;		
	}
	
	/*Calculate offset and fetch data*/
	getNextPage = ()=>{
		this.pageOffSet+=this.pageLimit;
		return this.initConnectionAndGetData();
	}
}
module.exports = ConnectionUtil;