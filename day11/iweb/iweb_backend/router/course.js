/**
 * 课程模块，包含如下功能点：
 *	3.1课程列表功能点(分页查询)
 *	3.2课程详情功能点
 *	3.3最新课程功能点
 *	3.4热门课程功能点
 */
const express = require('express')
const pool = require('../pool')
let router = express.Router()    //创建路由器
module.exports = router

/**
 * 3.1课程列表功能点(分页查询)
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/course/list
 * 请求参数：
 * 	typdId	 可选(默认值为0)		要查询的课程所属类别，0代表所有类别
 *	pageNum	 可选(默认值为1)		要查询哪一页
 * 返回消息：
 * 	{
 *		totalCount: 27,			//符合条件的总记录数——需要到数据库中查询
 * 		pageSize: 6,			//每页最多记录数/页面大小——是一个常量
 * 		pageCount: 5,			//总页数——总记录数/页面大小再上取整
 * 		pageNum: 1,				//当前页号——来自于客户端请求
 * 		courseList: [
 *	 		{cid:8,pic:'..',title:'..',tid:'',tname:'..',cLength:'',startTime:'',price:''},
 * 			....
 *		]
 *	}
 */
router.get('/list', (req, res, next)=>{
	//1.读取请求数据
	let typeId = req.query.typeId		//要查询的课程所属类别
	if(!typeId){
		typeId = 0		//0-代表所有类别
	}else {
		typeId = parseInt(typeId)
	}
	
	let pageNum = req.query.pageNum		//要显示哪一页数据/页号
	if(!pageNum){
		pageNum = 1		//默认查询第一页
	}else {
		pageNum = parseInt(pageNum)   
	}
	
	//2.执行数据库查询
	let output = {
		totalCount: 0,		//符合条件的总记录数
		pageSize: 6,		//页面大小——常量
		pageCount: 0,		//总页数
		pageNum: pageNum,	//要查询的页号
		courseList: [],		//要查询的数据
	}
	//查询符合条件的总记录数——"不限定查询条件的查询"
	//let sql = 'SELECT COUNT(*) AS c FROM course WHERE 1 AND x=? AND y=? AND z=?'
	//let sql = 'SELECT COUNT(*) AS c FROM course WHERE 1'
	let placeholder = []	//SQL中占位符对应的值
	let sql = 'SELECT COUNT(*) AS c FROM course WHERE 1 '
	if(typeId>0){			//如果客户端向查询某个特定类型的课程，则拼接查询条件
		sql += ' AND typeId=? '
		placeholder.push(typeId)
	}
	pool.query(sql, placeholder, (err, result)=>{
		if(err){
			next(err)
			return
		}
		output.totalCount = result[0].c		//查询到了满足条件的总记录数
		output.pageCount = Math.ceil(output.totalCount/output.pageSize) //总页数
		//继续查询指定页上的课程记录
		let sql = 'SELECT cid,pic,title,cLength,startTime,price,tid,tname FROM course, teacher WHERE course.teacherId=teacher.tid '
		let placeholder = []	//当前第二条SQL中?占位符对应的值
		if(typeId>0){			//如果客户端指定了课程类别，则追加查询条件
			sql += ' AND typeId=? '
			placeholder.push(typeId)
		}
		sql += ' ORDER BY cid DESC LIMIT  ?, ? '
		placeholder.push((output.pageNum-1)*output.pageSize)	//从哪一行开始读取数据
		placeholder.push(output.pageSize)	//最多获取几行数据
		//第1页： 0/1/2/3/4/5			//第2页： 6/7/8/9/10/11
		//第3页： 12/13/14/15/16/17		//第n页： (n-1)*6/....
		pool.query(sql, placeholder, (err, result)=>{
			if(err){
				next(err)
				return
			}
			output.courseList = result	//分页数据
			//3.发送响应消息
			res.send(output)
		})
	})
})


/**
 * 3.2课程详情功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/course/detail
 * 请求参数：
 * 	cid	  必需		要查询的课程编号
 * 返回消息：
 * 	{
        "cid": 1,
        "typeId": 1,
        "title": "01HTML零基础入门",
        "teacherId": 1,
        "cLength": "1天",
        "startTime": "每周一开课",
        "pic": "img-course\/01.png",
        "price": 399,
        "details": "<p>本课程详细讲解了HTML5的各个方面，课程从环境搭建开始，依次讲述了HTML5新元素、Canvas、SVG、Audio、GPS定位、拖拽效果、WEB存储、App Cache、HTML5 多线程和HTML5消息推送等内容。.....<\/p>",
        "tid": 1,
        "tname": "成亮",
        "tpic": "img-teacher\/zx.jpg",
		"schoolList":[
			{sid: 2, sname:'北京万寿路校区'},
			.....
		]
	}
 */
router.get('/detail', (req, res, next)=>{
	//1.读取请求数据
	let cid = req.query.cid
	if(!cid){
		let output = {
			code: 400,
			msg: 'cid required'
		}
		res.send(output)
		return 
	}
	//2.执行数据库查询
	let sql = 'SELECT cid,typeId,title,cLength,startTime,pic,price,details,tid,tname,tpic FROM course,teacher WHERE course.teacherId=teacher.tid AND cid=?'
	pool.query(sql, cid, (err, result)=>{
		if(err){
			next(err)
			return
		}
		if(result.length===0){	//根据客户端提交的cid，没有查询到指定的课程
			res.send({})
			return
		}
		let output = result[0]	//查询得到了一个课程对象
		let sql = 'SELECT sid,sname FROM school WHERE sid IN (SELECT schoolId FROM schoolCourse WHERE courseId=?)'
		pool.query(sql, cid, (err, result)=>{
			if(err){
				next(err)
				return
			}
			output.schoolList = result
			//3.发送响应消息
			res.send(output)
		})
	})
})


/**
 * 3.3最新课程功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/course/newest
 * 请求参数：
 * 	count	  可选		需要返回的最新课程的数量，默认值为4
 * 返回消息：
 * 	[
		{
			"cid": 12,
			"title": "12HTML零基础入门",
			"pic": "img-course/01.png",
			"price": 399,
			"tname": "纪盈鑫"
		}，
		.......
	]
 */
router.get('/newest', (req, res, next)=>{
	//1.读取请求数据
	let count = req.query.count
	if(!count){
		count = 4
	}else {	  //查询字符串中提交的数据都是string，但是SQL中的LIMIT后面必需是int
		count = parseInt(count)
	}
	//2.执行查询语句
	let sql = 'SELECT cid,title,pic,price,tname FROM course,teacher WHERE course.teacherId=teacher.tid  ORDER  BY  cid  DESC  LIMIT  ?' 
	pool.query(sql, count, (err, result)=>{
		if(err){
			next(err)
			return
		}
		//3.发送响应消息
		res.send(result)
	})
})


/**
 * 3.4热门课程功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/course/hottest
 * 请求参数：
 * 	count	  可选		需要返回的热门课程的数量，默认值为4
 * 返回消息：
 * 	[
		{
			"cid": 12,
			"title": "12HTML零基础入门",
			"pic": "img-course/01.png",
			"price": 399,
			"tname": "纪盈鑫"
		}，
		.......
	]
 */
router.get('/hottest', (req, res, next)=>{
	//1.读取请求数据
	let count = req.query.count
	if(!count){
		count = 4
	}else {	  //查询字符串中提交的数据都是string，但是SQL中的LIMIT后面必需是int
		count = parseInt(count)
	}
	//2.执行查询语句
	let sql = 'SELECT cid,title,pic,price,tname FROM course,teacher WHERE course.teacherId=teacher.tid  ORDER  BY  buyCount  DESC  LIMIT  ?' 
	pool.query(sql, count, (err, result)=>{
		if(err){
			next(err)
			return
		}
		//3.发送响应消息
		res.send(result)
	})
})

