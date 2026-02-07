// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SeedVault.sol";
import "../src/ZKSegment.sol";
import {IWorldID} from "../src/interfaces/IWorldID.sol";
import {IERC20} from "../src/SeedVault.sol";

/// @title DeployScript
/// @notice Foundry deployment script for SeedVault and ZKSegment contracts.
/// @dev Usage:
///      1. Copy contracts/.env.example to contracts/.env and fill in values.
///      2. Run: forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast
///
///      Environment variables required:
///        PRIVATE_KEY        - Deployer wallet private key
///        WORLD_ID_ROUTER    - World ID Router contract address on target chain
///        WLD_TOKEN_ADDRESS  - WLD ERC-20 token address on target chain
///        APP_ID             - World ID app identifier (e.g. "app_staging_xxx")
///        ACTION_ID          - Action string scoping the proof (e.g. "contribute")
///        GROUP_ID           - World ID credential group (1 = Orb-verified)
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address worldIdRouter = vm.envAddress("WORLD_ID_ROUTER");
        address wldToken = vm.envAddress("WLD_TOKEN_ADDRESS");
        string memory appId = vm.envString("APP_ID");
        string memory actionId = vm.envString("ACTION_ID");
        uint256 groupId = vm.envUint("GROUP_ID");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy SeedVault with World ID router, app config, and WLD token
        SeedVault seedVault = new SeedVault(
            IWorldID(worldIdRouter),
            appId,
            actionId,
            groupId,
            IERC20(wldToken)
        );

        // Deploy ZKSegment (no constructor args; creates default segments)
        ZKSegment zkSegment = new ZKSegment();

        vm.stopBroadcast();

        console.log("SeedVault deployed at:", address(seedVault));
        console.log("ZKSegment deployed at:", address(zkSegment));
    }
}
