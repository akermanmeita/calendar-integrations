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
		console.log(this.props.configuration.portletInstance.calendar_id);
		console.log(this.props.configuration.portletInstance.server);

		var options = {
			method: 'POST',
			headers: { 'Accept': 'application/json','Content-Type': 'application/json' },
			body: JSON.stringify({id: this.props.configuration.portletInstance.calendar_id, days: this.props.configuration.portletInstance.days, accept_cache: this.props.configuration.portletInstance.accept_cache})
		}
		fetch(`http://localhost:8008/eventsList`,options).then((res) => res.json()).then((data) => this.setState({calData:data})).catch( (err)=>console.error(err));
	}
	componentDidMount() {
		console.log("Mount");
		this.getEvents();
	}
	render() {
		var events;

		if (typeof this.state.calData.code === undefined) {
			events = this.state.calData.map((event, key) => <li key={event.index}>{event.start} - {event.summary}</li>);
		}
		else if (typeof this.state.calData.code === 'number') {
			events = <li>{this.state.calData.code} Error</li>
		}
		else {
			events = this.state.calData.map((event, key) => <li key={event.index}>{event.start} - {event.summary}</li>);
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