// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();
const _ = DB.command;

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('新增正确数量', event.ZQSL)
  console.log('新增做题数量', event.ZTSL)
  console.log('此用户id', event.openid);
  // 设置为东八区时间
  process.env.TZ ='Asia/Shanghai';
  // 获取用户id
  var openid = event.openid;
  console.log(openid);
  // 获得今天日期
  var date = new Date();
  var y = date.getFullYear();
  var m = date.getMonth()+1;
  var d = date.getDate();
  var ymd = y+"-"+m+"-"+d;
  return await DB.collection('userInfo').doc(openid).update({
    data: {
      ['ZQSL.'+ymd]: _.inc(event.ZQSL),
      ['ZTSL.'+ymd]: _.inc(event.ZTSL),
      'ZQSL.total': _.inc(event.ZQSL),
      'ZTSL.total': _.inc(event.ZTSL)
    }
  });
}