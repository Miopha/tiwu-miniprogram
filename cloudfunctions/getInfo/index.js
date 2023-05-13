// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();
const _ = cloud.database().command;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  var subjects = DB.collection('userInfo').doc('subOfAll').get();
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      var res = {s:subjects}
      resolve(res)
    },3015)
  })
}