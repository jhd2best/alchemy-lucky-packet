<template>
  <div id="app">
    <van-row>
      <van-col span="24">
        <van-nav-bar
          :title="navTitle"
        >
          <template #left>
            <van-dropdown-menu active-color="#1989fa">
              <van-dropdown-item
                v-model="lang" 
                :options="langOption"
                @change="changeLang"
              />
            </van-dropdown-menu>
            <van-tag
              type="primary"
              style="margin-left:15px"
              v-if="'production' !== appMode"
            >TESTNET</van-tag>
          </template>
          <template #right>
            <van-button
              round
              type="primary"
              size="small"
              v-if="!isAuthorized"
              :loading="isWalletConnecting"
              @click="connectWallet"
              :disabled="!isWalletReady"
            >{{ $t('nav.connWallet') }}</van-button>
            <span class="addr" v-else @click="logout">{{ webUtil.shorterB32Address(address) }}</span>
          </template>
        </van-nav-bar>
      </van-col>
    </van-row>
    <van-row>
      <van-col span="24">
        <router-view ref="content" />
      </van-col>
    </van-row>
    <van-row>
      <van-col span="24">
        <van-tabbar route @change=tabbarChange>
          <van-tabbar-item name="send" to="/send" icon="paid">{{ $t('nav.send') }}</van-tabbar-item>
          <van-tabbar-item name="claim" to="/claim" icon="gold-coin-o">{{ $t('nav.claim') }}</van-tabbar-item>
          <van-tabbar-item name="history" to="/history" icon="notes-o">{{ $t('nav.history') }}</van-tabbar-item>
        </van-tabbar>
      </van-col>
    </van-row>
  </div>
</template>

<script>
import { Locale } from 'vant';
import enUS from 'vant/es/locale/lang/en-US';
import zhCN from 'vant/es/locale/lang/zh-CN';

const { Harmony } = require('@harmony-js/core');
const { ChainType } = require('@harmony-js/utils');

export default {
  name: 'App',
  data() {
    return {
      appMode: 'development',
      isWalletConnecting: false,
      isWalletReady: false,
      hmny: null,
      isOneWallet: false,
      onewallet: null,
      address: '',
      addressHex: '',
      contract: null,
      isAuthorized: false,
      tarActive: 'send',
      navTitle: this.$t('nav.send'),
      lang: 'en',
      langOption: [
        { text: 'English', value: 'en' },
        { text: '简体中文', value: 'zh-CN' },
      ],
    }
  },
  created: function() {
    this.appMode = process.env.NODE_ENV;
  },
  mounted: function() {
    Locale.use('en-US', enUS);

    this.hmny = new Harmony(this.contractConfig.url[this.appMode],{chainType: ChainType.Harmony, chainId: 2});
    this.hmny.setShardID(0);
    
    var triedTimes = 0;
    var timer = setInterval(() => {
      if (window.onewallet && window.onewallet.isOneWallet) {
        this.onewallet = window.onewallet;
        this.isWalletReady = true;

        // load contract
        this.contract = this.hmny.contracts.createContract(this.contractConfig.abi,this.contractConfig.address);

        // attach onewallet
        this.contract.wallet.signTransaction = async (tx)=>{
          tx.from = this.address;
          const signTx = await this.onewallet.signTransaction(tx);
          console.log(signTx);
          return signTx;
        }

        this.$refs.content.contract = this.contract;
        clearInterval(timer)
      } else {
        triedTimes++;
        if (triedTimes > 10) {
          clearInterval(timer)
          this.$notify({ type: 'danger', message: 'please use OneWallet' });
        }
      }
    }, 500);
  },
  methods: {
    connectWallet: async function () {
      this.isWalletConnecting = true;
      const getAccount = await this.onewallet.getAccount();
      console.log(getAccount);
      this.address = getAccount.address;
      this.isAuthorized = true;
      this.addressHex = new this.hmny.crypto.HarmonyAddress(getAccount.address).basicHex;
      this.isWalletConnecting = false;
      
      await this.$refs.content.initPage();

      this.$notify({ type: 'success', message: 'success connect OneWallet' });
    },
    tabbarChange: function (tab) {
      this.tarActive = tab;
      this.navTitle = this.$t('nav.'+tab);
    },
    changeLang: function (lang) {
      this.$i18n.locale = lang;
      // refresh nav title
      this.navTitle = this.$t('nav.'+this.tarActive);
      // switch vant lang
      switch (lang) {
        case 'en':
          Locale.use('en-US', enUS);
          break;
        case 'zh-CN':
          Locale.use('zh-CN', zhCN);
          break;
      }
    },
    logout: async function () {
      this.$dialog.confirm({
        message: this.$t('nav.logoutNotice'),
      }).then(async () => {
        await this.onewallet.forgetIdentity();
        this.address = '';
        this.addressHex = '';
        this.isAuthorized = false;

        await this.$refs.content.initPage();
      });
    }
  },
}
</script>

<style>
#app {
  line-height: 1;
  font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Arial,PingFang SC,Hiragino Sans GB,Heiti SC,Microsoft YaHei,WenQuanYi Micro Hei,sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 500px;
  height: 100%;
  margin: 0 auto;
}

.van-nav-bar .van-dropdown-menu__bar {
  box-shadow: 0px 0px 0px;
}

p {
  margin: 0px;
}
</style>
