'use strict';

var React = require('react-native');
var _ = require('lodash');
var moment = require('moment');
var request = require('superagent');

var {
	AppRegistry,
	StyleSheet,
	Text,
	TouchableHighlight,
	VibrationIOS,
	View,
} = React;

var MissedConnection = require('./MissedConnection');

var API = 'https://umicorn-api.herokuapp.com/api/v1';

class Scout extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			scouting: false,
			location: null,
			error: null,
			watchID: null,
			timerID: null,
			end: null,
			timer: null,
			scout: null,
			scouts: [],
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
		var scout = !_.isEmpty(this.state.scout) ? this.state.scout.objectId : null;
		var scouts = _.pluck(this.state.scouts, 'objectId');
		return (
			<View>
				<Text style={styles.info}>{this.state.timer}</Text>
				<Text style={styles.tinyInfo}>{scout}</Text>
				<Text style={styles.info}>{scouts.length}</Text>
				<Text style={styles.tinyInfo}>{JSON.stringify(scouts)}</Text>
			</View>
		);
	}

	_onPressButton() {
		var timer = this._timer.bind(this);
		if (!this.state.scouting) {
			navigator.geolocation.getCurrentPosition(
				(position) => {this._createScout(position)},
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
			var timerID = setInterval(timer, 60000); // Every Minute
			var watchID = navigator.geolocation.watchPosition(
				(position) => {this._watcher(position)},
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

			this._stopScout();

		}
	}

	_timer() {
		var timer = this.state.end.diff(moment(), 'minutes');
		if (timer <= 0) {
			this._stopScout();
		} else {
			this._getScouts(this.state.location);
			this.setState({
				timer: timer
			});
		}
	}

	_watcher(position) {

		var location = {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		};

		if (this.state.scout) {
			this._updateScout(location);
			this._getScouts(location);
		}

		this.setState({
			location: location
		});
	}

	_createScout(position) {

		var location = {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		};

		request
			.post(API + '/scouts')
			.send(location)
			.set('Accept', 'application/json')
			.end((err, res) => {
				if (res.ok) {
					this.setState({
						scout: JSON.parse(res.text)
					});
				} else {
					this.setState({
						scouting: false
					});
				}
			});
	}

	_updateScout(location) {
		request
			.post(API + '/scouts/' + this.state.scout.objectId)
			.send(location)
			.set('Accept', 'application/json')
			.end((err, res) => {
				if (res.ok) {
					this.setState({
						scout: JSON.parse(res.text)
					});
				} else {
					this.setState({
						scouting: false
					});
				}
			});
	}

	_getScouts(location) {
		request
			.get(API + '/scouts')
			.query(location)
			.set('Accept', 'application/json')
			.end((err, res) => {
				if (res.ok) {
					this._buildCurrentScouts(JSON.parse(res.text));
				} else {
					this.setState({
						scouting: false
					});
				}
			});
	}

	_buildCurrentScouts(scouts) {

		var oldScouts = _.clone(this.state.scouts);

		var newScouts = _.filter(scouts, (scout) => {
			return _.indexOf(_.pluck(oldScouts, 'objectId'), scout.objectId) === -1 && scout.objectId !== this.state.scout.objectId;
		});

		if (newScouts.length > 0) {
			VibrationIOS.vibrate();
		}

		var currentScouts = oldScouts.concat(newScouts);

		this.setState({
			scouts: currentScouts
		});
	}

	_stopScout() {
		navigator.geolocation.clearWatch(this.state.watchID);
		clearInterval(this.state.timerID);
		VibrationIOS.vibrate();

		request
			.del(API + '/scouts/' + this.state.scout.objectId)
			.set('Accept', 'application/json')
			.end((err, res) => {
				if (res.ok) {
					this.props.navigator.replace({
						component: MissedConnection,
						passProps:{
							scout: this.state.scout,
							scouts: this.state.scouts
						}
					});
				}
			});
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
		marginTop: 30,
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
