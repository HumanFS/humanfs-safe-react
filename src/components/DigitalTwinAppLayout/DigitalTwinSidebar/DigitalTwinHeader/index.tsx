import styled, { css } from 'styled-components'
import { useSelector } from 'react-redux'
import {
  Icon,
  FixedIcon,
  Text,
  Title,
  Button,
  CopyToClipboardBtn,
  ExplorerButton,
} from '@gnosis.pm/safe-react-components'
import { useRouteMatch } from 'react-router-dom'

import FlexSpacer from 'src/components/FlexSpacer'
import Paragraph from 'src/components/layout/Paragraph'
import { getChainInfo, getExplorerInfo } from 'src/config'
import {
  secondary,
  border,
  fontColor,
  background,
  primaryLite,
  secondaryBackground,
  black400,
} from 'src/theme/variables'
import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { copyShortNameSelector } from 'src/logic/appearance/selectors'
import { ADDRESSED_ROUTE } from 'src/routes/routes'
import Track from 'src/components/Track'
import { OVERVIEW_EVENTS } from 'src/utils/events/overview'
//import Threshold from 'src/components/AppLayout/Sidebar/Threshold'
import { trackEvent } from 'src/utils/googleTagManager'
import useSafeAddress from 'src/logic/currentSession/hooks/useSafeAddress'
import { Avatar, Box } from '@material-ui/core'
//import { currentSafe } from 'src/logic/safe/store/selectors'

export const TOGGLE_SIDEBAR_BTN_TESTID = 'TOGGLE_SIDEBAR_BTN'

const Container = styled.div`
  max-width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 12px;
`

const IdenticonContainer = styled.div`
  width: 100%;
  margin: 14px 8px 9px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`
const StyledIcon = styled(Icon)`
  svg {
    height: 24px;
    width: 24px;
    transform: rotateZ(-90deg);

    .icon-color {
      fill: ${black400};
    }

    path:nth-child(2) {
      display: none;
    }
  }
`

const IconContainer = styled.div`
  width: 100px;
  display: flex;
  gap: 8px;
  justify-content: space-evenly;
  align-items: center;
  margin: 14px 0;
`
const StyledButton = styled(Button)`
  &&.MuiButton-root {
    width: 100%;
    height: 38px;
    padding: 0 12px;
  }
`

const innerButtonStyle = css`
  & span {
    transition: background-color 0.2s ease-in-out;
    border-radius: 5px;
    width: 32px;
    height: 32px;
    background-color: ${background};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  & .icon-color {
    fill: ${secondary};
  }

  &:hover span {
    background-color: ${primaryLite};
  }
`

const StyledExplorerButton = styled(ExplorerButton)`
  border-radius: 5px;
  width: 32px;
  height: 32px;
  background-color: ${background};

  ${innerButtonStyle}
`

const StyledCopyToClipboardBtn = styled(CopyToClipboardBtn)`
  border-radius: 5px;
  width: 32px;
  height: 32px;
  background-color: ${background};

  ${innerButtonStyle}
`

const StyledQRCodeButton = styled.button`
  border: 0;
  cursor: pointer;
  border-radius: 5px;
  width: 32px;
  height: 32px;
  background-color: ${background};
  padding: 0;

  ${innerButtonStyle}
`

type StyledTextLabelProps = {
  chainInfo: ChainInfo
}

const StyledTextLabel = styled(Text)`
  margin: -8px 0 0 -8px;
  padding: 4px 8px;
  width: 75%;
  text-align: center;
  color: ${(props: StyledTextLabelProps) => props.chainInfo?.theme?.textColor ?? fontColor};
  background-color: ${(props: StyledTextLabelProps) => props.chainInfo?.theme?.backgroundColor ?? border};
`

const StyledTextSafeName = styled(Text)`
  width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StyledText = styled(Title)`
  margin: 0 0 14px 0;
`

const ToggleSafeListButton = styled.button`
  cursor: pointer;
  border: 0;
  background-color: ${secondaryBackground};
  border-radius: 50%;
  width: 42px;
  height: 42px;
  position: absolute;
  right: -40px;
  display: flex;
  align-items: center;
  justify-content: center;

  & span {
    margin-left: -15px;
  }

  &:hover {
    background-color: ${primaryLite};
  }
`

type Props = {
  address: string | undefined
  safeName: string | undefined
  granted: boolean
  balance: string | undefined
  onToggleSafeList: () => void
  onReceiveClick: () => void
  onNewTransactionClick: () => void
}

const SafeHeader = ({
  address,
  safeName,
  granted,
  onToggleSafeList,
  onReceiveClick,
  onNewTransactionClick,
}: Props): React.ReactElement => {
  //const { owners, threshold } = useSelector(currentSafe)
  const copyChainPrefix = useSelector(copyShortNameSelector)
  const { shortName } = useSafeAddress()
  const hasSafeOpen = useRouteMatch(ADDRESSED_ROUTE)

  const handleNewMeasurementClick = () => {
    trackEvent({ ...OVERVIEW_EVENTS.NEW_TRANSACTION })
    onNewTransactionClick()
  }

  if (!address || !hasSafeOpen) {
    return (
      <Container>
        <IdenticonContainer>
          <FlexSpacer />
          <FixedIcon type="notConnected" />
          <ToggleSafeListButton onClick={onToggleSafeList} data-testid={TOGGLE_SIDEBAR_BTN_TESTID}>
            <StyledIcon size="md" type="circleDropdown" />
          </ToggleSafeListButton>
        </IdenticonContainer>
      </Container>
    )
  }
  const chainInfo = getChainInfo()

  return (
    <>
      {/* Network */}
      <StyledTextLabel size="sm" chainInfo={chainInfo}>
        Life Force
      </StyledTextLabel>

      <Container>
        {/* Identicon */}
        <IdenticonContainer>
          <Box position="relative">
            {/*            <Threshold threshold={threshold} owners={owners.length} />
            <Identicon address={address} size="lg" />*/}
            <Avatar src={'https://static.quantimo.do/img/emoticon-set/png/happy-1.png'} />
          </Box>
          <ToggleSafeListButton onClick={onToggleSafeList} data-testid={TOGGLE_SIDEBAR_BTN_TESTID}>
            <StyledIcon size="md" type="circleDropdown" />
          </ToggleSafeListButton>
        </IdenticonContainer>

        {/* SafeInfo */}
        <StyledTextSafeName size="xl" center>
          {safeName}
        </StyledTextSafeName>
        {/*        <StyledPrefixedEthHashInfo hash={address} shortenHash={4} textSize="sm" />*/}
        <IconContainer>
          <Track {...OVERVIEW_EVENTS.SHOW_QR}>
            <StyledQRCodeButton onClick={onReceiveClick}>
              <Icon size="sm" type="qrCode" tooltip="Show QR code" />
            </StyledQRCodeButton>
          </Track>
          <Track {...OVERVIEW_EVENTS.COPY_ADDRESS}>
            <StyledCopyToClipboardBtn textToCopy={copyChainPrefix ? `${shortName}:${address}` : `${address}`} />
          </Track>
          <Track {...OVERVIEW_EVENTS.OPEN_EXPLORER}>
            <StyledExplorerButton explorerUrl={getExplorerInfo(address)} />
          </Track>
        </IconContainer>

        <Paragraph color="black400" noMargin size="md">
          Life Force Score
        </Paragraph>
        <StyledText size="xs">60%</StyledText>
        <StyledButton
          size="md"
          disabled={!granted}
          color="primary"
          variant="contained"
          onClick={handleNewMeasurementClick}
        >
          <Text size="xl" color="white">
            {granted ? 'New Measurement' : 'Read Only'}
          </Text>
        </StyledButton>
      </Container>
    </>
  )
}

export default SafeHeader
