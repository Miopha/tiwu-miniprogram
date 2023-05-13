// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return await DB.collection('systemInfo').doc('b86b5a57645a17e3001bef7a0a690718').get()
}