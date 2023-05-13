// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();
const _ = DB.command;

// 云函数入口函数
exports.main = async (event, context) => {
  // event.sub 科目
  // event.id 题目id
  // event.status = 1 表示做对，否则做错
  event.status = (Number)(event.status);
  console.log(event)
  DB.collection(event.sub).doc(event.id).update({
    data: {
      'correct': _.inc(event.status==1?1:0),
      'total': _.inc(1)
    }
  }).then(res=>{
    console.log('题目', event.id, '更新成功');
    DB.collection(event.sub).doc(event.id).field({
      'correct': true,
      'total': true,
      'dif': true
    }).get().then(res=>{
      console.log('获得题目数据', res);
      var correct = res.data.correct;
      var total = res.data.total;
      var dif = res.data.hasOwnProperty('dif')?res.data.dif:0.5;
      if(res.data.total%5==0){
        console.log('更新难度系数');
        var r = correct/5
        console.log(r);
        dif = (r-dif)*0.1+dif
        console.log('新的难度系数为', dif);
        correct = 0; // 重置做对人数
      }
      // 更新题目难度系数
      DB.collection(event.sub).doc(event.id).update({
        data:{
          'correct': correct,
          'total': total,
          'dif': dif
        }
      }).then(res=>{
        console.log('题目难度系数更新成功');
      })
    })
  })
}