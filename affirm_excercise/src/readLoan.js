import React, {Component} from 'react';
import axios from 'axios';
import loanFile from './large/loans.csv';
import facilities from './large/facilities.csv';
import covenants from './large/covenants.csv';
import assFile from './small/assignments.csv';
import yieldFile from './small/yields.csv';

class ReadLoan extends Component{
	constructor(props){
		super(props);
		this.state = {
			Loan : [],
			resultFacilities :{},
			resultCovenants : {},
			assignments : "loan_id,facility_id\n",
			yields : "facility_id,expected_yield\n"
		}		
	}
	componentDidMount(){
		axios.get(facilities).then(response=>{
			let fac = response.data;
			this.setFacility(fac);
		}).catch(err => console.log('Error occurred while reading facilities file', err));

		axios.get(covenants).then(response=>{
			let cov = response.data;
			this.setCovenants(cov);
		}).catch(err => console.log('Error occurred while reading covenants file', err));

		axios.get(loanFile).then(response=>{
			this.setState({Loan:response.data.trim().split("\n")});
			this.validateLoan(response.data.trim().split("\n"));	
		}).catch((err)=>{console.log('Error occurred when reading Loan file ', err);});
		
		
	}
	render(){
		return (<div></div>);
	}
	
	validateLoan = (data) => {
		let assignments = [];
		
		for(let i=1;i<data.length;i++){
			let LoanObj= this.getLoan(data,i);
			let bannedFacility = [];
			let updatedFacilities = this.state.resultFacilities;
			/*pull all conventants with state != banned_state 
			& default_likelyhood <= max_Default_likelyhood
			& loan_amount <= facility_amount
			& loan_interest_rate >= facility_interest_rate*/
			//let conventants = this.state.resultCovenants;			
			let conventants = Object.entries(this.state.resultCovenants);
			let resAssignments=null;
			
			for(let j=0;j<conventants.length;j++){
				
				let key=conventants[j][0];
				let val =conventants[j][1];
				for(let k=0;k<val.length && bannedFacility.length<=0;k++){
					
						// get facilities without state ban
						/*
						&& parseFloat(this.state.resultFacilities[val[k].facility_id].amount) >= parseFloat(LoanObj.amount)
							&& parseFloat(LoanObj.interest_rate) >= parseFloat(this.state.resultFacilities[val[k].facility_id].interest_rate)
						*/	
						if(((
							parseFloat(LoanObj.default_likelihood) <= parseFloat(val[k]['max_default_likelihood']) && val[k]['max_default_likelihood']!=="" 
							) || val[k]['max_default_likelihood']==="" ) 
							&& (LoanObj['state']!==val[k]['banned_state'])
							&& parseFloat(updatedFacilities[val[k].facility_id].amount) >= parseFloat(LoanObj.amount)
							&& (bannedFacility.length <= 0)						
						)
						{
							if(resAssignments === null )
							{	
								resAssignments = updatedFacilities[val[k]['facility_id']];
								updatedFacilities[val[k].facility_id].amount=parseFloat(updatedFacilities[val[k].facility_id].amount)-parseFloat(LoanObj.amount);
							}
							else {
								if(parseFloat(resAssignments.interest_rate) > parseFloat(updatedFacilities[val[k]['facility_id']].interest_rate))
								{
									updatedFacilities[resAssignments.id].amount = parseFloat(updatedFacilities[resAssignments.id].amount)+ parseFloat(LoanObj.amount);
									updatedFacilities[val[k].facility_id].amount = parseFloat(updatedFacilities[val[k].facility_id].amount)-parseFloat(LoanObj.amount);
									resAssignments=updatedFacilities[val[k]['facility_id']];
								}
							}						
						}
						else{
							bannedFacility.push(val[k].facility_id);
						}
					
				}
				if(bannedFacility.length>0){
					if(resAssignments && bannedFacility.indexOf(resAssignments.id)>=0)
					{
						updatedFacilities[resAssignments.id].amount=parseFloat(updatedFacilities[resAssignments.id].amount)+parseFloat(LoanObj.amount);
						resAssignments=null;
						break;
					}
				}				
				bannedFacility=[];
			}
			
			
			if(resAssignments){
				assignments.push([LoanObj.id,resAssignments.id]);				
			}
			this.setState({resultFacilities:updatedFacilities});
		}
		let txtAssignments = this.state.assignments;
		txtAssignments+=""+assignments.join("\n").toString();
		this.writeToFile(txtAssignments,assFile);
		this.calculateYields(assignments);
	}
	calculateYields(assignments){
		let yields={};
		assignments=assignments.sort((entry1,entry2)=>{
			return entry1[1]-entry2[1];
		});
		
		for(let i=0;i<assignments.length;i++){
			let facilityId=assignments[i][1];
			let loanId=assignments[i][0];
			let LoanObj = this.getLoanById(loanId);
			let facilityObj = this.getFacilityById(facilityId);
			let expected_yield = (1 - LoanObj.default_likelihood) * LoanObj.interest_rate * LoanObj.amount
							- LoanObj.default_likelihood * LoanObj.amount
							- facilityObj.interest_rate * LoanObj.amount
			if(yields[facilityId])
				yields[facilityId] = Math.ceil(parseFloat(yields[facilityId])+parseFloat(expected_yield));
			else
				yields[facilityId] = Math.ceil(parseFloat(expected_yield));
		}
		let textYields = this.state.yields;
		Object.entries(yields).forEach((entry)=>{
			textYields+= entry[0]+","+entry[1]+"\n";
		});
		this.writeToFile(textYields,yieldFile);
	}
	writeToFile=(data,fileName)=>{
		console.log('Write to file : ', fileName, data);
	}
	getLoanById = (loanId)=>{
			let rows=this.state.Loan;
			let headerRow=rows[0].trim();
			let headerCols = headerRow.split(",");
			let resultRow=[];
			let loanEntry = {};
			for(let i=1;i<rows.length;i++){
				resultRow = rows[i].split(",");			
				for(let col=0;col<headerCols.length;col++){
					if(resultRow.length>0)
						loanEntry[headerCols[col]] = resultRow[col];
				}
				if(loanEntry.id === loanId){
					return loanEntry;
				}
			}
			return loanEntry;		
	}
	getFacilityById = (facilityId) =>{
		return this.state.resultFacilities[facilityId];
	}
	
	getLoan =  (Loan,rowCnt) => {
			let rows=Array.from(Loan);
			let headerRow=rows[0].trim();
			let headerCols = headerRow.split(",");
			let resultRow=[];
			if(rows[rowCnt]){
			 resultRow = rows[rowCnt].split(",");
			}
			let loanEntry = {};
			for(let col=0;col<headerCols.length;col++){
				if(resultRow.length>0)
					loanEntry[headerCols[col]] = resultRow[col];
			}
			return loanEntry;
		
	}


	setFacility = (facilityData)=>{
		if(typeof facilityData === 'string'){
			let rows=facilityData.split("\n");
			let headerRow=rows[0].trim();
			let headerCols = headerRow.split(",");
			let resultFacilities = {}; 
			for(let i=1;i<rows.length;i++){
				let resultRow = rows[i].split(",");
				let facility = {};
				for(let col=0;col<headerCols.length;col++){
					facility[headerCols[col]] = resultRow[col];
				}
				resultFacilities[facility['id']]=facility;		
			}
			this.setState({resultFacilities:resultFacilities});
			
		}
	}

	setCovenants = (covData)=>{
		if(typeof covData === 'string'){
			let rows = covData.split("\n");
			let headerRow=rows[0].trim();
			let headerCols = headerRow.split(",");
			let resultCovenants = {};
			for(let i=1;i<rows.length;i++){
				let resultRow = rows[i].split(",");
				let covenant = {};
				for(let col=0;col<headerCols.length;col++){
					covenant[headerCols[col]]=resultRow[col];
				}
				let key = covenant['facility_id']+","+covenant['bank_id'];
				if(resultCovenants[key]) 
					resultCovenants[key].push(covenant);
				else 
					resultCovenants[key] = [covenant];
				
			}
			this.setState({resultCovenants: resultCovenants});			
		}
	}
}
export default ReadLoan;