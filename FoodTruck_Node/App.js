const https = require('https');
const http = require('http');
const urlModule = require('url');
const fs = require('fs');
const DataUtil = require('./DataUtil');

const server = http.createServer(function(req, res) {
	/*
		Set Content-Type header
	*/
	res.writeHead(200, {"Content-Type": "text/html"});
	
	/*
		Read the URL for path
	*/
	let url = urlModule.parse(req.url,true).pathname;
	
    if(url ==='/') { 
        fs.readFile('./index.html', null, function (error, data) {
        if (error) {
            res.writeHead(404);
            res.write('Whoops! File not found!');
        } else {
            res.write(data);
        }
        res.end();
    });
    } 
    else if(url ==='/foodTrucks' ) { 
		
		const queryParam = urlModule.parse(req.url,true).query;
		
		let pageNumber=0;
		if(queryParam.page)
			pageNumber = queryParam.page;
		
		let du = new DataUtil(pageNumber);
		
		https.get(du.reqUrl, (resp) => {			 
			let data = '';
			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data+= chunk;
			});

			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				res.write(data);  
				res.end();  				
			});

		}).on("error", (err) => {
			console.log("Error: " + err.message);
			res.write(err.message);  
			res.end();  			  
		});
       
    } 
    else { 
        res.write('OOPS - The page you are looking for is not found!!');  
        res.end();  
    }
});
server.listen(8080);