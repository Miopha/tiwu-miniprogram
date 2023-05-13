// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  var addition = event.hasOwnProperty('add')?event.add.length:0
  cloud.callFunction({
    name: "updateZTSL_ZQSL",
    data:{
      openid: event.userId,
      ZTSL: addition,
      ZQSL: addition
    }
  }).then(res=>{
    console.log('添加成功', res)
  });
  if(event.add){
    for(var i = 0 ; i < event.add.length ; ++i){
      cloud.callFunction({
        name: "updDifference",
        data: {
          sub: event.sub,
          id: event.add[i],
          status: 1
        }
      });
    }
  }
  try{
    return await DB.collection("userInfo").doc(event.userId).update({
      data: {
        [event.sub+'.'+event.belong] : DB.command.push(event.add)
      }
    })
  }catch(e){
    console.error(e);
  }
}