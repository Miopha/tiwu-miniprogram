// pages/wrongQuestions/answerPage/answerPage.js
var app = getApp();
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading : 0,
    questions : [],
    sub: {
      type : String,
      value : 'my'
    },
    belong: {
      type : Number,
      value : 0
    },
    charactor: ['A','B','C','D'],
    choice : [],
    analysis : [],
    overall : false,
    currentQuestion : 0,
    wrongQuestionsId : [],
    y : 0,
    m : 0,
    d : 0,
    //存储计时器
    setInter: '',
    hour: 1,
    min: 1,
    sec: 1,
    showHour : '00',
    showMin : '00',
    showSec : '00'
  },
  /**
   * 一个异步任务
   * 1.获得传来的题单的题目信息
   */
  beginLoading(){
    this.setData({
      isLoading : 1
    });
    wx.showLoading({
      title : "获取数据中",
      mask : true
    });
  },
  reduceIsLoading(){
    this.setData({
      isLoading : this.data.isLoading-1
    });
    if(this.data.isLoading==0) wx.hideLoading();
  },
  // 获得传来的题单的题目信息
  generateQuestions(){
    wx.cloud.callFunction({
      name : "getQuestionsInfo",
      data : {
        questions : this.data.wrongQuestionsId
      }
    }).then(res=>{
      console.log("已获得错题信息:",res.result.data);
      this.setData({
        questions : res.result.data,
        choice : Array(res.result.data.length).fill(0),
        analysis : Array(res.result.data.length).fill(0)
      });
      this.reduceIsLoading();
    });
  },
  // 切换到总览
  switch2Overall(){
    this.setData({
      overall : !this.data.overall
    });
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
  // 提交当前状态到云端
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
          that._submitConfirmed(undone);
          wx.navigateBack();
        }else if(res.cancel){
          console.log("用户点击了取消")
        }
      }
    });
  },
  // 更新数据库的逻辑操作
  // 把做对的题目从错题集中删除
  // 保存没做对的题目
  // 覆盖云数据库中原来错题信息即可
  _submitConfirmed(undone){
    var that = this;
    // 保存没做对的题目的下标
    var incorrect = [];
    this.data.choice.forEach(function (value,index,obj){
      if(!that.data.analysis[index]||value!=that.data.questions[index].answer) incorrect.push(index);
    });
    console.log("此次没做对的题目为",incorrect);
    // 新的错题信息
    var newWrongQuestionsId = [];
    // 用双指针得到新的错题信息
    for(var i = 0, cnt = 0 ; i < this.data.wrongQuestionsId.length ; ++i){
      while(cnt<incorrect.length&&incorrect[cnt]<i) ++cnt;
      if(incorrect[cnt]==i) newWrongQuestionsId.push(this.data.wrongQuestionsId[i]);
    }
    // 得到新的错题信息
    console.log("得到新的错题信息",newWrongQuestionsId);
    // 如果错题全部做对，则删除当天的错题信息
    // 如果错题没有全部做对，则删除已经做对的错题
    wx.cloud.callFunction({
      name : "processWrongQuestions",
      data : {
        newWrongQuestionsId : newWrongQuestionsId,
        y : this.data.y,
        m : this.data.m,
        d : this.data.d
      }
    }).then(res=>{
      console.log(res);
    });
      // 记录错题
    var wrongQuestions = [];
    for(var i = 0 ; i < this.data.questions.length ; ++i){
      // 没做过的题目直接跳过
      // 错题
      if(this.data.analysis[i]&&this.data.choice[i]!=this.data.questions[i].answer){
        wrongQuestions.push({"_id":this.data.questions[i]._id,"sub":this.data.wrongQuestionsId[i].sub});
      }
    }
    console.log("此次做错的题目为",wrongQuestions);
    wx.cloud.callFunction({
      name : "updWrongQuestions",
      data : {
        wrongQuestions : wrongQuestions
      }
    }).then(res=>{

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
      title: '已收藏'
    });
    var QID = this.data.questions[this.data.currentQuestion]['_id'];
    console.log('收藏题目', QID);
    wx.cloud.callFunction({
      name: "collect",
      data:{
        QID: QID
      }
    }).then(res=>{});
  },
  feedback(){
    wx.showToast({
      title: '感谢你的反馈',
      icon: 'error'
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
      title: '已收藏'
    });
    var QID = this.data.questions[this.data.currentQuestion]['_id'];
    console.log('收藏题目', QID);
    wx.cloud.callFunction({
      name: "collect",
      data:{
        QID: QID
      }
    }).then(res=>{});
  },
  feedback(){
    wx.showToast({
      title: '感谢你的反馈',
      icon: 'error'
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
      title: '已收藏'
    });
    var QID = this.data.questions[this.data.currentQuestion]['_id'];
    console.log('收藏题目', QID);
    wx.cloud.callFunction({
      name: "collect",
      data:{
        QID: QID
      }
    }).then(res=>{});
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
    console.log("进入了错题答题页");
    this.beginLoading();
    var questions = JSON.parse(decodeURIComponent(options.questions));
    this.setData({
      wrongQuestionsId : questions,
      y : options.y,
      m : options.m,
      d : options.d
    })
    this.generateQuestions();
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
    this.queryTime();
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