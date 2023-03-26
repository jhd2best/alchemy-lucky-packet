<template>
  <div id="page-claim">
    <van-row class="row-packet">
      <van-col span="18" class="packet-body" offset="3">
        <div class="prize-bg">
          <div class="prize-bg-header"></div>
        </div>
        <div class="prize-info">
          <div class="avatar">
            <img src="https://assets.coingecko.com/coins/images/279/small/ethereum.png">
          </div>
          <p class="nickname">ETH</p>
          <div class="input-packet-seed">
            <van-password-input
              :info="$t('claim.info')"
              :value="seed"
              :mask="false"
              :length="6"
              :gutter="10"
              :focused="showKeyboard"
              @focus="inputSeed"
            />
          </div>
        </div>
      </van-col>
    </van-row>
    <van-number-keyboard
      v-model="seed"
      :show="showKeyboard"
      @blur="showKeyboard = false"
    />
  </div>
</template>

<script>
export default {
  name: 'page-claim',  
  data() {
    return {
      parent: null,
      packetId: 0,
      seed: '',
      showKeyboard: false,
      loadToast: null,
    }
  },
  mounted() {
    this.parent = this.$root.$children[0];
    this.packetId = this.$route.params.id;
  },
  watch: {
    seed(seed) {
      if (seed.length === 6) {
        this.claimPacket(seed)
      }
    },
  },
  methods: {
    initPage: function () {

    },
    inputSeed: function () {
      if (!this.parent.address) {
        this.$notify({ type: 'danger', message: 'please connect wallet first' });
        return false;
      }

      if (!this.packetId) {
        this.$notify({ type: 'danger', message: 'invalid packet id' });
        return false;
      }

      this.showKeyboard = true;
    },
    claimPacket: async function (seed) {
      this.showKeyboard = false;

      this.loadToast = this.$toast.loading({
        message: this.$t('common.loading'),
        forbidClick: false,
        duration: 0,
      });

      const tx = await this.parent.contract.claimSeedPacket(this.packetId, seed, {
        gasLimit: this.contractConfig.defaultGasLimit
      });

      try {
        const receipt = await tx.wait();
        console.log('receipt', receipt)
      } catch (e) {
        this.$notify({ type: 'danger', message: 'fail to claim lucky packet: '+e });
        this.loadToast.clear();
        return
      }

      this.seed = '';
      this.loadToast.clear();
      this.$notify({ type: 'success', message: 'claim lucky packet success' });
    }
  },
}
</script>

<style>
  .row-packet {
    margin-top: 1rem;
  }
  .packet-body {
    position: relative;
    overflow: hidden;
    height: 7.4rem;
    border-radius: .14rem;
    will-change: transform;
  }
  .packet-body .prize-bg {
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg,#de4444,#db4242 32%,#b72424);
  }
  .packet-body .prize-bg .prize-bg-header {
    width: 100%;
    height: 2.36rem;
    background-image: url(../assets/packet_header.png);
    background-size: 100% 100%;
  }
  .packet-body .prize-info {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 1;
    text-align: center;
  }
  .packet-body .prize-info .avatar {
    width: 1.2rem;
    height: 1.2rem;
    margin: 1.6rem auto 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    border-radius: 50%;
    background: -webkit-gradient(linear,left top,left bottom,from(#ffb47e),to(#f36b07));
    background: linear-gradient(180deg,#ffb47e,#f36b07);
    -webkit-box-shadow: 0 0.12rem 0 rgba(140,0,0,.2);
    box-shadow: 0 0.12rem 0 rgba(140,0,0,.2);
  }
  .packet-body .prize-info .avatar img{
    width: .96rem;
    height: .96rem;
    border-radius: 50%;
  }
  .packet-body .prize-info .nickname {
    padding-top: .14rem;
    font-size: .28rem;
    line-height: .4rem;
    color: #fff;
    font-weight: 500;
  }
  .packet-body .prize-info .input-packet-seed {
    padding-top: 1rem;
    width: 90%;
    margin: 0 auto;
  }
  .packet-body .prize-info .input-packet-seed .van-password-input__info {
    color: #fff;
  }
</style>
