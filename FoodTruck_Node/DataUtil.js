const https = require('https');
const connectionUtil = require('./connectionUtil');

class DataUtil {
	/*
		Construct URL with current Pagination Number
	*/
	constructor(pageNumber){
		this.reqUrl = new connectionUtil(pageNumber).initConnectionURL(); 
		this.result = null;
		console.log("URL Generated ", this.reqUrl);
	}
	/* 
		Reads the request URL from ConnectionUtil, and makes GET request and sets response in result.
	*/
	fetchData = ()=>{
		https.get(this.reqUrl, (resp) => {			 
				let data = '';
				// A chunk of data has been recieved.
				resp.on('data', (chunk) => {
					data+= chunk;
				});
				// The whole response has been received. Print out the result.
				resp.on('end', () => {
					this.result= data;				
				});
			}).on("error", (err) => {
				console.log("Error: " + err.message);			  
			});
		return this.result;
	}
}

module.exports = DataUtil;
