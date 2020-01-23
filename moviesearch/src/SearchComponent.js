import React, {Component} from 'react';
import axios from 'axios';
import './search.css'

class SearchComponent extends Component{
	constructor(props){
		super(props);
		this.state = {
			query: '',
			prevQuery:'',
			results:null,
			titles:[]			
		}

	}
	
	onTextChangeHandler = (event) => {
		this.setState({query:event.target.value});
	}
	onSuggestionClickHandler = (event)=>{
		let titles = this.state.titles;
		if(titles.indexOf(event.target.innerText)<0 && titles.length<5)
		{	
			titles.push(event.target.innerText);
			this.setState({titles:titles});
		}
	}
	
	deleteTagHandler = (event)=>{
		event.target.parentNode.remove();
	}
	
	onunloadSuggester = (event)=>{
		event.target.style.display='none';
	}
	
	componentDidUpdate(){
		if(this.state.query !== this.state.prevQuery){
				axios.get('http://www.omdbapi.com/?apikey=97b2e430&type=movie&page=1&s='+this.state.query).then((response)=>{
				let results = response.data.Search;				
				if(results){
					results=results.filter((entry)=>{							
						return (entry.Title.toLowerCase().indexOf(this.state.query)==0);
					});		
				}
				this.setState({results: results, prevQuery:this.state.query});
			}).catch((err)=>{console.log("Error occured: ", err);});
		}			
	}
	generateTitleTags(){
		let titleTags="";
		if(this.state.titles.length>0){
			titleTags=this.state.titles.map((title,index)=>{
						return <span className="tagTitle" key={index+title}>{title}
									<span className="tagRemove" onClick={this.deleteTagHandler}>x
									</span>
								</span>});
		}
		return titleTags;
	}
	
	generateSuggestionItems(){
		let suggestionItems=[];
		if(this.state.results){
			suggestionItems=this.state.results.map(
				(entry)=>{return (<li onMouseDown={this.onSuggestionClickHandler} key={entry.imdbID}>{entry.Title}</li>);}
			);						
		}
		return suggestionItems;
	}
	render(){
		let titleTags=this.generateTitleTags();
		
		let suggester = null;
		let suggestionItems = this.generateSuggestionItems();
		
		if(suggestionItems.length>0){
			suggester= <ul className="autocomplete-items"			
						onBlur={(event)=>{this.onunloadSuggester(event)} }
						tabIndex="0"
						 ref={dropdown => this.dropdown = dropdown}>{suggestionItems}</ul>;
		}
		return (
			<div>
				<div className="searchContainer" >
					<div id="tagInput"  >
						{titleTags}
						<input className="searchInput" onChange={this.onTextChangeHandler} type="text" />
						<div className="suggesterContainer">
						{suggester}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
export default SearchComponent;