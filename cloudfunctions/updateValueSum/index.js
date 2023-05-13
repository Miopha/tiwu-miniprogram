// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();
const _ = DB.command;

// 云函数入口函数
exports.main = async (event, context) => {
  var openid = event.openid, questions = event.wrongQuestions, sub = questions[0]['sub'], total = event.wrongQuestions.length;
  DB.collection(sub).doc(questions[0]._id).field({
    belong: true
  }).get().then(res=>{
    console.log(res);
    var belong = res.data.belong;
    var subBelong = sub+'.'+belong;
    console.log('修改可做价值:', subBelong);
    var ids = [];
    for(var i = 0 ; i < questions.length ; ++i){
      ids.push(questions[i]._id);
    }
    console.log('题目id:', ids);
    DB.collection(sub).where({
      _id: _.in(ids)
    }).field({
      dif: true
    }).get().then(res=>{
      res = res.data;
      var totalDif = 0, cnt = 0;
      console.log('已获得题目难度系数', res);
      for(var i = 0 ; i < res.length ; ++i){
        if(res[i].hasOwnProperty('dif')){
          ++cnt;
          totalDif += Math.log(res[i]['dif']*10+1)
        }
      }
      totalDif += Math.log(0.5*10+1)*(total-cnt);
      console.log('得到难度系数之和', totalDif);
      DB.collection('userInfo').doc(openid).update({
        data:{
          ['valueSum.'+subBelong]: totalDif
        }
      }).then(res=>{
        console.log('更新成功')
      })
    });
  })
}