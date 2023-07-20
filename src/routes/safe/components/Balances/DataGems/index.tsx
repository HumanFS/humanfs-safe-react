import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import Card from '@material-ui/core/Card'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { Grid } from '@material-ui/core'

import Item from './components/Item'
import Paragraph from 'src/components/layout/Paragraph'
import { nftAssetsFromNftTokensSelector, nftLoadedSelector } from 'src/logic/collectibles/store/selectors'
import SendModal from 'src/routes/safe/components/Balances/SendModal'
import { fontColor, lg, screenSm, screenXs } from 'src/theme/variables'
import { NFTToken } from 'src/logic/collectibles/sources/collectibles.d'
import { trackEvent } from 'src/utils/googleTagManager'
import { ASSETS_EVENTS } from 'src/utils/events/assets'
import VirtualizedList from 'src/components/VirtualizedList'
import InfoAlert from 'src/components/InfoAlert'
import SafeAppCard from '../../Apps/components/SafeAppCard/SafeAppCard'
import { useAppList } from '../../Apps/hooks/appList/useAppList'
import { log } from 'lit-js-sdk/src/lib/utils'
import { connectWeb3 } from 'lit-js-sdk/src/utils/eth'
import { LIT_CHAINS } from 'lit-js-sdk/src/lib/constants'
import { Contract } from '@ethersproject/contracts'
import * as LitJson from '../../../../../utils/lit/abis/LIT.json'
import { useDataGemNftTokens } from './hooks/useDataGemNftTokens'

const useStyles = makeStyles(
  createStyles({
    cardInner: {
      boxSizing: 'border-box',
      maxWidth: '100%',
      padding: '52px 54px',
    },
    cardOuter: {
      boxShadow: '1px 2px 10px 0 rgba(212, 212, 211, 0.59)',
    },
    gridRow: {
      boxSizing: 'border-box',
      columnGap: '30px',
      display: 'grid',
      gridTemplateColumns: '1fr',
      marginBottom: '45px',
      maxWidth: '100%',
      rowGap: '45px',

      '&:last-child': {
        marginBottom: '0',
      },

      [`@media (min-width: ${screenXs}px)`]: {
        gridTemplateColumns: '1fr 1fr',
      },

      [`@media (min-width: ${screenSm}px)`]: {
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
      },
    },
    title: {
      alignItems: 'center',
      display: 'flex',
      margin: '18px',
    },
    titleImg: {
      backgroundPosition: '50% 50%',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      borderRadius: '50%',
      height: '45px',
      margin: '0 10px 0 0',
      width: '45px',
    },
    titleText: {
      color: fontColor,
      fontSize: '18px',
      fontWeight: 'normal',
      lineHeight: '1.2',
      margin: '0',
    },
    titleFiller: {
      backgroundColor: '#e8e7e6',
      flexGrow: 1,
      height: '2px',
      marginLeft: '40px',
    },
    noData: {
      fontSize: lg,
      textAlign: 'center',
    },
  }),
)

/**
 * Finds the tokens that the current user owns from the predeployed LIT contracts
 * @param {Object} params
 * @param {string} params.chain The chain that was minted on. "ethereum" and "polygon" are currently supported.
 * @param {number} params.accountAddress The account address to check
 * @returns {Promise} The token ids owned by the accountAddress
 */
export async function findLITs(): Promise<any> {
  log('findLITs')

  try {
    const { web3, account } = await connectWeb3()
    const { chainId } = await web3.getNetwork()
    const chainHexId = '0x' + chainId.toString(16)
    // const chainHexId = await web3.request({ method: 'eth_chainId', params: [] })
    const chain = chainHexIdToChainName(chainHexId)
    const tokenAddress = LIT_CHAINS[chain].contractAddress
    const contract = new Contract(tokenAddress, LitJson.abi, web3.getSigner())
    log('getting maxTokenId for chain', chain)
    const maxTokenId = await contract.tokenIds()
    const accounts: string[] = []
    const tokenIds: number[] = []
    for (let i = 0; i <= maxTokenId; i++) {
      accounts.push(account)
      tokenIds.push(i)
    }
    log('getting balanceOfBatch for ', accounts, tokenIds)
    const balances = await contract.balanceOfBatch(accounts, tokenIds)
    log('balances', balances)
    const tokenIdsWithNonzeroBalances = balances
      .map((b, i) => (b.toNumber() === 0 ? null : i))
      .filter((b) => b !== null)
    return { tokenIds: tokenIdsWithNonzeroBalances, chain }
  } catch (error) {
    log(error)
    if (error.code === 4001) {
      // EIP-1193 userRejectedRequest error
      log('User rejected request')
      return { errorCode: 'user_rejected_request' }
    } else {
      console.error(error)
    }
    return { errorCode: 'unknown_error' }
  }
}

function chainHexIdToChainName(chainHexId) {
  for (let i = 0; i < Object.keys(LIT_CHAINS).length; i++) {
    const chainName = Object.keys(LIT_CHAINS)[i]
    const litChainHexId = '0x' + LIT_CHAINS[chainName].chainId.toString('16')
    if (litChainHexId === chainHexId) {
      return chainName
    }
  }
}

const Collectibles = ({ children }: { children: ReactNode }): React.ReactElement => {
  const classes = useStyles()
  const [selectedToken, setSelectedToken] = useState<NFTToken | undefined>()
  const [sendNFTsModalOpen, setSendNFTsModalOpen] = useState(false)

  const nftLoaded = useSelector(nftLoadedSelector)
  //const nftTokens = useSelector(orderedNFTAssets)
  const response = useDataGemNftTokens()
  const nftTokens = response.dataGemNftTokens
  //debugger

  const nftAssetsFromNftTokens = useSelector(nftAssetsFromNftTokensSelector)
  //debugger

  const nftAmount = useMemo(() => nftTokens.length, [nftTokens])
  useEffect(() => {
    trackEvent({ ...ASSETS_EVENTS.NFT_AMOUNT, label: nftAmount })
  }, [nftAmount])

  const handleItemSend = (nftToken: NFTToken) => {
    setSelectedToken(nftToken)
    setSendNFTsModalOpen(true)
  }

  if (nftAssetsFromNftTokens.length === 0) {
    return (
      <Fragment>
        {children}
        <Card className={classes.cardOuter}>
          <div className={classes.cardInner}>
            <Paragraph className={classes.noData}>{nftLoaded ? 'No NFTs available' : 'Loading NFTs...'}</Paragraph>
          </div>
        </Card>
      </Fragment>
    )
  }

  return (
    <>
      <VirtualizedList
        data={nftAssetsFromNftTokens}
        itemContent={(index, nftAsset) => {
          // Larger collectible lists can cause this to be initially undefined
          if (!nftAsset) {
            return null
          }

          return (
            <Fragment key={nftAsset.slug}>
              {index === 0 && children}

              <div className={classes.title}>
                <div className={classes.titleImg} style={{ backgroundImage: `url(${nftAsset.image || ''})` }} />
                <h2 className={classes.titleText}>{nftAsset.name}</h2>
                <div className={classes.titleFiller} />
              </div>
              <div className={classes.gridRow}>
                {nftTokens
                  .filter(({ assetAddress }) => nftAsset.address === assetAddress)
                  .map((nftToken, i) => (
                    <Item
                      data={nftToken}
                      key={`${nftAsset.slug}_${nftToken.tokenId}_${i}`}
                      onSend={() => handleItemSend(nftToken)}
                    />
                  ))}
              </div>
            </Fragment>
          )
        }}
      />
      <SendModal
        activeScreenType="sendCollectible"
        isOpen={sendNFTsModalOpen}
        onClose={() => setSendNFTsModalOpen(false)}
        selectedToken={selectedToken}
      />
    </>
  )
}

const CollectiblesPage = (): React.ReactElement => {
  const NFT_APPS_TAG = 'nft'
  const { allApps, pinnedSafeApps, togglePin } = useAppList()
  const nftApps = useMemo(() => allApps.filter((app) => app.tags?.includes(NFT_APPS_TAG)), [allApps])

  const infoBar = (
    <InfoAlert
      id="collectiblesInfo"
      title="Use Safe Apps to view your NFT portfolio"
      text="Get the most optimal experience with Safe Apps. View your collections, buy or sell NFTs, and more."
    />
  )

  return (
    <Collectibles>
      {nftApps.length > 0 && (
        <>
          {infoBar}

          <h3>NFT apps</h3>

          <Grid style={{ marginBottom: '30px' }}>
            {nftApps.map((app) => (
              <Grid item key={app.id} xs={4}>
                <SafeAppCard
                  safeApp={app}
                  size="md"
                  togglePin={togglePin}
                  isPinned={pinnedSafeApps.some(({ id }) => id === app.id)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <h3>Health Data NFTs</h3>
    </Collectibles>
  )
}

export default CollectiblesPage