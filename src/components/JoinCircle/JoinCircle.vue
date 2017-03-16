<template>
  <a @click="joinEvent" class="join_circle" v-if="onOff">{{text}}</a>
</template>

<style>
  .join_circle {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0.96rem;
    line-height: 0.96rem;
    background: #ff3838;
    font-size: 0.34rem;
    color: #fff;
  }
</style>

<script>
  export default {
    name: 'joincircle',
    props: {
      circleId: {
        type: String,
        default: ''
      },
      userId: {
        type: String,
        default: ''
      },
      followerId: {
        type: String,
        default: ''
      },
      joinWay: {
        type: Number,
        default: 4
      },
      text: {
        type: String,
        default: "加入社群"
      },
      onOff: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        baseUrls: {
          joinOnPayUrl: '/zhangmen/circle/circle-pay',            //付费加群跳转页面URL
          joinOnVipUrl: '/vip/`${this.circleId}`/product/list',   //会员加群跳转页面URL
          faildAuthUrl: '/zhangmen/community/qualified/list',
          joinAuthApiUrl: '/api/zm/circle/beforejoin',            //用户是否有访问权限的api请求地址
          joinApiUrl: '/api/zm/w/circle/circle-web-join/',         //执行加群操作api请求地址
          hostUrl: window.location.href                            //当前页URL
        }
      }
          ;
    },
    computed: {},
    methods: {
      /**
       * 加群事件函数
       */
      joinEvent(){
        switch (this.joinWay) {
          case 8:// 入群类型为 会员入群
            this.joinOnVip(circleId, userId, bizType, type);
            break;
          case 4:// 入群类型为 付费入群
            this.joinOnPay(circleId, userId, bizType, type);
            break;
          default://其它入群方式
            this.joinOnOther(circleId, userId, bizType, type);
            break;
        }
      },
      /**
       * 处理付费类型的入群操作
       */
      joinOnPay(){
        var url = this.baseUrls.joinOnPayUrl + '?';
        url += "circleId=" + this.circleId;
        url += "&userId=" + this.userId;
        url += "&bizType=joinCirclePay";
        url += "&liveChargeCallback=" + this.baseUrls.hostUrl;
        url += "&followerId=" + this.followerId;
        window.location.href = url;
      },
      /**
       * 处理会员类型的入群操作
       */
      joinOnVip(bizType, type){
        var url = this.baseUrls.joinOnPayUrl + '?';
        url += "userId=" + this.userId;
        url += "&noJoin=0";
        url += "&liveChargeCallback=" + this.baseUrls.hostUrl;
        url += "&followerId=" + this.followerId;
        window.location.href = url;
      },
      /**
       * 其它类型入群操作：需要先校验是否有入群资格，然后入群
       */
      joinOnOther(){
        var flag = this.hasJoinAuth();
        if (flag == 0) {
          this.doJoin();
        }
      },
      /**
       * 判断用户是否有入群资格
       */
      hasJoinAuth(userId, circleId){
        this.$http.get(this.baseUrls.joinAuthApiUrl, {userId, circleId})
        .then((res) => {
          return res.body.code;
          //请求成功后 需要的业务。
        })

        var num = "";
        var that = circleS;
        $.ajax({
          type: "get",
          url: this.baseUrls.joinAuthApiUrl,
          data: {
            userId: userId,
            circleId: circleId,
          },
          dataType: "json",
          async: false,
          success: function (data, textStatus) {
//            直接跳转地址
            var joinstate = data.code;
            if (joinstate != 0) {
              if (joinstate == 16051) {//加群资格
                var url = this.baseUrls.faildAuthUrl + '?';
                url += 'userId=' + circleS.userId;
                url += '&type=1&bizId=' + circleId;
                url += '&fromUrl=' + encodeURIComponent(this.baseUrls.hostUrl);
                window.location.href = url;
              } else {
                 alert("加群出现错误");
              }
              num = -1;
            } else {
              num = 0;
            }
          }
        });
        return num;
      },

      /**
       * 执行加群操作
       */
      doJoin(){
        //发送加群请求
        $.ajax({
          url: this.baseUrls.joinApiUrl,
          data: {
            "circleId": circleId,
            "userId": userId,
            "followerId": that.followerId
          },
          type: "PUT",
          dataType: "json",
          success: function (data) {
            if (data.code == 0) {
              that.joinState = data.joinState;
              that.userType = data.userType;
              //加入社群，隐藏权限弹窗
              if (that.joinState != that.joinStateN) { //未加入状态
                //底部按钮文案：？？？
              }
              //liushuai 2016/3/8 默认加群，不做任何处理
              if (!redirectUrl && !source) {
                //默认加群，不做任何处理
                console.log("加群成功，默认不做任何处理");
                return;
              }
              if (typeof redirectUrl != "undefined") {
                window.location.href = redirectUrl;
              } else if (typeof source != "undefined" && source == "BY_COMMUNITY") {
                //that.showDownloadWin(that.joinState);//加群成功下载弹窗
                //OperPop.showSuccessPop("加入社群成功");
                window.location.reload();//入群成功刷新页面
              } else if (typeof source != "undefined" && source == "BY_WEIXINAUTH") {
                OperPop.showSuccessPop("加入社群成功");
                //that.showDownloadWin(that.joinState);//加群成功下载弹窗
                $(".community_button").text(RemindMsg.bottom.apply_all);
                $(".community_button").bind("click", function () {
                  downloadApp();
                });
                window.location.reload();//入群成功刷新页面
              }
            } else if (data.code == 16061) {
              //社群加入权限改为付费加入，调用付费入群模块
              // 2016年3月7日 TYJ 因为登陆后置导致登陆完成后无法调转到收费社群的付费说明页
              circleId = (circleId == undefined) || (circleId == "") ? data.circleId : circleId;
              userId = (userId == undefined) || (userId == "") ? data.userId : userId;
              payMent.circleJoinPay(circleId, userId, bizType, "login");
            } else if (data.code != 0) {
              $("#video").hide();// 因为安卓手机下弹层会被播放器遮挡，所以弹层弹出时先播放器隐藏
              alert(data.message);
              $(".popub-footer").click(function () {
                if (typeof redirectUrl != "undefined" && redirectUrl.indexOf("undefined") <= 0) {
                  window.location.href = redirectUrl;
                } else {
                  window.location.reload();
                }
              });
              localStorage.fromLogin = "";
            }
            ;
          }
        });
      },

      ajaxJoinAuth(){
      },
      ajaxDoJoin(){
      },

      successJoinAuth(){
      },
      successDoJoin(){
      }
    }
  }
</script>
