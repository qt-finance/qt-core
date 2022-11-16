import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { Fake } from "../test-types";

describe("Fake", () => {
  async function setupFixture() {
    // Contracts are deployed using the first signer/account by default

    const FakeContract = await ethers.getContractFactory("Fake");
    const fake = (await FakeContract.deploy()) as Fake;

    return { fake };
  }

  describe("# constructor", () => {
    it("setup the right owner", async () => {
      const { fake } = await loadFixture(setupFixture);

      const [owner] = await ethers.getSigners();

      expect(await fake.owner()).to.be.equal(owner.address);
    });
  });
});
