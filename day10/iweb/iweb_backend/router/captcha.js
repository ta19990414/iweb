/** 
 * 验证码模块，包含如下功能点：
 *	8.1 生成注册用的验证码功能点
 */
const express = require('express')
const pool = require('../pool')
let router = express.Router()    //创建路由器
module.exports = router

/**
 * 8.1 生成注册用的验证码功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/captcha/register
 * 请求参数：
 * 	无
 * 返回消息：
 * 	<svg>...</svg>
 */
const svgCaptcha = require('svg-captcha')
const random = require('../util/random')
router.get('/register', (req, res)=>{
	//1.生成一个验证码
	//let captcha = svgCaptcha.create()	//{text: 'x5y9', data: '<svg>...</svg>'}
	let options = {
		width:100,	
		height: 18,
		fontSize: 30,
		charPreset: '23456789abcdefghjkmnpqrstwxyABCEFGHJKLMNPQRSTWXY', //预设字符
		size: 5,			//默认为4，验证码字符个数
		noise: 5,			//默认为1，干扰线数量
		color: true,		//字符是否彩色
		background: random.randColor(160, 250),	//背景颜色
	}
	let captcha = svgCaptcha.create(options)
	
	//2.把验证码的内容保存在当前用户的会话中
	req.session.captchaRegister = captcha.text.toLowerCase() //存储为小写形式
	console.log('服务器端保存的验证码1：', req.session.captchaRegister)
	
	//3.把验证码图片发送给客户端
	res.type('svg')		//修改响应消息头部Content-Type: image/svg+xml
	res.send(captcha.data)
})