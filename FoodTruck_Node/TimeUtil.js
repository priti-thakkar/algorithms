class TimeUtil{
	daysOfWeek = ['Sunday', 'Monday', 'Tuesday','Wednesday', 'Thursday','Friday', 'Saturday'];
	/*
		Initialize with current day of the week, current hour, current time
	*/
	constructor(){
		this.date = new Date();
		this.dow = this.date.getUTCDay();		
		this.today=this.daysOfWeek[this.dow];
		this.curHr = this.date.getHours();
		this.curTm = this.date.getUTCMinutes();
		console.log('Hours & minutes : ', this.curHr, this.curTm);
	}
	// Returns current Time in HH:MM  24hr format
	getCurTime24 = () =>{
		return this.curHr+":"+this.curTm;
	}
	// Returns today's day of the week
	getCurDay = ()=>{
		return this.today;
	}
	
}

module.exports = TimeUtil;