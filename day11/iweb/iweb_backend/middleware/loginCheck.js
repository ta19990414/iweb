/**
 * 登录检查中间件，用于需要进行登录检验的路由或路由器之前
 */
module.exports = function(req, res, next){
	if(!req.session || !req.session.userInfo){
		let output = {
			code: 490,
			msg: 'login required'
		}
		res.send(output)
		return
	}
	next() //用户已经登录了，放行，继续执行后续的中间件或路由
}