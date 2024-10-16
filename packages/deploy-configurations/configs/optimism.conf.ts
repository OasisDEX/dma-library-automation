import { loadContractNames } from '@deploy-configurations/constants'
import { SystemConfig } from '@deploy-configurations/types/deployment-config'
import { Network } from '@deploy-configurations/types/network'

const SERVICE_REGISTRY_NAMES = loadContractNames(Network.OPTIMISM)

export const config: SystemConfig = {
  mpa: {
    core: {
      ServiceRegistry: {
        name: 'ServiceRegistry',
        deploy: false,
        address: '0x063E4242CD7C2421f67e21D7297c74bbDFEF7b0E',
        history: ['0xf22F17B1D2354B4F4F52e4d164e4eB5e1f0A6Ba6'],
        constructorArgs: [0],
      },
      OperationsRegistry: {
        name: 'OperationsRegistry',
        deploy: false,
        address: '0x53B1f1B3f34b5B3C7dA8BD60a7E8ee2eFd175603',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.OPERATIONS_REGISTRY,
        history: [
          '0x392ACeBea829373A3eFDc0dA80a16003106d8f6E',
          '0x3Dd262181BA245184a903CD8B77E23417f815669',
          '0x53B1f1B3f34b5B3C7dA8BD60a7E8ee2eFd175603',
        ],
        constructorArgs: [],
      },
      OperationExecutor: {
        name: 'OperationExecutor',
        deploy: false,
        address: '0xa7840fa682506117F4549E918930C80c1FC3A46c',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.OPERATION_EXECUTOR,
        history: [
          '0x5AB3e51608cEa26090445CA89bc91628C8bB99f9',
          '0xFDFf46fF5752CE2A4CAbAAf5a2cFF3744E1D09de',
          '0xa7840fa682506117F4549E918930C80c1FC3A46c',
        ],
        constructorArgs: [
          'address:ServiceRegistry',
          'address:OperationsRegistry',
          '0x0000000000000000000000000000000000000000',
          '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
        ],
      },
      OperationStorage: {
        name: 'OperationStorage',
        deploy: false,
        address: '0x28cd581B0F96BC046f461cAE9BBd7303fA0fF8e6',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.OPERATION_STORAGE,
        history: [
          '0xd4FEaf1023CD6998053a1eb02460000980Cc908f',
          '0x6d3af85e27686FfF7686b2FAe174b0a7d8c95e16',
          '0x28cd581B0F96BC046f461cAE9BBd7303fA0fF8e6',
        ],
        constructorArgs: ['address:ServiceRegistry', 'address:OperationExecutor'],
      },
      DSProxyFactory: {
        name: 'DSProxyFactory',
        deploy: false,
        address: '0x93dFeCd48491eCc6F6EC82B0fEE1Cba9eF9C941A',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.DS_PROXY_FACTORY,
        history: [],
        constructorArgs: [],
      },
      DSProxyRegistry: {
        name: 'DSProxyRegistry',
        deploy: false,
        address: '0x4EcDc277484D71A3BD15f36C858aEc2C56803869',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.DS_PROXY_REGISTRY,
        history: [],
        constructorArgs: ['address:DSProxyFactory'],
      },
      DSGuardFactory: {
        name: 'DSGuardFactory',
        deploy: false,
        address: '0x7bBe5f9C95E2994C420B3Af063e74e5F87b2A3B5',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.DS_GUARD_FACTORY,
        history: [],
        constructorArgs: [],
      },
      AccountGuard: {
        name: 'AccountGuard',
        deploy: false,
        address: '0x916411367fC2f0dc828790eA03CF317eC74E24E4',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.ACCOUNT_GUARD,
        history: ['0x63059cC2533344B65372983D4B6258b2cbbBF0Da'],
        constructorArgs: [],
      },
      AccountFactory: {
        name: 'AccountFactory',
        deploy: false,
        address: '0xaaf64927BaFe68E389DE3627AA6b52D81bdA2323',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.ACCOUNT_FACTORY,
        history: ['0xE166a06809FD35Cece10df9Cace87BbDB9a48F66'],
        constructorArgs: ['address:AccountGuard'],
      },
      Swap: {
        name: 'Swap',
        deploy: false,
        address: '0x6e4c6e76b3C1D834c0e3c4c2bAec8d58B8421A99',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.SWAP,
        history: ['0x4De3CA09e803969408f83F453416b3e2D70C12Fe'],
        constructorArgs: [
          '0x85f9b7408afE6CEb5E46223451f5d4b832B522dc',
          '0xE0611d7A57879734058aCE889569A2E79701fcAf',
          20,
          'address:ServiceRegistry',
        ],
      },
    },
    actions: {
      SendTokenAuto: {
        name: 'SendTokenAuto',
        deploy: false,
        address: '0x0000000000000000000000000000000000000000',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.SEND_TOKEN_AUTO,
        history: [],
        constructorArgs: [],
      },
      PositionCreated: {
        name: 'PositionCreated',
        deploy: false,
        address: '0x8061c24823094E51e57A4a5cF8bEd3CCf09d316F',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.POSITION_CREATED,
        history: ['0xE7aA0939F0cFF45162A22751CbE0009c689EA256'],
        constructorArgs: [],
      },
      SwapAction: {
        name: 'SwapAction',
        deploy: false,
        address: '0x0f57A087d7138DE78F2a727C62c06a779450aE68',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.SWAP_ACTION,
        history: [
          '0xAE39820D9F9F0cE9331eAe6827A9D922CA5287b9',
          '0x398105CD43115b54A0EFE0b210D99c596e4571A7',
          '0x55D4d311Cd9B2dD5693FB51f06DbE50B9Da84D13',
          '0x02F55D374d791DfF5614aD2F368145A46343B08A',
          '0x02F55D374d791DfF5614aD2F368145A46343B08A',
        ],
        constructorArgs: ['address:ServiceRegistry'],
      },
      TakeFlashloan: {
        name: 'TakeFlashloan',
        deploy: false,
        address: '0x1CE5B441eCf21F9F90eB89926C48cd12BE484DB8',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.TAKE_A_FLASHLOAN,
        history: [
          '0x53958191c3077eDe3Ca90Eb840283df063FC1be3',
          '0x080bB3a23098D71a4e8fc5dE8f1Cbb83553BBc57',
        ],
        constructorArgs: [
          'address:ServiceRegistry',
          '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
          'address:DSGuardFactory',
        ],
      },
      TakeFlashloanBalancer: {
        name: 'TakeFlashloanBalancer',
        deploy: false,
        address: '0xb26e526A5B1C4A3aE3d4d24e1748df3ff53209d4',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.TAKE_A_FLASHLOAN_BALANCER,
        history: ['', '0x2a35D123111ea15cabD125A0e2Faf42bC58e76D3'],
        constructorArgs: [
          'address:ServiceRegistry',
          '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
          'address:DSGuardFactory',
        ],
      },
      SetApproval: {
        name: 'SetApproval',
        deploy: false,
        address: '0x35Ae11606ff6DF0b4EDD0Dd32d7F72b22206F398',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.SET_APPROVAL,
        history: [
          '0x983EFCA0Fd5F9B03f75BbBD41F4BeD3eC20c96d8',
          '0x18ca8bE41D32727383bC0F98705f7662ed0B7E28',
        ],
        constructorArgs: ['address:ServiceRegistry'],
      },
      PullToken: {
        name: 'PullToken',
        deploy: false,
        address: '0x34B82d26A145b2A4fcE8E218D339841EC1493D10',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.PULL_TOKEN,
        history: [
          '0xFAf9D0B7B92e8B281CaF10b42970179B45CA6412',
          '0x414958801DC53E840501f507D7A0FEBE55806200',
        ],
        constructorArgs: [],
      },
      SendToken: {
        name: 'SendToken',
        deploy: false,
        address: '0x84Ce4DdEaf429bb8ff610eb487b30080Ed98C912',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.SEND_TOKEN,
        history: [
          '0xeB54C366512c4d59A222A251ea7316568859E08C',
          '0xAa4C55A8dd5b0e923056676D544FC20bb5D5e3A3',
        ],
        constructorArgs: ['address:ServiceRegistry'],
      },
      WrapEth: {
        name: 'WrapEth',
        deploy: false,
        address: '0xfC757966C9842cCFC71196bE306b80E5b520e643',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.WRAP_ETH,
        history: [
          '0x43C9a445fCf3bc3d1483c0b90DC0346249c0D84C',
          '0xaAF5aBF888d6633cAB2bb04E46EBb2FD3ba98B14',
        ],
        constructorArgs: ['address:ServiceRegistry'],
      },
      UnwrapEth: {
        name: 'UnwrapEth',
        deploy: false,
        address: '0xE76D0308BE45Fc54Dcfb06aff778785F884e3736',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.UNWRAP_ETH,
        history: [
          '0x7E7EB65A93441a2D2Bf0941216b4c1116B554d85',
          '0xF8C44FDB83bC89FE3db2FeAE98e2732FDa469699',
        ],
        constructorArgs: ['address:ServiceRegistry'],
      },
      ReturnFunds: {
        name: 'ReturnFunds',
        deploy: false,
        address: '0x7D81740b28eA699ee84031d3562a93F481b3F1A7',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.RETURN_FUNDS,
        history: [
          '0xAC0B1652388Ea425884e6b60e2eD30155f43D50b',
          '0x0eD12441616ca97F5729Fff519F5e8d13d8De15F',
        ],
        constructorArgs: [],
      },
      CollectFee: {
        name: 'CollectFee',
        deploy: true,
        address: '0x3C407ea1ceDA073adF1b8472648FCD8b5400132a',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.common.COLLECT_FEE,
        history: [],
        constructorArgs: [
          'address:ServiceRegistry',
          20,
          '0xE0611d7A57879734058aCE889569A2E79701fcAf',
        ],
      },
      AaveV3Borrow: {
        name: 'AaveV3Borrow',
        deploy: false,
        address: '0x4E883C730B9CF973aBC47726eA52e107DC70fa68',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.aave.v3.BORROW,
        history: [
          '0x645325494A37d35cf6baFc82C3e6bcE4473F2685',
          '0x330B1b23dbF728841AF12e6478CeBb9d51ab6f90',
        ],
        constructorArgs: ['address:ServiceRegistry'],
      },
      AaveV3Withdraw: {
        name: 'AaveV3Withdraw',
        deploy: false,
        address: '0xFe5d44e8D5313E09cF6d9E30ABc594Ec31fEeC06',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.aave.v3.WITHDRAW,
        history: [
          '0xb3f0C5E4012aF22359c9Ab233DABd80cD81F5ec5',
          '0x98Ee526EdF6c9c3cfa1369a5D24bC2c6c278bB19',
        ],
        constructorArgs: ['address:ServiceRegistry'],
      },
      AaveV3WithdrawAuto: {
        name: 'AaveV3WithdrawAuto',
        deploy: false,
        address: '0x76064cCF2EF1E98Cc60Ddd512E0A8B794d61FAB5',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.aave.v3.WITHDRAW_AUTO,
        history: ['', '0x601a8F7EA34168D912fB3C214a377CB544F18c0d'],
        constructorArgs: ['address:ServiceRegistry'],
      },
      AaveV3Deposit: {
        name: 'AaveV3Deposit',
        deploy: false,
        address: '0xdF2cc941f0D856121cf2e25DACBE55e349f3f6Bc',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.aave.v3.DEPOSIT,
        history: [
          '0x2006d4e76A398c78964F7e311BFd7Ccb149EaFE2',
          '0x22E4CeE555C44df56ac7B85033cdE54B7439817c',
        ],
        constructorArgs: ['address:ServiceRegistry'],
      },
      AaveV3Payback: {
        name: 'AaveV3Payback',
        deploy: false,
        address: '0x5d93bf7B3a1cD4d0e935Db79B0ec616DfAFDD6D4',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.aave.v3.PAYBACK,
        history: [
          '0xA0Cb87300aB07D00468704cD8f016F8dE47D8E0A',
          '0x3f91613F0c7f1f5940c324FfeF07632DD5793680',
        ],
        constructorArgs: ['address:ServiceRegistry'],
      },
      AaveV3SetEMode: {
        name: 'AaveV3SetEMode',
        deploy: false,
        address: '0x22e3922fE7E51006c3e37b50F0ea1c9d368853bF',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.aave.v3.SET_EMODE,
        history: ['0x36a9ED9B00ECC380C4e559B80a1857C65353ce7e'],
        constructorArgs: ['address:ServiceRegistry'],
      },
      AjnaDepositBorrow: {
        name: 'AjnaDepositBorrow',
        deploy: false,
        address: '',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.ajna.DEPOSIT_BORROW,
        history: [],
        constructorArgs: ['address:ServiceRegistry'],
      },
      AjnaRepayWithdraw: {
        name: 'AjnaRepayWithdraw',
        deploy: false,
        address: '',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.ajna.REPAY_WITHDRAW,
        history: [],
        constructorArgs: ['address:ServiceRegistry'],
      },
    },
  },
  common: {
    GnosisSafe: {
      name: 'GnosisSafe',
      address: '0x0000000000000000000000000000000000000000',
    },
    UniswapRouterV3: {
      name: 'UniswapRouterV3',
      address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      serviceRegistryName: SERVICE_REGISTRY_NAMES.common.UNISWAP_ROUTER,
    },
    BalancerVault: {
      name: 'BalancerVault',
      address: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      serviceRegistryName: SERVICE_REGISTRY_NAMES.common.BALANCER_VAULT,
    },
    FeeRecipient: {
      name: 'FeeRecipient',
      address: '0xC7b548AD9Cf38721810246C079b2d8083aba8909',
    },
    AuthorizedCaller: {
      name: 'AuthorizedCaller',
      address: '0x85f9b7408afE6CEb5E46223451f5d4b832B522dc',
    },
    OneInchAggregator: {
      name: 'OneInchAggregator',
      address: '0x1111111254EEB25477B68fb85Ed929f73A960582',
      serviceRegistryName: SERVICE_REGISTRY_NAMES.common.ONE_INCH_AGGREGATOR,
    },
    OneInchAggregator5: {
      name: 'OneInchAggregator5',
      address: '0x1111111254EEB25477B68fb85Ed929f73A960582',
    },
    MerkleRedeemer: {
      name: 'MerkleRedeemer',
      address: '0x7D1405e1Bafd1c48721403D2Eb2F394e10a67A1b',
    },
    DssCharter: {
      name: 'DssCharter',
      address: '0x0000000000000000000000000000000000000000',
    },
    DssProxyActions: {
      name: 'DssProxyActions',
      address: '0x0000000000000000000000000000000000000000',
    },
    DssProxyActionsCharter: {
      name: 'DssProxyActionsCharter',
      address: '0x0000000000000000000000000000000000000000',
    },
    DssMultiplyProxyActions: {
      name: 'DssMultiplyProxyActions',
      address: '0x0000000000000000000000000000000000000000',
    },
    DssCropper: {
      name: 'DssCropper',
      address: '0x0000000000000000000000000000000000000000',
    },
    DssProxyActionsCropjoin: {
      name: 'DssProxyActionsCropjoin',
      address: '0x0000000000000000000000000000000000000000',
    },
    DssProxyActionsDsr: {
      name: 'DssProxyActionsDsr',
      address: '0x0000000000000000000000000000000000000000',
    },
    Otc: {
      name: 'Otc',
      address: '0x0000000000000000000000000000000000000000',
    },
    OtcSupportMethods: {
      name: 'OtcSupportMethods',
      address: '0x0000000000000000000000000000000000000000',
    },
    ServiceRegistry: {
      name: 'ServiceRegistry',
      address: '0x0000000000000000000000000000000000000000',
    },
    GuniProxyActions: {
      name: 'GuniProxyActions',
      address: '0x0000000000000000000000000000000000000000',
    },
    GuniResolver: {
      name: 'GuniResolver',
      address: '0x0000000000000000000000000000000000000000',
    },
    GuniRouter: {
      name: 'GuniRouter',
      address: '0x0000000000000000000000000000000000000000',
    },
    CdpRegistry: {
      name: 'CdpRegistry',
      address: '0x0000000000000000000000000000000000000000',
    },
    DefaultExchange: {
      name: 'DefaultExchange',
      address: '0x0000000000000000000000000000000000000000',
    },
    NoFeesExchange: {
      name: 'NoFeesExchange',
      address: '0x0000000000000000000000000000000000000000',
    },
    LowerFeesExchange: {
      name: 'LowerFeesExchange',
      address: '0x0000000000000000000000000000000000000000',
    },
    LidoCrvLiquidityFarmingReward: {
      name: 'LidoCrvLiquidityFarmingReward',
      address: '0x0000000000000000000000000000000000000000',
    },
    ChainlinkPriceOracle_USDCUSD: {
      name: 'ChainlinkPriceOracle_USDCUSD',
      address: '0x16a9fa2fda030272ce99b29cf780dfa30361e0f3',
    },
    ChainlinkPriceOracle_ETHUSD: {
      name: 'ChainlinkPriceOracle_ETHUSD',
      address: '0x13e3ee699d1909e989722e753853ae30b17e08c5',
    },
    SdaiOracle: {
      name: 'SdaiOracle',
      address: '0x0000000000000000000000000000000000000000',
    },
    ADAI: {
      name: 'ADAI',
      address: '0x0000000000000000000000000000000000000000',
    },
    AAVE: {
      name: 'AAVE',
      address: '0x0000000000000000000000000000000000000000',
    },
    BAL: {
      name: 'BAL',
      address: '0x0000000000000000000000000000000000000000',
    },
    BAT: {
      name: 'BAT',
      address: '0x0000000000000000000000000000000000000000',
    },
    COMP: {
      name: 'COMP',
      address: '0x0000000000000000000000000000000000000000',
    },
    CBETH: {
      name: 'CBETH',
      address: '0xadDb6A0412DE1BA0F936DCaeb8Aaa24578dcF3B2',
    },
    CRVV1ETHSTETH: {
      name: 'CRVV1ETHSTETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    DAI: {
      name: 'DAI',
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      serviceRegistryName: SERVICE_REGISTRY_NAMES.common.DAI,
    },
    ETH: {
      name: 'ETH',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    },
    FRAX: {
      name: 'FRAX',
      address: '0x0000000000000000000000000000000000000000',
    },
    GHO: {
      name: 'GHO',
      address: '0x0000000000000000000000000000000000000000',
    },
    GNO: {
      name: 'GNO',
      address: '0x0000000000000000000000000000000000000000',
    },
    GUNIV3DAIUSDC1: {
      name: 'GUNIV3DAIUSDC1',
      address: '0x0000000000000000000000000000000000000000',
    },
    GUNIV3DAIUSDC2: {
      name: 'GUNIV3DAIUSDC2',
      address: '0x0000000000000000000000000000000000000000',
    },
    GUSD: {
      name: 'GUSD',
      address: '0x0000000000000000000000000000000000000000',
    },
    KNC: {
      name: 'KNC',
      address: '0x0000000000000000000000000000000000000000',
    },
    LDO: {
      name: 'LDO',
      address: '0x0000000000000000000000000000000000000000',
    },
    LINK: {
      name: 'LINK',
      address: '0x0000000000000000000000000000000000000000',
    },
    LRC: {
      name: 'LRC',
      address: '0x0000000000000000000000000000000000000000',
    },
    LUSD: {
      name: 'LUSD',
      address: '0x0000000000000000000000000000000000000000',
    },
    MANA: {
      name: 'MANA',
      address: '0x0000000000000000000000000000000000000000',
    },
    MATIC: {
      name: 'MATIC',
      address: '0x0000000000000000000000000000000000000000',
    },
    PAX: {
      name: 'PAX',
      address: '0x0000000000000000000000000000000000000000',
    },
    PAXUSD: {
      name: 'PAXUSD',
      address: '0x0000000000000000000000000000000000000000',
    },
    RENBTC: {
      name: 'RENBTC',
      address: '0x0000000000000000000000000000000000000000',
    },
    RETH: {
      name: 'RETH',
      address: '0x9bcef72be871e61ed4fbbc7630889bee758eb81d',
    },
    RWA001: {
      name: 'RWA001',
      address: '0x0000000000000000000000000000000000000000',
    },
    RWA002: {
      name: 'RWA002',
      address: '0x0000000000000000000000000000000000000000',
    },
    RWA003: {
      name: 'RWA003',
      address: '0x0000000000000000000000000000000000000000',
    },
    RWA004: {
      name: 'RWA004',
      address: '0x0000000000000000000000000000000000000000',
    },
    RWA005: {
      name: 'RWA005',
      address: '0x0000000000000000000000000000000000000000',
    },
    RWA006: {
      name: 'RWA006',
      address: '0x0000000000000000000000000000000000000000',
    },
    SDAI: {
      name: 'SDAI',
      address: '0x0000000000000000000000000000000000000000',
    },
    STETH: {
      name: 'STETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    TBTC: {
      name: 'TBTC',
      address: '0x0000000000000000000000000000000000000000',
    },
    TUSD: {
      name: 'TUSD',
      address: '0x0000000000000000000000000000000000000000',
    },
    UNI: {
      name: 'UNI',
      address: '0x0000000000000000000000000000000000000000',
    },
    UNIV2AAVEETH: {
      name: 'UNIV2AAVEETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    UNIV2DAIETH: {
      name: 'UNIV2DAIETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    UNIV2DAIUSDC: {
      name: 'UNIV2DAIUSDC',
      address: '0x0000000000000000000000000000000000000000',
    },
    UNIV2DAIUSDT: {
      name: 'UNIV2DAIUSDT',
      address: '0x0000000000000000000000000000000000000000',
    },
    UNIV2ETHUSDT: {
      name: 'UNIV2ETHUSDT',
      address: '0x0000000000000000000000000000000000000000',
    },
    UNIV2LINKETH: {
      name: 'UNIV2LINKETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    UNIV2UNIETH: {
      name: 'UNIV2UNIETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    UNIV2USDCETH: {
      name: 'UNIV2USDCETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    UNIV2WBTCDAI: {
      name: 'UNIV2WBTCDAI',
      address: '0x0000000000000000000000000000000000000000',
    },
    UNIV2WBTCETH: {
      name: 'UNIV2WBTCETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    'USDC.E': {
      name: 'USDC.E',
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      serviceRegistryName: SERVICE_REGISTRY_NAMES.common.USDC,
    },
    USDC: {
      name: 'USDC',
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    },
    USDBC: {
      name: 'USDBC',
      address: '0x0000000000000000000000000000000000000000',
    },
    USDT: {
      name: 'USDT',
      address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    },
    WBTC: {
      name: 'WBTC',
      address: '0x68f180fcce6836688e9084f035309e29bf0a2095',
      serviceRegistryName: SERVICE_REGISTRY_NAMES.common.WBTC,
    },
    WETH: {
      name: 'WETH',
      address: '0x4200000000000000000000000000000000000006',
      serviceRegistryName: SERVICE_REGISTRY_NAMES.common.WETH,
    },
    WLD: {
      name: 'WLD',
      address: '0x0000000000000000000000000000000000000000',
    },
    WSTETH: {
      name: 'WSTETH',
      address: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
      serviceRegistryName: SERVICE_REGISTRY_NAMES.common.WSTETH,
    },
    YIELDBTC: {
      name: 'YIELDBTC',
      address: '0x0000000000000000000000000000000000000000',
    },
    YIELDETH: {
      name: 'YIELDETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    YFI: {
      name: 'YFI',
      address: '0x0000000000000000000000000000000000000000',
    },
    ZRX: {
      name: 'ZRX',
      address: '0x0000000000000000000000000000000000000000',
    },
  },
  aave: {
    v2: {
      Oracle: {
        name: 'Oracle',
        address: '0x0000000000000000000000000000000000000000',
      },
      LendingPool: {
        name: 'LendingPool',
        address: '0x0000000000000000000000000000000000000000',
      },
      PoolDataProvider: {
        name: 'PoolDataProvider',
        address: '0x0000000000000000000000000000000000000000',
      },
      WETHGateway: {
        name: 'WETHGateway',
        address: '0x0000000000000000000000000000000000000000',
      },
    },
    v3: {
      Oracle: {
        name: 'Oracle',
        address: '0xD81eb3728a631871a7eBBaD631b5f424909f0c77',
      },
      LendingPool: {
        name: 'LendingPool',
        address: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        serviceRegistryName: SERVICE_REGISTRY_NAMES.aave.v3.AAVE_POOL,
      },
      PoolDataProvider: {
        name: 'PoolDataProvider',
        address: '0x7F23D86Ee20D869112572136221e173428DD740B',
      },
      L2Encoder: {
        name: 'L2Encoder',
        address: '0x9abADECD08572e0eA5aF4d47A9C7984a5AA503dC',
      },
    },
  },
  spark: {},
  maker: {
    common: {
      FlashMintModule: {
        name: 'FlashMintModule',
        address: '0x0000000000000000000000000000000000000000',
      },
      Chainlog: {
        name: 'Chainlog',
        address: '0x0000000000000000000000000000000000000000',
      },
      CdpManager: {
        name: 'CdpManager',
        address: '0x0000000000000000000000000000000000000000',
      },
      GetCdps: {
        name: 'GetCdps',
        address: '0x0000000000000000000000000000000000000000',
      },
      Jug: {
        name: 'Jug',
        address: '0x0000000000000000000000000000000000000000',
      },
      Pot: {
        name: 'Pot',
        address: '0x0000000000000000000000000000000000000000',
      },
      End: {
        name: 'End',
        address: '0x0000000000000000000000000000000000000000',
      },
      Spot: {
        name: 'Spot',
        address: '0x0000000000000000000000000000000000000000',
      },
      Dog: {
        name: 'Dog',
        address: '0x0000000000000000000000000000000000000000',
      },
      Vat: {
        name: 'Vat',
        address: '0x0000000000000000000000000000000000000000',
      },
      McdGov: {
        name: 'McdGov',
        address: '0x0000000000000000000000000000000000000000',
      },
    },
    joins: {
      MCD_JOIN_DAI: {
        name: 'MCD_JOIN_DAI',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_ETH_A: {
        name: 'MCD_JOIN_ETH_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_ETH_B: {
        name: 'MCD_JOIN_ETH_B',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_ETH_C: {
        name: 'MCD_JOIN_ETH_C',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_BAT_A: {
        name: 'MCD_JOIN_BAT_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_USDC_A: {
        name: 'MCD_JOIN_USDC_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_USDC_B: {
        name: 'MCD_JOIN_USDC_B',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_PSM_USDC_A: {
        name: 'MCD_JOIN_PSM_USDC_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_TUSD_A: {
        name: 'MCD_JOIN_TUSD_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_WBTC_A: {
        name: 'MCD_JOIN_WBTC_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_WBTC_B: {
        name: 'MCD_JOIN_WBTC_B',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_WBTC_C: {
        name: 'MCD_JOIN_WBTC_C',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_ZRX_A: {
        name: 'MCD_JOIN_ZRX_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_KNC_A: {
        name: 'MCD_JOIN_KNC_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_MANA_A: {
        name: 'MCD_JOIN_MANA_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_USDT_A: {
        name: 'MCD_JOIN_USDT_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_PAXUSD_A: {
        name: 'MCD_JOIN_PAXUSD_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_PSM_PAX_A: {
        name: 'MCD_JOIN_PSM_PAX_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_COMP_A: {
        name: 'MCD_JOIN_COMP_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_LRC_A: {
        name: 'MCD_JOIN_LRC_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_LINK_A: {
        name: 'MCD_JOIN_LINK_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_BAL_A: {
        name: 'MCD_JOIN_BAL_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_YFI_A: {
        name: 'MCD_JOIN_YFI_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_GUSD_A: {
        name: 'MCD_JOIN_GUSD_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_PSM_GUSD_A: {
        name: 'MCD_JOIN_PSM_GUSD_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_UNI_A: {
        name: 'MCD_JOIN_UNI_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_RENBTC_A: {
        name: 'MCD_JOIN_RENBTC_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_AAVE_A: {
        name: 'MCD_JOIN_AAVE_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_MATIC_A: {
        name: 'MCD_JOIN_MATIC_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_WSTETH_A: {
        name: 'MCD_JOIN_WSTETH_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_WSTETH_B: {
        name: 'MCD_JOIN_WSTETH_B',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_UNIV2DAIETH_A: {
        name: 'MCD_JOIN_UNIV2DAIETH_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_UNIV2WBTCETH_A: {
        name: 'MCD_JOIN_UNIV2WBTCETH_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_UNIV2USDCETH_A: {
        name: 'MCD_JOIN_UNIV2USDCETH_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_UNIV2DAIUSDC_A: {
        name: 'MCD_JOIN_UNIV2DAIUSDC_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_UNIV2ETHUSDT_A: {
        name: 'MCD_JOIN_UNIV2ETHUSDT_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_UNIV2LINKETH_A: {
        name: 'MCD_JOIN_UNIV2LINKETH_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_UNIV2UNIETH_A: {
        name: 'MCD_JOIN_UNIV2UNIETH_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_UNIV2WBTCDAI_A: {
        name: 'MCD_JOIN_UNIV2WBTCDAI_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_UNIV2AAVEETH_A: {
        name: 'MCD_JOIN_UNIV2AAVEETH_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_UNIV2DAIUSDT_A: {
        name: 'MCD_JOIN_UNIV2DAIUSDT_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_RWA001_A: {
        name: 'MCD_JOIN_RWA001_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_RWA002_A: {
        name: 'MCD_JOIN_RWA002_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_RWA003_A: {
        name: 'MCD_JOIN_RWA003_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_RWA004_A: {
        name: 'MCD_JOIN_RWA004_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_RWA005_A: {
        name: 'MCD_JOIN_RWA005_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_RWA006_A: {
        name: 'MCD_JOIN_RWA006_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_RETH_A: {
        name: 'MCD_JOIN_RETH_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_GNO_A: {
        name: 'MCD_JOIN_GNO_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_DIRECT_AAVEV2_DAI: {
        name: 'MCD_JOIN_DIRECT_AAVEV2_DAI',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_GUNIV3DAIUSDC1_A: {
        name: 'MCD_JOIN_GUNIV3DAIUSDC1_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_GUNIV3DAIUSDC2_A: {
        name: 'MCD_JOIN_GUNIV3DAIUSDC2_A',
        address: '0x0000000000000000000000000000000000000000',
      },
      MCD_JOIN_CRVV1ETHSTETH_A: {
        name: 'MCD_JOIN_CRVV1ETHSTETH_A',
        address: '0x0000000000000000000000000000000000000000',
      },
    },
    pips: {
      PIP_ETH: {
        name: 'PIP_ETH',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_BAT: {
        name: 'PIP_BAT',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_USDC: {
        name: 'PIP_USDC',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_WBTC: {
        name: 'PIP_WBTC',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_TUSD: {
        name: 'PIP_TUSD',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_ZRX: {
        name: 'PIP_ZRX',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_KNC: {
        name: 'PIP_KNC',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_MANA: {
        name: 'PIP_MANA',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_USDT: {
        name: 'PIP_USDT',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_PAXUSD: {
        name: 'PIP_PAXUSD',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_PAX: {
        name: 'PIP_PAX',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_COMP: {
        name: 'PIP_COMP',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_LRC: {
        name: 'PIP_LRC',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_LINK: {
        name: 'PIP_LINK',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_BAL: {
        name: 'PIP_BAL',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_YFI: {
        name: 'PIP_YFI',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_GUSD: {
        name: 'PIP_GUSD',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_UNI: {
        name: 'PIP_UNI',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_RENBTC: {
        name: 'PIP_RENBTC',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_AAVE: {
        name: 'PIP_AAVE',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_MATIC: {
        name: 'PIP_MATIC',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_WSTETH: {
        name: 'PIP_WSTETH',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_ADAI: {
        name: 'PIP_ADAI',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_UNIV2DAIETH: {
        name: 'PIP_UNIV2DAIETH',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_UNIV2WBTCETH: {
        name: 'PIP_UNIV2WBTCETH',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_UNIV2USDCETH: {
        name: 'PIP_UNIV2USDCETH',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_UNIV2DAIUSDC: {
        name: 'PIP_UNIV2DAIUSDC',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_UNIV2ETHUSDT: {
        name: 'PIP_UNIV2ETHUSDT',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_UNIV2LINKETH: {
        name: 'PIP_UNIV2LINKETH',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_UNIV2UNIETH: {
        name: 'PIP_UNIV2UNIETH',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_UNIV2WBTCDAI: {
        name: 'PIP_UNIV2WBTCDAI',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_UNIV2AAVEETH: {
        name: 'PIP_UNIV2AAVEETH',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_UNIV2DAIUSDT: {
        name: 'PIP_UNIV2DAIUSDT',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_GUNIV3DAIUSDC1: {
        name: 'PIP_GUNIV3DAIUSDC1',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_GUNIV3DAIUSDC2: {
        name: 'PIP_GUNIV3DAIUSDC2',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_CRVV1ETHSTETH: {
        name: 'PIP_CRVV1ETHSTETH',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_RWA001: {
        name: 'PIP_RWA001',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_RWA002: {
        name: 'PIP_RWA002',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_RWA003: {
        name: 'PIP_RWA003',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_RWA004: {
        name: 'PIP_RWA004',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_RWA005: {
        name: 'PIP_RWA005',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_RWA006: {
        name: 'PIP_RWA006',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_RETH: {
        name: 'PIP_RETH',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_GNO: {
        name: 'PIP_GNO',
        address: '0x0000000000000000000000000000000000000000',
      },
      PIP_WETH: {
        name: 'PIP_WETH',
        address: '0x0000000000000000000000000000000000000000',
      },
    },
  },
  automation: {
    AutomationBot: {
      name: 'AutomationBot',
      address: '0x0000000000000000000000000000000000000000',
    },
    AutomationBotV2: {
      name: 'AutomationBotV2',
      address: '0xb2e2a088d9705cd412CE6BF94e765743Ec26b1e4',
    },
    AutomationBotAggregator: {
      name: 'AutomationBotAggregator',
      address: '0x0000000000000000000000000000000000000000',
    },
  },
  ajna: {
    AjnaPoolInfo: {
      name: 'AjnaPoolInfo',
      address: '0x0000000000000000000000000000000000000000',
      serviceRegistryName: undefined,
    },
    AjnaProxyActions: {
      name: 'AjnaProxyActions',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_ETHDAI: {
      name: 'AjnaPoolPairs_ETHDAI',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_ETHUSDC: {
      name: 'AjnaPoolPairs_ETHUSDC',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_RETHDAI: {
      name: 'AjnaPoolPairs_RETHDAI',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_RETHETH: {
      name: 'AjnaPoolPairs_RETHETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_RETHUSDC: {
      name: 'AjnaPoolPairs_RETHUSDC',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_USDCETH: {
      name: 'AjnaPoolPairs_USDCETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_USDCDAI: { name: 'AjnaPoolPairs_USDCDAI', address: '' },
    AjnaPoolPairs_USDCWBTC: {
      name: 'AjnaPoolPairs_USDCWBTC',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_WBTCDAI: {
      name: 'AjnaPoolPairs_WBTCDAI',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_WBTCUSDC: {
      name: 'AjnaPoolPairs_WBTCUSDC',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_WSTETHDAI: {
      name: 'AjnaPoolPairs_WSTETHDAI',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_WSTETHETH: {
      name: 'AjnaPoolPairs_WSTETHETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_WSTETHUSDC: {
      name: 'AjnaPoolPairs_WSTETHUSDC',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_CBETHETH: {
      name: 'AjnaPoolPairs_CBETHETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_TBTCWBTC: {
      name: 'AjnaPoolPairs_TBTCWBTC',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_TBTCUSDC: {
      name: 'AjnaPoolPairs_TBTCUSDC',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_ETHGHO: {
      name: 'AjnaPoolPairs_ETHGHO',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_WSTETHGHO: {
      name: 'AjnaPoolPairs_WSTETHGHO',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_GHODAI: {
      name: 'AjnaPoolPairs_GHODAI',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_RETHGHO: {
      name: 'AjnaPoolPairs_RETHGHO',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_WBTCGHO: {
      name: 'AjnaPoolPairs_WBTCGHO',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_CBETHGHO: {
      name: 'AjnaPoolPairs_CBETHGHO',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_WLDUSDC: {
      name: 'AjnaPoolPairs_WLDUSDC',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_USDCWLD: {
      name: 'AjnaPoolPairs_USDCWLD',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_SDAIUSDC: {
      name: 'AjnaPoolPairs_SDAIUSDC',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_YFIDAI: {
      name: 'AjnaPoolPairs_YFIDAI',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_YIELDETHETH: {
      name: 'AjnaPoolPairs_YIELDETHETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaPoolPairs_YIELDBTCWBTC: {
      name: 'AjnaPoolPairs_YIELDBTCWBTC',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaRewardsManager: {
      name: 'AjnaRewardsManager',
      address: '0x0000000000000000000000000000000000000000',
    },
    AjnaRewardsClaimer: {
      name: 'AjnaRewardsClaimer',
      address: '0x0000000000000000000000000000000000000000',
    },
    ERC20PoolFactory: {
      name: 'ERC20PoolFactory',
      address: '0x0000000000000000000000000000000000000000',
      serviceRegistryName: SERVICE_REGISTRY_NAMES.ajna.ERC20_POOL_FACTORY,
    },
  },
  morphoblue: {
    MorphoBlue: {
      name: 'MorphoBlue',
      address: '0x0000000000000000000000000000000000000000',
      serviceRegistryName: SERVICE_REGISTRY_NAMES.morphoblue.MORPHO_BLUE,
    },
    AdaptiveCurveIrm: {
      name: 'AdaptiveCurveIrm',
      address: '0x0000000000000000000000000000000000000000'
    },
  },
}
