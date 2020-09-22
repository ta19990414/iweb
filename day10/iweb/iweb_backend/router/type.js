/** 
 * 课程类别模块，包含如下功能点：
 *	5.1类别列表功能点
 */
const express = require('express')
const pool = require('../pool')
let router = express.Router()    //创建路由器
module.exports = router

/**
 * 5.1类别列表功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/type
 * 请求参数：
 * 	无
 * 返回消息：
 * 	[
 *		{tpid: 2, tpname:'...'},
 * 		...
 *	]
 */
router.get('/', (req, res,next)=>{
	let sql = 'SELECT tpid, tpname FROM  type ORDER BY tpid'
	pool.query(sql, (err, result)=>{
		if(err){
			next(err)
			return
		}
		res.send(result)
	})
})