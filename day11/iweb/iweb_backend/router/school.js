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
 *		{sid: 2, address: 'xxx', phone: 'yyy', postcode:'...'},
 * 		...
 *	]
 */
router.get('/list', (req, res, next)=>{
	//向MySQL数据库发起查询请求
	let sql = 'SELECT sid,sname,address,phone,postcode FROM school'
	pool.query(sql, (err, result)=>{
		//if(err)throw err		//抛出异步错误会导致Node.js崩溃
		if(err){
			next(err)	//如果SQL执行发生错误，交给后置中间件处理
			return		//next()不会终止当前函数的执行
		}	
		//向客户端发送响应消息
		res.send(result)//查询成功，发送查询结果
	})
})

/**
 * 1.2校区开课功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/school/course
 * 请求参数：
 * 	sid - 要查询的学校编号
 * 返回消息：
 * 	{
 *		shool: {sid: 2, sname:'北京万寿路中心', address:'北京是海淀区'},
 *		courseList: [
 *	 		{cid: 28, pic:'images/..jpg', cLength: '1天', startTime: '每周一',price:450},
 * 			......
 *		]
 * 	}
 */
router.get('/course', (req, res, next)=>{
	//1.读取请求数据
	let sid = req.query.sid	
	if(!sid){				//请求数据的服务器端校验 —— 必需的！
		let output = {
			code: 400,
			msg: 'sid required'
		}
		res.send(output)
		return
	}
	//2.执行数据库查询
	let output = {			//最终的输出数据
		school: {},			//校区数据
		courseList: []		//课程数据
	}
	let sql = 'SELECT sid,sname,address FROM school WHERE sid=?'
	pool.query(sql, sid, (err, result)=>{
		if(err){
			next(err)
			return
		}
		if(result.length===0){	//根据客户端提交的sid，没有查询到任何校区
			//3.发送响应消息
			res.send(output)
			return
		}
		output.school = result[0]
		//继续查询该校区开设的课程
		let sql = 'SELECT cid,pic,cLength,startTime,price FROM course WHERE cid IN (SELECT courseId FROM schoolCourse WHERE schoolId=?)'
		pool.query(sql, sid, (err, result)=>{
			if(err){
				next(err)
				return
			}
			output.courseList = result	//不论根据sid查询到多少个课程，都是合理的，可能是[]，或者[{}]，或者[{},{},....]
			res.send(output)
		})
	})
})