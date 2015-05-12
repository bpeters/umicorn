'use strict';

var React = require('react-native');
var {
	AppRegistry,
	NavigatorIOS,
	StyleSheet,
} = React;

var Scout = require('./Scout');

var umicorn = React.createClass({
	render: function() {
		return (
			<NavigatorIOS
				style={styles.container}
				initialRoute={{
						title: 'Scout',
						component: Scout,
						passProps: {},
					}
				}
				itemWrapperStyle={styles.itemWrapper}
				barTintColor='#3F3648'
				tintColor='#E4D6EE'
				titleTextColor='#E4D6EE'
			/>
		);
	}
});

var styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	itemWrapper: {
		backgroundColor: '#3F3648',
	},
});

AppRegistry.registerComponent('umicorn', () => umicorn);
