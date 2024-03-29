<template>
  <div id="page-history">
    <template v-if="packets.length > 0">
      <van-card
        v-for="packet in packets" :key="packet.packetId"
        :num="packet.count"
        :tag="packet.type == 1?$t('record.random'):''"
        :price="packet.amount+' '+packet.tokenName"
        :desc="$t('record.remainAmount')+': '+webUtil.addCommas(packet.remainAmount, 2)+' '+packet.tokenName+' / '+$t('record.remainCount')+': '+packet.remainCount"
        :title="'#'+packet.packetId+' '+packet.tokenName+' '+$t('record.luckyPacket')"
        :thumb="packetImage"
        :currency="$t('record.totalAmount')+' '"
      >
        <template #footer>
          <template v-if="packet.remainCount == 0">
            <van-button size="small" type="primary" class="packet-btn">{{ $t('record.stateClose') }}</van-button>
          </template>
          <template v-else>
            <van-button size="small" type="danger" class="packet-btn" style="margin-right:15px;" @click="packetBack(packet.packetId)">{{ $t('record.withdraw') }}</van-button>
            <van-button
              size="small"
              type="info"
              class="packet-btn"
              :id="'clipboard-'+packet.packetId"
              @click="packetShare(packet.packetId)"
              :data-clipboard-text="$t('record.shareText', {host: host, packetId: packet.packetId, seed: packet.seed, tokenName: packet.tokenName})"
            >{{ $t('record.share') }}</van-button>
          </template>
        </template>
      </van-card>
    </template>
    <template v-else>
      <van-empty :description="$t('record.nonePacket')" />
    </template>
  </div>
</template>

<script>
import Clipboard from 'clipboard';
import { ethers } from "ethers";

export default {
  name: 'page-history',
  computed: {},
  data() {
    return {
      parent: null,
      packets: [],
      packetImage: require("../assets/packet.png"),
      tokenMap: {
        '000000000000000000000000000000000000beef': 'ETH',
      },
      loadToast: null,
      host: window.location.host,
    }
  },
  mounted() {
    this.parent = this.$root.$children[0];
    if (this.parent.address) {
      this.getUserPackets(this.parent.address);
    }
  },
  methods: {
    initPage: function () {
      this.getUserPackets(this.parent.address);
    },
    getUserPackets: async function (address) {
      if (!address) {
        this.packets = [];
        return false;
      }

      this.loadToast = this.$toast.loading({
        message: this.$t('common.loading'),
        forbidClick: false,
        duration: 0,
      });
      await this.parent.contract.getMyPackets({
        from: this.parent.addressHex,
        gasLimit: this.contractConfig.defaultGasLimit,
      }).then((data) => {
        console.log("data", data);

        if (data.length > 0) {
          this.packets = [];
          
          for (const index in data) {
            let packet = data[index].split('::');
            this.packets.push({
              token: packet[0],
              packetId: packet[1],
              type: packet[2],
              amount: ethers.utils.formatUnits(ethers.utils.parseUnits(packet[3], "wei"), "ether"),
              count: packet[4],
              remainAmount: ethers.utils.formatUnits(ethers.utils.parseUnits(packet[5], "wei"), "ether"),
              remainCount: packet[6],
              tokenName: this.tokenMap[packet[0]]?this.tokenMap[packet[0]]:'unknown HRC20 token',
              packetDesc: '',
              seed: packet[7],
            });
          }
        }
      }).catch((error) => {
        this.$notify({ type: 'danger', message: 'fail to get lucky packet: '+error });
      }).finally(() => {
        this.loadToast.clear();
      });
    },
    packetBack: function (packetId) {
      this.$dialog.confirm({
        title: this.$t('record.withdraw'),
        message: this.$t('record.withdrawNotice'),
      }).then(async () => {
        this.loadToast = this.$toast.loading({
          message: this.$t('common.loading'),
          forbidClick: false,
          duration: 0,
        });

        const tx = await this.parent.contract.claimMyPacket(packetId, {
          gasLimit: this.contractConfig.defaultGasLimit,
        });

        try {
          const receipt = await tx.wait();
          console.log('receipt', receipt)
        } catch (e) {
          this.$notify({ type: 'danger', message: 'fail to withdraw lucky packet: '+e });
          this.loadToast.clear();
          return
        }

        await this.getUserPackets(this.parent.address);

        this.$notify({ type: 'success', message: 'withdraw lucky packet success' });
        this.loadToast.clear();
      });
    },
    packetShare: function (packetId) {
      let clipboard = new Clipboard('#clipboard-'+packetId)
      clipboard.on('success', () => {
        this.$notify({ type: 'success', message: 'copy invite link success' });
        clipboard.destroy();
      })
      clipboard.on('error', () => {
        clipboard.destroy()
      })
    }
  },
}
</script>

<style>
  .van-card__content {
    text-align: left;
  }
  .van-button.packet-btn {
    height: 27px;
    padding: 0 30px;
  }
</style>
