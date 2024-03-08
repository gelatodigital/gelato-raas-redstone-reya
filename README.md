
# Reya RedStone deployments

### Relevant Files:
[ETH Price Feed Adapter contract](./contracts/adapters/RedstonePriceFeedWithRoundsETH.sol)
[Deployment Script](./deploy/priceFeedOracleETH.deploy.ts)
[Test](./test/ETH.ts)

### Known Issues
Please, bear in mind that if the last block produced is older than one minute, the update wil fail with 'TimestampFromTooLongFuture' error