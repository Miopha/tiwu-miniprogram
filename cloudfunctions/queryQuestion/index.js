// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const tasks = [];
  var promise = DB.collection('mzt').where({'_id': event.id}).get();
  tasks.push(promise);
  promise = DB.collection('my').where({'_id': event.id}).get();
  tasks.push(promise);
  promise = DB.collection('sx').where({'_id': event.id}).get();
  tasks.push(promise);
  promise = DB.collection('sg').where({'_id': event.id}).get();
  tasks.push(promise);
  promise = DB.collection('examination').where({'_id': event.id}).get();
  tasks.push(promise);
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  });
}