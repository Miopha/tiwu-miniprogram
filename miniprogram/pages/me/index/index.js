import * as echarts from '../../../ec-canvas/echarts';
var that = this;
const defaultAvatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const app = getApp();
// 每日做题数量
var ZTSL = {};
// 每日累计正确率
var ZQL = {};
// 做题总数
var ZTZS = 0;
// 正确总数
var ZQZS = 0;
// 掌握度
var ZWD = {
  data: [0, 0, 0, 0],
  sub: ['毛中特', '马原', '史纲', '思修']
}
function setOption(chart, xdata, ydata, title) {
  var option = {
    grid: {
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xdata,
      // show: false
    },
    yAxis: {
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
    },
    series: [{
      name: title,
      type: 'line',
      smooth: true,
      data: ydata,
      itemStyle: {
        normal: {
          color: '#ffb71b',
          lineStyle: {        // 系列级个性化折线样式  
            width: 4,
            type: 'solid',
            color: new echarts.graphic.LinearGradient(0, 0.4, 0.7, 1, [{
              offset: 0,
              color: '#ffb71b'
            } , {
              offset: 0.4,
              color: '#b75cee'
            }, {
              offset: 0.7,
              color: '#66acfc'
            }, {
              offset: 1,
            color: '#3843fa'
          }]),//线条渐变色  
          }
        },
      }
    }],
    dataZoom: [
      {
        type: "slider",
        show: true,
        start: 60,
        end: 100,
        xAxisIndex: [0],
      },
    ],
  };
  chart.setOption(option);
  return chart;
}

function setRadarOption(chart, ydata) {
  var mx = ydata[0];
  for(var i = 1 ; i < 4 ; ++i) mx = Math.max(mx,ydata[i]);
  var option = {
    backgroundColor: "#ffffff",
    title: {
      text: '科目掌握程度',
      left: 'center',
      show: false
    },
    xAxis: {
      show: false
    },
    yAxis: {
      show: false
    },
    radar: {
      shape: 'circle',
      indicator: [{
        name: '毛中特',
        max: mx
      },
      {
        name: '马原',
        max: mx
      },
      {
        name: '史纲',
        max: mx
      },
      {
        name: '思修',
        max: mx
      }
      ]
    },
    series: [{
      type: 'radar',
      data: [{
        value: ydata,
      }]
    }]
  };
  console.log('ydata', ydata)
  chart.setOption(option);
  return chart;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    subMapping:{
      mzt: '毛中特',
      my: '马原',
      sg: '史纲',
      sx: '思修'
    },
    valueSumLen: 0,
    valueSum: [],
    dailyWrong: [],
    dailyFinished: false,
    daily: "../../../images/mission_unfinished.png",
    avatarSrc : defaultAvatar,
    userName : "未设置",
    autoRemove :{
      type: 'string',
      value: '0'
    },
    ec1: {
      lazyLoad: true
      // onInit: initChart1
    },
    ec2: {
      lazyLoad: true
      // onInit: initChart2
    },
    ec3: {
      // onInit: initChart3
      lazyLoad: true
    },
    rank_ZQSL:[
      {
        name : "iced Tead",
        total : 200
      },{
        name : "gustavo",
        total : 50
      }
    ],
    rank_JCTS:[],
    ZTSL:{
    }
  },
  getPhoneNumber(e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
  },
  goUserInfo(){
    wx.navigateTo({
      url: '/pages/me/userInfo/userInfo',
    })
  },
  setAutoRemove(){
    this.setData({
      autoRemove : this.data.autoRemove=='0'?'1':'0'
    });
    wx.cloud.callFunction({
      name: "updateAutoRemove",
      data: {
        autoRemove: this.data.autoRemove
      }
    }).then(res=>{

    })
  },
  setClipboard(){
    wx.setClipboardData({
      data: app.globalData.userInfo.userId,
      success(res){
        wx.showToast({
          title: '已复制到粘贴版',
          icon: 'success'
        })
      }
    })
  },
  goFeedback(){
    wx.navigateTo({
      url: '/pages/me/feedback/feedback',
    });
  },
  deleteInfo(){
    wx.showModal({
      title: '清除账号所有数据',
      content: '确认删除吗？',
      confirmColor: `rgb(250,33,12)`,
      complete: (res) => {
        if (res.cancel) {
          console.log('用户点击了取消');
        }
        if (res.confirm) {
          console.log('删除数据！！');
          wx.cloud.callFunction({
            name: "deleteUserInfo"
          });
        }
      }
    })
  },
  enterCollection(){
    wx.navigateTo({
      url: '/pages/me/collectionAnswerPage/collectionAnswerPage',
    })
  },
  formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return [year, month, day];
    return year+"-"+month+"-"+day
  },
  init_one: function(xdata, ydata){
    this.oneComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
          width: width,
          height: height
      });
      setOption(chart, xdata, ydata, '做题数量')
      this.chart = chart;
      return chart;
    });
  },
  init_two: function(xdata, ydata){
    this.twoComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
          width: width,
          height: height
      });
      setOption(chart, xdata, ydata, '正确率')
      this.chart = chart;
      return chart;
    });
  },
  init_three: function(ydata){
    this.threeComponent.init((canvas, width, height) => {
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      setRadarOption(Chart, ydata);
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    })
  },
  fetchSub(sub, index){
    wx.cloud.callFunction({
      name: "getUserDid",
      data: {
        userId: app.globalData.userInfo.userId,
        sub: sub
      }
    }).then(res1=>{
      wx.cloud.callFunction({
        name: "getAllQuestions",
        data: {
          sub: sub
        }
      }).then(res2=>{
        const questions_info = new Set();
        var cnt = 0;
        // 把m个题库中的题目的id放入set里
        res2.result.data.forEach(function(value,index,obj){
          questions_info.add(value._id);
        });
        // 遍历n个已做过的题目，检查是否在set中
        // i: 第i章节
        for(var i = 0 ; i < 50 ; ++i){
          var thisDid = 0;
          try{
            res1.result.data[sub][i].forEach(function(value,index,obj) {
              if(questions_info.has(value)) ++thisDid;
            });
          }catch(e){}
          cnt += thisDid;
        }
        // 修改已做过题目did
        if(res2.result.data.length-1>0)
          ZWD['data'][index] = 1.0*cnt/(res2.result.data.length-1);
        else
          ZWD['data'][index] = 0;
        if(index==3) this.init_three(ZWD.data);
      })
    })
  },
  fetchVisData(){
    wx.cloud.callFunction({ // 获得做题数量，正确率
      name: "getZTSL"
    }).then(res=>{
      console.log(res);
      var ymd = this.formatTime(new Date());
      ZTSL = {x:[], y:[]};
      ZQL = {x:[], y:[]};
      ZTZS = ZQZS = 0;
      for(var d = 1 ; d <= ymd[2] ; ++d){
        ZQL.x.push(ymd[0]+"-"+ymd[1]+"-"+d)
        ZTSL.x.push(ymd[0]+"-"+ymd[1]+"-"+d)
        if(res.result.data.hasOwnProperty('ZTSL')&&res.result.data.ZTSL.hasOwnProperty(ymd[0]+"-"+ymd[1]+"-"+d)){
          ZTSL.y.push(res.result.data.ZTSL[ymd[0]+"-"+ymd[1]+"-"+d]);
          ZTZS += res.result.data.ZTSL[ymd[0]+"-"+ymd[1]+"-"+d];
          ZQZS += res.result.data.ZQSL[ymd[0]+"-"+ymd[1]+"-"+d];
        }else{
          ZTSL.y.push(0);
        }
        if(ZTZS!=0) ZQL.y.push(ZQZS/ZTZS);
        else ZQL.y.push(0);
      }
      this.init_one(ZTSL.x, ZTSL.y);
      this.init_two(ZQL.x, ZQL.y);
      console.log('已获得做题数量', ZTSL);
      console.log('已获得做题正确率', ZQL);
    });
    this.fetchSub('mzt', 0);
    this.fetchSub('my', 1);
    this.fetchSub('sg', 2);
    this.fetchSub('sx', 3);
    console.log('已获得掌握度', ZWD);
  },
  fetchRank(){
    wx.cloud.callFunction({
      name: "getRank"
    }).then(res=>{
      res = res.result.data;
      console.log('已获得rank数据', res);
      var rank_JCTS = [];
      for(var i = 0 ; i < res.length ; ++i){
        rank_JCTS.push({
          'JCTS': res[i].JCTS,
          'avatarSrc': res[i].hasOwnProperty('avatarSrc')?res[i]['avatarSrc']:defaultAvatar,
          'userName': res[i].hasOwnProperty('userName')?res[i]['userName']:'神秘用户'
        });
      }
      var cmp = function(x, y){
        return x.JCTS>y.JCTS?-1:1
      }
      rank_JCTS = rank_JCTS.sort(cmp)
      this.setData({
        rank_JCTS: rank_JCTS
      });
      console.log('坚持天数排行榜', rank_JCTS);
      var rank_ZQSL = [];
      for(var i = 0 ; i < res.length ; ++i){
        rank_ZQSL.push({
          'ZQSL': res[i].hasOwnProperty('ZQSL')?res[i]['ZQSL']['total']:0,
          'avatarSrc': res[i].hasOwnProperty('avatarSrc')?res[i]['avatarSrc']:defaultAvatar,
          'userName': res[i].hasOwnProperty('userName')?res[i]['userName']:'神秘用户'
        });
      }
      var cmp = function(x, y){
        return x.ZQSL>y.ZQSL?-1:1
      }
      rank_ZQSL = rank_ZQSL.sort(cmp)
      this.setData({
        rank_ZQSL: rank_ZQSL
      });
      console.log('正确数量排行榜', rank_ZQSL);
    })
  },
  getNowFormatDate() {
    return new Date(new Date(new Date().toLocaleDateString()).getTime()).valueOf()
  },
  recommandation(){
    // 检测每日练习是否完成
    wx.cloud.callFunction({
      name: "getZJSJ"
    }).then(res=>{
      if(res.result.data.hasOwnProperty('ZJSJ')&&res.result.data.ZJSJ==this.getNowFormatDate()){
        this.setData({
          dailyFinished: true,
          daily: "../../../images/mission_finished.png"
        });
      }else{
        this.setData({
          dailyFinished: false,
          daily: "../../../images/mission_unfinished.png"
        })
      }
    });
    // 做题价值推荐算法
    wx.cloud.callFunction({
      name: 'getValueSum'
    }).then(res=>{
      res = res.result.data;
      console.log('已获得做题价值', res);
      if(res.hasOwnProperty('valueSum')){
        this.setData({
          valueSumLen: 0,
          valueSum: []
        });
        this.process('mzt', res['valueSum']);
        this.process('my', res['valueSum']);
        this.process('sg', res['valueSum']);
        this.process('sx', res['valueSum']);
        console.log(this.data.valueSum);
        var cmp = function(x, y){
          return x.value>y.value?-1:1;
        }
        this.data.valueSum.sort(cmp);
        this.setData({
          valueSum: this.data.valueSum
        });
      }
    })
  },
  process(sub, valueSum){
    if(valueSum.hasOwnProperty(sub)){
      for(var key in valueSum[sub]){
        this.data.valueSum.push({
          sub: sub,
          belong: key,
          value: valueSum[sub][key],
          belongVis: this.convertToChineseNumeral((Number)(key)+1)
        });
        this.setData({
          valueSumLen: this.data.valueSumLen+1
        });
      }
    }
  },
  generate(res, value){
    var ymd = this.dateBefore(value);
    try{
      if(res['wrongQuestions'][ymd[0]][ymd[1]][ymd[2]]){
        this.data.dailyWrong.push({
          date: ymd[1]+'月'+ymd[2]+'日',
          done: false
        })
      }else{
        this.data.dailyWrong.push({
          date: '无记录',
          done: true
        })
      }
    }catch(e){
      this.data.dailyWrong.push({
        date: '无记录',
        done: true
      })
    }
  },
  dateBefore(value){
    var curTime = new Date().getTime();
    var date = curTime - (value * 3600 * 24 * 1000);
    date = new Date(date);
    var year = ""+date.getFullYear();
    var month = ""+(date.getMonth() + 1);
    var day = ""+date.getDate();
    return [year, month, day]
  },
  fetchDailyWrong(){
    wx.cloud.callFunction({
      name: "getWrongQuestions"
    }).then(res=>{
      this.setData({
        dailyWrong: []
      });
      res = res.result.data;
      console.log('已获得错题数据', res['wrongQuestions']['2023']['5']['10']);
      this.generate(res, 3);
      this.generate(res, 7);
      this.generate(res, 30);
      this.setData({
        dailyWrong: this.data.dailyWrong
      })
    })
  },
  enterDaily(){
    if(this.data.dailyFinished) return ;
    wx.navigateTo({
      url: '/pages/basic/dailyExercisePage/dailyExercisePage',
    })
  },
  enterDailyWrong(){
    for(var i = 0 ; i < 3 ; ++i){
      if(!this.data.dailyWrong[i].done){
        var date = this.data.dailyWrong[i].date;
        var y = 2023, m = 0, d = 0, j = 0;
        for(; j<date.length ; ++j){
          if(isNaN(Number(date[j]))) break;
          m = m*10+(Number)(date[j])
        }
        ++j;
        for(; j<date.length ; ++j){
          if(isNaN(Number(date[j]))) break;
          d = d*10+(Number)(date[j])
        }
        wx.cloud.callFunction({
          name: "getCertainWrongQuestionsId",
          data: {
            y: y,
            m: m,
            d: d
          }
        }).then(res=>{
          var wrongQuestionsData = res.result.data.wrongQuestions[y.toString()][m.toString()][d.toString()];
          console.log('已获得错题数据', wrongQuestionsData);
          wrongQuestionsData = encodeURIComponent(JSON.stringify(wrongQuestionsData));
          wx.navigateTo({
            url: '/pages/wrongQuestions/answerPage/answerPage?questions='+wrongQuestionsData+'&y=2023&m='+m+'&d='+d,
          });
        })
        this.data.dailyWrong[i].done = true
        this.setData({
          dailyWrong: this.data.dailyWrong
        })
        console.log(i)
        break;
      }
    }
  },
  enterSubAnswer(){
    if(this.data.valueSum.length<=0) return ;
    var data = this.data.valueSum.shift();
    this.setData({
      valueSum: this.data.valueSum,
      valueSumLen: this.data.valueSumLen-1
    });
    wx.cloud.callFunction({
      name: 'delValueSum',
      data:{
        sub: data.sub,
        belong: data.belong
      }
    }).then(res=>{});
    wx.navigateTo({
      url: "/pages/basic/answerPage/answerPage?sub="+data.sub+"&belong="+data.belong+"&reset=1"+"&userDid=0",
    });
  },
  convertToChineseNumeral(num) {
    if (num == 10) {
      return '十'
    } else if (num == 1) {
      return '一'
    }
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const units = ['', '十', '百', '千', '万'];
    let result = '';
    let numStr = num.toString();
    for (let i = 0; i < numStr.length; i++) {
      let digit = parseInt(numStr.charAt(i));
      let unit = units[numStr.length - i - 1];
      if (digit === 0) {
        // 当前数字为0时不需要输出汉字，但需要考虑上一个数字是否为0，避免出现连续的零
        if (result.charAt(result.length - 1) !== '零') {
          result += '零';
        }
      } else {
        result += digits[digit] + unit;
      }
    }
    // 对于一些特殊的数字，如10、100等，需要在最前面加上“一”
    if (result.charAt(0) === '一') {
      result = result.substr(1, result.length);
    } else if (result.charAt(0) === '百') {
      result = '一' + result;
    } else if (result.charAt(0) === '千') {
      result = '一' + result;
    }
    return result;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.fetchDailyWrong();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.oneComponent = this.selectComponent('#mychart-one'); 
    this.twoComponent = this.selectComponent('#mychart-two'); 
    this.threeComponent = this.selectComponent('#mychart-three'); 
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.cloud.callFunction({
      name : "getUserInfomation"
    }).then(res=>{
      var avatarSrc, userName, email, school, autoRemove;
      try{
        avatarSrc = res.result.data.avatarSrc;
      }catch(e){
        avatarSrc = defaultAvatar;
      }
      if(res.result.data.avatarSrc){
        avatarSrc = res.result.data.avatarSrc;
      }else{
        avatarSrc = "";
      }
      if(res.result.data.userName){
        userName = res.result.data.userName;
      }else{
        userName = "";
      }
      if(res.result.data.email){
        email = res.result.data.school;
      }else{
        email = "";
      }
      if(res.result.data.school){
        school = res.result.data.school;
      }else{
        school = "";
      }
      if(res.result.data.autoRemove){
        autoRemove = res.result.data.autoRemove;
      }else{
        autoRemove = '0';
      }
      this.setData({
          avatarSrc : avatarSrc,
          userName : userName,
          email : email,
          school : school,
          autoRemove : autoRemove
      });
    });
    this.fetchVisData();
    this.fetchRank();
    this.recommandation();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})