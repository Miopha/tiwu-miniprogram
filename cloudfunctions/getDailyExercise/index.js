// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const DB = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  DB.collection('dailyExercise').where({
    'belong': event.belong
  }).get().then(q=>{
    console.log('当天已有试题', q.data.length);
    if(q.data.length<10){
      cloud.callFunction({
        name: "randomQuestion",
        data: {
          num: 10-q.data.length
        }
      }).then(res=>{
        for(var key in res.result.list)
          if(res.result.list[key].hasOwnProperty('answer')){
            q.data.push(res.result.list[key]);
            var cnt = 0;
            for(var i = 0 ; i < 4 ; ++i)
              cnt += !!(res.result.list[key].answer&(1<<i))
            DB.collection('dailyExercise').add({
              data: {
                description: res.result.list[key].description,
                analysis: res.result.list[key].analysis,
                answer: res.result.list[key].answer,
                choice: res.result.list[key].choice,
                multipleChoice: cnt>1,
                belong: event.belong
              }
            }).then(res1=>{
              console.log('题目已生成', res.result.list[key])
            })
            if(q.data.length==10)
            return q;
          }
        console.log(q)
      })
    }else{
      return q;
    }
  })
}