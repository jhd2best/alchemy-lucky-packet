async function main() {
    // deploy proxy contract
    const proxyFactory = await ethers.getContractFactory("EternalStorageProxy");
    const proxyContract = await proxyFactory.deploy();

    console.log("Success deploy Proxy contract at:", proxyContract.address);

    const luckyPackageFactory = await ethers.getContractFactory("LuckyPackageV1");
    const luckyPackageContract = await luckyPackageFactory.deploy();

    console.log("Success deploy LuckyPackage contract at:", luckyPackageContract.address);
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});