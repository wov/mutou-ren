
/*
 * GET test page.
 */

exports.test = function(req, res){
  res.render('test', { title: 'Express' })
};