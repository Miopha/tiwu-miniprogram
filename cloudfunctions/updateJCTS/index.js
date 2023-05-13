// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  console.log('event', event)
  DB.collection('userInfo').doc(openid).field({
    JCTS: true,
    ZJSJ: true
  }).get().then(res=>{
    console.log(res)
    var JCTS;
    try{
      if(res.data.JCTS) JCTS = res.data.JCTS;
      else JCTS = 0;
    }catch(e){
      JCTS = 0;
    }
    try{
      if(res.data.ZJSJ==event.time) console.log(event.time);
      else JCTS += 1;
    }catch(e){
      JCTS += 1;
    }
    console.log('新坚持天数', JCTS);
    DB.collection('userInfo').doc(openid).update({
      data:{
        JCTS: JCTS,
        ZJSJ: event.time
      }
    })
  })
}