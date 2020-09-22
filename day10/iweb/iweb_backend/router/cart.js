/** 
 * 校区模块，包含如下功能点：
 *	1.1校区列表功能点
 *	1.2校区开课功能点
 */
const express = require('express')
const pool = require('../pool')
let router = express.Router()    //创建路由器
module.exports = router

/**
 * 1.1校区列表功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/school/list
 * 请求参数：
 * 	无
 * 返回消息：
 * 	[
 *		{sid: 2, adress: 'xxx', phone: 'yyy', postcode:'...'},
 * 		...
 *	]
 */
router.get('/list', (req, res)=>{
	let output = [
		{sid:2,address:'北京市东城区'},
		{sid:5,address:'北京市西城区'},
	]
	res.send(output)
})