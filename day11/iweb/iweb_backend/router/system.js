/**
 * 系统模块，包含如下功能点：
 *	10.1系统信息功能点
 *	10.2轮播广告列表功能点
 */
const express = require('express')
const pool = require('../pool')
let router = express.Router()    //创建路由器
module.exports = router

/**
 * 10.1系统信息功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/system/info
 * 请求参数：
 * 	无
 * 返回消息：
 * 	{
		logoUrl:'',			logo图片路径
		siteName:'',		网站名称
		adminMail:'',		管理员邮箱
		adminPhone:'',		管理员电话
		copyright:'',		版权声明
		companyName:'',		公司名称
		icp:'',
	}
 */
router.get('/system/info', (req, res, next)=>{
	let sql = 'SELECT logoUrl,siteName,adminMail,adminPhone,copyright,companyName,icp FROM basicInfo'
	pool.query(sql, (err, result)=>{
		if(err){
			next(err)
			return 
		}
		let output = result[0]
		res.send(output)
	})
})

/**
 * 10.2轮播广告列表功能点
 * 请求方法：
 * 	GET
 * 请求URL：
 * 	/carousel
 * 请求参数：
 * 	无
 * 返回消息：
 * 	[
		{cid:1, picUrl:'',href:'',title:''},
		...
 *	]
 */
router.get('/carousel', (req, res, next)=>{
	let sql = 'SELECT cid,picUrl,href,title FROM carousel ORDER BY cid'
	pool.query(sql, (err, result)=>{
		if(err){
			next(err)
			return 
		}
		let output = result
		res.send(output)
	})
})

