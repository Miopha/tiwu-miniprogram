// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  return await DB.collection(event.sub).where({belong:event.belong}).orderBy('_id','asc').get();
}