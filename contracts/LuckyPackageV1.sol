pragma solidity ^0.4.26;
pragma experimental ABIEncoderV2;

import "./Utils.sol";
import "./Ownable.sol";
import "./SafeMath.sol";
import "./EternalStorage.sol";
import "hardhat/console.sol";

/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
    function totalSupply() public view returns (uint256);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}


contract ERC20 is ERC20Basic {
    function allowance(address owner, address spender) public view returns (uint256);
    function transferFrom(address from, address to, uint256 value) public returns (bool);
    function approve(address spender, uint256 value) public returns (bool);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


contract LuckyPackageV1 is EternalStorage, Ownable, Utils {
    using SafeMath for uint256;
    
    struct Packet {
        address token;
        address owner;
        uint32 packetId;
        uint8 packetType;
        uint256 packetAmount;
        uint8 packetCount;
        uint256 claimCount;
        uint256 remainAmount;
        uint256 remainCount;
        mapping(address => uint256)  receivers;
        address maxAddress;
        address[] addresses;
        uint256[] amounts;
        uint256 seed;
    }
    
    mapping(uint256 => Packet) public packets;
    mapping(address => bool) public blackList;
    mapping(address => uint[]) public userPackets;
    
    event Packetstarted(uint256 total, address tokenAddress);
    event PacketClaimed(uint256 amount, address token, uint32 packetId, address user);
    event Packetended(uint256 total, address tokenAddress);
    event ClaimedTokens(address token, address owner, uint256 balance);
    event ClaimedPacketTokens(uint32 packetid, address token, address owner, uint256 balance);

    uint8 PACKET_TYPE_LUCKY = 1;
    uint8 PACKET_TYPE_AVG = 2;

    modifier hasFee() {
        if (currentFee(msg.sender) > 0) {
            require(msg.value >= currentFee(msg.sender));
        }
        _;
    }

    function() public payable {}

    function initialize(address _owner) public {
        require(!initialized());
        setOwner(_owner);
        setArrayLimit(200);
        setDiscountStep(0.00005 ether);
        setFee(1 ether);
        boolStorage[keccak256("rs_multisender_initialized")] = true;
    }

    function initialized() public view returns (bool) {
        return boolStorage[keccak256("rs_multisender_initialized")];
    }
 
    function txCount(address customer) public view returns(uint256) {
        return uintStorage[keccak256(abi.encodePacked("txCount", customer))];
    }

    function arrayLimit() public view returns(uint256) {
        return uintStorage[keccak256("arrayLimit")];
    }

    function setArrayLimit(uint256 _newLimit) public onlyOwner {
        require(_newLimit != 0);
        uintStorage[keccak256("arrayLimit")] = _newLimit;
    }

    function discountStep() public view returns(uint256) {
        return uintStorage[keccak256("discountStep")];
    }

    function setDiscountStep(uint256 _newStep) public onlyOwner {
        require(_newStep != 0);
        uintStorage[keccak256("discountStep")] = _newStep;
    }

    function fee() public view returns(uint256) {
        return uintStorage[keccak256("fee")];
    }

    function currentFee(address _customer) public view returns(uint256) {
        if (fee() > discountRate(msg.sender)) {
            return fee().sub(discountRate(_customer));
        } else {
            return 0;
        }
    }

    function setFee(uint256 _newStep) public onlyOwner {
        require(_newStep != 0);
        uintStorage[keccak256("fee")] = _newStep;
    }

    function setBlackList(address _user) public onlyOwner{
        require(!blackList[_user], 'do not need to be ban');
        blackList[_user] = true;
    }
    function unsetBlackList(address _user) public onlyOwner{
        require(blackList[_user], 'user not exists');
        blackList[_user] = false;
        delete blackList[_user];
    }

    function discountRate(address _customer) public view returns(uint256) {
        uint256 count = txCount(_customer);
        return count.mul(discountStep());
    }
    function randomId(uint256 seed) private view returns (uint32) {
        uint32 packetId = uint32(keccak256(abi.encodePacked(block.timestamp, block.difficulty, seed, msg.sender)));
        return packetId;
    }
    function randomSecretId(string secret) private view returns (uint32){
        uint32 packetId = uint32(keccak256(abi.encodePacked(block.timestamp, block.difficulty, secret, msg.sender)));
        return packetId;
    }
    function sendPacket(uint32 packetId, address token, uint8 packetType, uint256 packetAmount, uint8 packetCount, uint256 seed) private{
        require(packetCount < 256, 'packetCount must be less than 256');
        //保存元数据
        Packet memory packet;
        packet.token = token;
        packet.packetId = packetId;
        packet.packetType = packetType;
        packet.packetAmount = packetAmount;
        packet.packetCount = packetCount;
        packet.remainAmount = packetAmount;
        packet.remainCount = packetCount;
        packet.claimCount = 0;
        packet.owner = msg.sender;
        packet.seed = seed;

        packets[packetId] = packet;
        userPackets[msg.sender].push(packetId);

        uint8 i=0; 
        uint256 userAmount;
        uint256 totalAmount  = packetAmount;
        uint256 totalCount = packetCount;
        for(i=0; i<packetCount; i++){
            if(packetType == PACKET_TYPE_AVG){
                userAmount = calcAvgAmount(totalAmount, totalCount);
            }
            else {
                userAmount = calcAmount(totalAmount, totalCount, packetId, i);
            }
            totalAmount = totalAmount.sub(userAmount);
            totalCount = totalCount.sub(1);
            packets[packetId].amounts.push(userAmount);
        }

        require(totalCount == 0, "some error happens");
        //先存储
        packetsendToken(token, packetAmount);
    }

    function calcAvgAmount(uint256 remainAmount, uint256 remainCount) private pure returns(uint256) {
        if (remainAmount <= 0 || remainCount <= 0) {
            return 0;
        }
        uint256 myAmount = 0;
        // 只剩一个红包
        if (remainCount == 1) {
            myAmount = remainAmount;
            return myAmount;
        }
        return remainAmount.div(remainCount);
    }

    // 计算抢红包数量
    function calcAmount(uint256 remainAmount, uint256 remainCount, uint256 packetId, uint8 claimIdx) private view returns(uint256) {
        if (remainAmount <= 0 || remainCount <= 0) {
            return 0;
        }
        uint256 myAmount = 0;
        // 只剩一个红包
        if (remainCount == 1) {
            myAmount = remainAmount;
            return myAmount;
        }
        //最小数量为平均值的1/10
        uint256 packetMin = remainAmount.div(remainCount).div(10);
        // 最大数量1: 假设剩余所有人都拿最小数量
        uint256 maxAmount =  remainAmount.sub(remainCount.sub(1).mul(packetMin));
        // 最大数量2: 平均值的两倍
        uint256 avgMaxAmount = remainAmount.div(remainCount).mul(2);
        // 取二者较小的作为最大数量
        uint256 randMax = maxAmount > avgMaxAmount ? avgMaxAmount : maxAmount;
        
        // 获取随机数量
        uint256 upSeed = randMax.div(packetMin);
        myAmount = (uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, packetId, claimIdx))).mod(upSeed)).mul(packetMin);
        if(myAmount == 0) {
            myAmount = packetMin;
        }
        return myAmount;
    }

    function sendSeedPacket(address token, uint256 seed, uint8 packetType, uint256 packetAmount, uint8 packetCount) public hasFee payable {
        uint32 packetId = randomId(seed); 
        if(packetId < 1000){
            packetId = randomId(seed);
        }
        uintStorage[keccak256(abi.encodePacked("pp1", msg.sender, seed))] = packetId; 
        sendPacket(packetId, token, packetType, packetAmount, packetCount, seed);
    }
    function sendSecretPacket(address token, string secret, uint8 packetType, uint256 packetAmount, uint8 packetCount) public hasFee payable {
        uint32 packetId = randomSecretId(secret);
        if(packetId <1000){
            packetId = randomSecretId(secret);
        }
        uintStorage[keccak256(abi.encodePacked("pp2", msg.sender, secret))] = packetId; 
        sendPacket(packetId, token, packetType, packetAmount, packetCount, 0);
    }
    function claimPacket(uint32 packetId) private{
        _claimUserPacket(packetId, msg.sender);
    }

    function _claimUserPacket(uint32 _packetId, address _user) private{
        Packet storage packet = packets[_packetId];
        require(packet.remainCount > 0, 'no remain left');
        require(!(packet.receivers[_user]>0), 'only claim once');
        require(packet.packetCount>=packet.addresses.length, 'count limit');
        require(!blackList[_user], 'you are banned');
        
        if(packet.claimCount == 0){
            packets[_packetId].maxAddress = _user;
        }
        uint8 claimIdx = uint8(packet.addresses.length);
        require(claimIdx == packet.claimCount, 'can not be claimed');
        
        uint256 claimAmount = packet.amounts[claimIdx];
        packets[_packetId].remainAmount = packets[_packetId].remainAmount.sub(claimAmount);
        packets[_packetId].remainCount = packets[_packetId].remainCount.sub(1);
        packets[_packetId].claimCount = packets[_packetId].claimCount.add(1);
        packets[_packetId].receivers[_user] = claimAmount;
        packets[_packetId].addresses.push(_user);

        if(claimAmount > packet.receivers[packets[_packetId].maxAddress]){
            packets[_packetId].maxAddress = _user;
        }
        singleClaimPacketToken(packet.token, _user, claimAmount, _packetId);
    }

    function getPacketAddresses(uint32 packetId) public view returns (address[] memory){ 
        Packet storage packet = packets[packetId];
        require(packet.packetAmount>0);
        return packet.addresses;    
    }
    function getPacketAmounts(uint32 packetId) public onlyOwner view returns (uint256[] memory){ 
        Packet storage packet = packets[packetId];
        require(packet.packetAmount>0);
        return packet.amounts;    
    }
    
    function getMyPackets() public view returns (string[]) {
        uint[] memory packetIds = userPackets[msg.sender];
        uint256 packetCount = packetIds.length;
        string[] memory packetSet = new string[](packetCount);
        uint256 i = 0;
        for(i=0; i<packetCount; i++){
            Packet memory packet = packets[packetIds[i]];
            string memory item = "";
            item = strConcat(item, addressToString(packet.token), "::", uint2str(packet.packetId), "::");
            item = strConcat(item, uint2str(packet.packetType), "::", uint2str(packet.packetAmount), "::");
            item = strConcat(item, uint2str(packet.packetCount), "::", uint2str(packet.remainAmount), "::");
            item = strConcat(item, uint2str(packet.remainCount), "::", uint2str(packet.seed));
            packetSet[i] = item;
        }

        return packetSet;
    }
    
    function getUserPackets(address user) public onlyOwner view returns (uint256[] memory){ 
        require(userPackets[user].length>0);
        return userPackets[user];    
    }
    
    function getClaimAmount(uint32 packetId, address[] _addrs) public view returns (uint256[] memory) {
        Packet storage packet = packets[packetId];
        require(packet.packetAmount>0);
        uint256 len = _addrs.length;
        uint256 i = 0;
        uint256 [] memory balances = new uint256[](len);
        for(i=0; i<len; i++){
            balances[i] = packet.receivers[_addrs[i]];
        }
        return balances;
    }

    function getMyAmount(uint32 packetId, address user) public view returns(uint256){
        Packet storage packet = packets[packetId];
        require(packet.receivers[user]>0, 'you did not claim');
        return packet.receivers[user];
    }

    function getSeedPacketId(uint256 seed) public view returns(uint32){
        return uint32(uintStorage[keccak256(abi.encodePacked("pp1", msg.sender, seed))]);
    }
     function getSecretPacketId(string secret) public view returns(uint32){
        return uint32(uintStorage[keccak256(abi.encodePacked("pp2", msg.sender, secret))]);
    }
    function claimSeedPacket(uint32 packetId, uint256 seed) public payable{
        Packet storage packet = packets[packetId];
        require(uint32(uintStorage[keccak256(abi.encodePacked("pp1", packet.owner, seed))]) == packetId, 'invalid pair for seed and packetId');
        claimPacket(packetId);
    }
    function claimSecretPacket(uint32 packetId, string secret) public payable{
        Packet storage packet = packets[packetId];
        require(uint32(uintStorage[keccak256(abi.encodePacked("pp2", packet.owner, secret))]) == packetId, 'invalid pair for secret and packetId');
        claimPacket(packetId);
    }
    function packetsendToken(address token, uint256 amount) private {
        if (token == 0x000000000000000000000000000000000000bEEF){
            packetsendEther();
        } else {
            ERC20 erc20token = ERC20(token);
            erc20token.transferFrom(msg.sender, address(this), amount);
            setTxCount(msg.sender, txCount(msg.sender).add(1));
            emit Packetstarted(amount, token);
        }
    }
    
    function singleClaimPacketToken(address _token, address _user, uint256 _amount, uint32 _packetId) private {
        require(_user != address(0x0), "wrong user");
        
        if (_token == address(0x000000000000000000000000000000000000bEEF)){
            singleClaimPacketEther(_user, _amount, _packetId);
        } else {
            ERC20 erc20token = ERC20(_token);
            erc20token.approve(address(this), _amount);
            erc20token.transferFrom(address(this), _user, _amount);
            emit PacketClaimed(_amount, _token, _packetId, _user);
        }
    }
    
    function packetsendEther() private {
        uint256 total = msg.value;
        uint256 pfee = currentFee(msg.sender);
        require(total >= pfee);
        total = total.sub(pfee);
        address(this).transfer(total);
        setTxCount(msg.sender, txCount(msg.sender).add(1));
        emit Packetstarted(msg.value, 0x000000000000000000000000000000000000bEEF);
    }
    function singleClaimPacketEther(address _user, uint256 _amount, uint32 packetId) private {
        _user.transfer(_amount);
        emit PacketClaimed(_amount, 0x000000000000000000000000000000000000bEEF, packetId, _user);
    } 
    
    function claimMyPacket(uint32 packetId) public{
        Packet storage packet = packets[packetId];
        require(msg.sender == packet.owner || msg.sender == owner());
        require(packet.remainCount > 0 && packet.remainAmount > 0);
        uint256 balance = packet.remainAmount;
        if(packet.token == 0x000000000000000000000000000000000000bEEF){
            msg.sender.transfer(packet.remainAmount);
            emit ClaimedTokens(packet.token, packet.owner, balance);
            packets[packetId].remainCount = 0;
            packets[packetId].remainAmount = 0;
            return;
        }
        ERC20 erc20token = ERC20(packet.token);
        erc20token.transfer(packet.owner, packet.remainAmount);
        emit ClaimedPacketTokens(packetId, packet.token, packet.owner, balance);
        packets[packetId].remainCount = 0;
        packets[packetId].remainAmount = 0;
    }

    function claimTokens(address _token) public onlyOwner {
        if (_token == 0x0) {
            owner().transfer(address(this).balance);
            emit ClaimedTokens(_token, owner(), balance);
            return;
        }
        ERC20 erc20token = ERC20(_token);
        uint256 balance = erc20token.balanceOf(this);
        erc20token.transfer(owner(), balance);
        emit ClaimedTokens(_token, owner(), balance);
    }
    
    function setTxCount(address customer, uint256 _txCount) private {
        uintStorage[keccak256(abi.encodePacked("txCount", customer))] = _txCount;
    }
}
