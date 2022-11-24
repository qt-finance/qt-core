import { ethers, upgrades } from 'hardhat';

// import depolyData from '../.openzeppelin/goerli.json';

// const deployedAddress = depolyData.proxies[0].address;
const deployedAddress = '';

async function main() {
	const Fake = await ethers.getContractFactory('Fake');
	const fake = await upgrades.upgradeProxy(deployedAddress, Fake, {
		kind: 'uups',
	});

	await fake.deployed();

	console.log(`contract deployed to ${fake.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
