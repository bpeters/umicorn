'use strict';

var React = require('react-native');
var _ = require('lodash');
var moment = require('moment');
var request = require('superagent');

var {
	AppRegistry,
	StyleSheet,
	Text,
	TextInput,
	TouchableHighlight,
	VibrationIOS,
	View,
} = React;

var API = 'https://umicorn-api.herokuapp.com/api/v1';

class MissedConnection extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			message: null
		};
	}

	render() {
		return ( 
			<View style={styles.listContainer}>
				<View style={styles.main}>
					<TextInput
						style={styles.textInput}
						onChangeText={(text) => this.setState({message: text})}
						multiline={true}
						ref="Message"
						autoCapitalize="none"
						autoCorrect={false}
						keyboardType="default"
						returnKeyType="submit"
						clearButtonMode="always"
						placeholder="Write a missed connection..."
						value={this.state.message}
					/>
				</View>
				<TouchableHighlight>
					<View style={styles.button}>
						<Text style={styles.buttonText}>
							
						</Text>
					</View>
				</TouchableHighlight>
			</View>
		);
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
	textInput: {
		height: 120,
		borderColor: 'gray',
		borderWidth: 1
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

module.exports = MissedConnection;
