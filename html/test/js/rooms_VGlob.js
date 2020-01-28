var vgApp = {
	paramsXHR : {
		url : 'http://' + window.location.hostname,
		port : 3101,
		base : '/testRooms',
		iam : '',
		eco : null
	},
	sqlite : {
		base   : '/shell/sqlite',
		userDB : 'usersTest.sqlite',
		sessDB : 'sessTest.sqlite',
		pathDB : 'apps/Rooms/sqlite/test',
		stmtDB : '',
	},
	encript : {
		base   : '/shell/encript',
	}
}
