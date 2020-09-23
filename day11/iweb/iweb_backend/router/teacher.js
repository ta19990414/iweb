/**
 * 讲师模块，包含如下功能点：
 *	2.1 讲师列表功能点
 *	2.2 讲师详情功能点
 */
const express = require('express')
const pool = require('../pool')
let router = express.Router()    //创建路由器
module.exports = router

/**
 * 2.1 讲师列表功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/teacher/list
 * 请求参数：
 * 	无
 * 返回消息：
 * 	[
 *		{tid, tname, tpic, maincourse, style},			
 * 		...
 *	]
 */
router.get('/list', (req, res)=>{
	let sql = 'SELECT tid,tname,tpic,maincourse,style FROM teacher'
	pool.query(sql, (err, result)=>{
		if(err){
			next(err)
			return
		}
		res.send(result)
	})
})

/**
 * 2.2 查询讲师详情功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/teacher/detail
 * 请求参数：
 * 	tid	  必需	讲师编号
 * 返回消息：
 * 	{
 *		tid: 5,
 * 		tname: '鑫鑫',
 * 		tpic: 'images/..jpg',
 * 		maincourse: '前端高级框架',
 * 		style: '....',
 * 		experience: '....',
 * 		courseList: [
 *			{cid:10,title:'...',pic:''},
 *			....
 *		]
 *	}
 */
router.get('/detail', (req,res,next)=>{
	//1.读取请求数据tid
	let tid = req.query.tid
	if(!tid){
		let output = {
			code: 400,
			msg: 'tid required'
		}
		res.send(output)
		return
	}
	//2.执行数据库查询
	let sql = 'SELECT tid,tname,tpic,maincourse,style,experience FROM teacher WHERE tid=?'
	pool.query(sql, tid, (err,result)=>{
		if(err){
			next(err)
			return
		}
		if(result.length===0){		//根据客户端提交的tid，没有查询讲师信息
			res.send({})
			return
		}
		let output = result[0]		//查询到的讲师对象
		//查询该讲师所授课程
		let sql = 'SELECT cid,title,pic FROM course WHERE teacherId=?'
		pool.query(sql,tid,(err,result)=>{
			if(err){
				next(err)
				return
			}
			output.courseList = result	//把查询到的课程列表追加到讲师对象
			//3.发送响应消息
			res.send(output)
		})
	})
})