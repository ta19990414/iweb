/**
 * 用户模块，包含如下功能点：
 *	4.1用户注册功能点
 *	4.2用户登录功能点
 *  4.3修改用户头像功能点
 *  4.4获取用户的全部信息功能点
 */
const express = require('express')
const pool = require('../pool')
let router = express.Router()    //创建路由器
module.exports = router

/**
 * 4.1 用户注册功能点
 * 请求方法：
 * 	POST
 * 请求URL：
 * 	/user/register
 * 请求参数：
 * 	类型：application/json
 *  uname	必需		注册用户名
 * 	upwd	必需		密码
 * 	phone	必需		电话
 * 	captcha	必需		验证码
 * 返回消息：
 * 	{
 *   "code": 200,
 *   "msg": "register success",
 *   "uid": 7
 *	}
 */
router.post('/register', (req, res, next)=>{
	//1.读取请求数据并进行服务器验证
	//GET请求数据放置在req.query中
	//POST请求数据放置在req.body中  //Express中默认情况下req没有body属性，需要中间件
	let uname = req.body.uname
	if(!uname){
		let output = {
			code: 400,
			msg: 'uname required'
		}
		res.send(output)
		return
	}
	//此处省略了uname的格式验证：必需符合邮箱格式  401
	let upwd = req.body.upwd
	if(!upwd){
		let output = {
			code: 402,
			msg: 'upwd required'
		}
		res.send(output)
		return
	}
	//此处省略了upwd长度验证   403
	let phone = req.body.phone
	if(!phone){
		let output = {
			code: 404,
			msg: 'phone required'
		}
		res.send(output)
		return
	}
	//此处省略了phone电话格式的验证	405
	//执行captcha验证
	let captcha = req.body.captcha
	if(!captcha){			//验证码不能为空
		let output = {
			code: 406,
			msg: 'captcha required'
		}
		res.send(output)
		return
	}
	captcha = captcha.toLowerCase()	//转换为小写形式 
	console.log('服务器端保存的验证码2：', req.session.captchaRegister)
	console.log('客户端提交来的验证码：', captcha)
	if(captcha !== req.session.captchaRegister){
		let output = {
			code: 407,
			msg: 'captcha error'
		}
		res.send(output)
		return
	}
	delete  req.session.captchaRegister   //验证码使用完毕，需要从session中删除
	
	//2.向数据库执行插入语句
	//验证用户名是否已经存在   501
	let sql = 'SELECT  uid  FROM  user  WHERE uname=?'
	pool.query(sql, uname, (err, result)=>{
		if(err){
			next(err)
			return
		}
		if(result.length>0){	//根据uname查询到了已经存在的记录
			let output = {
				code: 501,
				msg: 'uname already exists'
			}
			res.send(output)
			return
		}
		//验证电话号码是否已经存在   502
		let sql = 'SELECT uid FROM user WHERE phone=?'
		pool.query(sql, phone, (err, result)=>{
			if(err){
				next(err)
				return
			}
			if(result.length>0){	//根据phone查询到已经存在对应的记录
				let output = {
					code: 502,
					msg: 'phone already exists'
				}
				res.send(output)
				return 
			}
			//向数据库中执行一条INSERT语句完成注册
			let sql = 'INSERT INTO user(uname,upwd,phone) VALUES(?,?,?)'
			pool.query(sql, [uname,upwd,phone], (err,result)=>{
				if(err){
					next(err)
					return
				}
				let output = {
					code: 200,
					msg: 'register succ',
					uid: result.insertId	//向客户端发送新增用户在数据库中的自增编号 
				}
				//3.发送响应消息
				res.send(output)
			})
		})
	})
})


/**
 * 4.2 用户登录功能点
 * 请求方法：
 * 	POST	-	因为登录一般需要在数据库中添加一条新的“登录历史记录”
 * 请求URL：
 * 	/user/login
 * 请求参数：
 * 	类型：application/json
 *  uname	必需		注册用户名
 * 	upwd	必需		密码
 * 返回消息：
 * 	{
 *   "code": 200,
 *   "msg": "login success",
 *   "userInfo": {
 *		"uid": 2,
 *		"uname": "ranran@tedu.cn",
 * 		"nickname": "然然"
 *	  }
 *	}
 */
router.post('/login', (req, res, next)=>{
	//1.读取客户端提交的请求数据
	let uname = req.body.uname
	if(!uname){
		let output = {
			code: 401,
			msg: 'uname required'
		}
		res.send(output)
		return
	}
	let upwd = req.body.upwd
	if(!upwd){
		let output = {
			code: 403,
			msg: 'upwd required'
		}
		res.send(output)
		return
	}
	//2.执行登录验证
	let sql = 'SELECT uid,uname,nickname FROM user WHERE uname=? AND upwd=?'
	pool.query(sql, [uname,upwd], (err, result)=>{
		if(err){
			next(err)
			return
		}
		if(result.length===0){	//根据客户端提交的uname和upwd没有查询到相关记录
			let output = {
				code: 405,
				msg: 'uname or upwd error'
			}
			res.send(output)
			return 
		}
		//根据客户端提交的uname和upwd查询到相关记录
		//3.1 将当前用户的登录信息保存在服务器端，给客户端一个Set-Cookie：sid=...
		//console.log('SESSION: ', req.session)
		req.session.userInfo = result[0]//在服务器端保存用户的登录信息uid/uname/nickName
		//req.session.save()	//将当前的session数据保存会存储空间
		//3.2 向发送响应消息
		let output = {
			code: 200,
			msg: 'login succ',
			userInfo: result[0]
		}
		res.send(output)
	})
})

/**
 * 4.3.1 上传用户头像功能点
 * 请求方法：
 * 	POST
 * 请求URL：
 * 	/user/upload/avatar
 * 请求参数：
 * 	类型：multipart/form-data
 *  avatar  必需，待上传的用户头像
 * 返回消息：
 * 	{
 *   "code": 200,
 *   "msg": "avatar upload success",
 *   "fileName": 'img-avatar/13571234237723.jpg'  //此处的后缀名根据客户端上传的文件实际后缀名而变化
 *	}
 */
const random = require('../util/random')
const fs = require('fs')
const multer = require('multer')
let upload = multer({dest: './temp'})  //指定客户端上传的文件临时存储路径
router.post('/upload/avatar', upload.single('avatar')) //使用中间件解析请求主体
router.post('/upload/avatar', (req, res, next)=>{
	//1.读取客户端上传的文件内容
	//console.log('req.body:',  req.body)
	//console.log('req.file:',  req.file)
	let file = req.file	//客户端上传的文件描述对象
	//2.把客户端上传的头像文件保存到 img-avatar 目录下，并重命名
	let oldPath = file.path  //上传的文件在服务器上的临时存储路径
	let newPath = 'img-avatar/'+random.randFileName(file.originalname) //目标存储路径
	fs.rename(oldPath, './public/'+newPath, (err)=>{ //重命名/转移文件
		if(err){
			next(err)
			return
		}
		//客户端上传的文件已经被转移到业务的目录下：./public/img-avatar/xxxx.jpg
		let output = {
			code: 200,
			msg: 'avatar upload succ',
			fileName: newPath
		}
		res.send(output)
	})
})

/**
 * 4.3.2 修改用户头像功能点
 * 请求方法：
 * 	POST
 * 请求URL：
 * 	/user/update/avatar
 * 请求参数：
 * 	类型：application/json
 *  fileName  必需，用户头像保存在服务器上的路径名
 * 返回消息：
 * 	{
 *   "code": 200,
 *   "msg": "avatar update success"
 *	}
 */
const loginCheck = require('../middleware/loginCheck')
router.post('/upload/avatar', loginCheck)		//修改头像之前必须登录了
router.post('/upload/avatar', (req, res, next)=>{
	//1.读取客户端上传的文件内容
	let fileName = req.body.fileName
	let uid = req.session.userInfo.uid	//当前登录用户在会话中存储的uid
	
	//3.执行SQL语句，向数据库中提交UPDATE，更改当前登录用户的头像图片地址
	let sql = 'UPDATE user SET avatar=? WHERE uid=?'
	pool.query(sql, [fileName, uid], (err, result)=>{
		if(err){
			next(err)
			return
		}
		//当前登录用户的头像在数据库中修改完成
		let output = {
			code: 200,
			msg: 'avatar upload succ'
		}
		res.send(output)
	})
})


/**
 * 4.4 获取当前登录用户的全部信息功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/user/details
 * 请求参数：
 *  uid   必需的，从登录之后的session空间寻找
 * 返回消息：
 * 	{
 *   "uid": 200,
 *   "uname": "....",
 *   "nickname": "....",
 *   "phone": "....",
 * 	 "avatar": "....",
 * 	 "job": "....",
 * 	 "edu": "....",
 * 	 "age": "....",
 * 	 "sex": "....",
 *	}
 */
router.get('/details', loginCheck)	//只能获取“当前用户”的信息
router.get('/details', (req, res, next)=>{
	let uid = req.session.userInfo.uid
	let sql = 'SELECT uid,uname,nickname,phone,avatar,job,edu,age,sex FROM user WHERE uid=?'
	pool.query(sql, uid, (err, result)=>{
		if(err){
			next(err)
			return
		}
		res.send(result[0]) //根据uid能够查询有且仅有一行记录
	})
})


