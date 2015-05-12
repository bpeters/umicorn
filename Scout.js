'use strict';

var React = require('react-native');
var _ = require('lodash');
var moment = require('moment');

var {
	AppRegistry,
	StyleSheet,
	Text,
	TouchableHighlight,
	View,
} = React;

var UMICORNS = [
	{
		longitude: -97.72966571919972,
		latitude: 30.26964765339016,
	},
];

class Scout extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			scouting: false,
			position: null,
			error: null,
			watchID: null,
			umicorns: [],
			end: null,
		};
	}

	render() {
		return ( 
			<View style={styles.listContainer}>
				<View style={styles.main}>
					{this.state.scouting ? this._renderGeo() : null}
				</View>
				<TouchableHighlight onPress={this._onPressButton.bind(this)}>
					<View style={styles.button}>
						<Text style={styles.buttonText}>
							{this.state.scouting ? 'Stop Scouting' : 'Start Scouting' }
						</Text>
					</View>
				</TouchableHighlight>
			</View>
		);
	}

	_renderGeo() {
		var now = moment();
		var end = this.state.end;
		var timer = end.diff(now, 'minutes');
		return (
			<View>
				<Text style={styles.info}>{timer}</Text>
				<Text style={styles.info}>{this.state.position.coords.longitude}</Text>
				<Text style={styles.info}>{this.state.position.coords.latitude}</Text>
				<Text style={styles.info}>{JSON.stringify(this.state.umicorns)}</Text>
			</View>
		);
	}

	_onPressButton() {
		var distance = this._distance;
		if (!this.state.scouting) {
			var watchID = navigator.geolocation.watchPosition(
				(position) => {
					var umicorns = [];
					_.forEach(UMICORNS, function(umicorn) {
						var d = distance(
							position.coords.longitude,
							position.coords.latitude,
							umicorn.longitude,
							umicorn.latitude
						);
						umicorns.push(d);
					});
					this.setState({
						position: position,
						umicorns: umicorns
					});
				},
				(error) => {
					this.setState({
						error
					});
				},
				{
					enableHighAccuracy: true, 
					maximumAge: 30000, 
					timeout: 27000
				}
			);
			this.setState({
				watchID: watchID,
				end: moment(moment()).add(1, 'hours'), // Add Hour
				scouting: true
			});
		} else {
			navigator.geolocation.clearWatch(this.state.watchID);
			this.setState({
				position: null,
				error: null,
				end: null,
				scouting: false
			});
		}
	}

	_distance(lon1, lat1, lon2, lat2) {
		var R = 6371000; // metres
		var φ1 = lat1 * Math.PI / 180;
		var φ2 = lat2 * Math.PI / 180;
		var Δφ = (lat2 - lat1) * Math.PI / 180;
		var Δλ = (lon2 - lon1) * Math.PI / 180;

		var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
						Math.cos(φ1) * Math.cos(φ2) *
						Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		var d = R * c;

		return d;
	}
}

var styles = StyleSheet.create({
	listContainer: {
		flex: 1,
		backgroundColor: '#3F3648',
	},
	main: {
		paddingTop: 75,
		height: 592,
	},
	info: {
		color: '#E4D6EE',
		fontSize: 20,
		textAlign: 'center',
		lineHeight: 50,
	},
	button: {
		height: 75,
		backgroundColor: '#1BCAB3',
	},
	buttonText: {
		color: '#3F3648',
		fontSize: 20,
		textAlign: 'center',
		lineHeight: 50,
	},
});

module.exports = Scout;
