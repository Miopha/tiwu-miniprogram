// pages/basic/answerPage/answerPage.js
var app = getApp();
var util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sub: {
      type : String,
      value : 'my'
    },
    belong: {
      type : Number,
      value : 0
    },
    charactor: ['A','B','C','D'],
    questions : [],
    choice : [],
    analysis : [],
    overall : false,
    currentQuestion : 0,
    //存储计时器
    setInter: '',
    hour: 1,
    min: 1,
    sec: 1,
    showHour : '00',
    showMin : '00',
    showSec : '00'
  },
  // 提交题目
  submit(){
    var that = this;
    let undone = [];
    // 检查每一题是否做完
    this.data.analysis.forEach(function(value, index, obj){
      if(!value) undone.push(index+1);
    });
    console.log(undone.length?"有题目未完成":"全部题目已完成");
    wx.showModal({
      title: undone.length?"有题目未完成":"全部题目已完成",
      content: undone.length?undone.toString()+"题未完成，确认提交？":"确认提交吗？",
      success: function (res){
        if(res.confirm){
          console.log("用户点击了确定");
          that._score();
          wx.navigateBack();
        }else if(res.cancel){
          console.log("用户点击了取消")
        }
      }
    });
  },
  beginLoading(){
    this.setData({
      isLoading : 1
    });
    wx.showLoading({
      title : "组装试卷中",
      mask : true
    });
  },
  reduceIsLoading(){
    console.log("123213");
    this.setData({
      isLoading : this.data.isLoading - 1
    });
    if(this.data.isLoading==0) wx.hideLoading();
  },
  // 切换到总览
  switch2Overall(){
    this.setData({
      overall : !this.data.overall
    });
  },
  _score(){
    var total = 0, score = 0;
    for(var i = 0 ; i < this.data.questions.length ; ++i){
      if(this.data.questions[i].answer==this.data.choice[i]){
        score += this.data.questions[i]['multipleChoice']?2:1
      }
      total += this.data.questions[i]['multipleChoice']?2:1
    }
    console.log('获得分数',score,"/",total);
    setTimeout(() => {
      wx.showModal({
        title: '考试完成',
        content: '你的分数是'+score+'/'+total,
        complete: (res) => {
          if (res.cancel) {
            
          }
      
          if (res.confirm) {
            
          }
        }
      })
    }, 1000);

  },
  // 更新所选状态
  updChoice(e){
    var id = (Number)(e.currentTarget.id)
    var thisQ = Math.floor(id/4);
    // 此题目已经被答过
    if(this.data.analysis[thisQ]) return 0;
    var thisC = id%4;
    if(this.data.questions[thisQ].multipleChoice){
      this.setData({
        ['choice['+thisQ+']'] : this.data.choice[thisQ]^(1<<thisC)
      });
    }else{
      this.setData({
        ['choice['+thisQ+']'] : (1<<thisC)
      });
    }
  },
  // 验证选项是否正确，按钮触发函数
  verify(e){
    let thisQ = e.target.dataset.questions;
    // 没选任何选项
    if(!this.data.choice[thisQ]) return 0;
    if(this.data.choice[thisQ]==this.data.questions[thisQ].answer){
      console.log("第"+thisQ+"题回答正确");
      if(this.data.currentQuestion+1<this.data.analysis.length){
        this.setData({
          currentQuestion : this.data.currentQuestion+1
        });
      }
    }else{
      console.log("第"+thisQ+"题回答错误");
    }
    this.setData({
      ['analysis['+thisQ+']'] : 1
    });
  },
  // 页面发生变化
  swiperIndexChanged(e){
    console.log("切换到第"+e.detail.current+"题");
    this.setData({
      currentQuestion : e.detail.current
    });
  },
  // 在总览中切换题目
  changeCurrentQuestion(e){
    console.log("在总览中切换到第"+e.target.dataset.gotoquestion+"题");
    this.setData({
      currentQuestion : e.target.dataset.gotoquestion,
      overall : false
    });
  },
  queryTime(){
        var that = this;
        // 获取开始时间
        var beginTime = util.formatTime(new Date());
        console.log(beginTime)
        console.log("开始计时")
        //将计时器赋值给setInter
        that.data.setInter = setInterval(
          function () {
            if (that.data.sec != 60) {
              if (that.data.sec <= 9) {
                let showSec = '0' + that.data.sec
                that.setData({
                  showSec: showSec,
                  sec: that.data.sec + 1,
                })
              } else {
                that.setData({
                  showSec: that.data.sec,
                  sec: that.data.sec + 1,
                })
              }
            } else {
              if (that.data.min != 60) {
                // 60s 进 1min
                if (that.data.min <= 9) {
                  let showMin = '0' + that.data.min
                  that.setData({
                    sec: 0,
                    showSec: "00",
                    showMin: showMin,
                    min: that.data.min + 1,
                  })
                } else {
                  that.setData({
                    sec: 0,
                    showSec: "00",
                    showMin: that.data.min,
                    min: that.data.min + 1,
                  })
                }
              } else {
                // 60min 进 1hour
                if (that.data.hour != 24) {
                  if (that.data.hour <= 9) {
                    let showHour = '0' + that.data.hour
                    that.setData({
                      min: 0,
                      showMin: "00",
                      showHour: showHour,
                      hour: that.data.hour + 1,
                    });
                  } else {
                    that.setData({
                      min: 0,
                      showMin: "00",
                      showHour: that.data.hour,
                      hour: that.data.hour + 1,
                    });
                  }
                } else {
                  //24小时
                  var endTime = util.formatTime(new Date());
                  console.log(endTime)
  
                  console.log("结束计时")
                  //清除计时器  即清除setInter
                  clearInterval(that.data.setInter);
                  that.setData({
                    showModal: false,
                    showStop: false,
                    sec: 1,
                    min: 1,
                    hour: 1,
                    showSec: "00",
                    showMin: "00",
                    showHour: "00"
                  })
                }
              }
            }
          }, 1000);
  },
  showAnalysis(){
    this.setData({
      ['analysis['+this.data.currentQuestion+']'] : 1
    })
  },
  collect(){
    wx.showToast({
      title: '此题目不允许收藏'
    });
  },
  feedback(){
    wx.showToast({
      title: '感谢你的反馈',
      icon: 'error'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.beginLoading();
    this.queryTime();
    wx.cloud.callFunction({
      name: "generateExamByGeneticAlgorithm"
    }).then(res=>{
      console.log('已自动组装试卷:', res);
      res = res.result.s
      this.setData({
        questions : res.problemList,
        choice : Array(res.problemList.length).fill(0),
        analysis : Array(res.problemList.length).fill(0),
      });
      this.reduceIsLoading();
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

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