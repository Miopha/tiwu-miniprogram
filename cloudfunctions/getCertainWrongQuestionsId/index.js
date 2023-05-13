// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;
  console.log('wrongQuestions.'+event.y+'.'+event.m+'.'+event.d)
  // wrongQuestions.2023.5.10
  return await DB.collection('userInfo').doc(openid).field({
    ['wrongQuestions.'+event.y+'.'+event.m+'.'+event.d]: true
  }).get();
}