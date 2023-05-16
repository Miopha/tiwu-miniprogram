// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();
const _ = DB.command

// 云函数入口函数
exports.main = async (event, context) => {
  return await DB.collection('userInfo').where({
    ZQSL: _.exists(true)
  }).field({
    'ZQSL.total': true,
    JCTS: true,
    userName: true,
    avatarSrc: true
  }).get();
}