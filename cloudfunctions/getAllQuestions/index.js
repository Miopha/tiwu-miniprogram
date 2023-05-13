// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
DB = cloud.database();
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  // 先去除集合记录的总数
  const countResult = await DB.collection(event.sub).count();
  const total = countResult.total;
  // 计算需分几次取
  const batchTimes = Math.ceil(total/100);
  const tasks = [];
  for(var i = 0 ; i < batchTimes ; ++i){
    const promise = DB.collection(event.sub).skip(i*MAX_LIMIT).limit(MAX_LIMIT).field({
      _id : true,
      belong : true
    }).get();
    tasks.push(promise);
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}