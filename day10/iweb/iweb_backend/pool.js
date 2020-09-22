/**
 * MySQL数据库的连接池模块
 */
const mysql = require('mysql')

module.exports = mysql.createPool({
	/*连接本地的MySQL服务器必需的连接参数*/
	host:			'127.0.0.1',
	port:			'3306',
	user:			'root',
	password:		'',
	database:		'iweb',		//数据库名
	connectionLimit: 10			,//连接池最多可以保持的连接数
	
	/*连接新浪云中共享型MySQL服务器必需的连接参数——新浪云专供的变量*/
	// host:			process.env.MYSQL_HOST,
	// port:			process.env.MYSQL_PORT,
	// user:			process.env.ACCESSKEY,
	// password:		process.env.SECRETKEY,
	// database:		'app_' + process.env.APPNAME,		//数据库名
	// connectionLimit: 10					//连接池最多可以保持的连接数
})