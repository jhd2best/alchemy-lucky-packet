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
              style="margin-left:15px;display: none"
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
import { ethers } from "ethers";
import enUS from 'vant/es/locale/lang/en-US';
import zhCN from 'vant/es/locale/lang/zh-CN';



export default {
  name: 'App',
  data() {
    return {
      appMode: 'development',
      isWalletConnecting: false,
      isWalletReady: false,
      isOneWallet: false,
      wallet: null,
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

    if (!window.ethereum) {
      this.$notify({ type: 'danger', message: 'please install Metamask wallet' });
    } else {
      this.provider = new ethers.providers.Web3Provider(window.ethereum)
      this.wallet = window.ethereum;
      this.isWalletReady = true;
    }
  },
  methods: {
    connectWallet: async function () {
      this.isWalletConnecting = true;

      this.provider.send("eth_requestAccounts", []).then(() => {
        this.provider.listAccounts().then(async (accounts) => {
          this.signer = this.provider.getSigner(accounts[0]);
          // todo
          console.log(this.signer);
          this.address = accounts[0];
          // this.addressHex = new this.hmny.crypto.HarmonyAddress(getAccount.address).basicHex;

          this.isAuthorized = true;
          this.isWalletConnecting = false;

          this.contract = new ethers.Contract(this.contractConfig.address, this.contractConfig.abi, this.signer);
          this.$refs.content.contract = this.contract;

          await this.$refs.content.initPage();
          this.$notify({ type: 'success', message: 'success connect wallet' });
        });
      });
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
        await this.wallet.forgetIdentity();
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
