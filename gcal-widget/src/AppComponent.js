import React from 'react';
import ReactDOM from 'react-dom';

export default class extends React.Component {
	constructor() {
		super();
		this.state = {
			calData: []
		}
	}
	getEvents() {
		//console.log(this.props.configuration.portletInstance.calendar_id);
		//console.log(this.props.configuration.portletInstance.server);

		var options = {
			method: 'POST',
			headers: { 'Accept': 'application/json','Content-Type': 'application/json' },
			body: JSON.stringify({id: this.props.configuration.portletInstance.calendar_id, days: this.props.configuration.portletInstance.days, accept_cache: this.props.configuration.portletInstance.accept_cache})
		}
		fetch(`${this.props.configuration.portletInstance.server}/eventsList`,options).then((res) => res.json()).then((data) => this.setState({calData:data})).catch( (err)=>console.error(err));
	}
	componentDidMount() {
		this.getEvents();
	}
	render() {
		var events;
		console.log(this.state.calData);
		console.info(this.state.calData[0]);

		if (typeof this.state.calData[0].code == 'undefined') {
			if (this.state.calData.length == 1) {
				events = this.state.calData.map((event, key) => <li key={event.index}>{event.start} - {event.summary}</li>);
			}
			else {
				for (var i=0; i<this.state.calData.length; i++) {
					events = events + this.state.calData[i].map((event, key) => <li key={event.index}>{event.start} - {event.summary}</li>);
				}
			}
		}
		else if (typeof this.state.calData[0].code === 'number') {
			events = <li>Error: {this.state.calData[0].code} {this.state.calData.message}</li>
		}
		else {
			for (var i=0; i<this.state.calData.length; i++) {
				events = events + this.state.calData[i].map((event, key) => <li key={event.index}>{event.start} - {event.summary}</li>);
			}		
		}

		return (
            <div>
				<div id="calDiv">
					<ul>{events}</ul>
				</div>
			</div>
		);
	}	
}