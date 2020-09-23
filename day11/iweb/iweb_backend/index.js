/**
 * 服务器端应用入口文件
 */
/*1.创建并启动Web服务器*/
const express = require('express')

let port = 5050	//此处端口可以任意，5050是新浪云服务器默认端口
let app = express()
app.listen(port, ()=>{
	console.log('Server Listening on Port: ', port)
})

/*2.创建前置中间件——在路由之前执行的中间件(预处理请求和响应)*/
//让Express托管静态资源请求(图片/音频/视频)
app.use(express.static('./public'))
//解析请求消息主体，将application/json类型的请求数据保存入req.body中
let bodyParser = require('body-parser')
app.use(bodyParser.json()) 
//使用session处理中间件：①为当前客户端分配session存储空间，并告知客户端sid ②当前客户端再次请求时从请求头部读取sid，进而找到该客户端对应的session空间，保存为req.session对象
let session = require('express-session')
app.use(session({
	secret: 'tedu123',	//自定义生成sid随机数的种子
	saveUninitialized: true,	//是否保存未经初始化过的session数据
	resave: true,	//是否自动保存session数据——即使没有修改过
}))
//通知客户端浏览器，允许使用当前服务器返回的响应数据——即使用CORS方案解决XHR跨域限制
let cors = require('cors')
app.use(cors({
	//cors中间件调用时如果不给参数，默认添加一个CORS消息头：Access-Control-Allow-Origin: *
	//如果客户端请求消息中携带了身份认证信息(即Cookie)，响应消息头部Access-Control-Allow-Origin不再允许使用*
	//修改Access-Control-Allow-Origin头部：
	origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://wenhuafrontend.applinzi.com'],
	//修改Access-Control-Allow-Credentials头部：由默认的''改为true
	credentials: true,		//如果客户端请求中携带了身份认证信息，服务器必需准许才可以
}))


/*3.声明路由器(业务模块)，其中包含若干路由(业务功能点)——都实现一个特定的功能点*/
const schoolRouter = require('./router/school')
app.use('/school', schoolRouter)

const teacherRouter = require('./router/teacher')
app.use('/teacher', teacherRouter)

const typeRouter = require('./router/type')
app.use('/type', typeRouter)

const courseRouter = require('./router/course')
app.use('/course', courseRouter)

const userRouter = require('./router/user')
app.use('/user', userRouter)

const loginCheckMiddleware = require('./middleware/loginCheck')
app.use('/favorite', loginCheckMiddleware)  //操作收藏夹之前必需检验是否登录
const favoriteRouter = require('./router/favorite')
app.use('/favorite', favoriteRouter)

app.use('/cart', loginCheckMiddleware)  //购物车操作之前必需检验是否登录
const cartRouter = require('./router/cart')
app.use('/cart', cartRouter)

const captchaRouter = require('./router/captcha')
app.use('/captcha', captchaRouter)

const systemRouter = require('./router/system')
app.use('/', systemRouter)

/*4.创建后置中间件——如果路由无法处理的问题或继续进一步处理问题*/
//常用后置中间件：访问日志记录
//常用后置中间件：错误日志记录
/*
Express内置的错误处理中间件:
app.use((err, req, res, next)=>{		//错误处理中间件的第一个形参是err
	console.log(err)
	res.status(200).send('')
})
*/
//自定义错误中间件——所有的路由方法中只要执行了next(err)都会调用此中间件
app.use((err, req, res, next)=>{
	//console.log(err)				//开发阶段：此处可以把错误信息输出到控制台
	//fs.write('error.log', err)	//产品阶段：此次可以把错误消息保存到日志文件中
	//向客户端输出一个“合理且礼貌”的解释
	res.status(500)		//Internal Server Error
	res.send({	
		code: 500,
		msg: 'Sorry！Server tmp error！Please retry later！',
		err: err
	})
})