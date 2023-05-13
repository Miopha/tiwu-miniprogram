// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();
const _ = DB.command;

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  return await DB.collection('userInfo').doc(openid).update({
    data:{
      ['valueSum.'+event.sub+'.'+event.belong]: _.remove()
    }
  });
}