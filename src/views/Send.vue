<template>
  <div id="page-send">
    <van-row>
      <van-col span="24" class="prize-notice">
        <van-notice-bar
          left-icon="info-o"
          :text="$t('send.notice')"
        />
      </van-col>
      <van-col span="24" class="prize-form">
        <div class="input-prizeAmount">
          <div class="field-wrap">
            <template v-if="sendType == 1">
              <p class="field">{{ $t('send.totalAmount') }}</p>
              <i class="tag" v-if="$root.$children[0].lang === 'zh-CN'"></i>
              <van-tag plain type="danger" v-else style="margin-left:10px">RANDOM</van-tag>
            </template>
            <template v-if="sendType == 2"><p class="field">{{ $t('send.singleAmount') }}</p></template>
          </div>
          <div class="input-wrap">
            <input type="number" class="input dinMedium" placeholder="0.00" v-model="totalAmout" @blur="inputAmount">
            <div class="token-selector">
              <img alt="" class="token-logo" src="https://assets.coingecko.com/coins/images/279/small/ethereum.png">
              <p class="token-symbol">ETH</p>
            </div>
          </div>
        </div>
        <div class="input-type">
          <p class="prize-type" @click="changeSendType">
            <span>{{ $t('send.changeTo') }} </span>
            <template v-if="sendType == 1">{{ $t('send.normalPacket') }}</template>
            <template v-if="sendType == 2">{{ $t('send.randomPacket') }}</template>
          </p>
          <p class="asset">ETH {{ $t('send.balance') }}：<span class="amount">{{ webUtil.addCommas(oneAmount, 2) }}</span></p>
        </div>
        <div class="input-prizeCount">
          <p class="field">{{ $t('send.packetCount') }} <span class="unit">{{ $t('send.packetUnit') }}</span></p>
          <input type="number" placeholder="1-200" class="input dinMedium" v-model="totalCount">
        </div>
      </van-col>
    </van-row>
    <van-row>
      <van-col span="24" class="operation">
        <van-button
          type="danger"
          :disabled="!canSend"
          :loading="isSending"
          :loading-text="$t('send.sending')"
          class="send-btn"
          @click="send"
        >{{ $t('send.sendPacket') }}</van-button>
      </van-col>
    </van-row>
  </div>
</template>

<script>
export default {
  name: 'page-send',
  computed: {
    canSend: function () {
      return (this.totalAmout && this.totalCount);
    },
    hasAmount: function () {
      return (this.oneAmount != '-' && this.oneAmount > 0);
    }
  },
  data() {
    return {
      parent: null,
      oneAmount: 0,
      totalAmout: '',
      totalCount: '',
      isSending: false,
      sendType: 1,
      loadToast: null,
    }
  },
  mounted() {
    this.parent = this.$root.$children[0];
    if (this.parent.address) {
      this.getBalance(this.parent.address);
    }
  },
  methods: {
    initPage: function () {
      this.getBalance(this.parent.address);
    },
    getBalance: async function (address) {
      if (!address) {
        this.oneAmount = 0;
        return false;
      }

      this.loadToast = this.$toast.loading({
        message: this.$t('common.loading'),
        forbidClick: false,
        duration: 0,
      });
      
      let ret = await this.parent.hmny.blockchain.getBalance({
        address: address
      });
      this.oneAmount = this.parent.hmny.utils.fromWei(this.parent.hmny.utils.hexToNumber(ret.result), 'one');

      this.loadToast.clear();
    },
    inputAmount: function () {
      if (!this.parent.address) {
        this.$dialog.alert({
          message: this.$t('send.connWalletNotice'),
        }).then(() => {
          this.totalAmout = '';
        });
        return false;
      }
    },
    send: function () {
      if (this.totalAmout < 0.01) {
        this.$notify({ type: 'danger', message: 'please increase your ONE token amount' });
        return false;
      }

      if (this.totalCount < 1 || this.totalCount > 200) {
        this.$notify({ type: 'danger', message: 'package count need between 1 and 200' });
        return false;
      }

      let seed = this.webUtil.randomNum(100000, 999999);
      let token = '0x000000000000000000000000000000000000bEEF';

      let amount = (this.sendType == 1) ? this.totalAmout : this.totalAmout*this.totalCount;
      let totalAmount = new this.parent.hmny.utils.Unit(amount).asOne().toWei();
      
      this.parent.contract.methods.sendSeedPacket(token, seed, this.sendType, totalAmount, this.totalCount).send({
        value: totalAmount,
        gasLimit: this.contractConfig.defaultGasLimit,
        gasPrice: new this.parent.hmny.utils.Unit(this.contractConfig.defaultGasPrice).asGwei().toWei(),
      }).on('transactionHash', (hash) => {
        console.log('hash', hash)
        this.isSending = true;
      }).on('receipt', (receipt) => {
        console.log('receipt', receipt)
      }).on('confirmation', (confirmationNumber, receipt) => {
        console.log('confirmationNumber', confirmationNumber, receipt)

        this.isSending = false;
        this.totalCount = '';
        this.totalAmount = '';

        this.getBalance(this.parent.address);

        this.$dialog.confirm({
          message: this.$t('send.successNotice'),
        }).then(() => {
          this.$router.push('/history');
        }).catch();
      }).on('data', (event) => {
        console.log("event", event);
      }).on('error', (error) => {
        console.log('error', error);
        this.isSending = false;

        this.$notify({ type: 'danger', message: 'fail to send lucky packet: '+error });
      });
    },
    changeSendType: function () {
      this.sendType = 3 - this.sendType;
    },
  },
}
</script>

<style>
.prize-form {
  margin-top: 10px;
}
.prize-form .input-prizeAmount {
  padding: .26rem .3rem .38rem;
  border-radius: .1rem;
  background-color: #f8f8f8;
}
.prize-form .input-prizeAmount .field-wrap {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.prize-form .input-prizeAmount .field-wrap .field {
  font-size: .28rem;
  line-height: .34rem;
  color: #101010;
  font-weight: 500;
}

.prize-form .input-prizeAmount .field-wrap .tag {
  margin-left: .24rem;
  width: 1.14rem;
  height: .34rem;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOQAAABECAMAAACmlWlRAAAAP1BMVEVHcEz/9NX/7tP/7tP/7tT/7tP/7tP/7tP/79T/7tP/bAD/uYz/0a3/5sb/llb/fib/x5z/kEH/omT/rXj/2rfWDjbyAAAACnRSTlMACKD/VbfQ7SuFYmsqIAAABI9JREFUaN7lW+vSqyAMbKtVK1fB93/WU9EqKCTB9ps5an7VGa3kwu4G8HZLWlO+nlVdF/+91XX1fJXNLdfu5eMA3q18fZT3DBeb43n48ZOaz/JZHNieJSWLh3bRuYll8/4qTmAvcG42VXEKq4BklnVxEquTM/NVnMheF/Ax4eXJfIx6eTofI16WxQlthT5NBq4Kqbr+GBgbMMk9hx9N27ZKHIMv73snpHo72Zq/Hh8frP/htGxynusHH1uF3SYHs6683QPcD5HG54R7SIaR1d8UbJYmZ+71LWmQY77dT+Y9PUaIt6jZz99pd6l5wtIZf+5KZNGRnOSeZ2oZr/AywnAn2VwXxGBsrdmTyCn+QLlq9jYzZpKJzwjHB6z3rMWd5EFdEIKRTOWuRCoEmOYYRwelCNmZXyI4N8RgpFP52DEjPUiIz8Y5xtFBmU0woncJbz6CBo344TiyzoZWsEACPFEmq7xYG6GnT5xY2kCAvWcKOjFHv0dzPY63izqZ4gIbC4Fp26+Yucyr1sVHYEpavFqTIZKxELg4KbtbYw31Wu/wEQprPxDXlBIu5vrt5/ECz2JVsk/B5mBrr/BUhOkUXv1uZEEas9b1jxqS5IY+JfUG21GiYXp2uFtgi1P1DqPe2GOTEtTmuhuNrYBcdbMZka67sTLl/Etv8gua/gWDOJX+RBuO8W+S+kQCTMPCGvUKl6538Gh02GrzDewkvfI0Oa+QXi7EkhXjBUVSE4TfiJFLBYOr50iX8QrmTxa9AlebhpMV6XtSGDSOwmuN9ktj9BU8c+JU8wtw/QWHEDoOF/2MWT9VthrbvKVGOSKmNaKKd9uNxBpsEa34lNRL+o2U0qVVDesEY8V3UoCCcNUbcqxYNSGTNaHleEdfk6t1LlabagPH9mlrI8TYzyURhdmXTs4vEOl3pYp1eDtPcg6B4angSslkhSw+Igxi0sKIJyjO0qRAF2nBcxvmD4VAYkAuTna0Vwi9DCqVflYArLsOn/hW7jgx8MKXOgAGUWmBq7xAbcC1oypXAUCOJcnoQdaVBFWXZhAbgyrrU8GyVMc85RrDHRviDt4/MiLjlGCrpea5nWIQESlwpX3UW35jgZdEsAxxkXB/AzbNKIPIWFg081DPq1GJBF4RcSSMCgVcweUPlEH0dnPA8OlmXqy6K4UEPlvUEZcRHuBCVo8xiILqbr0tIBBW4y0RR8Lh0Ray0kuSHOtBGFB3ILj+RLlqSi85LUmm61VjDELYkFqDq7/aFZrJxR1GW6h8wNsEDGEQE9+xU9NoB33KEuAq9+uXUI9JRsBWaMPHwgwS223uPUyyIdEE4JqzlgJLFeyJacPn3iDSlcfLlYFLev2Sre0uZUqsdSIXXNH6bpBNWLZgaN/RVlaYl5Jw5AG4xpsQxbJWyRWlCXmi2+nCWXCxGCjp342xcBvq0kyj6N3VxGrRdjJ3H6A3Cp/EzalPKn20+c4jLgey4IhL1mGl41jdXO/Y2TUOEF7jKOg1DvVe43j2NQ7aX+OTiWt8/HKNz5gu8kHaRT4tvMhHot7nvtURPvetkM99/wFY+xcNx276oAAAAABJRU5ErkJggg==);
  background-size: 100% 100%;
}

.prize-form .input-prizeAmount .input-wrap {
  margin-top: .3rem;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.prize-form .input-prizeAmount .input-wrap .input {
  margin-top: .06rem;
  width: 3rem;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  font-size: .56rem;
  line-height: .58rem;
  color: #df4242;
}

.prize-form .input-prizeAmount .input-wrap .token-selector {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.prize-form .input-prizeAmount .input-wrap .token-selector .token-logo {
  width: .48rem;
  height: .48rem;
}

.prize-form .input-prizeAmount .input-wrap .token-selector .token-symbol {
  position: relative;
  height: .4rem;
  margin-left: .16rem;
  padding-right: .34rem;
  font-size: .4rem;
  line-height: .4rem;
  color: #101010;
}

.prize-form .input-type {
  padding: .28rem .28rem .4rem;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.prize-form .input-type .prize-type {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  font-size: .24rem;
  line-height: .28rem;
  color: #2370fb;
  text-align: left;
}

.prize-form .input-type .prize-type span {
  color: #999;
}

.prize-form .input-type .asset {
  font-size: .24rem;
  line-height: .28rem;
  color: #999;
}

.prize-form .input-type .asset .amount {
  color: #101010;
  font-weight: 500;
}

.prize-form .input-prizeCount {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  padding: .32rem .3rem;
  border-radius: .1rem;
  background-color: #f8f8f8;
}

.prize-form .input-prizeCount .field {
  font-size: .28rem;
  line-height: .32rem;
  color: #101010;
  font-weight: 500;
}

.prize-form .input-prizeCount .field .unit {
  padding-left: .16rem;
  color: #b9b9b9;
}

.prize-form .input-prizeCount .input {
  width: 3rem;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  font-size: .56rem;
  line-height: .58rem;
  color: #df4242;
  text-align: right;
}

.prize-form .input-prizeSecret {
  margin-top: .4rem;
  padding: .4rem .3rem;
  border-radius: .1rem;
  background-color: #f8f8f8;
}

.prize-form .input-prizeSecret .input {
  width: 100%;
  font-size: .28rem;
  line-height: .36rem;
  color: #333;
}

.operation {
  position: fixed;
  bottom: 1.5rem;
  left: 0;
  width: 100%;
}

.operation .input-limit {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: .24rem;
  line-height: .28rem;
}

.operation .input-limit .field {
  color: #a4a8b3;
}

.operation .input-limit .limit-text {
  padding-left: .2rem;
  color: #2370fb;
}

.operation .input-limit .icon {
  margin-left: .1rem;
  width: .11rem;
  height: .18rem;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAkCAMAAAC62DqvAAAANlBMVEVHcEwicPwicfwjb/sjc/8jcPsjcPsjcPsjcPwjcPwicfkjcPwjcPskb/gjb/sicPsjcPsjcPsD5Z4uAAAAEXRSTlMAkUo6EnGG8+JdLZyuIb/O0jYz2boAAABvSURBVCjPzdM5EsAgDANAhvsIEP3/s8G1lDYTyi0wlo1z/p6OTwNqZ74AlMA+zD17Po7GnsyTLAtkdl+OD/ZgfrH3enxF8mm+2eM+XjmIuPCrIDTrS3RJ/UDZjm5eR6WD1WPQQ9Mj/rTh17XXn+QBUx8KsXuhwYMAAAAASUVORK5CYII=);
  background-size: 100% 100%;
}

.send-btn {
  display: block;
  height: .88rem;
  font-size: .3rem;
  line-height: .88rem;
  color: #fff;
  font-weight: 500;
  text-align: center;
  width: 6.2rem;
  margin: .6rem auto;
}

.dinMedium {
  font-family: dinMedium!important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button, input, select, textarea {
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border: none;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding: 0;
  margin: 0;
  border: 0;
  background-color: transparent;
}

button::-webkit-input-placeholder,input::-webkit-input-placeholder,select::-webkit-input-placeholder,textarea::-webkit-input-placeholder {
  color: #ccc6c0
}

button:-moz-placeholder,button::-moz-placeholder,input:-moz-placeholder,input::-moz-placeholder,select:-moz-placeholder,select::-moz-placeholder,textarea:-moz-placeholder,textarea::-moz-placeholder {
  color: #ccc6c0
}

button:-ms-input-placeholder,input:-ms-input-placeholder,select:-ms-input-placeholder,textarea:-ms-input-placeholder {
  color: #ccc6c0
}

@font-face {
    font-family: dinMedium;
    src: url(../assets/DIN-Medium.woff) format("woff");
}
</style>
