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
          that._submitConfirmed(undone);
          wx.navigateBack();
        }else if(res.cancel){
          console.log("用户点击了取消")
        }
      }
    });
  },
  // 把结果提交到云端，并修改数据库
  _submitConfirmed(){
    wx.cloud.callFunction({
      name: "getUserInfo_subjectbelong",
      data: {
        sub: this.data.sub,
        belong: this.data.belong,
        userId: app.globalData.userInfo.userId
      }
    }).then(res=>{
      let addition = [];
      console.log(res);
      const questions_info = new Map();
      try{
        res.result.data[this.data.sub][this.data.belong].forEach(function(value,index,obj) {
            questions_info.set(value,true);
        });
      }catch(e){
        console.log("数据库不存在");
        wx.cloud.callFunction({
          name: "updUserInfo_subjectBelongList",
          data: {
            sub: this.data.sub,
            belong: this.data.belong,
            userId: app.globalData.userInfo.userId,
            add: this.data.sub+'.'+this.data.belong
          }
        }).then(res=>{
          console.log(res);
        });
      };
      console.log("用户已做过的题目：",questions_info);
      for(var i = 0, length = this.data.questions.length ; i < length ; ++i){
        if(this.data.choice[i]==this.data.questions[i].answer&&!questions_info.has(this.data.questions[i]._id)){
          addition.push(this.data.questions[i]._id);
        }
      };
      console.log("用户在此次答题中做对且需要添加到数据库中的题目：",addition);
      wx.cloud.callFunction({
        name: "updUserInfo_subjectBelongList",
        data: {
          sub: this.data.sub,
          belong: this.data.belong,
          userId: app.globalData.userInfo.userId,
          add: addition
        }
      }).then(res=>{
         console.log("已添加",res);
      });
    });
    // 记录错题
    var wrongQuestions = [], sub = [];
    for(var i = 0 ; i < this.data.questions.length ; ++i){
      // 没做过的题目直接跳过
      // 错题
      if(this.data.analysis[i]&&this.data.choice[i]!=this.data.questions[i].answer){
        wrongQuestions.push({_id:this.data.questions[i]._id,sub:this.data.sub});
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
  // 切换到总览
  switch2Overall(){
    this.setData({
      overall : !this.data.overall
    });
  },
  // 更新所选状态
  updChoice(e){
    let thisQ = e.target.dataset.questions;
    // 此题目已经被答过
    if(this.data.analysis[thisQ]) return 0;
    let thisC = e.target.dataset.choice;
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
  // 重置此章节
  reset(){
    console.log("此章节重置了");
    wx.cloud.callFunction({
      name:"resetChapter",
      data: {
        userId : app.globalData.userInfo.userId,
        sub : this.data.sub,
        belong : this.data.belong
      }
    }).then(res=>{
      console.log(res);
    })
  },
  // 根据userDid，得到用户已经做过的题目
  set(userDid){
    console.log("userDid=",userDid);
    var that = this;
    var questions_info = new Map();
    // 把用户做过的题目放入map中
    userDid.forEach(function(value,index,obj){
      questions_info.set(value,true);
    });
    // 检测当前题目是否做过
    this.data.questions.forEach(function(value,index,obj){
        if(questions_info.has(value._id)){
          that.setData({
            ['choice['+index+']'] : value.answer,
            ['analysis['+index+']'] : true
          });
        }
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
    var QID = this.data.questions[this.data.currentQuestion]._id;
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
    var questions = [];
    wx.cloud.callFunction({
      name: 'getCollection'
    }).then(res=>{
      var len = res.result.data.collection.length;
      console.log('res', res);
      if(res.result.data.collection){
        for(var i in res.result.data.collection){
          wx.cloud.callFunction({
            name: "queryQuestion",
            data: {
              id: res.result.data.collection[i]
            }
          }).then(res=>{
            questions.push(res.result.data[0]);
            if(questions.length==len){
              this.setData({
                questions : questions,
                analysis : Array(questions.length).fill(1)
              });
            }
          })
        }
      }
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