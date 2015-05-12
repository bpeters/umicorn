'use strict';

var React = require('react-native');
var _ = require('lodash');
var moment = require('moment');

var {
	AppRegistry,
	StyleSheet,
	Text,
	TouchableHighlight,
	VibrationIOS,
	View,
} = React;

var UMICORNS = [
	{
		id: 1,
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
			timerID: null,
			umicorns: [],
			end: null,
			timer: null,
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
		return (
			<View>
				<Text style={styles.info}>{this.state.timer}</Text>
				<Text style={styles.info}>{this.state.position.coords.longitude}</Text>
				<Text style={styles.info}>{this.state.position.coords.latitude}</Text>
				<Text style={styles.info}>{this.state.umicorns.length}</Text>
				<Text style={styles.tinyInfo}>{JSON.stringify(this.state.umicorns)}</Text>
			</View>
		);
	}

	_onPressButton() {
		var distance = this._distance;
		var timer = this._timer.bind(this);
		if (!this.state.scouting) {
			var timerID = setInterval(timer, 60000); // Every Minute
			var watchID = navigator.geolocation.watchPosition(
				(position) => {
					var umicorns = _.clone(this.state.umicorns);
					_.forEach(UMICORNS, function(umicorn) {
						var d = distance(
							position.coords.longitude,
							position.coords.latitude,
							umicorn.longitude,
							umicorn.latitude
						);
						if (d <= 100 && _.indexOf(_.pluck(umicorns, 'id'), umicorn.id) === -1) {
							umicorn.when = moment();
							umicorn.distance = d;
							umicorns.push(umicorn);
							VibrationIOS.vibrate();
						}
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
				timerID: timerID,
				end: moment(moment()).add(1, 'hours'), // Add Hour
				timer: 59,
				scouting: true
			});
		} else {
			navigator.geolocation.clearWatch(this.state.watchID);
			clearInterval(this.state.timerID);
			this.setState({
				position: null,
				error: null,
				end: null,
				timer: null,
				umicorns: [],
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

	_timer() {
		var timer = this.state.end.diff(moment(), 'minutes');
		if (timer <= 0) {
			this.setState({
				scouting: false
			});
			VibrationIOS.vibrate();
		} else {
			this.setState({
				timer: timer
			});
		}
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
	tinyInfo: {
		marginTop: 50,
		color: '#E4D6EE',
		fontSize: 11,
		textAlign: 'center',
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
