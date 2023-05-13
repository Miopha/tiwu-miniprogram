// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;
  return await DB.collection('feedback').add({
    data: {
      _createTime: event.currentTime,
      _updateTime: event.currentTime,
      content: event.content,
      file: event.fileIDs,
      openid: openid,
      type: event.type,
      time: event.currentTime
    }
  })
}