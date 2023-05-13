// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log("event",event);
  // 设置为东八区时间
  process.env.TZ ='Asia/Shanghai';
  // 获取用户id
  const wxContext = cloud.getWXContext();
  var openid = wxContext.OPENID;
  var ZTSL = event.hasOwnProperty('wrongQuestions')?event.wrongQuestions.length:0;
  // 更新题目用户做题数量、正确数量
  cloud.callFunction({
    name: "updateZTSL_ZQSL",
    data: {
      openid: openid,
      ZTSL: ZTSL,
      ZQSL: 0
    }
  });
  // 更新用户的可做价值
  cloud.callFunction({
    name: "updateValueSum",
    data:{
      openid: openid,
      wrongQuestions: event.wrongQuestions
    }
  }).then(res=>{});
  // 获得今天日期
  var date = new Date();
  var y = date.getFullYear();
  var m = date.getMonth()+1;
  var d = date.getDate();
  console.log("id:"+openid,y,m,d);
  DB.collection("userInfo").doc(openid).field({
    ["wrongQuestions."+y+"."+m+"."+d] : true
  }).get().then(res=>{
    var alreadyWrongQuestions;
    try{
      alreadyWrongQuestions = res.data.wrongQuestions[y][m][d];
    }catch(e){
      alreadyWrongQuestions = null;
    }
    const newWrongQuestions_info = new Map();
    // 把这次错过的题目放入map中
    event.wrongQuestions.forEach(function(value,index,obj){
      console.log(index,":",value);
      newWrongQuestions_info.set(value.sub+"-"+value._id,true);
      cloud.callFunction({
        name: "updDifference",
        data: {
          sub: value.sub,
          id: value._id,
          status: 0
        }
      });
    });
    // 如果本日已经错过这题，删除
    try{
      alreadyWrongQuestions.forEach(function(value,index,obj) {
        if(newWrongQuestions_info.has(value.sub+"-"+value._id)) newWrongQuestions_info.delete(value.sub+"-"+value._id);
      });
    }catch(e){console.log("新的一天");}
    console.log(newWrongQuestions_info);
    for(var [key] of newWrongQuestions_info.entries()){
      var add_info = key.split("-");
      try{
        DB.collection("userInfo").doc(openid).update({
          data :{
            ["wrongQuestions."+y+"."+m+"."+d] : DB.command.push({sub:add_info[0],_id:add_info[1]})
          }
        })
        console.log("错题"+key+",添加成功");
      }catch(e){
        console.error(e);
      }
    }
  });
}